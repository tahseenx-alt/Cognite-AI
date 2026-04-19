import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './Routes/ai.routes.js'; // Import our new routes

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // This is VERY important! It lets the server read your messages.

// Use the AI routes
app.use('/api', aiRoutes);

app.get('/', (req, res) => res.send("Cognito AI Kitchen is Open!"));

app.listen(5001, () => console.log("Server is running on port 5001"));