import passport from "passport";

// OAuth-flow
export default function authRoutes(app) {
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    }),
  );
  app.get("/auth/google/callback", passport.authenticate("google"));

  // Testing Auth. 🧪
  app.get("/api/current_user", (req, res) => {
    res.send(req.user);
  });
}
