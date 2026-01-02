window.addEventListener("DOMContentLoaded", () => {
  // ===== DOM refs =====
  const loading   = document.getElementById("loading");
  const bgMusic   = document.getElementById("bgMusic");
  const clickSnd  = document.getElementById("clickSnd");

  const settingsModal     = document.getElementById("settingsModal");
  const btnSettings       = document.getElementById("btnSettings");
  const btnCloseSettings  = document.getElementById("btnCloseSettings");
  const musicToggle       = document.getElementById("musicToggle");
  const langSelect        = document.getElementById("langSelect");

  const btnCursor = document.getElementById("buyCursor");
  const btnGranny = document.getElementById("buyGranny");
  const btnClick  = document.getElementById("buyClick");

  const moneyEl   = document.getElementById("money");
  const cpcEl     = document.getElementById("cpc");
  const cpsEl     = document.getElementById("cps");
  const gopnikImg = document.getElementById("gopnikImg");
  const gopnikBtn = document.getElementById("gopnik");

  // prestige refs
  const spEl        = document.getElementById("sp");
  const bonusEl     = document.getElementById("bonus");
  const spGainEl    = document.getElementById("spGain");
  const btnPrestige = document.getElementById("btnPrestige");

  // ===== constants =====
  const CURSOR_COST  = 15;
  const GRANNY_COST  = 100;
  const CLICK_COST   = 50;

  const PRESTIGE_MIN = 100000;
  const SP_BONUS_PER_POINT = 0.02; // 2%

  // ===== i18n =====
  const i18n = {
    cs: {
      settingsTitle: "Nastavení",
      music: "Hudba",
      lang: "Jazyk",
      moneyTitle: "PENÍZE",
      shopTitle: "OBCHOD",
      prestigeTitle: "PRESTIGE",
      cursor: "Kurzor",
      granny: "Babička",
      clickPower: "Síla kliku",
      buy: "Koupit",
      upgrade: "Vylepšit",
      dance: "Tanec gopníka (A ↔ B)",
      startHint: "klikni pro start",
      prestigeHint: "Resetuje peníze a upgradey, ale dá trvalý bonus.",
      prestigeBtn: "Prestige (reset)"
    },
    en: {
      settingsTitle: "Settings",
      music: "Music",
      lang: "Language",
      moneyTitle: "MONEY",
      shopTitle: "SHOP",
      prestigeTitle: "PRESTIGE",
      cursor: "Cursor",
      granny: "Grandma",
      clickPower: "Click power",
      buy: "Buy",
      upgrade: "Upgrade",
      dance: "Gopnik dance (A ↔ B)",
      startHint: "click to start",
      prestigeHint: "Resets money and upgrades, but gives a permanent bonus.",
      prestigeBtn: "Prestige (reset)"
    }
  };

  const el = (id) => document.getElementById(id);

  function applyLang(lang){
    const t = i18n[lang] || i18n.cs;

    if(el("t_settingsTitle")) el("t_settingsTitle").textContent = t.settingsTitle;
    if(el("t_musicLabel")) el("t_musicLabel").textContent = t.music;
    if(el("t_langLabel")) el("t_langLabel").textContent = t.lang;

    if(el("t_moneyTitle")) el("t_moneyTitle").textContent = t.moneyTitle;
    if(el("t_shopTitle")) el("t_shopTitle").textContent = t.shopTitle;
    if(el("t_prestigeTitle")) el("t_prestigeTitle").textContent = t.prestigeTitle;

    if(el("t_itemCursor")) el("t_itemCursor").textContent = t.cursor;
    if(el("t_itemGranny")) el("t_itemGranny").textContent = t.granny;
    if(el("t_itemClick"))  el("t_itemClick").textContent  = t.clickPower;

    if(btnCursor) btnCursor.textContent = `${t.buy} (${CURSOR_COST})`;
    if(btnGranny) btnGranny.textContent = `${t.buy} (${GRANNY_COST})`;
    if(btnClick)  btnClick.textContent  = `${t.upgrade} (${CLICK_COST})`;

    if(el("t_danceHint")) el("t_danceHint").textContent = t.dance;
    if(el("t_startHint")) el("t_startHint").textContent = t.startHint;

    if(el("t_prestigeHint")) el("t_prestigeHint").textContent = t.prestigeHint;
    if(btnPrestige) btnPrestige.textContent = t.prestigeBtn;

    localStorage.setItem("slavLang", lang);
  }

  function applyMusicEnabled(enabled){
    localStorage.setItem("musicEnabled", enabled ? "1" : "0");
    if(!bgMusic) return;

    if(enabled){
      bgMusic.muted = false;
      bgMusic.volume = 0.35;
      bgMusic.play().catch(()=>{});
    }else{
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  }

  // ===== modal open/close =====
  if(btnSettings && settingsModal){
    btnSettings.addEventListener("click", () => {
      settingsModal.classList.add("show");
      settingsModal.setAttribute("aria-hidden","false");
    });
  }
  if(btnCloseSettings && settingsModal){
    btnCloseSettings.addEventListener("click", () => {
      settingsModal.classList.remove("show");
      settingsModal.setAttribute("aria-hidden","true");
    });
    settingsModal.addEventListener("click", (e) => {
      if(e.target === settingsModal){
        settingsModal.classList.remove("show");
        settingsModal.setAttribute("aria-hidden","true");
      }
    });
  }

  if(musicToggle){
    musicToggle.addEventListener("change", () => applyMusicEnabled(musicToggle.checked));
  }
  if(langSelect){
    langSelect.addEventListener("change", () => applyLang(langSelect.value));
  }

  // ===== GAME STATE =====
  let money = 0, cpc = 1, cps = 0;
  let slavPoints = 0;

  const imgs = ["gopnik_A.png", "gopnik_B.png"];
  let imgIndex = 0;

  function totalMultiplier(){
    return 1 + (slavPoints * SP_BONUS_PER_POINT);
  }

  function calcPrestigeGain(currentMoney){
    if(currentMoney < PRESTIGE_MIN) return 0;
    return Math.floor(Math.sqrt(currentMoney / PRESTIGE_MIN));
  }

  function getSave(){
    return { version:1, money, cpc, cps, slavPoints, updatedAt: Date.now() };
  }
  function applySave(d){
    money = d?.money ?? 0;
    cpc   = d?.cpc ?? 1;
    cps   = d?.cps ?? 0;
    slavPoints = d?.slavPoints ?? 0;
  }
  function saveGame(){
    localStorage.setItem("slavClickerSave", JSON.stringify(getSave()));
  }
  function loadGame(){
    const s = localStorage.getItem("slavClickerSave");
    if(!s) return;
    try { applySave(JSON.parse(s)); } catch {}
  }

  function render(){
    const mult = totalMultiplier();

    if(moneyEl) moneyEl.textContent = Math.floor(money);
    if(cpcEl)   cpcEl.textContent = `${cpc} (×${mult.toFixed(2)})`;
    if(cpsEl)   cpsEl.textContent = (cps * mult).toFixed(1);

    if(btnCursor) btnCursor.disabled = money < CURSOR_COST;
    if(btnGranny) btnGranny.disabled = money < GRANNY_COST;
    if(btnClick)  btnClick.disabled  = money < CLICK_COST;

    const gain = calcPrestigeGain(money);
    if(spEl) spEl.textContent = String(slavPoints);
    if(bonusEl) bonusEl.textContent = `+${Math.round((mult - 1) * 100)}%`;
    if(spGainEl) spGainEl.textContent = String(gain);
    if(btnPrestige) btnPrestige.disabled = gain <= 0;

    saveGame();
  }

  function doPrestige(){
    const gain = calcPrestigeGain(money);
    if(gain <= 0) return;

    const ok = confirm(`Prestige? Získáš ${gain} Slav Points.\nResetuje se peníze a upgradey.`);
    if(!ok) return;

    slavPoints += gain;
    money = 0;
    cpc = 1;
    cps = 0;
    render();
  }

  if(btnPrestige){
    btnPrestige.addEventListener("click", doPrestige);
  }

  // ===== shop handlers =====
  if(btnCursor){
    btnCursor.addEventListener("click", () => {
      if(money < CURSOR_COST) return;
      money -= CURSOR_COST;
      cps += 0.1;
      render();
    });
  }
  if(btnGranny){
    btnGranny.addEventListener("click", () => {
      if(money < GRANNY_COST) return;
      money -= GRANNY_COST;
      cps += 1;
      render();
    });
  }
  if(btnClick){
    btnClick.addEventListener("click", () => {
      if(money < CLICK_COST) return;
      money -= CLICK_COST;
      cpc += 1;
      render();
    });
  }

  // ===== gopnik click =====
  if(gopnikBtn){
    gopnikBtn.addEventListener("click", () => {
      if(clickSnd){
        clickSnd.currentTime = 0;
        clickSnd.play().catch(()=>{});
      }

      money += cpc * totalMultiplier();

      imgIndex = (imgIndex + 1) % imgs.length;
      if(gopnikImg) gopnikImg.src = imgs[imgIndex];

      if(gopnikImg){
        gopnikImg.style.transform = "scale(1.05)";
        setTimeout(() => gopnikImg.style.transform = "scale(1)", 80);
      }

      render();
    });
  }

  // passive income
  setInterval(() => {
    money += cps * totalMultiplier();
    render();
  }, 1000);

  // ===== init settings =====
  const savedMusic = localStorage.getItem("musicEnabled");
  if(musicToggle){
    musicToggle.checked = (savedMusic !== "0");
    if(!musicToggle.checked && bgMusic){
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  }

  const savedLang = localStorage.getItem("slavLang") || "cs";
  if(langSelect) langSelect.value = savedLang;
  applyLang(savedLang);

  // load save
  loadGame();
  render();

  // loading click starts music (allowed user gesture)
  if(loading){
    loading.addEventListener("click", () => {
      if(musicToggle && musicToggle.checked){
        applyMusicEnabled(true);
      }
      loading.style.display = "none";
    }, { once:true });
  }
});
