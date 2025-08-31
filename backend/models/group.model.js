import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    avatar: {
        type: String,
        default: 'https://i.imgur.com/6VBx3io.png'
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

groupSchema.pre("save", function(next) {
    this.updatedAt = Date.now();
    next();
});

export const Group = mongoose.model("Group", groupSchema);