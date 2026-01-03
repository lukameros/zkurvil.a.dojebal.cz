// =====================
// ZÁKLADNÍ DATA POSTAVY
// =====================
let money = 3170;
let cigarettes = 42;

// =====================
// INIT – NASTAVENÍ UI
// =====================
document.addEventListener("DOMContentLoaded", () => {
  // Měna
  const moneyEl = document.getElementById("money");
  const cigarettesEl = document.getElementById("cigarettes");

  if (moneyEl) moneyEl.textContent = money.toLocaleString("cs-CZ");
  if (cigarettesEl) cigarettesEl.textContent = cigarettes;

  initMenuButtons();
  initStatButtons();
});

// =====================
// MENU BUTTONS (ACTIVE)
// =====================
function initMenuButtons() {
  const buttons = document.querySelectorAll(".sf-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// =====================
// STAT BUTTONS (+)
// =====================
function initStatButtons() {
  document.querySelectorAll(".stat").forEach(stat => {
    const btn = stat.querySelector("button");
    const valueEl = stat.querySelector("b");

    if (!btn || !valueEl) return;

    btn.addEventListener("click", () => {
      let current = parseInt(valueEl.textContent) || 0;
      valueEl.textContent = current + 1;
    });
  });
}
