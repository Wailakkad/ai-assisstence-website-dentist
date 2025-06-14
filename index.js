const express = require('express');
const cors =  require('cors');
const dotenv = require('dotenv');
dotenv.config();
const AiChatRouter = require('./routes/AiChat');




const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/chat', AiChatRouter);

module.exports = app;
