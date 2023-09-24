import { Markup, Scenes } from "telegraf";
import * as linkModel from "../../models/admin/linkAgreggatorModel.mjs";

export const sendMenu = (ctx) => {
  ctx.reply("Entendido\\. O que você quer fazer no Agregador de Links?", {
    parse_mode: "MarkdownV2",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Criar Link", "createLink")],
      [Markup.button.callback("Ver Meus Links", "viewLinks")],
    ])
      .oneTime()
      .resize(),
  });
};

export const viewLinks = new Scenes.WizardScene(
  "viewLinksScene",
  (ctx) => {
    linkModel.getLinks().then((links) => {
      if (links != 0) {
        links.forEach((link) => {
          ctx.reply(`${link.name}`, {
            parse_mode: "MarkdownV2",
            ...Markup.inlineKeyboard([
              Markup.button.callback("❌ Excluir", `${link.id}`),
            ]).oneTime(),
          });
        });
      } else {
        ctx.reply(
          "Você não tem nenhum link cadastrado ainda. Vou agilizar e te mostrar o menu principal."
        );
        ctx.scene.leave();
      }
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    const linkId = ctx.callbackQuery.data;
    const deleteLink = await linkModel.deleteLink(linkId);

    await ctx.reply(
      deleteLink.message +
        "\n____________________________________________________"
    );

    links = await linkModel.getLinks();

    if (links != 0) {
      ctx.wizard.selectStep(0);
      return ctx.wizard.step(ctx);
    } else {
      await ctx.reply("Você excluiu todos os seus links");
      ctx.scene.leave();
    }
  }
);

export const createLinkWizard = new Scenes.WizardScene(
  "createLinkScene",
  (ctx) => {
    ctx.reply(
      "Envie o nome que os usuários vão ver no agregador de links. Ex: Instagram"
    );
    ctx.wizard.state.createLink = {};
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.wizard.state.createLink.name = ctx.message.text;
    ctx.reply(
      "Envie o link para o qual os usuários vão ao clicar no nome. Ex: instagram.com/usuario"
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.createLink.url = ctx.message.text;
    await ctx.reply("Tudo configurado, vamos revisar!");

    const linkName = ctx.wizard.state.createLink.name.replace(".", "\\.");
    const linkUrl = ctx.wizard.state.createLink.url.replace(".", "\\.");

    await ctx.reply(
      `\*_Nome que será exibido:_*\n${linkName}\n\n\*_Link para onde o usuário será levado:_*\n${linkUrl}`,
      {
        parse_mode: "MarkdownV2",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("✅ Salvar", "save")],
          [Markup.button.callback("🔁 Refazer", "restart")],
          [Markup.button.callback("❌ Cancelar", "cancel")],
        ])
          .oneTime()
          .resize(),
      }
    );

    return ctx.wizard.next();
  },
  async (ctx) => {
    switch (ctx.callbackQuery.data) {
      case "save":
        const save = await linkModel.saveLink(ctx.wizard.state.createLink);
        ctx.reply(save.message);
        return ctx.scene.leave();
        break;

      case "restart":
        await ctx.reply("Certo, vamos recomeçar.");
        ctx.wizard.selectStep(0);
        return ctx.wizard.step(ctx);
        break;

      case "cancel":
        ctx.reply("Certo, vamos voltar ao menu principal.");
        return ctx.scene.leave();
    }
  }
);

export const sendCustomerLinks = (ctx) => {
  linkModel.getLinks().then((links) => {
    let keyboardBtns = [];
    links.forEach((link) => {
      keyboardBtns.push([Markup.button.url(link.name, link.url)]);
    });

    ctx.reply("Teste dos Links do Consumidor", {
      ...Markup.inlineKeyboard(keyboardBtns)
    })

  });
};
