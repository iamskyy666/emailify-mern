import { model } from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

const UserModel = model("users");

// Encoding users
passport.serializeUser((userModel, done) => {
  done(null, userModel.id);
});

// Deserialize User
passport.deserializeUser((id, done) => {
  UserModel.findById(id).then((user) => {
    done(null, user); // done -> always takes an error obj. -> here -> null
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      UserModel.findOne({ googleId: profile.id }).then((existingUser) => {
        if (existingUser) {
          // we already have a record with the given profile-id
          done(null, existingUser); // null -> no errors
        } else {
          // we don't have any record with the given profile-id
          new UserModel({ googleId: profile.id })
            .save()
            .then((user) => done(null, user));
        }
      });
    },
  ),
); // instance of Google password-strategy
