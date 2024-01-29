import { Markup, Scenes } from "telegraf";
import { getModelByTenant } from "../utils/tenantUtils.mjs";
import linkSchema from "../schemas/Link.mjs";

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
  "viewLinks",
  async (ctx) => {
    const Link = getModelByTenant(ctx.session.db, "Link", linkSchema);
    const links = await Link.find().lean();

    if (!links) {
      await ctx.reply(
        "Você não tem nenhum link cadastrado ainda. Vou agilizar e te mostrar o menu principal."
      );

      return ctx.scene.leave();
    }

    for (let i = 0; i < links.length; i++) {
      await ctx.reply(`${links[i].name}`, {
        parse_mode: "MarkdownV2",
        ...Markup.inlineKeyboard([
          Markup.button.callback("❌ Excluir", `${links[i]._id}`),
        ]).oneTime(),
      });
    }

    return ctx.wizard.next();
  },
  async (ctx) => {
    const Link = getModelByTenant(ctx.session.db, "Link", linkSchema);

    if(ctx.callbackQuery.data){

      const linkId = ctx.callbackQuery.data;
      try {
        await Link.deleteOne({ id: linkId });

        await ctx.reply(
          "O link foi deletado" +
          "\n____________________________________________________"
        );
      } catch (err) {
        await ctx.reply(err);
      }
    }

    return ctx.scene.leave();
  }
);

export const createLink = new Scenes.WizardScene(
  "createLink",
  async (ctx) => {
    await ctx.reply(
      "Envie o nome que os usuários vão ver no agregador de links. Ex: Instagram"
    );
    ctx.wizard.state.createLink = {};
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.wizard.state.createLink.name = ctx.message.text;
    await ctx.reply(
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
        try {
          const Link = getModelByTenant(ctx.session.db, "Link", linkSchema);
          const newLink = new Link(ctx.wizard.state.createLink);
          newLink.save();
          await ctx.reply("O link foi criado com sucesso!");
        } catch (err) {
          await ctx.reply(err);
        }
        return ctx.scene.leave();
        break;

      case "restart":
        await ctx.reply("Certo, vamos recomeçar.");
        ctx.wizard.selectStep(0);
        return ctx.wizard.step(ctx);
        break;

      case "cancel":
        await ctx.reply("Certo, vamos voltar ao menu principal.");
        return ctx.scene.leave();
    }
  }
);

export const sendCustomerLinks = async (ctx) => {
  const Link = getModelByTenant(ctx.session.db, "Link", linkSchema);
  const links = await Link.find().lean();

  if(links.length === 0){
    await ctx.reply('Ainda não temos nenhum link cadastrado para outras plataformas.');
    await ctx.scene.leave();
    return;
  }

  let keyboardBtns = [];
  links.forEach((link) => {
    keyboardBtns.push([Markup.button.url(link.name, link.url)]);
  });
  await ctx.reply("", {
    ...Markup.inlineKeyboard(keyboardBtns),
  });

  await ctx.scene.leave();
};
