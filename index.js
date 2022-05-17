import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { userRouter } from "./routes/user.js";
import { otpRouter } from "./routes/otp.js";

const app = express();
//middleware settings
app.use(express.json());
dotenv.config();
app.use(bodyParser.json());
app.use(cors());
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

export const client = await creatConnection();

app.use("/user", userRouter);
app.use("/otp", otpRouter);

app.get("/", (req, res) => {
  res.send("This is my backend app for OTP manager");
  return;
});

app.listen(PORT, () => console.log("Server Started at PORT " + PORT));

async function creatConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo connected successfully");
  return client;
}
