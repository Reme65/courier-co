document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".enquiry-form");
  if (!form) return;

  const fields = {
    fullName: document.getElementById("fullName"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    service: document.getElementById("service"),
    deliveryType: document.getElementById("deliveryType"),
    collectionDate: document.getElementById("collectionDate"),
    weight: document.getElementById("weight"),
    message: document.getElementById("message"),
    collectionPostcode: document.getElementById("collectionPostcode"),
    deliveryPostcode: document.getElementById("deliveryPostcode")
  };

  const results = {
    collectionPostcode: document.getElementById("collectionPostcodeResult"),
    deliveryPostcode: document.getElementById("deliveryPostcodeResult")
  };

  const errorMessages = {
    fullName: "Please enter a full name of at least 3 characters.",
    email: "Please enter a valid email address.",
    phone: "Please enter a valid phone number.",
    service: "Please select a service.",
    deliveryType: "Please select a delivery priority.",
    collectionDate: "Please choose today or a future date.",
    weight: "Please enter a valid weight greater than 0.",
    message: "Please enter at least 15 characters of delivery details.",
    collectionPostcode: "Please enter a valid UK postcode.",
    deliveryPostcode: "Please enter a valid UK postcode."
  };

  function createErrorElement(field) {
    let error = field.parentElement.querySelector(".form-error.client-error");

    if (!error) {
      error = document.createElement("p");
      error.className = "form-error client-error";
      field.parentElement.appendChild(error);
    }

    return error;
  }

  function clearClientErrors() {
    const clientErrors = form.querySelectorAll(".client-error");
    clientErrors.forEach((error) => error.remove());

    Object.values(fields).forEach((field) => {
      if (field) field.removeAttribute("aria-invalid");
    });
  }

  function clearPostcodeMessages() {
    Object.values(results).forEach((result) => {
      if (result) result.textContent = "";
    });
  }

  function validateFullName() {
    return fields.fullName.value.trim().length >= 3;
  }

  function validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(fields.email.value.trim());
  }

  function validatePhone() {
    const phonePattern = /^[0-9+()\s-]{7,20}$/;
    return phonePattern.test(fields.phone.value.trim());
  }

  function validateService() {
    return fields.service.value.trim() !== "";
  }

  function validateDeliveryType() {
    return fields.deliveryType.value.trim() !== "";
  }

  function validateCollectionDate() {
    if (!fields.collectionDate.value) return false;

    const selectedDate = new Date(fields.collectionDate.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate >= today;
  }

  function validateWeight() {
    return fields.weight.value !== "" && Number(fields.weight.value) > 0;
  }

  function validateMessage() {
    return fields.message.value.trim().length >= 15;
  }

  function normalisePostcode(value) {
    return value.trim().toUpperCase();
  }

  async function lookupPostcode(postcode) {
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
    const data = await response.json();
    return data;
  }

  async function validatePostcodeField(fieldName) {
    const field = fields[fieldName];
    const resultBox = results[fieldName];
    const postcode = normalisePostcode(field.value);

    if (!postcode) {
      if (resultBox) resultBox.textContent = "";
      return false;
    }

    try {
      const data = await lookupPostcode(postcode);

      if (data.status === 200 && data.result) {
        if (resultBox) {
          resultBox.textContent = `Valid postcode: ${data.result.postcode} • ${data.result.admin_district || ""} ${data.result.region ? "• " + data.result.region : ""}`.trim();
        }
        return true;
      }

      if (resultBox) resultBox.textContent = "Postcode not found.";
      return false;
    } catch (error) {
      if (resultBox) resultBox.textContent = "Unable to check postcode right now.";
      return false;
    }
  }

  const syncValidators = {
    fullName: validateFullName,
    email: validateEmail,
    phone: validatePhone,
    service: validateService,
    deliveryType: validateDeliveryType,
    collectionDate: validateCollectionDate,
    weight: validateWeight,
    message: validateMessage
  };

  function showFieldError(fieldName) {
    const field = fields[fieldName];
    const error = createErrorElement(field);

    error.textContent = errorMessages[fieldName];
    field.setAttribute("aria-invalid", "true");
  }

  async function runValidation() {
    clearClientErrors();
    clearPostcodeMessages();

    let formIsValid = true;

    Object.keys(syncValidators).forEach((fieldName) => {
      const isValid = syncValidators[fieldName]();

      if (!isValid) {
        formIsValid = false;
        showFieldError(fieldName);
      }
    });

    const collectionValid = await validatePostcodeField("collectionPostcode");
    if (!collectionValid) {
      formIsValid = false;
      showFieldError("collectionPostcode");
    }

    const deliveryValid = await validatePostcodeField("deliveryPostcode");
    if (!deliveryValid) {
      formIsValid = false;
      showFieldError("deliveryPostcode");
    }

    return formIsValid;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formIsValid = await runValidation();

    if (!formIsValid) {
      const firstError = form.querySelector(".client-error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        const field = firstError.previousElementSibling;
        if (field) field.focus();
      }
      return;
    }

    form.submit();
  });

  ["collectionPostcode", "deliveryPostcode"].forEach((fieldName) => {
    const field = fields[fieldName];
    if (!field) return;

    field.addEventListener("blur", async () => {
      const valid = await validatePostcodeField(fieldName);

      const oldError = field.parentElement.querySelector(".form-error.client-error");
      if (oldError) oldError.remove();
      field.removeAttribute("aria-invalid");

      if (!valid && field.value.trim()) {
        showFieldError(fieldName);
      }
    });
  });
});
