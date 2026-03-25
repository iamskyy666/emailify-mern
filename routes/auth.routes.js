import passport from "passport";

// OAuth-flow
export default function authRoutes(app) {
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    }),
  );

  //! OLDER VERSION
  // app.get("/auth/google/callback", passport.authenticate("google"));

  //! LATEST VERSION
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (_, res) => {
      res.redirect("/api/current_user");
    },
  );

  //! OLDER VERSION (passport.js)
  // app.get("/api/logout", (req, res) => {
  //   req.logout();
  //   res.send(req.user)
  // });

  //! LATEST VERSION (passport.js)
  app.get("/api/logout", (req, res, next) => {
    req.logout(function (err) {
      if (err) return next(err);

      req.session.destroy(() => {
        res.send("Logged out successfully ✅");
      });
    });
  });

  // Testing Auth. 🧪
  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });
}
