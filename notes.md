# 🔥 1. What Passport.js actually is

Passport is **authentication middleware** for Node.js.

👉 It does **one job only**:

> Handle authentication (login, signup, sessions, OAuth, etc.)

It does **NOT**:

* create users ❌
* hash passwords ❌
* store data ❌

👉 It just **plugs into your system and handles auth flow cleanly**

---

# 🧠 2. Where Passport fits in MERN

In a MERN app:

* **MongoDB** → stores users
* **Express** → backend server
* **React** → frontend UI
* **Node.js** → runtime

Passport sits inside **Express backend**

```
React (login form)
   ↓
Express API
   ↓
Passport (auth logic)
   ↓
MongoDB (user data)
```

---

# ⚙️ 3. Core Concepts (VERY IMPORTANT)

## 1. Strategy

Passport uses **strategies**.

👉 A strategy = “way to authenticate”

Examples:

* **passport-local** → email + password
* **passport-jwt** → token-based auth
* Google / Facebook OAuth

---

## 2. Middleware flow

Passport works like:

```js
app.post("/login", passport.authenticate("local"), (req, res) => {
  res.send("Logged in");
});
```

👉 It intercepts the request, validates user, then moves forward.

---

## 3. Sessions vs JWT

Two main ways:

### 🟢 Session-based (classic)

* Server stores session
* Uses cookies

### 🔵 JWT-based (modern MERN way)

* No session
* Token stored in frontend (localStorage/cookies)

👉 For MERN apps → **JWT is preferred**

---

# 🏗️ 4. Basic Setup (Local Strategy)

Let’s build the mental model.

---

## Step 1: Install packages

```bash
npm i passport passport-local bcrypt jsonwebtoken
```

---

## Step 2: User Model (MongoDB)

```js
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
```

---

## Step 3: Configure Passport

```js
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./models/User");

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          return done(null, false, { message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return done(null, false, { message: "Wrong password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
```

👉 This is the **core brain** of authentication.

---

## Step 4: Route

```js
app.post("/login", passport.authenticate("local"), (req, res) => {
  res.json(req.user);
});
```

---

# 🔐 5. Using JWT with Passport (Important for MERN)

Now we go real-world.

---

## Step 1: Install JWT strategy

```bash
npm i passport-jwt
```

---

## Step 2: Generate token after login

```js
const jwt = require("jsonwebtoken");

app.post("/login", async (req, res) => {
  const user = req.user;

  const token = jwt.sign(
    { id: user._id },
    "secretkey",
    { expiresIn: "1d" }
  );

  res.json({ token });
});
```

---

## Step 3: Configure JWT Strategy

```js
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "secretkey",
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);
```

---

## Step 4: Protect routes

```js
app.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json(req.user);
  }
);
```

---

# ⚛️ 6. Frontend (React flow)

From React:

### Login

```js
const res = await axios.post("/login", { email, password });
localStorage.setItem("token", res.data.token);
```

---

### Send token

```js
axios.get("/profile", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

# 🧩 7. Real MERN Architecture (Clean Way)

In real projects (like yours):

```
/config/passport.js   ← strategies
/controllers/auth.js
/routes/authRoutes.js
/middleware/auth.js   ← protect routes
```

👉 Keep Passport config separate — clean code matters.

---

# ⚠️ 8. Common Mistakes (VERY IMPORTANT)

### ❌ 1. Thinking Passport handles everything

No — it only authenticates.

---

### ❌ 2. Not hashing passwords

Always use bcrypt.

---

### ❌ 3. Using sessions in MERN unintentionally

If using JWT:

```js
passport.authenticate("jwt", { session: false })
```

---

### ❌ 4. Hardcoding secrets

Use `.env`:

```env
JWT_SECRET=supersecret
```

---

# 🧠 9. When should we use Passport?

Be honest here — this matters for your growth.

### Use Passport if:

* Multiple auth strategies (Google, Facebook, etc.)
* Complex authentication system

### Avoid Passport if:

* Simple MERN app
* Only email/password + JWT

👉 Many modern MERN apps **skip Passport** and use:

* bcrypt
* jsonwebtoken

Because it's simpler and more controllable.

---

# 🚀 Final Summary

* **Passport.js** = authentication middleware
* Uses **strategies** (local, JWT, OAuth)
* Works inside Express backend
* JWT strategy is best for MERN
* Not required for simple apps

---

Let’s strip this down to the essentials first, then build it back up properly so we actually understand it (not just copy-paste code).

---

# 🔐 1. What Google OAuth actually is

**Google OAuth** is a way to let users log into your app using their Google account instead of creating a new password.

👉 It’s based on **OAuth 2.0**

**Key idea:**

> We don’t handle passwords — Google does.

---

## 🧠 Simple mental model

Instead of:

```
User → enters email + password → your database
```

We do:

```
User → clicks "Login with Google"
     → Google verifies user
     → Google sends us user info
