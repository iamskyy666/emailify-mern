import { model, Schema } from "mongoose";

const userSchema = new Schema({
  googleId: String,
});

const UserModel = model("users", userSchema);
export default UserModel;
