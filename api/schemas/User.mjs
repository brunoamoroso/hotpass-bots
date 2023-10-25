import { Schema } from "mongoose";

const userSchema = new Schema(
  {
    telegram_id: {
      type: Number,
      required: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: String,
    username: String,
    interest_level: {
      type: String,
      default: "low",
    },
    role_type: {
      type: String,
      default: "customer",
    },
    packs_bought: Array,
    subscriptions_bought: Array,
  },
  {
    timestamps: true,
  }
);

export default userSchema;
