const express = require("express");
const path = require("path");

const indexRouter = require("./routes/index");
const healthRouter = require("./routes/health");
const usersRouter = require("./routes/users");
const itemsRouter = require("./routes/items");
const tagsRouter = require("./routes/tags");
const staticRouter = require("./routes/static");

const app = express();

app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "pug");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "..", "public")));

app.use((req, res, next) => {
  res.locals.projectName = "SwapCircle";
  res.locals.currentPath = req.path;
  next();
});

app.use("/", indexRouter);
app.use("/health", healthRouter);
app.use("/users", usersRouter);
app.use("/items", itemsRouter);
app.use("/tags", tagsRouter);
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SwapCircle running at http://localhost:${PORT}`);
});
