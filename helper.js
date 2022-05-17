import { client } from "./index.js";
import { ObjectId } from "mongodb";

export function createUser(data) {
  return client.db("b30wd").collection("users").insertOne(data);
}

export function getUserByName(email) {
  return client.db("b30wd").collection("users").findOne({ email: email });
}

export function createTokenForUser(data) {
  return client.db("b30wd").collection("token").insertOne(data);
}
export function checkUserInToken(user_id) {
  return client
    .db("b30wd")
    .collection("token")
    .findOne({ user_id: ObjectId(user_id) });
}

export function updatePassword(user_id, updateData) {
  return client
    .db("b30wd")
    .collection("users")
    .updateOne({ _id: ObjectId(user_id) }, { $set: updateData });
}

export function removeToken(user_id) {
  return client
    .db("b30wd")
    .collection("token")
    .deleteOne({ user_id: ObjectId(user_id) });
}

export async function getUserByEmail(email) {
  return client.db("b30wd").collection("users").findOne({ email: email });
}

export async function getUserById(user_id) {
  return client
    .db("b30wd")
    .collection("users")
    .findOne({ _id: ObjectId(user_id) });
}

export async function setAccountActivated(user_id) {
  return client
    .db("b30wd")
    .collection("users")
    .updateOne({ _id: ObjectId(user_id) }, { $set: { activated: true } });
}

export async function storeAuthenticator(data) {
  return client.db("b30wd").collection("otp-manager").insertOne(data);
}

export async function getUserFromOTPManager(email) {
  return client.db("b30wd").collection("otp-manager").findOne({ email: email });
}

export function updateOTPforUser(data) {
  return client
    .db("b30wd")
    .collection("otp-manager")
    .updateOne({ email: data.email }, { $set: data });
}
