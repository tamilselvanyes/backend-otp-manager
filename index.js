import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

const app = express();
app.use(express.json());
dotenv.config();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

export const client = await creatConnection();

app.get("/", (req, res) => {
  res.send("This is my backend app for OTP manager");
  return;
});

app.listen(PORT, () => console.log("Server Started at PORT" + PORT));

async function creatConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo connected successfully");
  return client;
}
