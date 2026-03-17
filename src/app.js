const express = require("express");
const path = require("path");

const indexRouter = require("./routes/index");
const healthRouter = require("./routes/health");
const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");
const tagsRouter = require("./routes/tags");

const app = express();

app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "pug");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use("/", indexRouter);
app.use("/health", healthRouter);
app.use("/users", usersRouter);
app.use("/items", itemsRouter);
app.use("/tags", tagsRouter);

app.use((req, res) => {
  res.status(404).render("status_message", {
    projectName: "SwapCircle",
    title: "Page not found",
    message: "The page you requested does not exist.",
    primaryLink: "/",
    primaryText: "Go home",
    secondaryLink: "/items",
    secondaryText: "Browse items"
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("status_message", {
    projectName: "SwapCircle",
    title: "Server error",
    message: "Something went wrong while loading this page. Please try again.",
    primaryLink: "/",
    primaryText: "Go home",
    secondaryLink: "/health",
    secondaryText: "Check health"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running: http://localhost:${PORT}`));
