import { Router } from "express";
import {
  getUsers,
  login,
  logout,
  signup,
  updateUser,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
// Admin protected routes
authRouter.post("/update-user", authenticate, updateUser);
authRouter.get("/users", authenticate, getUsers);

export default authRouter;
