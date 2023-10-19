import User from "../models/User.mjs";

export const authUser = async (userTg) => {
  const user = await User.findOne({telegram_id: userTg.id});
  if(!user){
    const newUser = new User({
      telegram_id: userTg.id,
      first_name: userTg.first_name,
      last_name: userTg.last_name,
      username: userTg.username,
    })
    newUser.save();
    return "customer";
  }else{
    return user.role_type;
  }
};
