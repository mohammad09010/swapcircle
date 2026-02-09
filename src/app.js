const express = require("express");
const path = require("path");

const indexRouter = require("./routes/index");
const healthRouter = require("./routes/health");

const app = express();

// View engine
app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "pug");

// Static assets
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// Routes
app.use("/", indexRouter);
app.use("/health", healthRouter);

// Basic 404
app.use((req, res) => {
  res.status(404).send("404 - Not Found");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SwapCircle running on http://localhost:${PORT}`);
});
