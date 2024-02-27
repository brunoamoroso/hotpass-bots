import botConfigSchema from "../schemas/BotConfig.mjs";
import userSchema from "../schemas/User.mjs";
import { getModelByTenant } from "../utils/tenantUtils.mjs";
import { Telegraf } from "telegraf";
import express from "express";
import * as subscriptions from "../controllers/subscriptionsController.mjs";

export default async function checkSubscriptions() {
  const bots = [
    {
      name: "amandaleon",
      token: process.env.AMANDALEON_TOKEN,
    },
    {
      name: "swbot",
      token: process.env.SWBOTTOKEN,
    },
  ];

  const app = express();

  try {
    bots.forEach(async (bot) => {
      const telegramBot = new Telegraf(bot.token);
      app.use(
        await telegramBot.createWebhook({
          domain: process.env.WEBHOOK_DOMAIN,
          path: `/api/bots/${bot.name}`,
        })
      );

      const BotConfigModel = getModelByTenant(
        bot.name + "db",
        "BotConfig",
        botConfigSchema
      );

      console.log(`concectou no ${bot.name}`)
      const botConfigs = await BotConfigModel.findOne().lean();
      console.log(botConfigs);

      if(!botConfigs){
        console.log(`Bot, ${bot.name}, hasn't configured its botConfigs`);
        return;
      }

      if (!botConfigs.vip_chat_id) {
        console.log(`Bot, ${bot.name}, hasn't a vip chat defined`);
        return;
      }

      const UserModel = getModelByTenant(bot.name + "db", "User", userSchema);

      // the solution with the updateMany has a problem of not returning the documents so it isn't possible to remove them from the vip channel
      const query = {
        subscriptions_bought: {
          $elemMatch: {
            status: "active",
            date_exp: { $lte: new Date() },
          },
        },
      };

      const users = await UserModel.find(query).lean();

      if (users.length === 0) {
        console.log(
          `Bot, ${bot.name}, hasn't any users with an active subscription`
        );
        return;
      }

      //remove users from the vip channel
      users.forEach((user) => {
        telegramBot.telegram.banChatMember(
          botConfigs.vip_chat_id,
          user.telegram_id
        );
      });

      //update users to have a inactive subscription
      const updateQuery = {
        $set: {
          "subscriptions_bought.$[].status": "inactive",
        },
      };
      
      await UserModel.updateMany(query, updateQuery);
    });
  } catch (err) {
    console.log(err);
  }
}
