import { User } from '../models/user.model.js';
import { Message } from  '../models/message.model.js';
import { Chat } from '../models/chat.model.js';
import { io } from '../server.js';

const uploadMediaMessage = async (req, res) => {
   try {
      const { chatId, messageType = 'file' } = req.body;
      const file = req.file;
      const userId = req.user._id;

      if (!file){
          return res.status(400).json({ error: 'No file uploaded' });
      }

      const newMessage = await Message.create({
         chatId,
         sender: userId,
         content: file.originalname,
         messageType,
         fileUrl: `/uploads/${file.filename}`
      });

      await newMessage.populate('sender', 'name email avatar');
      
      await Chat.findByIdAndUpdate(chatId, {
         latestMessage: newMessage._id,
         updatedAt: new Date()
      });
      
      res.status(201).json(newMessage);
   } catch (err) {
      console.error('Upload media error:', err);
      res.status(500).json({ error: err.message });
   }
};

const sendMessage = async(req, res) => {
    try {
         const { content, chatId, messageType = 'text' } = req.body;
         const userId = req.user._id;

         if(!content || !chatId) {
            return res.status(400).json({message: "Content and chatId are required"});
         }

         const newMessage = await Message.create({
            chatId,
            sender: userId,
            content,
            messageType
         });

         await newMessage.populate('sender', 'name email avatar');
         
         await Chat.findByIdAndUpdate(chatId, {
            latestMessage: newMessage._id,
            updatedAt: new Date()
         });

         res.status(201).json(newMessage);
    } catch (error) {
         console.error('Send message error:', error);
         res.status(500).json({ error: "Failed to send message" });
    }
};

const getMessages = async(req, res) => {
    try {
       const { chatId } = req.params;
       const userId = req.user._id;

       const chat = await Chat.findById(chatId);
       if (!chat || !chat.users.includes(userId)) {
          return res.status(403).json({ error: "Access denied" });
       }

       const messages = await Message.find({ chatId })
          .populate("sender", "name email avatar")
          .sort({ createdAt: 1 });
         
       res.json(messages);
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

const markMessagesAsRead = async(req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        await Message.updateMany(
            { chatId, sender: { $ne: userId }, isRead: false },
            { 
                $set: { isRead: true },
                $push: { readBy: { user: userId, readAt: new Date() } }
            }
        );

        res.json({ message: "Messages marked as read" });
    } catch (error) {
        console.error('Mark messages as read error:', error);
        res.status(500).json({ error: "Failed to mark messages as read" });
    }
};

const updateProfilePic = async (req, res) => {
   try {
      const userId = req.user.id;
      const file = req.file;
      if (!file) return res.status(400).json({ error: 'No file uploaded' });
      const updatedUser = await User.findByIdAndUpdate(
         userId,
         { profilePic: file.path },
         { new: true }
      );
      res.status(200).json({ profilePic: updatedUser.profilePic });
   } catch (err) {
      res.status(500).json({ error: err.message });
   }
};

export {getMessages, sendMessage, uploadMediaMessage, updateProfilePic, markMessagesAsRead};