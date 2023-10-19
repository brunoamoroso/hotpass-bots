// import { Markup, Scenes } from "telegraf";
// import * as subscriptionsModel from "../models/subscriptionsModel.mjs";
// import cycleFormat from "../utils/cycleFormat.mjs";

// export const sendMenu = (ctx) => {
//   ctx.reply("O que você quer fazer nas assinaturas?", {
//     ...Markup.inlineKeyboard([
//       [Markup.button.callback("Criar um Plano", "createSubscriptionPlan")],
//       [Markup.button.callback("Ver Planos Ativos", "viewActivePlans")],
//     ]).oneTime(),
//   });
// };

// export const createSubscription = new Scenes.WizardScene(
//   "createSubscriptionPlanScene",
//   (ctx) => {
//     ctx.scene.session.planData = {};
//     ctx.reply("Certo, comece me enviando qual será o nome do seu plano");
//     ctx.wizard.next();
//   },
//   (ctx) => {
//     ctx.scene.session.planData.title = ctx.message.text;
//     ctx.reply("Agora me fale quanto vai custar o plano de assinatura");
//     ctx.wizard.next();
//   },
//   (ctx) => {
//     ctx.scene.session.planData.price = ctx.message.text;
//     ctx.reply(
//       "O plano será cobrado dos assinates a cada X Semanas ou X Meses?",
//       {
//         ...Markup.inlineKeyboard([
//           [Markup.button.callback("Semanas", "weekly")],
//           [Markup.button.callback("Meses", "monthly")],
//         ]),
//       }
//     );
//     ctx.wizard.next();
//   },
//   (ctx) => {
//     ctx.scene.session.planData.cycle = ctx.callbackQuery.data;
//     const chosenOpt = ctx.callbackQuery.data === "weekly" ? "Semanas" : "Meses";
//     ctx.reply(
//       `\*Você escolheu:  ${chosenOpt}*\n\nAgora digite após quantos\\(as\\) ${chosenOpt} será cobrado o pagamento para continuar acessando o plano\\. \n\nEx: 2 para 2 ${chosenOpt}`,
//       {
//         parse_mode: "MarkdownV2",
//       }
//     );

//     ctx.wizard.next();
//   },
//   async (ctx) => {
//     ctx.scene.session.planData.duration = ctx.message.text;
//     await subscriptionsModel.save(ctx.scene.session.planData);
//     ctx.reply("Plano salvo!");
//     ctx.scene.leave();
//   }
// );

// export const viewActiveSubscriptions = new Scenes.BaseScene(
//   "viewActiveSubscriptionsScene"
// );

// viewActiveSubscriptions.enter(async (ctx) => {
//   const plans = await subscriptionsModel.getActivePlansAdmin();
//   plans.forEach((plan) => {
//     plan.cycle = plan.cycle === "weekly" ? "Semanas" : "Meses";
//     ctx.reply(
//       "*_Nome do Plano:_*\n" +
//         plan.title +
//         "\n\n*_Preço do Plano:_*\n" +
//         plan.price.replace(".", "\\.") +
//         "\n\n*_Ciclo de cobrança do Plano:_*\n" +
//         plan.duration +
//         " " +
//         cycleFormat(plan.duration, plan.cycle) +
//         "\n\n*_Assinantes Ativos:_*\n" +
//         plan.subscribers,
//       {
//         parse_mode: "MarkdownV2",
//       }
//     );
//   });
// });

// export const buySubscription = new Scenes.BaseScene("buySubscriptionScene");

// buySubscription.enter((ctx) => {
//   subscriptionsModel.getActivePlansCustomer().then((plans) => {
//     let keyboardBtns = [];
//     plans.forEach((plan) => {
//       const btnText =
//         plan.title +
//         " - " +
//         plan.duration +
//         " " +
//         cycleFormat(plan.duration, plan.cycle);
//       keyboardBtns.push([Markup.button.callback(btnText, plan.id)]);
//     });

//     ctx.reply(
//       "Tá quase tendo o privilégio de poucos amor. Escolhe por quanto tempo você quer acesso a mim 😏",
//       {
//         ...Markup.inlineKeyboard(keyboardBtns),
//       }
//     );
//   });
// });

// buySubscription.on("callback_query", async (ctx) => {
//   subscriptionsModel
//     .getSubscriptionPlanById(ctx.callbackQuery.data)
//     .then((plan) => {
//       ctx.sendInvoice(
//         {
//           chat_id: ctx.chat.id,
//           title: plan.title,
//           description: `Vai garantir ${plan.duration} ${cycleFormat(plan.duration, plan.cycle)} a mim amor`,
//           payload: {userId: ctx.chat.id, planId: ctx.callbackQuery.data},
//           provider_token: process.env.STRIPE_KEY,
//           currency: "BRL",
//           prices: [{ label: "Preço", amount: plan.price.replace(".", "") }],
//         }
//       );
//     });
// });
