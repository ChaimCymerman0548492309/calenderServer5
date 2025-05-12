import mongoose, { Schema, Document } from "mongoose";

// ============================
// User model
// ============================
export interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}


export interface IUser extends Document {
  username: string;
  password: string;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const User = mongoose.model<IUser>("User", userSchema);

// ============================
// Event model
// ============================

export interface IEvent extends Document {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  user: Schema.Types.ObjectId;
  employeeIds: string[];
}

const eventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  allDay: { type: Boolean, default: false },
  color: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  employeeIds: { type: [String], default: [] },
});

export const Event = mongoose.model<IEvent>("Event", eventSchema);

// ============================
// Employee model
// ============================

export interface IEmployee extends Document {
  name: string;
  position: string;
  color: string;
  avatar?: string;
  user: Schema.Types.ObjectId;
}

const employeeSchema = new Schema<IEmployee>({
  name: { type: String, required: true },
  position: { type: String, required: true },
  color: { type: String, required: true },
  avatar: { type: String },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);
