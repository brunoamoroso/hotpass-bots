import { Scenes, Markup } from "telegraf";
import chatsFilter from "../utils/chatsFilter.mjs";
import botConfigSchema from "../schemas/BotConfig.mjs";
import { getModelByTenant } from "../utils/tenantUtils.mjs";

export const msgTrigger = new Scenes.BaseScene("msgTrigger");

msgTrigger.enter(async (ctx) => {
    return await ctx.reply("Certo, vamos começar a montar a sua mensagem para disparo.\n\nSe você quiser que ela tenha foto ou vídeo juntos, selecione um deles na sua galeria, adicione uma legenda e me envie");
});

msgTrigger.on("message", async (ctx) => {
    ctx.scene.session.msg = {};

    if(ctx.message.text){
        ctx.scene.session.msg.text = ctx.message.text;
    }

    if(ctx.message.photo){
        ctx.scene.session.msg.media = {
            type: "photo",
            file: ctx.message.photo[0].file_id
        }

        ctx.scene.session.msg.caption = ctx.message.caption;
    }

    if(ctx.message.video){
        ctx.scene.session.msg.media = {
            type: "video",
            file: ctx.message.video.file_id
        }

        ctx.scene.session.msg.caption = ctx.message.caption;
    }

    return await ctx.reply("Escolha um botão de chamada pro bot", {
        ...Markup.inlineKeyboard([
            [Markup.button.callback("🤖 Acesse o Bot", "bot")],
            [Markup.button.callback("📹 Veja meus Packs", "packs")],
            [Markup.button.callback("❤️‍🔥 Seja meu Assinante", "subscriptions")],
            [Markup.button.callback("Não quero botão de chamada", "noCTA")]
        ])
    })
});

//CTA Buttons
msgTrigger.action("bot", async (ctx) => {
    ctx.scene.session.msg.cta = "bot";
    await chatsFilter(ctx);
});

msgTrigger.action("packs", async (ctx) => {
    ctx.scene.session.msg.cta = "packs";
    await chatsFilter(ctx);
});

msgTrigger.action("subscriptions", async (ctx) => {
    ctx.scene.session.msg.cta = "subscriptions";
    await chatsFilter(ctx);
});

msgTrigger.action("noCTA", async (ctx) => {
    await chatsFilter(ctx);
});

//chatFilter buttons
msgTrigger.action("target_preview", async (ctx) => {
    await ctx.reply("✅ Certo, estou enviado a mensagem somente no grupo de prévias agora mesmo");

    const botConfigsModel = getModelByTenant(
        ctx.session.db,
        "BotConfig",
        botConfigSchema
      );
    const botConfigs = await botConfigsModel.findOne().lean();

    await composeAndSendMsg(ctx, botConfigs.preview_chat_id, ctx.scene.session.msg);
    return ctx.scene.leave();
});

msgTrigger.action("target_vip", async (ctx) => {
    await ctx.reply("✅ Certo, estou enviado a mensagem somente no grupo de prévias agora mesmo");

    const botConfigsModel = getModelByTenant(
        ctx.session.db,
        "BotConfig",
        botConfigSchema
      );
    const botConfigs = await botConfigsModel.findOne().lean();

    await composeAndSendMsg(ctx, botConfigs.vip_chat_id, ctx.scene.session.msg);
    return ctx.scene.leave();
});

msgTrigger.action("target_all", async (ctx) => {
    await ctx.reply("✅ Certo, estou enviado a mensagem somente no grupo de prévias agora mesmo");

    const botConfigsModel = getModelByTenant(
        ctx.session.db,
        "BotConfig",
        botConfigSchema
      );
    const botConfigs = await botConfigsModel.findOne().lean();

    await composeAndSendMsg(ctx, botConfigs.preview_chat_id, ctx.scene.session.msg);
    await composeAndSendMsg(ctx, botConfigs.vip_chat_id, ctx.scene.session.msg);

    return ctx.scene.leave();
});

/**
 * @param {*} chat_id 
 * @param {*} msgObj this should be a ctx.scene.session.msg
 */
async function composeAndSendMsg(ctx, chat_id, msgObj){
    const botURL = `https://t.me/${ctx.session.tgBotLink}?start`;
    const packsURL = `https://t.me/${ctx.session.tgBotLink}?start=viewPacks`;
    const subscriptionsURL = `https://t.me/${ctx.session.tgBotLink}?start=viewSubscriptions`;

    if(msgObj.text){
        switch (msgObj.cta) {
            case "bot":
                    await ctx.telegram.sendMessage(chat_id, msgObj.text, {
                        ...Markup.inlineKeyboard([
                            Markup.button.url("🤖 Acesse o Bot", botURL)
                        ])
                    })
                break;
            
            case "packs":
                await ctx.telegram.sendMessage(chat_id, msgObj.text, {
                    ...Markup.inlineKeyboard([
                        Markup.button.url("📹 Veja meus Packs", packsURL)
                    ])
                })
                break;

            case "subscriptions":
                await ctx.telegram.sendMessage(chat_id, msgObj.text, {
                    ...Markup.inlineKeyboard([
                        Markup.button.url("❤️‍🔥 Seja meu Assinante", subscriptionsURL)
                    ])
                })
                break;
            
            default:
                await ctx.telegram.sendMessage(chat_id, msgObj.text)
                break;
        }
    }

    if(msgObj.media.type === "photo"){
        switch (msgObj.cta) {
            case "bot":
                    await ctx.telegram.sendPhoto(chat_id, msgObj.media.file, {
                        caption: msgObj.caption,
                        ...Markup.inlineKeyboard([
                            Markup.button.url("🤖 Acesse o Bot", botURL)
                        ])
                    })
                break;
            
            case "packs":
                await ctx.telegram.sendPhoto(chat_id, msgObj.media.file, {
                    caption: msgObj.caption,
                    ...Markup.inlineKeyboard([
                        Markup.button.url("📹 Veja meus Packs", packsURL)
                    ])
                })
                break;

            case "subscriptions":
                await ctx.telegram.sendPhoto(chat_id, msgObj.media.file, {
                    caption: msgObj.caption,
                    ...Markup.inlineKeyboard([
                        Markup.button.url("❤️‍🔥 Seja meu Assinante", subscriptionsURL)
                    ])
                })
                break;
            
            default:
                await ctx.telegram.sendPhoto(chat_id, msgObj.media.file, {
                    caption: msgObj.caption,
                })
                break;
        }
    }

    if(msgObj.media.type === "video"){
        switch (msgObj.cta) {
            case "bot":
                    await ctx.telegram.sendVideo(chat_id, msgObj.media.file, {
                        caption: msgObj.caption,
                        ...Markup.inlineKeyboard([
                            Markup.button.url("🤖 Acesse o Bot", botURL)
                        ])
                    })
                break;
            
            case "packs":
                await ctx.telegram.sendVideo(chat_id, msgObj.media.file, {
                    caption: msgObj.caption,
                    ...Markup.inlineKeyboard([
                        Markup.button.url("📹 Veja meus Packs", packsURL)
                    ])
                })
                break;

            case "subscriptions":
                await ctx.telegram.sendVideo(chat_id, msgObj.media.file, {
                    caption: msgObj.caption,
                    ...Markup.inlineKeyboard([
                        Markup.button.url("❤️‍🔥 Seja meu Assinante", subscriptionsURL)
                    ])
                })
                break;
            
            default:
                await ctx.telegram.sendVideo(chat_id, msgObj.media.file, {
                    caption: msgObj.caption,
                })
                break;
        }
    }
}