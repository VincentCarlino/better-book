import express from "express";
import connectDB from "./db/db.js";
import UserRouter from "./routes/User.js";
import cors from "cors";
import DeckRouter from "./routes/Deck.js";

const port = 5050;
const app = express();

app.use(cors());
app.use(express.json())

connectDB();

app.get('/', (req, res) => res.send('Hello world!'));
app.use('/api/auth/', UserRouter);
app.use('/api/deck/', DeckRouter);

app.listen(port, () => console.log(`Server running on port ${port}`));