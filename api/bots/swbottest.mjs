import express from "express";
import { configDotenv } from "dotenv";
import { Telegraf, Scenes, session } from "telegraf";
import { Mongo } from "@telegraf/session/mongodb";
import composer from "../index.mjs";

//Controllers
import * as packs from "../controllers/packsController.mjs";
import * as links from "../controllers/linkAgreggatorController.mjs";
import * as admins from "../controllers/adminsController.mjs";
import * as subscriptions from "../controllers/subscriptionsController.mjs";
import { connectDb } from "../db/conn.mjs";

configDotenv();

const app = express();

const bot = new Telegraf(process.env.SWBOTTOKEN);

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
// bot.use((ctx) => {
//   connectDb(ctx.session.db).catch(err => console.log(err));
// });
bot.use(stage.middleware());
bot.use(composer);

bot.command("sair", async (ctx) => {
 await ctx.scene.leave();
 return ctx.reply("Saindo");
});

bot.catch((err) => {
  console.log("Error: " + err);
});

export default app;
