import express from "express";
import { createChat, getChat, getAllChats, renameChat, addUser, removeUser } from "../controllers/chat.controllers.js";
import auth from "../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/", createChat);
router.get("/", getAllChats);
router.get("/:chatId", getChat);
router.put("/:chatId/rename", renameChat);
router.put("/:chatId/add-user",  addUser);
router.put("/:chatId/remove-user", removeUser);

export default router;