import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.send('Cognito AI Backend is sprinting!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});