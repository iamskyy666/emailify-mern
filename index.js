import dotenv from "dotenv";
dotenv.config();

import express from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { googleClientID, googleClientSecret } from "./config/keys.js";

const app = express();

// middlewares
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(`🟡 accessToken: ${accessToken}`);
      console.log(`🔵 refreshToken: ${refreshToken}`);
      console.log(`👤 profile: ${profile}`);
      //console.log(`✅ done: ${done}`);
    },
  ),
); // instance of Google password-strategy

const PORT = process.env.PORT || 5000;

// OAuth-flow
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

app.get("/auth/google/callback", passport.authenticate("google"));

app.listen(PORT, () => {
  console.log(`App running on PORT: ${PORT} ☑️`);
});
