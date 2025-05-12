// import { RequestHandler } from "express";
// import { AuthenticatedRequest, Event } from "./DB";

// import { Request, Response } from "express";


// export const getEventsHandler = async (
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const events = await Event.find({ user: req.user?._id });
//     res.send(events);
//   } catch (error) {
//     res.status(500).send({ message: "Error fetching events" });
//   }
// };


// export const createEventHandler = async (
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const event = new Event({
//       ...req.body,
//       user: req.user?._id,
//     });
//     await event.save();
//     res.status(201).send(event);
//   } catch (error) {
//     res.status(500).send({ message: "Error creating event" });
//   }
// };

// export const updateEventHandler = async (
//   req: AuthenticatedRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const event = await Event.findOneAndUpdate(
//       { _id: req.params.id, user: req.user?._id },
//       req.body,
//       { new: true }
//     );

//     if (!event) {
//       return res.status(404).send({ message: "Event not found" });
//     }

//     res.send(event);
//   } catch (error) {
//     res.status(500).send({ message: "Error updating event" });
//   }
// };

// export const deleteEventHandler: RequestHandler = async (
//   req: AuthenticatedRequest,
//   res
// ) => {
//   try {
//     const event = await Event.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user?._id,
//     });

//     if (!event) {
//       return res.status(404).send({ message: "Event not found" });
//     }

//     res.send(event);
//   } catch (error) {
//     res.status(500).send({ message: "Error deleting event" });
//   }
// };
