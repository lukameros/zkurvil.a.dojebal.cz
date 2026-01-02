document.addEventListener("DOMContentLoaded", () => {
  // ===== DOM refs =====
  const loading   = document.getElementById("loading");
  const bgMusic   = document.getElementById("bgMusic");
  const clickSnd  = document.getElementById("clickSnd");

  const settingsModal     = document.getElementById("settingsModal");
  const btnSettings       = document.getElementById("btnSettings");
  const btnCloseSettings  = document.getElementById("btnCloseSettings");
  const musicToggle       = document.getElementById("musicToggle");
  const langSelect        = document.getElementById("langSelect");

  // sidebar nav
  const navPlay     = document.getElementById("navPlay");
  const navShop     = document.getElementById("navShop");
  const navUpgrades = document.getElementById("navUpgrades");
  const navPrestige = document.getElementById("navPrestige");
  const navSettings = document.getElementById("navSettings");

  // sidebar stats
  const moneySideEl = document.getElementById("moneySide");
  const cpcSideEl   = document.getElementById("cpcSide");
  const cpsSideEl   = document.getElementById("cpsSide");

  const btnCursor = document.getElementById("buyCursor");
  const btnGranny = document.getElementById("buyGranny");
  const btnClick  = document.getElementById("buyClick");

  const moneyEl   = document.getElementById("money");
  const cpcEl     = document.getElementById("cpc");
  const cpsEl     = document.getElementById("cps");

  const comboEl   = document.getElementById("combo");
  const critEl    = document.getElementById("crit");
  const eventLine = document.getElementById("eventLine");

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
  const SP_BONUS_PER_POINT = 0.02; // +2% za point

  // Combo
  const COMBO_WINDOW_MS = 900;
  const COMBO_ADD = 0.06;
  const COMBO_MAX = 3.00;

  // Crit
  const CRIT_CHANCE = 0.10;
  const CRIT_MULT   = 3.0;

  // Events
  const EVENT_MIN_MS = 45000;
  const EVENT_MAX_MS = 90000;

  // ===== i18n (min) =====
  const i18n = {
    cs: {
      settingsTitle: "Nastavení",
      music: "Hudba",
      lang: "Jazyk",
      moneyTitle: "PENÍZE",
      moneyLabel: "Peníze:",
      cpcLabel: "Za klik:",
      cpsLabel: "Za sekundu:",
      shopTitle: "OBCHOD",
      prestigeTitle: "PRESTIGE",
      cursor: "Kurzor",
      granny: "Babička",
      clickPower: "Síla kliku",
      buy: "Koupit",
      upgrade: "Vylepšit",
      startHint: "klikni pro start",
      prestigeHint: "Resetuje peníze a upgradey, ale dá trvalý bonus.",
      prestigeBtn: "Prestige (reset)",
      combo: "Combo:",
      crit: "Krit:",
      eventNone: "—",
      eventVodka: "Vodka Rush aktivní",
      eventRaid: "Police Raid aktivní",
      eventMarket: "Slav Market aktivní",
      prestigeConfirm: (gain)=>`Prestige? Získáš ${gain} Slav Points.\nResetuje se peníze a upgradey.`
    },
    en: {
      settingsTitle: "Settings",
      music: "Music",
      lang: "Language",
      moneyTitle: "MONEY",
      moneyLabel: "Money:",
      cpcLabel: "Per click:",
      cpsLabel: "Per second:",
      shopTitle: "SHOP",
      prestigeTitle: "PRESTIGE",
      cursor: "Cursor",
      granny: "Grandma",
      clickPower: "Click power",
      buy: "Buy",
      upgrade: "Upgrade",
      startHint: "click to start",
      prestigeHint: "Resets money and upgrades, but gives a permanent bonus.",
      prestigeBtn: "Prestige (reset)",
      combo: "Combo:",
      crit: "Crit:",
      eventNone: "—",
      eventVodka: "Vodka Rush active",
      eventRaid: "Police Raid active",
      eventMarket: "Slav Market active",
      prestigeConfirm: (gain)=>`Prestige? You will gain ${gain} Slav Points.\nMoney and upgrades will reset.`
    }
  };

  const el = (id) => document.getElementById(id);

  let lang = localStorage.getItem("slavLang") || "cs";
  function t(){ return i18n[lang] || i18n.cs; }

  function applyLang(newLang){
    lang = newLang;
    localStorage.setItem("slavLang", lang);
    const tr = t();

    if(el("t_settingsTitle")) el("t_settingsTitle").textContent = tr.settingsTitle;
    if(el("t_musicLabel")) el("t_musicLabel").textContent = tr.music;
    if(el("t_langLabel")) el("t_langLabel").textContent = tr.lang;

    if(el("t_moneyTitle")) el("t_moneyTitle").textContent = tr.moneyTitle;
    if(el("t_moneyLabel")) el("t_moneyLabel").textContent = tr.moneyLabel;
    if(el("t_cpcLabel")) el("t_cpcLabel").textContent = tr.cpcLabel;
    if(el("t_cpsLabel")) el("t_cpsLabel").textContent = tr.cpsLabel;

    if(el("t_shopTitle")) el("t_shopTitle").textContent = tr.shopTitle;
    if(el("t_prestigeTitle")) el("t_prestigeTitle").textContent = tr.prestigeTitle;

    if(el("t_itemCursor")) el("t_itemCursor").textContent = tr.cursor;
    if(el("t_itemGranny")) el("t_itemGranny").textContent = tr.granny;
    if(el("t_itemClick"))  el("t_itemClick").textContent  = tr.clickPower;

    if(btnCursor) btnCursor.textContent = `${tr.buy} (${effectiveCost(CURSOR_COST)})`;
    if(btnGranny) btnGranny.textContent = `${tr.buy} (${effectiveCost(GRANNY_COST)})`;
    if(btnClick)  btnClick.textContent  = `${tr.upgrade} (${effectiveCost(CLICK_COST)})`;

    if(el("t_startHint")) el("t_startHint").textContent = tr.startHint;
    if(el("t_prestigeHint")) el("t_prestigeHint").textContent = tr.prestigeHint;
    if(btnPrestige) btnPrestige.textContent = tr.prestigeBtn;

    if(el("t_comboLabel")) el("t_comboLabel").textContent = tr.combo;
    if(el("t_critLabel")) el("t_critLabel").textContent = tr.crit;

    renderEventLine();
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

  function openSettings(){
    if(!settingsModal) return;
    settingsModal.classList.add("show");
    settingsModal.setAttribute("aria-hidden","false");
    if(musicToggle?.checked) applyMusicEnabled(true);
  }
  function closeSettings(){
    if(!settingsModal) return;
    settingsModal.classList.remove("show");
    settingsModal.setAttribute("aria-hidden","true");
  }

  // ===== modal =====
  btnSettings?.addEventListener("click", openSettings);
  navSettings?.addEventListener("click", openSettings);

  btnCloseSettings?.addEventListener("click", closeSettings);
  settingsModal?.addEventListener("click", (e) => {
    if(e.target === settingsModal) closeSettings();
  });

  musicToggle?.addEventListener("change", () => applyMusicEnabled(musicToggle.checked));
  langSelect?.addEventListener("change", () => applyLang(langSelect.value));

  // ===== nav actions =====
  navPlay?.addEventListener("click", () => {
    // jen vizuálně – klidně později dáme highlight
    gopnikBtn?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  });
  navShop?.addEventListener("click", () => {
    document.getElementById("t_shopTitle")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  });
  navUpgrades?.addEventListener("click", () => {
    document.getElementById("t_shopTitle")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  });
  navPrestige?.addEventListener("click", () => {
    document.getElementById("t_prestigeTitle")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  });

  // ===== GAME STATE =====
  let money = 0, cpc = 1, cps = 0;
  let slavPoints = 0;

  // combo state
  let combo = 1.0;
  let lastClickAt = 0;

  // event state
  let activeEvent = null; // "vodka" | "raid" | "market" | null
  let eventEndsAt = 0;
  let nextEventTimer = null;

  // ===== prestige =====
  function totalPrestigeMultiplier(){
    return 1 + (slavPoints * SP_BONUS_PER_POINT);
  }
  function calcPrestigeGain(currentMoney){
    if(currentMoney < PRESTIGE_MIN) return 0;
    return Math.floor(Math.sqrt(currentMoney / PRESTIGE_MIN));
  }

  // ===== event effects =====
  function isEventActive(name){
    return activeEvent === name && Date.now() < eventEndsAt;
  }
  function clickEventMultiplier(){
    if(isEventActive("vodka")) return 1.5;
    if(isEv
