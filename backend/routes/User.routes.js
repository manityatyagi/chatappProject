import express from "express";
import { registerUser, loginUser, getProfile, searchUsers } from "../controllers/user.controllers.js";
import { updateProfilePic } from "../controllers/message.controllers.js";
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

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", auth, getProfile);
router.get("/search", auth, searchUsers);
router.post("/profile-pic", auth, upload.single("file"), updateProfilePic);

export default router;