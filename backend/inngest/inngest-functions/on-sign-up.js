import { inngest } from "../client.js";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendEmail } from "../../utils/mailer.js";
export const onUserSignUp = inngest.createFunction(
  {
    id: "on-user-sign-up",
    retries: 2,
  },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      //   Find the user in the database
      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User not found");
        }
        return userObject;
      });

      //   Send an email to the user
      await step.run("send-welcome-email", async () => {
        const subject = "Welcome to the Ticket System";
        const message = "Welcome to the Ticket System"`Hello ${user.name},\n\nThank you for signing up for our ticket system! We're excited to have you on board.\n\nBest regards,\nTicket System Team`;
        const desc = sendEmail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("Error in onUserSignUp function step:", error.message);
      return { success: false };
    }
  }
);
