import express , { Request, Response, NextFunction, RequestHandler, request }from 'express';
// import { Request, Response, NextFunction, RequestHandler } from 'express';
import mongoose, { Schema, Document } from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fillFormDemoQA } from './DemoQA';
import { Employee, Event, User } from './DB';

dotenv.config();

// Extend the Request interface to include our custom properties
export interface AuthenticatedRequest extends Request {
  user?: any;
  token?: string;
}
export type AsyncRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;

// fillFormDemoQA()ְ

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

app.get('/', (req, res) => {
  res.json({ message: "Hello from API!" });
});

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://CHAIMCY1:8114@cluster0.waypb.mongodb.net/calendar-app?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as mongoose.ConnectOptions)
  .then(() => console.log('✅ Successfully connected to MongoDB!'))
  .catch(error => console.error('❌ Connection error:', error));

// User model


// Authentication middleware
const authenticate: RequestHandler = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('Authentication required');
    
    const decoded = jwt.verify(token, JWT_SECRET) as { _id: string };
    const user = await User.findOne({ _id: decoded._id });
    
    if (!user) throw new Error('User not found');
    
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Please authenticate' });
  }
};

// Route handlers with proper typing - using RequestHandler type
const registerHandler = async (req : Request , res : any) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ message: 'Username and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).send({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(500).send({ message: 'Error registering user' });
  }
};

const loginHandler = async (req : Request, res : any) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET);
    res.send({ user, token });
  } catch (error) {
    res.status(500).send({ message: 'Error logging in' });
  }
};

const getMeHandler: RequestHandler = (req: AuthenticatedRequest, res) => {
  res.send(req.user);
};

const getIsAlive = (req: Request, res : Response) => {
    res.status(200).send({ message: 'server is Alive !!' });
};

const getEventsHandler: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const events = await Event.find({ user: req.user?._id });
    res.send(events);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching events' });
  }
};

const createEventHandler: RequestHandler = async (req: AuthenticatedRequest, res) => {
  try {
    const event = new Event({
      ...req.body,
      user: req.user?._id
    });
    await event.save();
    res.status(201).send(event);
  } catch (error) {
    res.status(500).send({ message: 'Error creating event' });
  }
};

const updateEventHandler = async (req: AuthenticatedRequest, res : any) => {
  try {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      req.body,
      { new: true }
    );

    if (!event) {
      return res.status(404).send({ message: 'Event not found' });
    }

    res.send(event);
  } catch (error) {
    res.status(500).send({ message: 'Error updating event' });
  }
};

const deleteEventHandler = async (req: AuthenticatedRequest, res : any) => {
  try {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      user: req.user?._id
    });

    if (!event) {
      return res.status(404).send({ message: 'Event not found' });
    }

    res.send(event);
  } catch (error) {
    res.status(500).send({ message: 'Error deleting event' });
  }
};

// ===== Employee Routes =====
const createEmployeeHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employee = new Employee({
      ...req.body,
      user: req.user?._id
    });
    await employee.save();
    res.status(201).send(employee);
  } catch (error) {
    res.status(500).send({ message: 'Error creating employee' });
  }
};

const getEmployeesHandler = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employees = await Employee.find({ user: req.user?._id });
    res.send(employees);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching employees' });
  }
};

const updateEmployeeHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      req.body,
      { new: true }
    );

    if (!employee) {
      res.status(404).send({ message: "Employee not found" });
      return;
    }

    res.send(employee);
  } catch (error) {
    res.status(500).send({ message: "Error updating employee" });
  }
};


const deleteEmployeeHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void | any> => {
  try {
    const employee = await Employee.findOneAndDelete({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!employee) {
      return res.status(404).send({ message: "Employee not found" });
    }

    // הסרת העובד מכל האירועים המשויכים
    await Event.updateMany(
      { employeeIds: req.params.id },
      { $pull: { employeeIds: req.params.id } }
    );

    res.send(employee);
  } catch (error) {
    res.status(500).send({ message: "Error deleting employee" });
  }
};

// ===== Event Assignment Routes =====
const assignEmployeeToEventHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void | any> => {
  try {
    const { eventId, employeeId } = req.params;

    // בדיקה שהעובד והאירוע שייכים למשתמש
    const employee = await Employee.findOne({
      _id: employeeId,
      user: req.user?._id,
    });
    const event = await Event.findOne({ _id: eventId, user: req.user?._id });

    if (!employee || !event) {
      return res.status(404).send({ message: "Employee or Event not found" });
    }

    // הוספה או הסרה של העובד
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId },
      {
        $addToSet: { employeeIds: employeeId }, // מוסיף רק אם לא קיים
      },
      { new: true }
    );

    res.send(updatedEvent);
  } catch (error) {
    res.status(500).send({ message: "Error assigning employee to event" });
  }
};

const removeEmployeeFromEventHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void | any> => {
  try {
    const { eventId, employeeId } = req.params;

    const updatedEvent = await Event.findOneAndUpdate(
      { _id: eventId, user: req.user?._id },
      { $pull: { employeeIds: employeeId } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(404).send({ message: "Event not found" });
    }

    res.send(updatedEvent);
  } catch (error) {
    res.status(500).send({ message: "Error removing employee from event" });
  }
};
const updateEventAssignmentHandler: AsyncRequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { eventId } = req.params;
    const { employeeId, action } = req.body;

    const event = await Event.findOne({ _id: eventId, user: req.user?._id });
    if (!event) {
      res.status(404).send({ message: "Event not found" });
      return;
    }

    let update;
    if (action === "add") {
      update = { $addToSet: { employeeIds: employeeId } };
    } else if (action === "remove") {
      update = { $pull: { employeeIds: employeeId } };
    } else {
      res.status(400).send({ message: "Invalid action" });
      return;
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, update, {
      new: true,
    });

    res.send(updatedEvent);
  } catch (error) {
    next(error);
  }
};

const asyncHandler = (fn: AsyncRequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as AuthenticatedRequest, res, next)).catch(next);
  };
};
// ===== Register All Routes =====
// Employee routes
app.post('/api/employees', authenticate, createEmployeeHandler);
app.get('/api/employees', authenticate, getEmployeesHandler);
app.put('/api/employees/:id', authenticate, updateEmployeeHandler);
app.delete('/api/employees/:id', authenticate, deleteEmployeeHandler);

// Event assignment routes
app.post('/api/events/:eventId/assign/:employeeId', authenticate, assignEmployeeToEventHandler);
app.delete('/api/events/:eventId/remove/:employeeId', authenticate, removeEmployeeFromEventHandler);

// Existing routes
app.post('/api/auth/register', registerHandler);
app.post('/api/auth/login', loginHandler);
app.get('/api/auth/me', authenticate, getMeHandler);
app.get('/api/events', authenticate, getEventsHandler);
app.get('/api', getIsAlive);
app.post('/api/events', authenticate, createEventHandler);
app.put('/api/events/:id', authenticate, updateEventHandler);
app.delete('/api/events/:id', authenticate, deleteEventHandler);

// Register routes
app.post('/api/auth/register', registerHandler);
app.post('/api/auth/login', loginHandler);
app.get('/api/auth/me', authenticate, getMeHandler);
app.get('/api/events', authenticate, getEventsHandler);
app.get('/api', getIsAlive );
app.post('/api/events', authenticate, createEventHandler);
app.put('/api/events/:id', authenticate, updateEventHandler);
app.delete('/api/events/:id', authenticate, deleteEventHandler);
// הוסף את הניתוב הבא ל-server.ts
app.patch(
  "/api/events/:eventId/employees",
  authenticate,
  asyncHandler(updateEventAssignmentHandler)
);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

