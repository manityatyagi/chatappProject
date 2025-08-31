import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["message", "friend_request", "group_invite", "reaction"],
        required: true
    },
    relatedEntity: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "onModel"
    },
    onModel: {
        type: String,
        enum: ["Message", "Group", "User"]
    },
    read: {
        type: Boolean,
        default: false
    }, 
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {timestamps: true});

export const Notification = mongoose.model("Notification", notificationSchema)