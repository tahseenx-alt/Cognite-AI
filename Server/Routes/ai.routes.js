import express from 'express';
import { generateResponse } from './Controllers/ai.controller.js';

const router = express.Router();

// When someone sends a "POST" request to /chat, run our AI code
router.post('/chat', generateResponse);

export default router;