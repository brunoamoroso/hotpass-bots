import { Telegraf, Scenes, session } from "telegraf";
import express from "express";
import { configDotenv } from "dotenv";

//Controllers
import * as packs from "./controllers/admin/packsController.mjs";
import * as links from "./controllers/admin/linkAgreggatorController.mjs";
import * as admins from "./controllers/admin/adminsController.mjs";
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
const stage = new Scenes.Stage([
  links.createLinkWizard,
  links.viewLinks,
  packs.createPack,
  packs.viewPacks,
  admins.createAdmin,
  admins.viewAdmins,
]);
bot.use(session());
bot.use(stage.middleware());

bot.command("/menu", (ctx) => {
  ctx.scene.leave();
  mainMenu(ctx);
})

//Packs
bot.action("packs", (ctx) => {
  packs.sendMenu(ctx);
});

bot.action("createPack", (ctx) => {
  ctx.scene.enter("createPackScene");
});

bot.action("viewPacks", (ctx) => {
  ctx.scene.enter("viewPacksScene");
});

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

links.viewLinks.leave((ctx) => {
  setTimeout(() => {
    mainMenu(ctx);
  }, 2000);
});

//Create Admin
bot.action("admins", (ctx) => {
  admins.sendMenu(ctx);
});

bot.action("createAdmin", (ctx) => {
  ctx.scene.enter("createAdminScene");
})


bot.action("viewAdmins", (ctx) => {
  ctx.scene.enter("viewAdminsScene");
});

// local route
app.use("/", (req, res) => {
  bot.launch();
});

export default app;
