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

**AUTHENTICATION🛡️** is one of those topics that separates “it works” from “we actually understand backend auth like engineers.”

---

# 🔐 1. What problem are we solving?

When a user logs in, we need to:

* Identify them on future requests
* Keep them logged in securely
* Prevent attackers from hijacking sessions

We **cannot trust the client (browser)**. So every request must prove identity.

---

# 🍪 2. What are Cookies?

### 👉 Definition

Cookies are **small pieces of data stored in the browser**, sent automatically with every request to the server.

### 👉 How cookies work

1. Server sends:

   ```
   Set-Cookie: token=abc123
   ```
2. Browser stores it
3. Every future request:

   ```
   Cookie: token=abc123
   ```

So cookies = **automatic storage + automatic sending**

---

### 👉 Types of Cookies

#### 1. Session Cookies

* Stored in memory
* Deleted when browser closes

#### 2. Persistent Cookies

* Stored on disk
* Have expiration time

---

### 👉 Important Cookie Flags (VERY IMPORTANT)

These are critical for security:

* **HttpOnly**

  * JS cannot access it (`document.cookie` blocked)
  * Protects against XSS attacks

* **Secure**

  * Sent only over HTTPS

* **SameSite**

  * Controls cross-site requests
  * Values:

    * `Strict` → only same site
    * `Lax` → some cross-site allowed
    * `None` → fully cross-site (requires Secure)

---

### 👉 When we use cookies

Cookies are just a **transport/storage mechanism**
They don’t define authentication by themselves.

We can store:

* session IDs
* JWT tokens (access/refresh)

---

# 🔑 3. What are Access Tokens?

### 👉 Definition

An **access token** is a short-lived credential used to access protected resources.

Most commonly: **JWT (JSON Web Token)**

---

### 👉 Structure of JWT

```
HEADER.PAYLOAD.SIGNATURE
```

#### Example:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJ1c2VySWQiOiIxMjMifQ
.
abcXYZsignature
```

---

### 👉 Inside JWT

#### 1. Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### 2. Payload

```json
{
  "userId": "123",
  "role": "admin",
  "exp": 1710000000
}
```

#### 3. Signature

Server signs using secret:

```
HMACSHA256(base64(header + payload), secret)
```

---

### 👉 Key Properties

* Stateless (no DB needed to verify)
* Self-contained
* Has expiry (`exp`)

---

### 👉 Why short-lived?

If stolen → attacker gets access
So we keep it short (e.g., 15 min)

---

# 🔄 4. What are Refresh Tokens?

### 👉 Definition

A **refresh token** is a long-lived token used to generate new access tokens.

---

### 👉 Why do we need refresh tokens?

If access tokens expire quickly (good for security), we don’t want users to log in again every 15 minutes.

So:

* Access token → short life (security)
* Refresh token → long life (user convenience)

---

### 👉 Flow

1. Login:

   * Server gives:

     * accessToken (short-lived)
     * refreshToken (long-lived)

2. Access token expires

3. Client sends refresh token:

   ```
   POST /refresh
   ```

4. Server verifies refresh token and issues new access token

---

### 👉 Where do we store refresh tokens?

Best practice:

* Store in **HttpOnly cookie**
* OR secure DB (hashed)

---

# ⚖️ 5. Cookies vs Tokens (Important distinction)

This confuses almost everyone.

| Concept | What it is                |
| ------- | ------------------------- |
| Cookie  | Storage + transport       |
| Token   | Authentication credential |

👉 So:

* Cookie = “where we store”
* Token = “what we store”

---

# 🧠 6. Two Common Authentication Approaches

---

## ✅ Approach 1: Session-based (Old school)

1. Login
2. Server creates session in DB
3. Sends sessionId in cookie
4. Every request → sessionId → lookup DB

### Pros

* Easy to invalidate
* Secure

### Cons

* Requires DB lookup every request
* Not scalable

---

## ✅ Approach 2: Token-based (Modern JWT)

1. Login
2. Server gives JWT
3. Client sends JWT in every request

### Pros

* Stateless
* Scalable

### Cons

* Hard to revoke
* Needs careful handling

---

# 🔥 7. Best Practice (REAL WORLD)

This is what we actually use in production:

### ✅ Hybrid Approach

* Access Token → stored in memory or header
* Refresh Token → stored in HttpOnly cookie

---

### 👉 Flow (IMPORTANT)

1. Login

   * accessToken (short-lived)
   * refreshToken (HttpOnly cookie)

2. API calls

   ```
   Authorization: Bearer accessToken
   ```

3. Access token expires

   * Client calls `/refresh`

4. Server:

   * validates refresh token
   * sends new access token

---

# 🛡️ 8. Security Threats & How we defend

---

## ❌ XSS (Cross-Site Scripting)

Attacker injects JS → steals tokens

### Defense:

* Use **HttpOnly cookies**
* Avoid storing tokens in localStorage

---

## ❌ CSRF (Cross-Site Request Forgery)

Browser auto-sends cookies → attacker tricks user

### Defense:

* SameSite cookies
* CSRF tokens

---

## ❌ Token Theft

If access token is stolen

### Defense:

* Short expiry
* Rotate refresh tokens

---

# 🔁 9. Refresh Token Rotation (Advanced)

Every time we use refresh token:

1. Invalidate old one
2. Issue new one

This prevents replay attacks.

---

# 🧩 10. Real MERN Example (What we should do)

Since we are building MERN apps, here’s the practical setup:

---

### 👉 Backend (Node.js)

* On login:

  * create accessToken (15 min)
  * create refreshToken (7 days)
  * store refreshToken in DB (hashed)
  * send refreshToken as HttpOnly cookie

---

### 👉 Frontend (React)

* Store accessToken in memory (or Redux)
* Never store refreshToken manually

---

### 👉 Axios setup

* Attach access token:

  ```
  Authorization: Bearer <token>
  ```

* Interceptor:

  * if 401 → call refresh API → retry request

---

# ⚠️ Common mistakes (we must avoid)

* ❌ Storing tokens in localStorage (XSS risk)
* ❌ Long-lived access tokens
* ❌ Not rotating refresh tokens
* ❌ Not setting HttpOnly flag
* ❌ Not using HTTPS

---

# 🧠 Final mental model (lock this in)

Think of it like this:

* **Cookie** → delivery box
* **Access Token** → temporary pass (short entry)
* **Refresh Token** → master key to get new passes

---



