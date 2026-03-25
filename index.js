import "./config/dotenv.js";
import express from "express";
import "./services/passport.services.js";
import authRoutes from "./routes/auth.routes.js";
import mongoose from "mongoose";
import UserModel from "./models/user.model.js";

mongoose.connect(process.env.MONGO_URI);

const app = express();

//routes
authRoutes(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App running on PORT: ${PORT} ☑️`);
});
