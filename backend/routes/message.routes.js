import express from "express";
import { sendMessage, getMessages, uploadMediaMessage, markMessagesAsRead } from "../controllers/message.controllers.js";
import auth from "../middlewares/auth.middlewares.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/upload", auth, upload.single("file"), uploadMediaMessage);
router.post("/", auth, sendMessage);
router.get("/:chatId", auth, getMessages);
router.put("/:chatId/read", auth, markMessagesAsRead);

export default router;

