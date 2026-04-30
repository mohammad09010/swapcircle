require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");

const { waitForDatabase } = require("./db");
const { attachCurrentUser } = require("./middleware/auth");

const indexRouter = require("./routes/index");
const healthRouter = require("./routes/health");
const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");
const itemsCreateRouter = require("./routes/items_create");
const tagsRouter = require("./routes/tags");
const staticRouter = require("./routes/static");
const authRouter = require("./routes/auth");
const swapsRouter = require("./routes/swaps");
const dashboardRouter = require("./routes/dashboard");
const settingsRouter = require("./routes/settings");
const referralRouter = require("./routes/referral");

const app = express();

app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "pug");
app.set("trust proxy", 1);

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use(
  session({
    name: "swapcircle.sid",
    secret: process.env.SESSION_SECRET || "swapcircle-dev-secret-change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    }
  })
);

app.use((req, res, next) => {
  res.locals.projectName = "SwapCircle";
  res.locals.currentPath = req.path;
  next();
});

app.use(attachCurrentUser);

app.use("/", indexRouter);
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/", itemsCreateRouter);
app.use("/items", itemsRouter);
app.use("/tags", tagsRouter);
app.use("/my-swaps", swapsRouter);
app.use("/settings", settingsRouter);
app.use("/referral", referralRouter);
app.use("/", dashboardRouter);
app.use("/", staticRouter);

app.use((req, res) => {
  res.status(404).render("not_found", {
    pageTitle: "Page not found",
    pageClass: "page-not-found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("server_error", {
    pageTitle: "Server error",
    pageClass: "page-error",
    message: "Something went wrong while loading this page. Please try again."
  });
});

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  try {
    await waitForDatabase();
    app.listen(PORT, () => {
      console.log(`SwapCircle running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to MySQL after multiple attempts.");
    console.error(error);
    process.exit(1);
  }
}

startServer();
