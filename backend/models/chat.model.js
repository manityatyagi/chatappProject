import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
       name: {
          type: String,
          required: true,
          trim: true
     },
       isNormatChat: {
          type: Boolean,
          default: true,
     },
       isGroupChat: {
          type: Boolean,
          default: false
     },
       isBotChat: {
          type: Boolean,
          default: false
     },
       users: [
        {
          type:mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
     ],
       groupAdmin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
     },
       latestMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message"
     },
       chatAvatar: {
          type: String,
          default: 'https://avatar.iran.liara.run/public'
          }
       },
     {timestamps: true})
     
chatSchema.pre("save", function(next) {
    this.updatedAt = Date.now();
    next();
 })
export const Chat = mongoose.model("Chat", chatSchema);