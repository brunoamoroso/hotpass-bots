import { Schema } from "mongoose";

const botConfigSchema = new Schema(
  {
    vip_chat_id: {
      type: String,
      default: '',
    },
    preview_chat_id: {
      type: String,
      default: '',
    },
    split_rules: {
      type: Array,
      default: [
        {
          amount: 15,
          type: 'percentage',
          recipient_id: 're_clondjs7y23ny019t4kgpw2po',
          options: {
            charge_processing_fee: true,
            charge_remainder_fee: true,
            liable: false
          }
        }
      ],
    },
    owner_chat_id: {
      type: String,
      default: '',
    },
    custom_start:{
      type: Object,
      default: {},
    }
  },
  {
    timestamps: true,
  }
);

export default botConfigSchema;