import { Notification } from "../models/notification.model.js";

const getNotification = async(req, res) => {
       try {
        const notifications = await Notification.find({
            recipient: req.user.id,
            read: false
        }).sort("-createdAt").populate("sender", "name email")
        .populate("relatedEntity");

        res.json(notifications);
       } catch (error) {
        res.status(500);
        throw new Error(error.message);
       }
}

const markasRead = async(req, res) => {
    try{
        const readMessages = await Notification.updateMany({
            _id: { $in: req.body.notificationIds },
            recipient: req.user.id,
        }, {$set: { read: true }});
      
           res.json({success: true});
    } catch(error) {
       res.status(500).json({message: error.message});
    }
}

export { getNotification,  markasRead} ;