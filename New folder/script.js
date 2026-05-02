/* back to the top button*/
refreshBtn.addEventListener("click", loadNewImage);

const topBtn = document.getElementById("topBtn");

topBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});