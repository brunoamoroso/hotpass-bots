import { Markup, Scenes } from "telegraf";
import { getModelByTenant } from "../utils/tenantUtils.mjs";
import userSchema from "../schemas/User.mjs";
import botConfigSchema from "../schemas/BotConfig.mjs";
import mongoose from "mongoose";

export const migrate = new Scenes.WizardScene(
  "migrate",
  async (ctx) => {
    const BotConfigsModel = getModelByTenant(
      ctx.session.db,
      "BotConfig",
      botConfigSchema
    );
    const botConfigs = await BotConfigsModel.findOne().lean();

    if (!botConfigs) {
      await ctx.reply(
        "Você precisa definir ao menos um chat para o bot para inicializar os BotConfigs dele"
      );
      return ctx.scene.leave();
    }

    let keyboardBtns = [];

    if (botConfigs.vip_chat_id) {
      keyboardBtns.push([
        Markup.button.callback("Grupo VIP", "vip+" + botConfigs.vip_chat_id),
      ]);
    }

    if (botConfigs.preview_chat_id) {
      keyboardBtns.push([
        Markup.button.callback(
          "Grupo de Prévias",
          "preview+" + botConfigs.preview_chat_id
        ),
      ]);
    }

    await ctx.reply("Qual dos chats você está migrando?", {
      ...Markup.inlineKeyboard(keyboardBtns),
    });
    return ctx.wizard.next();
  },
  async (ctx) => {
    ctx.scene.session.chat = ctx.callbackQuery.data.split("+");
    await ctx.reply(
      "Me envie um array contendo todos os telegramIds que você obteve com os gists que estão nos docs sobre migração"
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const arrayIds = JSON.parse(ctx.message.text);

    const chatType = ctx.scene.session.chat[0];
    const chatId = ctx.scene.session.chat[1];

    let migrateUsers = [];
    let userToMigrate = {};

    function wait(ms){
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    try {
      for (let i = 0; i < arrayIds.length; i++) {
        const telegramId = parseInt(arrayIds[i]);
        
        const telegramUser = await ctx.telegram.getChatMember(
          chatId,
          telegramId
        );

        if (telegramUser.user.is_bot) {
          continue;
        }

        switch (chatType) {
          case "vip":
            userToMigrate = {
              telegram_id: telegramUser.user.id,
              first_name: telegramUser.user.first_name || "",
              last_name: telegramUser.user.last_name || "",
              username: telegramUser.user.username || "",
              subscriptions_bought: [
                {
                  _id: new mongoose.Types.ObjectId().toString(),
                  name: "Subscription Migration",
                  interval: "month",
                  intervalCount: 1,
                  price: 0,
                  status: "active",
                  date_bought: new Date("2024-03-01T00:00:00Z"),
                  date_exp: new Date("2024-04-01T00:00:00Z"),
                },
              ],
            };
            break;

          case "preview":
            userToMigrate = {
              telegram_id: telegramUser.user.id,
              first_name: telegramUser.user.first_name || "",
              last_name: telegramUser.user.last_name || "",
              username: telegramUser.user.username || "",
            };
            break;
        }
        migrateUsers.push(userToMigrate);
        await wait(1000);
      }

      const UserModel = getModelByTenant(ctx.session.db, "User", userSchema);
      const result = await UserModel.insertMany(migrateUsers);
      console.log(result);
      await ctx.reply(`Foram migrados ${result.length} usuários`);
    } catch (err) {
      console.log(err);
    }
    return ctx.scene.leave();
  }
);
