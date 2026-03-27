const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/services", (req, res) => {
  res.render("services");
});

app.get("/enquiries", (req, res) => {
  res.render("enquiries", {
    errors: {},
    formData: {}
  });
});

app.post("/enquiries", (req, res) => {
  const {
    fullName,
    email,
    phone,
    service,
    deliveryType,
    collectionDate,
    weight,
    message,
    collectionPostcode,
    deliveryPostcode
  } = req.body;

  const errors = {};

  if (!fullName || fullName.trim().length < 3) {
    errors.fullName = "Please enter a full name of at least 3 characters.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!phone || !/^[0-9+()\s-]{7,20}$/.test(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!service || service.trim() === "") {
    errors.service = "Please select a service.";
  }

  if (!deliveryType || deliveryType.trim() === "") {
    errors.deliveryType = "Please select a delivery type.";
  }

  if (!collectionDate) {
    errors.collectionDate = "Please choose a collection date.";
  } else {
    const selectedDate = new Date(collectionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      errors.collectionDate = "Collection date cannot be in the past.";
    }
  }

  if (!weight || Number(weight) <= 0) {
    errors.weight = "Please enter a valid weight greater than 0.";
  }

  if (!message || message.trim().length < 15) {
    errors.message = "Please enter at least 15 characters of delivery details.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).render("enquiries", {
      errors,
      formData: req.body
    });
  }

  const enquiryData = {
    fullName: fullName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    service: service.trim(),
    deliveryType: deliveryType.trim(),
    collectionDate,
    weight,
    message: message.trim(),
    collectionPostcode: collectionPostcode.trim(),
    deliveryPostcode: deliveryPostcode.trim()

  };

  console.log("Validated enquiry submitted:");
  console.log(enquiryData);

  res.render("thank-you", { enquiryData });
});

app.get("/thank-you", (req, res) => {
  res.render("thank-you", { enquiryData: null });
});

app.use((req, res) => {
  res.status(404).send("404 - Page not found");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});