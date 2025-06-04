// index.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import { serve } from "inngest/express";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/user.route.js";
import ticketRouter from "./routes/ticket.route.js";
import { inngest } from "./inngest/client.js";
import { onUserSignUp } from "./inngest/inngest-functions/on-sign-up.js";
import { onTicketCreate } from "./inngest/inngest-functions/on-ticket-create.js";
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRouter);
app.use("/api/tickets", ticketRouter);

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignUp, onTicketCreate],
  })
);
const initializeApp = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database:", error.message);
    process.exit(1); // Only here
  }
};

initializeApp();
