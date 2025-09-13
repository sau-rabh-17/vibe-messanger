import express from "express";
import { protectRoutes } from "../middleware/auth.js";
import { getMessages, getUserForSideBar, markMessageAsSeen, sendMessage } from "../controllers/message.controller.js";

const messageRoutes = express.Router();

messageRoutes.get("/users", protectRoutes, getUserForSideBar)
messageRoutes.get("/:id", protectRoutes, getMessages)
messageRoutes.put("mark/:id", protectRoutes, markMessageAsSeen)
messageRoutes.post("/send/:id", protectRoutes, sendMessage)

export default messageRoutes