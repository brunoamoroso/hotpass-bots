import { Schema } from "mongoose";

const botConfigSchema = new Schema(
  {
    vip_chat_id: {
      type: String,
    },
    preview_chat_id: {
      type: String,
    },
    split_rules: {
      type: Array,
    },
    owner_chat_id: {
      type: String,
    },
    custom_start:{
      type: Object,
    }
  },
  {
    timestamps: true,
  }
);

export default botConfigSchema;