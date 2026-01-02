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
  const COMBO_WINDOW_MS = 900; // do 0.9s se drží combo
  const COMBO_ADD = 0.06;      // kolik přidá za rychlý klik
  const COMBO_MAX = 3.00;      // max combo

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

    renderEventLine(); // přepíše event text do správného jazyka
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

  // ===== modal =====
  if(btnSettings && settingsModal){
    btnSettings.addEventListener("click", () => {
      settingsModal.classList.add("show");
      settingsModal.setAttribute("aria-hidden","false");
      // user gesture → když je hudba povolená, zkus ji rozjet
      if(musicToggle?.checked) applyMusicEnabled(true);
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
  musicToggle?.addEventListener("change", () => applyMusicEnabled(musicToggle.checked));
  langSelect?.addEventListener("change", () => applyLang(langSelect.value));

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
    // vodka: +50% klik
    if(isEventActive("vodka")) return 1.5;
    // raid: klik x2
    if(isEventActive("raid")) return 2.0;
    return 1.0;
  }
  function cpsEventMultiplier(){
    // raid: cps -50% (police raid)
    if(isEventActive("raid")) return 0.5;
    return 1.0;
  }
  function shopDiscountMultiplier(){
    // market: -30% ceny
    if(isEventActive("market")) return 0.70;
    return 1.0;
  }

  function effectiveCost(base){
    return Math.ceil(base * shopDiscountMultiplier());
  }

  // ===== save/load =====
  function getSave(){
    return {
      version: 2,
      money, cpc, cps,
      slavPoints,
      updatedAt: Date.now()
    };
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

  // ===== UI helpers =====
  function renderEventLine(){
    const tr = t();
    if(!eventLine) return;

    // pokud event doběhl, vypni
    if(activeEvent && Date.now() >= eventEndsAt){
      activeEvent = null;
      eventEndsAt = 0;
    }

    if(!activeEvent){
      eventLine.textContent = tr.eventNone;
      return;
    }

    const left = Math.max(0, Math.ceil((eventEndsAt - Date.now()) / 1000));
    let label = tr.eventNone;
    if(activeEvent === "vodka") label = tr.eventVodka;
    if(activeEvent === "raid") label = tr.eventRaid;
    if(activeEvent === "market") label = tr.eventMarket;

    eventLine.textContent = `${label}: ${left}s`;
  }

  function render(){
    const prestigeMult = totalPrestigeMultiplier();
    const cpsMult = prestigeMult * cpsEventMultiplier();

    if(moneyEl) moneyEl.textContent = Math.floor(money);

    // CPC: ukážeme efektivní klik s prestige + combo + event (bez crit, protože je random)
    const effClick = cpc * prestigeMult * combo * clickEventMultiplier();
    if(cpcEl) cpcEl.textContent = `${cpc} (≈ ${Math.floor(effClick)})`;

    const effCps = cps * cpsMult;
    if(cpsEl) cpsEl.textContent = effCps.toFixed(1);

    // HUD
    if(comboEl) comboEl.textContent = `x${combo.toFixed(2)}`;
    if(critEl) critEl.textContent = `${Math.round(CRIT_CHANCE * 100)}%`;
    renderEventLine();

    // shop buttons availability (s event slevou)
    const cCost = effectiveCost(CURSOR_COST);
    const gCost = effectiveCost(GRANNY_COST);
    const kCost = effectiveCost(CLICK_COST);

    if(btnCursor){
      btnCursor.disabled = money < cCost;
      btnCursor.textContent = `${t().buy} (${cCost})`;
    }
    if(btnGranny){
      btnGranny.disabled = money < gCost;
      btnGranny.textContent = `${t().buy} (${gCost})`;
    }
    if(btnClick){
      btnClick.disabled = money < kCost;
      btnClick.textContent = `${t().upgrade} (${kCost})`;
    }

    // prestige
    const gain = calcPrestigeGain(money);
    if(spEl) spEl.textContent = String(slavPoints);
    if(bonusEl) bonusEl.textContent = `+${Math.round((prestigeMult - 1) * 100)}%`;
    if(spGainEl) spGainEl.textContent = String(gain);
    if(btnPrestige) btnPrestige.disabled = gain <= 0;

    saveGame();
  }

  // ===== prestige action =====
  function doPrestige(){
    const gain = calcPrestigeGain(money);
    if(gain <= 0) return;

    const ok = confirm(t().prestigeConfirm(gain));
    if(!ok) return;

    slavPoints += gain;

    // reset run
    money = 0;
    cpc = 1;
    cps = 0;

    // reset combo + event
    combo = 1.0;
    lastClickAt = 0;
    activeEvent = null;
    eventEndsAt = 0;

    render();
  }
  btnPrestige?.addEventListener("click", doPrestige);

  // ===== shop =====
  btnCursor?.addEventListener("click", () => {
    const cost = effectiveCost(CURSOR_COST);
    if(money < cost) return;
    money -= cost;
    cps += 0.1;
    render();
  });
  btnGranny?.addEventListener("click", () => {
    const cost = effectiveCost(GRANNY_COST);
    if(money < cost) return;
    money -= cost;
    cps += 1;
    render();
  });
  btnClick?.addEventListener("click", () => {
    const cost = effectiveCost(CLICK_COST);
    if(money < cost) return;
    money -= cost;
    cpc += 1;
    render();
  });

  // ===== combo + click gain =====
  const imgs = ["gopnik_A.png", "gopnik_B.png"];
  let imgIndex = 0;

  function updateComboOnClick(){
    const now = Date.now();
    if(lastClickAt && (now - lastClickAt) <= COMBO_WINDOW_MS){
      combo = Math.min(COMBO_MAX, combo + COMBO_ADD);
    }else{
      combo = 1.0;
    }
    lastClickAt = now;
  }

  function rollCrit(){
    return Math.random() < CRIT_CHANCE;
  }

  gopnikBtn?.addEventListener("click", () => {
    // click sound
    if(clickSnd){
      clickSnd.currentTime = 0;
      clickSnd.play().catch(()=>{});
    }

    // combo
    updateComboOnClick();

    // base gain
    const prestigeMult = totalPrestigeMultiplier();
    let gain = cpc * prestigeMult * combo * clickEventMultiplier();

    // crit
    if(rollCrit()){
      gain *= CRIT_MULT;
      // malá vizuální nápověda přes eventLine na 1s
      if(eventLine){
        const old = eventLine.textContent;
        eventLine.textContent = `💥 CRIT! +${Math.floor(gain)}`;
        setTimeout(() => renderEventLine(), 900);
      }
    }

    money += gain;

    // gopnik swap + pop
    imgIndex = (imgIndex + 1) % imgs.length;
    if(gopnikImg) gopnikImg.src = imgs[imgIndex];
    if(gopnikImg){
      gopnikImg.style.transform = "scale(1.05)";
      setTimeout(() => gopnikImg.style.transform = "scale(1)", 80);
    }

    render();
  });

  // combo decay (když neklikáš, spadne zpět)
  setInterval(() => {
    if(!lastClickAt) return;
    const idle = Date.now() - lastClickAt;
    if(idle > COMBO_WINDOW_MS && combo !== 1.0){
      combo = 1.0;
      render();
    }
  }, 250);

  // passive income
  setInterval(() => {
    const prestigeMult = totalPrestigeMultiplier();
    const gain = cps * prestigeMult * cpsEventMultiplier();
    money += gain;
    render();
  }, 1000);

  // ===== events scheduler =====
  function scheduleNextEvent(){
    clearTimeout(nextEventTimer);
    const delay = EVENT_MIN_MS + Math.random() * (EVENT_MAX_MS - EVENT_MIN_MS);
    nextEventTimer = setTimeout(startRandomEvent, delay);
  }

  function startRandomEvent(){
    // pokud už běží event, jen naplánuj další
    if(activeEvent && Date.now() < eventEndsAt){
      scheduleNextEvent();
      return;
    }

    const pool = ["vodka", "raid", "market"];
    activeEvent = pool[Math.floor(Math.random() * pool.length)];

    let dur = 15; // default vodka 15s
    if(activeEvent === "raid") dur = 10;
    if(activeEvent === "market") dur = 20;

    eventEndsAt = Date.now() + dur * 1000;

    // aby se hned promítly slevy / multiplikátory do UI
    render();

    // po skončení znovu naplánuj
    setTimeout(() => {
      if(Date.now() >= eventEndsAt){
        activeEvent = null;
        eventEndsAt = 0;
        render();
      }
      scheduleNextEvent();
    }, (dur + 0.2) * 1000);
  }

  // ===== init =====
  // music toggle default
  const savedMusic = localStorage.getItem("musicEnabled");
  if(musicToggle){
    musicToggle.checked = (savedMusic !== "0");
    if(!musicToggle.checked && bgMusic){
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  }

  // language init
  if(langSelect) langSelect.value = lang;
  applyLang(lang);

  // load save
  loadGame();
  render();

  // loading click starts music (allowed user gesture)
  loading?.addEventListener("click", () => {
    if(musicToggle?.checked) applyMusicEnabled(true);
    loading.style.display = "none";
  }, { once:true });

  // start event loop
  scheduleNextEvent();
});
