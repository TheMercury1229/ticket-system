import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createTicket,
  getTicket,
  getTickets,
} from "../controllers/ticket.controller.js";

const ticketRouter = Router();

ticketRouter.get("/", authenticate, getTickets);
ticketRouter.get("/:id", authenticate, getTicket);
ticketRouter.post("/", authenticate, createTicket);

export default ticketRouter;
