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
    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: ticket._id.toString(),
        title: ticket.title,
        description: ticket.description,
        createdBy: req.user._id.toString(),
      },
    });
    return res.status(201).json({
      message: "Ticket created successfully and processing started",
      ticket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];
    // Get ticket for admin and moderator
    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "name", "_id"])
        .sort({ createdAt: -1 });
    }
    // Get tickets for user
    else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }
    return res.status(200).json({
      message: "Tickets fetched successfully",
      tickets,
    });
  } catch (error) {
    console.error("Error fetching tickets", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;
    if (user.role !== "user") {
      ticket = await Ticket.findById(req.params.id).populate("assignedTo", [
        "email",
        "name",
        "_id",
      ]);
    } else {
      ticket = await Ticket.findOne({
        _id: req.params.id,
        createdBy: user._id,
      }).select("title description status createdAt");
    }
    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }
    return res.status(200).json({
      message: "Ticket fetched successfully",
      ticket,
    });
  } catch (error) {
    console.error("Error fetching ticket by id", error.message);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
