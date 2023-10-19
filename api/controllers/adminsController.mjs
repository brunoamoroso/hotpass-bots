import { Markup, Scenes } from "telegraf";
import User from "../models/User.mjs";

export const sendMenu = (ctx) => {
  ctx.reply("Entendido, o que você deseja fazer em Admins?", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Criar Admin", "createAdmin")],
      [Markup.button.callback("Ver Admins", "viewAdmins")],
    ]),
  });
};

export const viewAdmins = new Scenes.BaseScene("viewAdmins");

viewAdmins.enter(async (ctx) => {
  const admins = ctx.scene.state.admins;
  await Promise.all(admins.map(admin => {
    return ctx.reply(
          "*_Nome Completo: _*" +
            admin.first_name +
            " " +
            admin.last_name +
            "\n\n*_Nome de Usuário: _*",
          {
            parse_mode: "MarkdownV2",
            ...Markup.inlineKeyboard([
              [Markup.button.callback("❌ Remover Admin", `${admin.id}`)],
            ]),
          }
        );
  }));
  
  // admins.forEach((admin) => {
  //   return ctx.reply(
  //     "*_Nome Completo: _*" +
  //       admin.first_name +
  //       " " +
  //       admin.last_name +
  //       "\n\n*_Nome de Usuário: _*",
  //     {
  //       parse_mode: "MarkdownV2",
  //       ...Markup.inlineKeyboard([
  //         [Markup.button.callback("❌ Remover Admin", `${admin.id}`)],
  //       ]),
  //     }
  //   );
  // });
});

export const createAdmin = new Scenes.BaseScene("createAdmin");

createAdmin.enter(async (ctx) => {
  console.log(ctx.session);
  ctx.reply(
    "Certo, me envie o contato de quem será um novo Administrador do Bot"
  );
});

createAdmin.on("message", async (ctx) => {
  if (ctx.message.contact) {
    const userTg = ctx.message.contact;
    const user = new User({
      telegram_id: userTg.user_id,
      first_name: userTg.first_name,
      last_name: userTg.last_name,
      role_type: "admin",
    });
    try {
      await User.findOneAndUpdate({ telegram_id: userTg.user_id }, user, {
        upsert: true,
      });
      ctx.reply("A pessoa adminstradora foi adicionada com sucesso!");
    } catch (err) {
      console.log(err);
    }

    ctx.scene.leave();
  } else {
    ctx.reply(
      "Você precisa enviar o contato da pessoa que será administradora"
    );
  }
});
