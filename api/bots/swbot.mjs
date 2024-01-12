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
import { getModelByTenant } from "../utils/tenantUtils.mjs";
import userSchema from "../schemas/User.mjs";

configDotenv();

const app = express();

const bot = new Telegraf(process.env.SWBOTTOKEN);

app.post("/api/bots/swbottest", async (req, res, next) => {
  const {
    customer_chat_id,
    customer_pgme_id,
    plan_pgme_id,
    type_item_bought,
    bot_name
  } = req.body;
  console.log(req.body);

  if ((type_item_bought !== undefined) && (type_item_bought === "subscription")) {
    await subscriptions.subscriptionBought(bot, bot_name, customer_chat_id);
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
  ctx.session.botName = "swbot";
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
