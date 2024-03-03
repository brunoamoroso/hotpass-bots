import { getModelByTenant } from "../utils/tenantUtils.mjs";
import userSchema from '../schemas/User.mjs';

export const authUser = async (userTg, db) => {
  const User = getModelByTenant(db, "User", userSchema);

  const userData = {
    telegram_id: userTg.id,
    first_name: userTg.first_name,
    last_name: userTg.last_name,
    username: userTg.username,
  }

  const user = await User.findOneAndUpdate({telegram_id: userTg.id}, userData, {
    new: true,
    upsert: true,
  });

  return user.role_type;
};
