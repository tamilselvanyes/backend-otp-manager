import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { MailTransporter } from "../sendEmail.js";
import express from "express";

import {
  createUser,
  createTokenForUser,
  checkUserInToken,
  updatePassword,
  removeToken,
  getUserByEmail,
  setAccountActivated,
} from "../helper.js";

const router = express.Router();
export const userRouter = router;

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const hashedpassword = await genPassword(password);
  const new_user = {
    email: email,
    password: hashedpassword,
    activated: false,
  };
  const result = await createUser(new_user);
  const link = `${process.env.HOST}/activate-account/${
    (await getUserByEmail(email))._id
  }`;
  const subject = "Account Activation";
  const text = `Please Click the link below to activate your account, you will only be able to login after activation  \n ${link}`;
  await MailTransporter(email, subject, text);
  res.send(result);
});

router.post("/activate-account/:user_id", async (req, res) => {
  const { userid } = req.body;
  const result = await setAccountActivated(userid);
  res.send(result);
});

router.post("/email", async (req, res) => {
  const { email } = req.body;

  const userFromDb = await getUserByEmail(email);
  if (!userFromDb) {
    res.status(200).send({ message: "email available" });
  } else {
    res.status(403).send({ message: "User already exists" });
  }
});

router.post("/forgotpassword/email", async (req, res) => {
  const { email } = req.body;

  const userFromDb = await getUserByEmail(email);
  if (userFromDb) {
    res.status(200).send({ message: "email exist" });
  } else {
    res.status(403).send({ message: "email does not exist" });
  }
});

router.post("/reset-password-confirmation/:userid/:token", async (req, res) => {
  const { password_1 } = req.body;
  const user_id = req.params.userid;
  const token = req.body.token;

  const user_token = await checkUserInToken(user_id);

  if (!user_token) {
    res
      .status(401)
      .send({ message: "Invalid reset password request from user" });
    return;
  }

  if (!user_token.token === token) {
    res
      .status(401)
      .send({ message: "Invalid reset password Token does not match" });
    return;
  }

  if (user_token.ExpiresIn < Date.now()) {
    removeToken(user_id);
    res.send({ message: "Token expired" });
    return;
  }

  const hashedpassword = await genPassword(password_1);

  const updateData = { password: hashedpassword };
  await updatePassword(user_id, updateData);
  await removeToken(user_id);
  res.status(200).send({ message: "Password updated successfully" });
  return;
});

router.post("/reset-password", async (req, res) => {
  const { email } = req.body;

  const userFromDb = await getUserByEmail(email);
  if (!userFromDb) {
    res.status(400).send({ message: "No such user" });
    return;
  }

  const user_token_check = await checkUserInToken(userFromDb._id);
  if (user_token_check) {
    removeToken(userFromDb._id);
  }

  const token = jwt.sign({ id: userFromDb._id }, process.env.SECRET_KEY, {
    expiresIn: "10m", //600000 milli seconds
  });

  let current_time = Date.now();
  let expiry_time = current_time + 600000;
  const user_token = {
    user_id: userFromDb._id,
    token: token,
    createdAt: current_time,
    ExpiresIn: expiry_time,
  };

  await createTokenForUser(user_token);
  const link = `${process.env.HOST}/reset-password/${userFromDb._id}/${token}`;
  const subject = "Rest Password";
  const text = `Please Click the link below to reset the passsword for security reasons the link will be expired in the next 10 minutes \n ${link}`;
  await MailTransporter(email, subject, text);
  res.status(200).send({ message: "Mail sent" });
});

router.post("/login", async function (request, response) {
  // db.users.insertOne(data)
  const { email, password } = request.body;
  const userfromDB = await getUserByEmail(email);
  if (!userfromDB) {
    response.status(401).send({ message: "Invalid email or password" });
  } else if (userfromDB.activated === false) {
    response.status(401).send({
      message:
        "Account not yet Activated, Please activate by using link sent to your mail",
    });
  } else {
    const storedPassword = userfromDB.password;
    const isPasswordMatch = await bcrypt.compare(password, storedPassword);
    if (isPasswordMatch) {
      const token = jwt.sign({ id: userfromDB._id }, process.env.SECRET_KEY);
      response.status(200).send({ message: "Login Successful", token: token });
    } else {
      response.status(401).send({ message: "Invalid email or password" });
    }
  }
});
