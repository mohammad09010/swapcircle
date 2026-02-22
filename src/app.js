const express = require("express");
const path = require("path");

const indexRouter = require("./routes/index");
const healthRouter = require("./routes/health");
const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");
const tagsRouter = require("./routes/tags");

const app = express();

// View engine
app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "pug");

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Routes
app.use("/", indexRouter);
app.use("/health", healthRouter);

// IMPORTANT: these must be here (before 404)
app.use("/users", usersRouter);
app.use("/items", itemsRouter);
app.use("/tags", tagsRouter);

// 404
app.use((req, res) => {
  res.status(404).render("not_found", { projectName: "SwapCircle" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("500 - Server Error");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running: http://localhost:${PORT}`));
