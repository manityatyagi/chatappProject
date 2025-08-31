import express from "express";
import { clearAIChatHistory, chatWithAI, chatWithRAG, handleCommandsHttp } from "../controllers/AI.controllers.js";
import auth from "../middlewares/auth.middlewares.js";
import { errorHandler } from "../middlewares/error.middleware.js";

const router = express.Router();

router.delete("/clear", auth, errorHandler, clearAIChatHistory);
router.post("/help", auth, errorHandler, handleCommandsHttp);
router.post("/chat", auth, errorHandler, chatWithAI);
router.post("/rag", auth, errorHandler, chatWithRAG);

export default router;