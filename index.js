import "./config/dotenv.js";
import express from "express";
import "./models/user.model.js";
import "./services/passport.services.js";
import authRoutes from "./routes/auth.routes.js";
import mongoose from "mongoose";
//import cookieSession from "cookie-session";
import session from "express-session";
import passport from "passport";

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => console.log(err));

const app = express();

// use-cookies (cookie-session)
// app.use(
//   session({
//     maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
//     keys: [process.env.COOKIE_KEY],
//   }),
// );

// use-cookies (express-session)
app.use(
  session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

//routes
authRoutes(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App running on PORT: ${PORT} ☑️`);
});
