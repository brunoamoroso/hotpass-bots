import express from "express";
import { configDotenv } from "dotenv";
import composer from "../index.mjs";
import { Telegraf } from "telegraf";

configDotenv();

const app = express();

const bot = new Telegraf(process.env.HOTSENSEBOT_TOKEN);

// setting webhook to receive updates
app.use(
  await bot.createWebhook({
    domain: process.env.WEBHOOK_DOMAIN,
    path: "/api/bots/hotsense",
  })
);

bot.use(composer);
bot.catch(err => {
  console.log(err);
})

export default app;