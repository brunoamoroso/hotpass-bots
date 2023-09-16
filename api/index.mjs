import { Telegraf, Markup, Scenes, session } from "telegraf";
import express from "express";
import { configDotenv } from "dotenv";
import * as packs from "./controllers/admin/packsController.mjs";
import * as links from "./controllers/admin/linkAgreggatorController.mjs";
// import AuthController from "./controllers/authController.mjs";
import mainMenu from "./mainMenu.mjs";
import client from "./db/conn.mjs";

configDotenv();
const app = express();

const bot = new Telegraf(process.env.TOKEN);
// const SECRET_HASH = "32e58fbahey833349df3383dc910e180";

// setting webhook to receive updates
// app.use(await bot.createWebhook({domain: process.env.WEBHOOK_DOMAIN, path: '/api/'}))

//Initial message and entrypoint
bot.start((ctx) => {
  // const auth = new AuthController(ctx);
  // auth.registerUser();
  mainMenu(ctx);
});

//Handle Factories
const { enter, leave } = Scenes.Stage;

//creates stage
const stage = new Scenes.Stage([links.createLinkWizard, links.viewLinksWizard, packs.createPack]);
bot.use(session());
bot.use(stage.middleware());


//Packs
bot.action("packs", (ctx) => {
  packs.sendMenu(ctx);
});

bot.action("createPack", (ctx) => {
  ctx.scene.enter("createPackScene");
})

//Links Agreggator
bot.action("links", (ctx) => {
  links.sendMenu(ctx);
});

bot.action("createLink", (ctx) => {
  ctx.scene.enter("createLinkScene");
});

bot.action("viewLinks", (ctx) => {
  ctx.scene.enter("viewLinksScene");
});

links.viewLinksWizard.leave(ctx => {
  setTimeout(() => {
     mainMenu(ctx);
  },2000);
})

// local route
app.use("/", (req, res) => {
  bot.launch();
});

export default app;
