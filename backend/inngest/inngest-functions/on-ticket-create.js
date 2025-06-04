import { inngest } from "../client.js";
import User from "../../models/user.model.js";
import Ticket from "../../models/ticket.model.js";
import { NonRetriableError } from "inngest";
import { sendEmail } from "../../utils/mailer.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreate = inngest.createFunction(
  {
    id: "on-ticket-created",
    retries: 2,
  },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;
      // Fetch the ticket
      const ticket = await step.run("get-ticket", async () => {
        const ticketObj = await Ticket.findById(ticketId);
        if (!ticketObj) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObj;
      });

      //   Update the ticket
      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, {
          status: "TODO",
        });
      });

      //   Update the ai part
      const aiRes = await analyzeTicket(ticket);
      if (!aiRes) {
        throw new NonRetriableError("AI analysis failed");
      }
      //   Analyze the ticket
      const relatedSkills = await step.run("update-ticket-ai", async () => {
        let skills = [];

        await Ticket.findByIdAndUpdate(ticket._id, {
          priority: ["low", "medium", "high"].includes(aiRes.priority)
            ? aiRes.priority
            : "medium",
          helpfulnotes: aiRes.helpfulNotes,
          relatedSkills: aiRes.relatedSkills,
          summary: aiRes.summary,
        });
        skills = aiRes.relatedSkills;
        return skills;
      });
      //   Assign the moderator
      const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedSkills.join("|"),
              $options: "i", // Case-insensitive match
            },
          },
        });
        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }
        await ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });

        return user;
      });
      //   Send email to moderator
      await step.run("send-email-to-moderator", async () => {
        if (!moderator) {
          throw new NonRetriableError("No moderator found for ticket");
        }

        await sendEmail({
          to: moderator.email,
          subject: `New Ticket Assigned: ${ticket.title}`,
          text: `Hey ${moderator.name},\nYou have been assigned a new ticket:\n\nTitle: ${ticket.title}\nDescription: ${ticket.description}\n\nPlease review it as soon as possible.\n\nThank you!\n\nSupport Team`,
        });
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error on ticket create", error.message);
      return { success: false };
    }
  }
);
