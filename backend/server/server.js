import express from "express";
import connectDB from "./db/db.js";
import UserRouter from "./routes/User.js";
import cors from "cors";

const port = 5050;
const app = express();

app.use(cors());
app.use(express.json())

connectDB();

app.get('/', (req, res) => res.send('Hello world!'));
app.use('/api/users', UserRouter);

app.listen(port, () => console.log(`Server running on port ${port}`));