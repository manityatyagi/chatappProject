import { Chat } from "../models/chat.model.js";
import { server , io } from "../server.js";
import { User } from "../models/user.model.js";
import { Socket } from "socket.io";
import { response } from "express";

const createChat = async(req, res) => {
      try {
        const chatId = req.params;
        const {name, chatAvatar, isBotChat, isGroupChat , isNormatChat} = req.body;
        const currentUser = req.user.id;
     
    if (isBotChat) {
      if (users.length !== 1 || users[0] !== currentUser) {
        return res.status(400).json({ message: 'Bot chat must be created by and for a single user' });
      }
   
      const existingBotChat = await Chat.findOne({
        isBotChat: true,
        users: currentUser,
      });

      if (existingBotChat) {
        return res.status(200).json({ message: 'Bot chat already exists', chat: existingBotChat });
      }

      const botChat = await Chat.create({
        name: 'AI Assistant',
        isBotChat: true,
        users: [currentUser],
      });

      return res.status(201).json({ message: 'Bot chat created', chat: botChat });
    
    }

    if (!isGroupChat) {
      if (users.length !== 2) {
        return res.status(400).json({ message: 'Private chat must include exactly two users' });
      }

      const existingPrivateChat = await Chat.findOne({
        isGroupChat: false,
        isBotChat: false,
        users: { $all: users, $size: 2 },
      });

      if (existingPrivateChat) {
        return res.status(200).json({ message: 'Private chat already exists', chat: existingPrivateChat });
      }

      const privateChat = await Chat.create({
        users,
        isGroupChat: false,
      });

      return res.status(201).json({ message: 'Private chat created', chat: privateChat });
    }

    if (isGroupChat) {
      if (users.length < 3) {
        return res.status(400).json({ message: 'Group chat must have at least 3 users' });
      }

      if (!name) {
        return res.status(400).json({ message: 'Group chat must have a name' });
      }

      const groupChat = await Chat.create({
        name,
        isGroupChat: true,
        users,
        groupAdmin: currentUser,
      });

      return res.status(201).json({ message: 'Group chat created', chat: groupChat });
    
       if(!groupChat){
        res.status(400).json({ message: 'Invalid chat creation request' });
       }
     }
      }
      catch(err) {
     console.error('Chat creation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

const getAllChats = async(req, res) => {
      const userId = req.params;
      const { latestMessage , timeStamp }  = req.body;
      const allChats = await Chat.find({users: userId}).
                             populate("users", "-password").
                             populate("groupAdmin","-password").
                             populate("lastestMessage").
                             populate({
                                path: "lastestMessage",
                                populate: {path: "sender",select: "name email"}
                             }).
                             sort({updatedAt: -1});
                        
       res.status(200).json(allChats);                 
}
      
const getChat = async(req, res) => {
    const userId = req.user._id;
    const chatId = req.params.chatId;
    const singleChat = await Chat.findById(chatId).populate("users","-password").
                        populate({
                          path: "latestMessage",
                            populate: {
                                path: "sender",
                                select: "name email"
                             }
                         }); 
                    
      if(!singleChat){
        return res.status(404).json({message: "Chat not found"});
      }

     const isParticipant = Chat.users.some(user => user._id.toString() 
                       === userId.toString());

    if(!isParticipant){
        return res.status(403).json({message: "Access denied: Not a participant of the chat"})
    }

    res.status(200).json(singleChat);
}

const renameChat = async(req, res) => {
      const chatId = req.params;
      const userId = req.user._id
      const { newName } = req.body
     try {
         if(Chat.isGroupChat == true 
            && Chat.groupAdmin.toString() === userId.toString()) {
            const chatToBeUpdated = await Chat.findById(chatId) 
                Chat.name = newName;
                 await Chat.save();

                 res.status(200).json(chatToBeUpdated)  
         }
     }
     catch(error){
          console.error(error.message)
          res.status(500).json({message: "Chat not updated"});
     }
}

const addUser = async(req, res) => {
      const chatId = req.params;
      const userId = req.user._id;
      const addId = req.params.id;
     try{ 
        const Chat = await Chat.findById(chatId)
        if(Chat && Chat.isGroupChat === true){
        if(GroupChat.groupAdmin.toString() 
                             === userId.toString()) {
           if(
            Chat.users.includes(addId)) {
              return res.
                     status(401)
                     .json({message: "User is already present in the chat"})    
          
                }
                else {
                    GroupChat.users.push(addId);
                    await GroupChat.save();
                    return res.status(200).json({message: "User added in the chat", chat: GroupChat})     
                  }
        }}
     }
     catch(error){
         console.error(error.message);
          res.status(500).json({message: "Cannot add user"}) ;
     }
}

const removeUser = async (req, res) => {
  try {
    const chatId = req.params.chatId || req.params.id; 
    const userId = req.user._id;
    const { removeUserId } = req.body; 

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res.status(400).json({ message: "Not a group chat" });
    }
    if (chat.groupAdmin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only group admin can remove users" });
    }
    if (!chat.users.includes(removeUserId)) {
      return res.status(400).json({ message: "User not in the chat" });
    }
    chat.users = chat.users.filter(u => u.toString() !== removeUserId);
    await chat.save();
    res.status(200).json({ message: "User removed from chat", chat });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Cannot remove user" });
  }
}

export { createChat , getChat, getAllChats, addUser , renameChat, removeUser};
