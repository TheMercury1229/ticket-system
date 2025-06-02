import Ticket from "../models/ticket.model.js";
import { inngest } from "../inngest/client.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }
    const ticket = new Ticket({
      title,
      description,
      createdBy: req.user._id.toString(),
    });
    await ticket.save();
    // TODO:ADD INNGEST EVENT
    // await inngest.send({
    //     name:
    // })
    return res.status(201).json(ticket);
  } catch (error) {
    console.error("Error creating ticket", error.message);
  }
};
