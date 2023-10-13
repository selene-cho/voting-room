document.addEventListener("DOMContentLoaded", () => {
  const all = document.getElementById("all");
  const isActive = document.getElementById("isActive");
  const isActiveFalse = document.getElementById("isActiveFalse");

  all.addEventListener("click", () => {
    filter("all");
  });
  isActive.addEventListener("click", () => filter("isActive"));
  isActiveFalse.addEventListener("click", () => filter("isActiveFalse"));

  function filter(status) {
    const votings = document.querySelectorAll(".voting__block");

    votings.forEach((voting) => {
      if (voting.classList.contains(status)) {
        voting.style.display = "grid";
      } else {
        voting.style.display = "none";
      }
    });
  }
});
