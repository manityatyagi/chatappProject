import mongoose from "mongoose";

const AiSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    prompt: {
        type: String,
    },
    response: {
        type: String
    },
    model: {
        type: String,
        default: 'gpt-4o'
    }
}, {timestamps: true});

export const AI = mongoose.model("AI", AiSchema);