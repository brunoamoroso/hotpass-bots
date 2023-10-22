import mongoose from "../db/conn.mjs";
import { Schema } from "mongoose";

const Subscription = mongoose.model("Subscription", new Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: String,
        required: true,
    },
    duration:{
        type: String,
        required: true,
    },
    cycle:{
        type: String,
        required: true,
    },
    status:{
        type: String,
        default: "enabled",
    }
}, {timestamps: true}));

export default Subscription