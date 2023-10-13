document.addEventListener("DOMContentLoaded", () => {
  const formBlockOptions = document.querySelector(
    ".form__block.form__block--options"
  );

  function updateDeleteButtons() {
    const formBlockOption = document.querySelectorAll(".form__block--option")
    const deleteButtons = document.querySelectorAll(".deleteOptionBtn");

    deleteButtons.forEach((btn) => btn.removeAttribute("disabled"));

    if (formBlockOption.length <= 2) {
      deleteButtons.forEach((btn) => btn.setAttribute("disabled", true));
    }
  }

  updateDeleteButtons();

  document.querySelector(".addOptionBtn").addEventListener("click", (e) => {
    e.preventDefault();

    const optionBlock = document.createElement("div");
    optionBlock.className = "form__block--option"

    const optionInput = document.createElement("input");
    optionInput.type = "text";
    optionInput.name = "options";
    optionInput.className = "options";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "deleteOptionBtn";
    deleteButton.textContent = "🗑️ 삭제";

    deleteButton.addEventListener("click", () => {
      optionBlock.remove();
      updateDeleteButtons();
    });

    optionBlock.appendChild(optionInput);
    optionBlock.appendChild(deleteButton);

    formBlockOptions.appendChild(optionBlock);
    updateDeleteButtons();
  })
});
