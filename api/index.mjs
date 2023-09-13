import { Telegraf, Markup, Scenes, session } from "telegraf";
import express from "express";
import { configDotenv } from "dotenv";
// import AdsController from "./controllers/admin/adsController.mjs";
import LinkAgreggatorController from "./controllers/admin/linkAgreggatorController.mjs";
// import AuthController from "./controllers/authController.mjs";
// import client from "./db/conn.mjs";

configDotenv();
const app = express();

const bot = new Telegraf(process.env.TOKEN);
// const ads = new AdsController();
const links = new LinkAgreggatorController();
// const SECRET_HASH = "32e58fbahey833349df3383dc910e180";

// setting webhook to receive updates
// app.use(await bot.createWebhook({domain: process.env.WEBHOOK_DOMAIN, path: '/api/'}))

function mainMenu(ctx){
  const photo =
  "https://instagram.fccm2-1.fna.fbcdn.net/v/t51.2885-15/333171007_5984120695037196_245506842773113983_n.jpg?stp=dst-jpg_e35_p1080x1080&_nc_ht=instagram.fccm2-1.fna.fbcdn.net&_nc_cat=100&_nc_ohc=Pq5JW1iLYH8AX8hSIkK&edm=ACWDqb8BAAAA&ccb=7-5&ig_cache_key=MzA1NDk1MjY4NzQxMDY4NTQyMg%3D%3D.2-ccb7-5&oh=00_AfC1Z57_wLEktVizsI5thVi9lcCwM7IqHVOFEelJR6tcFQ&oe=64EE90EB&_nc_sid=ee9879";
  
  return ctx.replyWithPhoto(photo, {
    caption: "Oi amor, achou meu bot é? Vem navegar comigo\\.",
    parse_mode: "MarkdownV2",
    ...Markup.inlineKeyboard([
      [Markup.button.callback("🔗 Agregador de Links", "links")],
      [Markup.button.callback("📹 Meus Packs", "packs")],
    ])
      .oneTime()
      .resize(),
  });
};

//Initial message and entrypoint
bot.start((ctx) => {
  // const auth = new AuthController(ctx);
  // auth.registerUser();
  mainMenu(ctx);
});

//Handle Factories
const { enter, leave } = Scenes.Stage;

//creates stage
const stage = new Scenes.Stage([links.createLinkWizard, links.viewLinksWizard]);
bot.use(session());
bot.use(stage.middleware());

bot.action("packs", (ctx) => {

});

bot.action("links", (ctx) => {
  links.setCtx(ctx);
  links.sendMenu();
});

bot.action("createLink", (ctx) => {
  ctx.scene.enter("createLinkScene");
});

bot.action("viewLinks", (ctx) => {
  ctx.scene.enter("viewLinksScene");
});

stage.on("leave", ctx => {
  bot.start();
})

// local route
app.use("/", (req, res) => {
  bot.launch();
});

export default app;
