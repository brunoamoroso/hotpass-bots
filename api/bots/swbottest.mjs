import express from "express";
import { configDotenv } from "dotenv";
import { Telegraf, Scenes, session, Markup } from "telegraf";
import { Mongo } from "@telegraf/session/mongodb";
import composer from "../botIndex.mjs";

//Controllers
import * as packs from "../controllers/packsController.mjs";
import * as links from "../controllers/linkAgreggatorController.mjs";
import * as admins from "../controllers/adminsController.mjs";
import * as subscriptions from "../controllers/subscriptionsController.mjs";
import * as groupChat from "../controllers/groupChatController.mjs";
import { getModelByTenant } from "../utils/tenantUtils.mjs";

configDotenv();

const app = express();

const bot = new Telegraf(process.env.SWBOTTOKEN);

app.post("/api/bots/swbottest", async (req, res, next) => {
  const {
    channel_id,
    customer_chat_id,
    customer_pgme_id,
    plan_pgme_id,
    type_item_bought,
  } = req.body;
  console.log(req.body);

  if (type_item_bought !== undefined) {
    try {
      //update user with subscription bought for future marketing strategies

      const chatInviteLink = await bot.telegram.createChatInviteLink(
        channel_id,
        { chat_id: channel_id, creates_join_request: true }
      );
      await bot.telegram.sendMessage(
        customer_chat_id,
        "✅ Pagamento confirmado"
      );
      await bot.telegram.sendMessage(
        customer_chat_id,
        "Bem vindo ao grupo vip",
        {
          chat_id: customer_chat_id,
          ...Markup.inlineKeyboard([
            Markup.button.url(
              "Acesso ao grupo VIP",
              chatInviteLink.invite_link
            ),
          ]),
        }
      );
      return res.status(200).send("ok");
    } catch (err) {
      console.log(err);
    }
  }

  next();
});

// setting webhook to receive updates
app.use(
  await bot.createWebhook({
    domain: process.env.WEBHOOK_DOMAIN,
    path: "/api/bots/swbottest",
  })
);

// creates stage
const stage = new Scenes.Stage([
  links.createLink,
  links.viewLinks,
  packs.createPack,
  packs.viewPacks,
  packs.buyPacks,
  admins.createAdmin,
  admins.viewAdmins,
  subscriptions.createSubscriptionPlan,
  subscriptions.viewActiveSubscriptionsPlan,
  subscriptions.buySubscription,
]);

const store = Mongo({
  url: process.env.MONGODB_URI,
  database: "swbotdb",
});

bot.use(session({ store }));
bot.use(stage.middleware());
bot.use(async (ctx, next) => {
  ctx.session.db = "swbotdb";
  ctx.session.botName = "swbottest";
  return next();
});
bot.use(composer);

bot.command("sair", async (ctx) => {
  await ctx.scene.leave();
  return ctx.reply("Saindo");
});

bot.catch((err) => {
  console.log("Error: " + err);
});

export default app;
