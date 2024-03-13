import { Markup, Scenes } from "telegraf";
import { getModelByTenant } from "../utils/tenantUtils.mjs";
import botConfigSchema from "../schemas/BotConfig.mjs";

export const customStartCreator = new Scenes.WizardScene("customStart", 
    async (ctx) => {
        await ctx.reply("Certo, vamos montar um start customizado para você.\n\nLembre-se que essa é a mensagem que irá aparecer junto com o menu toda vez que o usuário digitar /start");
        await ctx.reply("Me envie um texto para utlizar.\n\nSe você quiser que ela tenha foto ou vídeo juntos, selecione um deles na sua galeria, adicione uma legenda e me envie")
        return ctx.wizard.next();
    },
    async (ctx) => {
        if(!ctx.message){
            await ctx.reply("Você precisa seguir as instruções acima.");
            return;
        }

        ctx.scene.session.customStart = {};
        await ctx.reply("Seu /start vai ficar assim:");

        const customerKeyboard = [
            [Markup.button.callback("❤️‍🔥 Assinaturas", " ")],
            [Markup.button.callback("📹 Packs", " ")],
            [Markup.button.callback("🔗 Links", " ")],
          ];

        if(ctx.message.text){
            ctx.scene.session.customStart.text = ctx.message.text;
            await ctx.reply(ctx.message.text, {
                ...Markup.inlineKeyboard(customerKeyboard)
            })
        }

        if(ctx.message.photo){
            ctx.scene.session.customStart.media = {
                type: "photo",
                file: ctx.message.photo[0].file_id,
            }

            ctx.scene.session.customStart.caption = ctx.message.caption;

            await ctx.replyWithPhoto(ctx.message.photo[0].file_id, {
                caption: ctx.message.caption,
                ...Markup.inlineKeyboard(customerKeyboard)
            })
        }

        if(ctx.message.video){
            ctx.scene.session.customStart.media = {
                type: "video",
                file: ctx.message.video.file_id,
            }

            ctx.scene.session.customStart.caption = ctx.message.caption;

            await ctx.replyWithVideo(ctx.message.video.file_id, {
                caption: ctx.message.caption,
                ...Markup.inlineKeyboard(customerKeyboard)
            })
        }

        await ctx.reply("O que você deseja fazer?", {
            ...Markup.inlineKeyboard([
                [Markup.button.callback("✅ Salvar", "save")],
                [Markup.button.callback("❌ Descartar", "cancel")]
            ])
        });

        return ctx.wizard.next();
    },
    async (ctx) => {
        if(!ctx.callbackQuery.data){
            await ctx.reply("Responda se você quer salvar ou descartar");
            return;
        }

        if((ctx.callbackQuery.data === " ") || (ctx.callbackQuery.data === "cancel")){
            await ctx.reply("❌ Descartando o que foi feito até aqui. Use /start para recomeçar");
            return ctx.scene.leave();
        }

        if(ctx.callbackQuery.data === "save"){
            const BotConfigsModel = getModelByTenant(ctx.session.db, "BotConfig", botConfigSchema);
            await BotConfigsModel.findOneAndUpdate({}, {
                $set: {
                    "custom_start": await ctx.scene.session.customStart
                },
            });

            await ctx.reply("✅ Mensagem Inicial Customizada salva com sucesso!");
            return ctx.scene.leave();
        }
    }
)