import express from "express";
import speakeasy from "speakeasy";
import QRcode from "qrcode";
import {
  storeAuthenticator,
  getUserFromOTPManager,
  getUserByEmail,
  updateOTPforUser,
  getUserOTPdata,
} from "../helper.js";
import { sendOTPtoPhone } from "../sendOTPtoPhone.js";
import { MailTransporter } from "../sendEmail.js";
import OTPgenerator from "otp-generator";

const router = express.Router();
export const otpRouter = router;

//executed only once for a user::
router.post("/totp-secret", async (request, response, next) => {
  var { email } = request.body;

  //email is must for creation
  if (email === null) {
    response.send({ message: "Email is required" });
    return;
  }
  //checking if email exists if exist just giving the existing url or ask for the TOTP
  const userExists = await getUserFromOTPManager(email);
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
  QRcode.toDataURL(secret.otpauth_url, async function (err, data_url) {
    data.data_url = data_url;
    await storeAuthenticator(data);
    response.send(data);
  });
});

router.post("/gen-otp", async (req, res) => {
  //testing code
  res.status(200).send({ message: "OTP sent successfully" });
  return;
  const { email, phoneNumber } = req.body;
  const userFromDb = await getUserByEmail(email);
  if (!userFromDb) {
    res.status(400).send({ message: "No such user" });
    return;
  }

  const phone_otp = OTPgenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
  const email_otp = OTPgenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  let current_time = Date.now();
  let expiry_time = current_time + 600000;
  const otp_data = {
    email: email,
    phoneNumber: phoneNumber,
    phone_otp: phone_otp,
    email_otp: email_otp,
    createdAt: current_time,
    ExpiresIn: expiry_time,
  };
  await updateOTPforUser(otp_data);
  const subject = "OTP Verification";
  const text = `Dear Sir/Madam
  Your One Time Password (OTP) is ${email_otp}`;
  const email_sent = await MailTransporter(email, subject, text);
  const OTP_sent = sendOTPtoPhone({
    number: phoneNumber,
    phone_otp: phone_otp,
  });
  if (OTP_sent === true && email_sent === true) {
    res.status(200).send({ message: "OTP sent successfully" });
  } else {
    res.send({ message: "OTP sent failed" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email_otp, phone_otp, email } = req.body;
  console.log(email_otp + phone_otp + email);

  if (email === null) {
    res.send({ message: "Email is required..." });
    return;
  }

  const data = await getUserOTPdata(email);

  if (data === null) {
    res.send({ message: "User does not exist" });
    return;
  }

  console.log(data);
  //checking is OTP expired
  console.log(data.ExpiresIn + "Check" + Date.now());
  if (data.ExpiresIn < Date.now()) {
    res.send({ message: "Token expired" });
    return;
  }

  //checking the mail OTP

  let email_verify = false;
  let phone_verify = false;

  if (data.email_otp === email_otp) {
    email_verify = true;
  }

  if (data.phone_otp === phone_otp) {
    phone_verify = true;
  }

  if (email_verify && phone_verify) {
    res.send({ message: "Both verified" });
    return;
  }

  if (email_verify === false && phone_verify === false) {
    res.send({ message: "Both failed" });
    return;
  }

  if (email_verify === true && phone_verify === false) {
    res.send({ message: "Email verified: Phone failed" });
    return;
  }

  if (email_verify === false && phone_verify === true) {
    res.send({ message: "Email failed: Phone verified" });
    return;
  }
});
