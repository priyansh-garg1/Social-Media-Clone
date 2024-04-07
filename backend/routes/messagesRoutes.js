import express from "express";
import { protectRoute } from "../middlewares/protectRoute.js";
import {
  getMessage,
  sendMessage,
  getConversations,
  deleteMessages
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/:otherUserId", protectRoute, getMessage);
router.post("/", protectRoute, sendMessage);
router.delete("/delete/:otherUserId", protectRoute, deleteMessages);

export default router;
