import * as authModel from "../models/authModel.mjs";

export const authUser = async (ctx) => {
  //user has id, is_bot, first_name, last_name, username, language_code
  return await authModel.checkUserRole(ctx.from.id).then((resp) => {
    if (resp) {
      return resp.role_type;
    } else {
      authModel.saveUser(ctx.from);
      return "customer";
    }
  });
};

// export default AuthController;
