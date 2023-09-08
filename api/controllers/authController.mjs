import { Telegraf, Markup } from "telegraf";
import authModel from '../models/authModel.mjs';

class AuthController{
    constructor(ctx){
        this.ctx = ctx;
    }

    registerUser(){
        //user has id, is_bot, first_name, last_name, username, language_code
        const user = this.ctx.update.message.from;
        const auth = new authModel(user);
        auth.saveUser();
    }
}

export default AuthController;
