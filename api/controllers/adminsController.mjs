import { Markup, Scenes } from "telegraf";
import userSchema from "../schemas/User.mjs";
import { getModelByTenant } from "../utils/tenantUtils.mjs";

export const sendMenu = (ctx) => {
  ctx.reply("Entendido, o que você deseja fazer em Admins?", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Criar Admin", "createAdmin")],
      [Markup.button.callback("Ver Admins", "viewAdmins")],
    ]),
  });
};

export const viewAdmins = new Scenes.WizardScene("viewAdmins", 
async (ctx) => {
  const User = getModelByTenant(ctx.session.db, "User", userSchema);
  const admins = await User.find({ role_type: "admin" }).lean();
 
  for (let i = 0; i < admins.length; i++) {
    await ctx.reply(
      "*_Nome Completo: _*" +
        admins[i].first_name +
        " " +
        admins[i].last_name +
        "\n\n*_Nome de Usuário: _*",
      {
        parse_mode: "MarkdownV2",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("❌ Remover Admin", `${admins[i]._id}`)],
        ]),
      }
    );
  }
  return ctx.wizard.next();
},
async (ctx) => {
  const User = getModelByTenant(ctx.session.db, "User", userSchema);
  if(ctx.callbackQuery.data){
    try{
      const adminToRemove = ctx.callbackQuery.data;
      await User.deleteOne({_id: adminToRemove});
      ctx.reply("O admin foi removido com sucesso!");
      return ctx.scene.leave();
    }catch(err){
      console.log(err);
      return ctx.scene.leave();
    }
  }
}
);

export const createAdmin = new Scenes.BaseScene("createAdmin");

createAdmin.enter(async (ctx) => {
  ctx.reply(
    "Certo, me envie o contato de quem será um novo Administrador do Bot"
  );
});

createAdmin.on("message", async (ctx) => {
  const User = getModelByTenant(ctx.session.db, "User", userSchema);
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
