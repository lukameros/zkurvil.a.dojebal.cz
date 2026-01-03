let money = 3170;
let mushrooms = 42;

// Menu button interactions
document.querySelectorAll(".sf-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".sf-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// Stat buttons
document.querySelectorAll(".stat button").forEach(btn => {
  btn.addEventListener("click", () => {
    const statValue = btn.previousElementSibling;
    const currentValue = parseInt(statValue.textContent);
    statValue.textContent = currentValue + 1;
  });
});