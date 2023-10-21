import { Composer } from "telegraf";

//Controllers
// import * as packs from "./controllers/packsController.mjs";
import * as links from "./controllers/linkAgreggatorController.mjs";
import * as admins from "./controllers/adminsController.mjs";
import  * as auth from './controllers/authController.mjs';
// import * as subscriptions from "./controllers/subscriptionsController.mjs";

import mainMenu from "./mainMenu.mjs";

const composer = new Composer();

composer.start((ctx) => {
  auth.authUser(ctx.from).then((role) => {
    mainMenu(ctx, role);
  });
});

//   bot.command("/menu", (ctx) => {
//     ctx.scene.leave();
//     mainMenu(ctx);
//   });

//   //Subscriptions
//   //Admin
//   bot.action("subscriptions", (ctx) => {
//     subscriptions.sendMenu(ctx);
//   });

//   bot.action("createSubscriptionPlan", (ctx) => {
//     ctx.scene.enter("createSubscriptionPlanScene");
//   });

//   bot.action("viewActiveSubscriptions", (ctx) => {
//     ctx.scene.enter("viewActivePlansScene");
//   });

//   //Customer
//   bot.action("subscriptionsCustomer", (ctx) => {
//     ctx.scene.enter("buySubscriptionScene");
//   });

//   //End of Subscriptions

//   //Packs
//   //Admin
//   bot.action("packs", (ctx) => {
//     packs.sendMenu(ctx);
//   });

//   bot.action("createPack", (ctx) => {
//     ctx.scene.enter("createPackScene");
//   });

//   bot.action("viewPacks", (ctx) => {
//     ctx.scene.enter("viewPacksScene");
//   });

//   //Customer
//   bot.action("packsCustomer", (ctx) => {
//     ctx.scene.enter("buyPacksScene");
//   });

//   bot.on("pre_checkout_query", (ctx) => {
//     ctx.answerPreCheckoutQuery(true);
//   });
//   //End of Packs

  //Links Agreggator
  //Admin
  composer.action("links", (ctx) => {
    links.sendMenu(ctx);
  });

  composer.action("createLink", (ctx) => {
    ctx.scene.enter("createLink");
  });

  composer.action("viewLinks", (ctx) => {
    ctx.scene.enter("viewLinks");
  });

  // links.viewLinks.leave((ctx) => {
  //   setTimeout(() => {
  //     mainMenu(ctx);
  //   }, 2000);
  // });

  // //Customer
  // composer.action("linksCustomer", (ctx) => {
  //   links.sendCustomerLinks(ctx);
  // });
  //End of Link Agreggator

//Create Admin
composer.action("admins", async (ctx) => {
  admins.sendMenu(ctx);
});

composer.action("createAdmin", async (ctx) => {
  ctx.scene.enter("createAdmin");
});

composer.action("viewAdmins", async (ctx) => {
  ctx.scene.enter("viewAdmins");
});

export default composer;
