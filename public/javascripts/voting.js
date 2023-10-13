function handleSubmit(buttonClass) {
  const buttonEl = document.querySelector(buttonClass);

  buttonEl.disabled = true;
}

const deleteBtnEl = document.getElementById("deleteBtn");

deleteBtnEl.addEventListener("click", async () => {
  const votingId = deleteBtnEl.dataset.id;
  const response = await fetch(`/votings/${votingId}`, {
    method: "DELETE",
  });

  if (response.ok) {
    window.location.href = "/";
  }
});
