import express from 'express'
import { checkAuth, login, signup, updateProfile } from '../controllers/user.controller.js';
import { protectRoutes } from '../middleware/auth.js';
const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.post("/update-profile", protectRoutes, updateProfile);
userRouter.get("/check", protectRoutes, checkAuth);

export default userRouter;
