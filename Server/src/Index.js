import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from './Routes/ai.routes.js'; // Notice the lowercase 'r'

// This loads your API key from the .env file
dotenv.config();

const app = express();

// These are your "Middlewares" (Kitchen helpers)
app.use(cors());
app.use(express.json());

// This connects your AI routes
app.use('/api', aiRoutes);

app.get('/', (req, res) => {
  res.send("Cognito AI Kitchen is Open!");
});

// We are using Port 5001 to avoid the Mac AirPlay bug
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});