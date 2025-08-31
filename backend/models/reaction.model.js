import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
    message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    emoji: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /\{Emoji}/u.test(v);
            },
            message: props => `${props.value} is not a valid emoji!`
        }
    },
}, { timestamps: true});

export const Reaction = mongoose.model("Reaction", reactionSchema);