import { Markup } from "telegraf";

export default function mainMenu(ctx, userRole){
  if(userRole === "admin"){
    const photo =
    "https://instagram.fccm2-1.fna.fbcdn.net/v/t51.2885-15/333171007_5984120695037196_245506842773113983_n.jpg?stp=dst-jpg_e35_p1080x1080&_nc_ht=instagram.fccm2-1.fna.fbcdn.net&_nc_cat=100&_nc_ohc=Pq5JW1iLYH8AX8hSIkK&edm=ACWDqb8BAAAA&ccb=7-5&ig_cache_key=MzA1NDk1MjY4NzQxMDY4NTQyMg%3D%3D.2-ccb7-5&oh=00_AfC1Z57_wLEktVizsI5thVi9lcCwM7IqHVOFEelJR6tcFQ&oe=64EE90EB&_nc_sid=ee9879";
     
    return ctx.reply("Bem vindo ao menu de Admins", {
      parse_mode: "MarkdownV2",
      ...Markup.inlineKeyboard([
        [Markup.button.callback("❤️‍🔥 Assinaturas", "subscriptions")],
        [Markup.button.callback("📹 Meus Packs", "packs")],
        [Markup.button.callback("🔗 Agregador de Links", "links")],
        [Markup.button.callback("🦹‍♀️ Admins", "admins")],
        [Markup.button.callback("📢 Divulgação", "linksCustomer")],
        [Markup.button.callback("🏷 Promoção", "linksCustomer")],
        [Markup.button.callback("💎 Definir Grupo dos VIPs", "setVipGroup")]
      ])
        .oneTime()
    });

    // return ctx.replyWithPhoto(photo, {
    //   caption: "Oi amor, achou meu bot é? Vem navegar comigo\\.",
    //   parse_mode: "MarkdownV2",
    //   ...Markup.inlineKeyboard([
    //     [Markup.button.callback("❤️‍🔥 Assinaturas", "subscriptions")],
    //     [Markup.button.callback("📹 Meus Packs", "packs")],
    //     [Markup.button.callback("🔗 Agregador de Links", "links")],
    //     [Markup.button.callback("🦹‍♀️ Admins", "admins")],
    //     [Markup.button.callback("📢 Divulgação", "linksCustomer")],
    //     [Markup.button.callback("🏷 Promoção", "linksCustomer")]
    //   ])
    //     .oneTime()
    //     .resize(),
    // });
  }else{ 
    return ctx.reply("Bem-vindo ao menu de Clientes", {
      ...Markup.inlineKeyboard([
        [Markup.button.callback("❤️‍🔥 Assinaturas", "subscriptionsCustomer")],
        [Markup.button.callback("📹 Packs", "packsCustomer")],
        [Markup.button.callback("🔗 Links", "linksCustomer")],
      ])
        .oneTime()
        .resize(),
    });
  }
};