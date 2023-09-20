import { Markup, Scenes } from "telegraf";
import * as adminsModel from "../../models/admin/adminsModel.mjs";

export const sendMenu = (ctx) => {
  ctx.reply("Entendido, o que você deseja fazer em Admins?", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Criar Admin", "createAdmin")],
      [Markup.button.callback("Ver Admins", "viewAdmins")],
    ]),
  });
};

export const viewAdmins = new Scenes.WizardScene(
  "viewAdminsScene",
  (ctx) => {
    adminsModel.getAdmins().then((admins) => {
      admins.forEach((admin) => {
        ctx.reply(
          "*_Nome Completo: _*" +
            admin.first_name +
            " " +
            admin.last_name +
            "\n\n*_Nome de Usuário: _*" +
            admin.username,
          {
            parse_mode: "MarkdownV2",
            ...Markup.inlineKeyboard([
              [Markup.button.callback("❌ Remover Admin", `${admin.id}`)],
            ]),
          }
        );
      });
    });
  },
  (ctx) => {
    ctx.reply(ctx.callbackQuery.text);
  }
);

export const createAdmin = new Scenes.BaseScene("createAdminScene");

createAdmin.enter((ctx) => {
    ctx.reply("Certo, me envie o contato de quem será um novo Administrador do Bot");
});

createAdmin.on("message", (ctx) => {
    adminsModel.saveAdmin(ctx.message.contact).then(resp => {
        ctx.reply(resp.message);
        ctx.scene.leave();
    });
})