```

---

# ⚙️ 2. Why we use it in real apps

### ✅ Benefits:

* No password management (huge win)
* More secure (Google handles auth)
* Faster signup/login
* Better UX

### ❌ Tradeoffs:

* Depends on Google
* Slightly complex setup

---

# 🔄 3. How the flow actually works (IMPORTANT)

This is where most beginners get lost — so let’s go step-by-step.

---

## 🔁 OAuth Flow

1. User clicks **"Login with Google"**
2. We redirect user to Google
3. User logs in on Google
4. Google asks: “Allow this app?”
5. User approves
6. Google sends us a **code**
7. Backend exchanges code for:

   * access token
   * user profile

---

## 🔥 Visual flow

```id="3dqcd7"
React → Express → Google → Express → React
```

---

# 🧩 4. How it’s used in Express apps

We usually use:

👉 **passport-google-oauth20**
👉 with **Passport.js**

---

# 🏗️ 5. Step-by-step Express setup

Now let’s build the real thing.

---

## Step 1: Install packages

```bash
npm i passport passport-google-oauth20 express-session
```

---

## Step 2: Create Google credentials

Go to:

👉 Google Cloud Console

Create:

* OAuth Client ID
* Client Secret

Add redirect URI:

```id="dtrd5g"
http://localhost:5000/auth/google/callback
```

---

## Step 3: Configure Passport

```js
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // profile contains Google user data
      return done(null, profile);
    }
  )
);
```

---

## Step 4: Routes

### 🔹 Start login

```js
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
```

---

### 🔹 Callback route

```js
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);
```

---

# 🧠 6. What data we get from Google

Inside `profile`:

```js
{
  id: "google-id",
  displayName: "Skyy",
  emails: [{ value: "email@gmail.com" }],
  photos: [...]
}
```

---

# 🏗️ 7. Real-world MERN usage (IMPORTANT)

In actual apps, we don’t just return profile.

We:

### ✅ Step 1: Check if user exists

```js
let user = await User.findOne({ googleId: profile.id });
```

---

### ✅ Step 2: If not → create user

```js
if (!user) {
  user = await User.create({
    googleId: profile.id,
    email: profile.emails[0].value,
    name: profile.displayName,
  });
}
```

---

### ✅ Step 3: Generate JWT

```js
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
```

---

### ✅ Step 4: Send token to frontend

```js
res.redirect(`http://localhost:3000?token=${token}`);
```

---

# ⚛️ 8. React frontend flow

### Button

```js
window.location.href = "http://localhost:5000/auth/google";
```

---

### After redirect

```js
const token = new URLSearchParams(window.location.search).get("token");
localStorage.setItem("token", token);
```

---

# ⚠️ 9. Common mistakes (this will save you hours)

### ❌ Wrong callback URL

Must match exactly in Google console

---

### ❌ Forgetting session setup (Passport default)

Passport uses sessions unless disabled

---

### ❌ Not handling JWT properly

Don’t just rely on session in MERN

---

### ❌ Not using HTTPS in production

Google may reject non-secure URLs

---

# 🧠 10. When should we use Google OAuth?

Use it when:

* We want easy login/signup
* Building modern apps (social login expected)

Avoid it if:

* Internal tools
* Simple practice apps

---

# 🚀 Final summary

* Google OAuth = login via Google using **OAuth 2.0**
* Express uses it via **Passport.js**
* Strategy: **passport-google-oauth20**
* Real flow:

  * Redirect → Google → Callback → JWT → Frontend

---

