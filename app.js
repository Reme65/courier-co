const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Tell Express to use EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files (CSS, images)
app.use(express.static(path.join(__dirname, "public")));

// Homepage route
app.get("/", (req, res) => {
  res.render("index");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/services", (req, res) => {
  res.render("services");
});

app.get("/enquiries", (req, res) => {
  res.render("enquiries");
});

app.get("/thank-you", (req, res) => {
  res.render("thank-you");
});