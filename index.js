import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import speakeasy from "speakeasy";
import QRcode from "qrcode";
import Vonage from "@vonage/server-sdk";
import { userRouter } from "./routes/user.js";

import { storeAuthenticator, getUserFromOTPManager } from "./helper.js";

const app = express();
//middleware settings
app.use(express.json());
dotenv.config();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

export const client = await creatConnection();

app.use("/user", userRouter);

//executed only once for a user::
app.post("/totp-secret", async (request, response, next) => {
  var { email } = request.body;

  //email is must for creation
  if (email === null) {
    response.send({ message: "Email is required" });
    return;
  }
  //checking if email exists if exist just giving the existing url or ask for the TOTP
  const userExists = await getUserFromOTPManager();
  if (userExists) {
    response.send(userExists);
    return;
  }

  var secret = speakeasy.generateSecret({ length: 20 });
  secret.otpauth_url = secret.otpauth_url.replace(
    "SecretKey",
    "OTP Manager App"
  );

  const data = {
    email: email,
    secret: secret.base32,
  };
  QRcode.toDataURL(secret.otpauth_url, function (err, data_url) {
    data.data_url = data_url;
  });

  const result = await storeAuthenticator(data);
  response.send(data);
});

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
