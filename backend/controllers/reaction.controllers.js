import { Reaction } from "../models/reaction.model.js";
import { Message } from "../models/message.model.js";
import { Notification } from "../models/notification.model.js";

export const addReaction = async(req, res) => {
    try {
        const { emoji } = req.body;
        const { messageId } = req.params;

        const reaction = await Reaction.deleteOne({
            message: messageId,
            user: req.user.id
        });

        const newReaction = new Reaction({
            message: messageId,
            user: req.user.id,
            emoji
        });
         await newReaction.save();

         const message = await Message.findById(messageId);
         if(message.sender.toString() !== req.user.id){
            await Notification.create({
               sender: req.user.id,
               recipient: message.sender,
               content: `Reacted with ${emoji} to your message`,
               type: 'reaction',
               relatedEntity: messageId,
               onModel: 'Message'
            });
         }
            res.json(reaction);
        } catch (error) {
          res.status(500).json({message: error.message});
    }
}

