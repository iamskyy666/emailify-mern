import { model, Schema } from "mongoose";

const userSchema = new Schema({
  googleId: String,
});

model("users", userSchema);
