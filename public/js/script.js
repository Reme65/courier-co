form.addEventListener("submit", (event) => {
  clearClientErrors();

  let formIsValid = true;

  Object.keys(validators).forEach((fieldName) => {
    const isValid = validators[fieldName]();

    if (!isValid) {
      formIsValid = false;
      showFieldError(fieldName);
    }
  });

  if (!formIsValid) {
    event.preventDefault();

    // 👇 scroll to first error (nice UX upgrade)
    const firstError = form.querySelector(".client-error");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      const field = firstError.previousElementSibling;
    if (field) field.focus();
    }
  }
});