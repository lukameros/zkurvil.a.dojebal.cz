document.addEventListener("DOMContentLoaded", async () => {
  // =========================
  // SUPABASE (jen session + save)
  // =========================
  const SUPABASE_URL = 'https://bmmaijlbpwgzhrxzxphf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbWFpamxicHdnemhyeHp4cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjQ5MDcsImV4cCI6MjA4MjQ0MDkwN30.s0YQVnAjMXFu1pSI1NXZ2naSab179N0vQPglsmy3Pgw';

  const supabase = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_ANON_KEY);

  // =========================
  // SAFE HELPERS
  // =========================
  const must = (el, name) => {
    if (!el) console.warn(`Chybí element #${name}`);
    return el;
  };
  const on = (el, ev, fn, opts) => {
    if (!el) return;
    el.addEventListener(ev, fn, opts);
  };

  // =========================
  // DOM
  // =========================
  const loading = must(document.getElementById("loading"), "loading");
  const bgMusic = document.getElementById("bgMusic");
  const clickSnd = document.getElementById("clickSnd");

  const settingsModal = document.getElementById("settingsModal");
  const btnSettings = document.getElementById("btnSettings");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const musicToggle = must(document.getElementById("musicToggle"), "musicToggle");
  const langSelect = must(document.getElementById("langSelect"), "langSelect");

  const cloudStatus = document.getElementById("cloudStatus");
  const cloudHint = document.getElementById("cloudHint");

  const moneyEl = must(document.getElementById("money"), "money");
  const cpcEl = must(document.getElementById("cpc"), "cpc");
  const cpsEl = must(document.getElementById("cps"), "cps");

  const comboEl = document.getElementById("combo");
  const critEl = document.getElementById("crit");
  const eventLine = must(document.getElementById("eventLine"), "eventLine");

  const gopnikBtn = must(document.getElementById("gopnik"), "gopnik");
  const gopnikImg = must(document.getElementById("gopnikImg"), "gopnikImg");

  const btnCursor = must(document.getElementById("buyCursor"), "buyCursor");
  const btnGranny = must(document.getElementById("buyGranny"), "buyGranny");
  const btnClick = must(document.getElementById("buyClick"), "buyClick");

  const spEl = document.getElementById("sp");
  const bonusEl = document.getElementById("bonus");
  const spGainEl = document.getElementById("spGain");
  const btnPrestige = document.getElementById("btnPrestige");

  // =========================
  // CONSTANTS
  // =========================
  const CURSOR_COST = 15;
  const GRANNY_COST = 100;
  const CLICK_COST  = 50;

  const PRESTIGE_MIN = 100000;
  const SP_BONUS_PER_POINT = 0.02;

  // Combo
  const COMBO_WINDOW_MS = 900;
  const COMBO_ADD = 0.06;
  const COMBO_MAX = 3.00;

  // Crit
  const CRIT_CHANCE = 0.10;
  const CRIT_MULT = 3.0;

  // Events
  const EVENT_MIN_MS = 45000;
  const EVENT_MAX_MS = 90000;

  // =========================
  // i18n (minimum)
  // =========================
  const i18n = {
    cs: {
      startHint: "Klikni pro start",
      moneyLabel: "Peníze",
      cpcLabel: "Za klik",
      cpsLabel: "Za sek",
      shopTitle: "OBCHOD",
      prestigeTitle: "PRESTIGE",
      cursor: "Kurzor",
      granny: "Babička",
      clickPower: "Síla kliku",
      buy: "Koupit",
      upgrade: "Vylepšit",
      combo: "Combo",
      crit: "Krit",
      prestigeHint: "Resetuje peníze a upgradey, ale dá trvalý bonus.",
      prestigeBtn: "Prestige (reset)",
      eventNone: "—",
      eventVodka: "Vodka Rush aktivní",
      eventRaid: "Police Raid aktivní",
      eventMarket: "Slav Market aktivní",
      prestigeConfirm: (gain)=>`Prestige? Získáš ${gain} Slav Points.\nResetuje se peníze a upgradey.`
    },
    en: {
      startHint: "Click to start",
      moneyLabel: "Money",
      cpcLabel: "Per click",
      cpsLabel: "Per sec",
      shopTitle: "SHOP",
      prestigeTitle: "PRESTIGE",
      cursor: "Cursor",
      granny: "Grandma",
      clickPower: "Click power",
      buy: "Buy",
      upgrade: "Upgrade",
      combo: "Combo",
      crit: "Crit",
      prestigeHint: "Resets money & upgrades, but gives permanent bonus.",
      prestigeBtn: "Prestige (reset)",
      eventNone: "—",
      eventVodka: "Vodka Rush active",
      eventRaid: "Police Raid active",
      eventMarket: "Slav Market active",
      prestigeConfirm: (gain)=>`Prestige? You gain ${gain} Slav Points.\nMoney and upgrades reset.`
    }
  };

  let lang = localStorage.getItem("slavLang") || "cs";
  function t(){ return i18n[lang] || i18n.cs; }

  // =========================
  // GAME STATE
  // =========================
  let money = 0, cpc = 1, cps = 0;
  let slavPoints = 0;

  let combo = 1.0;
  let lastClickAt = 0;

  let activeEvent = null; // vodka|raid|market|null
  let eventEndsAt = 0;
  let nextEventTimer = null;

  // 3 statické obrázky A -> B -> C -> A
  const imgs = ["gopnik_A.png", "gopnik_B.png", "gopnik_C.png"];
  let imgIndex = 0;

  // Supabase user (z session)
  let user = null;

  // =========================
  // Settings: language + music
  // =========================
  function applyLang(newLang){
    lang = newLang;
    localStorage.setItem("slavLang", lang);

    const tr = t();
    const setText = (id, txt) => {
      const x = document.getElementById(id);
      if(x) x.textContent = txt;
    };

    setText("t_startHint", tr.startHint);
    setText("t_moneyLabel", tr.moneyLabel);
    setText("t_cpcLabel", tr.cpcLabel);
    setText("t_cpsLabel", tr.cpsLabel);
    setText("t_shopTitle", tr.shopTitle);
    setText("t_prestigeTitle", tr.prestigeTitle);

    setText("t_itemCursor", tr.cursor);
    setText("t_itemGranny", tr.granny);
    setText("t_itemClick", tr.clickPower);

    setText("t_comboLabel", tr.combo);
    setText("t_critLabel", tr.crit);

    setText("t_prestigeHint", tr.prestigeHint);
    if(btnPrestige) btnPrestige.textContent = tr.prestigeBtn;

    render();
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

  // =========================
  // Prestige + multipliers
  // =========================
  function prestigeMult(){ return 1 + slavPoints * SP_BONUS_PER_POINT; }
  function calcPrestigeGain(currentMoney){
    if(currentMoney < PRESTIGE_MIN) return 0;
    return Math.floor(Math.sqrt(currentMoney / PRESTIGE_MIN));
  }

  // Combo
  function updateComboOnClick(){
    const now = Date.now();
    if(lastClickAt && (now - lastClickAt) <= COMBO_WINDOW_MS){
      combo = Math.min(COMBO_MAX, combo + COMBO_ADD);
    }else{
      combo = 1.0;
    }
    lastClickAt = now;
  }
  function rollCrit(){ return Math.random() < CRIT_CHANCE; }

  // Events multipliers
  function isEventActive(name){
    return activeEvent === name && Date.now() < eventEndsAt;
  }
  function clickEventMultiplier(){
    if(isEventActive("vodka")) return 1.5;
    if(isEventActive("raid")) return 2.0;
    return 1.0;
  }
  function cpsEventMultiplier(){
    if(isEventActive("raid")) return 0.5;
    return 1.0;
  }
  function shopDiscountMultiplier(){
    if(isEventActive("market")) return 0.70;
    return 1.0;
  }
  function effectiveCost(base){
    return Math.ceil(base * shopDiscountMultiplier());
  }

  // =========================
  // SAVE local + cloud
  // =========================
  function getSave(){
    return { version: 5, money, cpc, cps, slavPoints, updatedAt: Date.now() };
  }
  function applySave(d){
    money = d?.money ?? 0;
    cpc = d?.cpc ?? 1;
    cps = d?.cps ?? 0;
    slavPoints = d?.slavPoints ?? 0;
  }
  function saveLocal(){
    localStorage.setItem("slavClickerSave", JSON.stringify(getSave()));
  }
  function loadLocal(){
    const s = localStorage.getItem("slavClickerSave");
    if(!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  }

  async function loadCloud(){
    if(!user || !supabase) return null;
    const { data, error } = await supabase
      .from("saves")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    if(error) return null;
    return data?.data ?? null;
  }

  async function saveCloudNow(){
    if(!user || !supabase) return;
    const payload = getSave();
    const { error } = await supabase
      .from("saves")
      .upsert({ user_id: user.id, data: payload }, { onConflict: "user_id" });

    if(error){
      if(cloudStatus) cloudStatus.textContent = "chyba";
      if(cloudHint) cloudHint.textContent = "Cloud save chyba: " + error.message;
    }else{
      if(cloudStatus) cloudStatus.textContent = "online";
      if(cloudHint) cloudHint.textContent = "Uloženo do cloudu (" + new Date().toLocaleTimeString() + ")";
    }
  }

  let cloudSaveTimer = null;
  function scheduleCloudSave(){
    if(!user) return;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(() => saveCloudNow().catch(()=>{}), 800);
  }

  async function resolveBestSave(){
    const local = loadLocal();
    const cloud = await loadCloud();

    if(!cloud) return local;
    if(!local) return cloud;

    return (cloud.updatedAt ?? 0) >= (local.updatedAt ?? 0) ? cloud : local;
  }

  // =========================
  // UI render
  // =========================
  function renderEventLine(){
    const tr = t();

    if(activeEvent && Date.now() >= eventEndsAt){
      activeEvent = null;
      eventEndsAt = 0;
    }

    if(!activeEvent){
      if(eventLine) eventLine.textContent = tr.eventNone;
      return;
    }

    const left = Math.max(0, Math.ceil((eventEndsAt - Date.now()) / 1000));
    let label = tr.eventNone;
    if(activeEvent === "vodka") label = tr.eventVodka;
    if(activeEvent === "raid") label = tr.eventRaid;
    if(activeEvent === "market") label = tr.eventMarket;

    if(eventLine) eventLine.textContent = `${label}: ${left}s`;
  }

  function render(){
    const pm = prestigeMult();
    const cpsMult = pm * cpsEventMultiplier();

    if(moneyEl) moneyEl.textContent = String(Math.floor(money));

    const effClick = cpc * pm * combo * clickEventMultiplier();
    if(cpcEl) cpcEl.textContent = `${Math.floor(effClick)}`;
    if(cpsEl) cpsEl.textContent = (cps * cpsMult).toFixed(1);

    if(comboEl) comboEl.textContent = `x${combo.toFixed(2)}`;
    if(critEl) critEl.textContent = `${Math.round(CRIT_CHANCE * 100)}%`;
    renderEventLine();

    const cCost = effectiveCost(CURSOR_COST);
    const gCost = effectiveCost(GRANNY_COST);
    const kCost = effectiveCost(CLICK_COST);

    if(btnCursor) btnCursor.disabled = money < cCost;
    if(btnGranny) btnGranny.disabled = money < gCost;
    if(btnClick)  btnClick.disabled  = money < kCost;

    if(btnCursor) btnCursor.textContent = `${t().buy} (${cCost})`;
    if(btnGranny) btnGranny.textContent = `${t().buy} (${gCost})`;
    if(btnClick)  btnClick.textContent  = `${t().upgrade} (${kCost})`;

    const gain = calcPrestigeGain(money);
    if(spEl) spEl.textContent = String(slavPoints);
    if(bonusEl) bonusEl.textContent = `+${Math.round((pm - 1) * 100)}%`;
    if(spGainEl) spGainEl.textContent = String(gain);
    if(btnPrestige) btnPrestige.disabled = gain <= 0;

    saveLocal();
    scheduleCloudSave();
  }

  // =========================
  // SETTINGS modal (safe)
  // =========================
  on(btnSettings, "click", () => {
    if(!settingsModal) return;
    settingsModal.classList.add("show");
    settingsModal.setAttribute("aria-hidden","false");
  });

  on(btnCloseSettings, "click", () => {
    if(!settingsModal) return;
    settingsModal.classList.remove("show");
    settingsModal.setAttribute("aria-hidden","true");
  });

  on(settingsModal, "click", (e) => {
    if(e.target === settingsModal){
      settingsModal.classList.remove("show");
      settingsModal.setAttribute("aria-hidden","true");
    }
  });

  on(musicToggle, "change", () => applyMusicEnabled(!!musicToggle?.checked));
  on(langSelect, "change", () => applyLang(langSelect?.value || "cs"));

  // =========================
  // Prestige (FIX)
  // =========================
  on(btnPrestige, "click", () => {
    const gain = calcPrestigeGain(money);
    if(gain <= 0) return;

    if(!confirm(t().prestigeConfirm(gain))) return;

    slavPoints += gain;
    money = 0;
    cpc = 1;
    cps = 0;

    combo = 1.0;
    lastClickAt = 0;

    activeEvent = null;
    eventEndsAt = 0;

    render();
  });

  // =========================
  // Shop (safe)
  // =========================
  on(btnCursor, "click", () => {
    const cost = effectiveCost(CURSOR_COST);
    if(money < cost) return;
    money -= cost;
    cps += 0.1;
    render();
  });

  on(btnGranny, "click", () => {
    const cost = effectiveCost(GRANNY_COST);
    if(money < cost) return;
    money -= cost;
    cps += 1;
    render();
  });

  on(btnClick, "click", () => {
    const cost = effectiveCost(CLICK_COST);
    if(money < cost) return;
    money -= cost;
    cpc += 1;
    render();
  });

  // =========================
  // Click = combo + crit + A/B/C image toggle
  // =========================
  on(gopnikBtn, "click", () => {
    if(clickSnd){
      clickSnd.currentTime = 0;
      clickSnd.play().catch(()=>{});
    }

    updateComboOnClick();

    let gain = cpc * prestigeMult() * combo * clickEventMultiplier();

    if(rollCrit()){
      gain *= CRIT_MULT;
      if(eventLine){
        eventLine.textContent = `💥 CRIT! +${Math.floor(gain)}`;
        setTimeout(() => renderEventLine(), 900);
      }
    }

    money += gain;

    // A -> B -> C -> A
    imgIndex = (imgIndex + 1) % imgs.length;
    if(gopnikImg){
      gopnikImg.src = imgs[imgIndex];
      gopnikImg.style.transform = "scale(1.05)";
      setTimeout(() => { if(gopnikImg) gopnikImg.style.transform = "scale(1)"; }, 80);
    }

    render();
  });

  // combo decay
  setInterval(() => {
    if(!lastClickAt) return;
    if(Date.now() - lastClickAt > COMBO_WINDOW_MS && combo !== 1.0){
      combo = 1.0;
      render();
    }
  }, 250);

  // passive income
  setInterval(() => {
    money += cps * prestigeMult() * cpsEventMultiplier();
    render();
  }, 1000);

  // =========================
  // Events
  // =========================
  function scheduleNextEvent(){
    clearTimeout(nextEventTimer);
    const delay = EVENT_MIN_MS + Math.random() * (EVENT_MAX_MS - EVENT_MIN_MS);
    nextEventTimer = setTimeout(startRandomEvent, delay);
  }

  function startRandomEvent(){
    if(activeEvent && Date.now() < eventEndsAt){
      scheduleNextEvent();
      return;
    }

    const pool = ["vodka", "raid", "market"];
    activeEvent = pool[Math.floor(Math.random() * pool.length)];

    let dur = 15;
    if(activeEvent === "raid") dur = 10;
    if(activeEvent === "market") dur = 20;

    eventEndsAt = Date.now() + dur * 1000;
    render();

    setTimeout(() => {
      if(Date.now() >= eventEndsAt){
        activeEvent = null;
        eventEndsAt = 0;
        render();
      }
      scheduleNextEvent();
    }, (dur + 0.2) * 1000);
  }

  // =========================
  // Loading click (music start)
  // =========================
  on(loading, "click", () => {
    if(musicToggle?.checked) applyMusicEnabled(true);
    if(loading) loading.style.display = "none";
  }, { once:true });

  // =========================
  // AUTO SESSION (z hry.html)
  // =========================
  async function refreshSession(){
    if(!supabase){
      if(cloudStatus) cloudStatus.textContent = "offline";
      if(cloudHint) cloudHint.textContent = "Supabase není načtené (chybí script supabase-js?).";
      user = null;
      return;
    }

    const { data } = await supabase.auth.getSession();
    user = data?.session?.user ?? null;

    if(user){
      if(cloudStatus) cloudStatus.textContent = "online";
      if(cloudHint) cloudHint.textContent = "Přihlášen automaticky: " + (user.email || "OK");
    }else{
      if(cloudStatus) cloudStatus.textContent = "offline";
      if(cloudHint) cloudHint.textContent = "Nepřihlášen (login je v hry.html).";
    }
  }

  async function initBestSaveFromCloud(){
    await refreshSession();
    if(user){
      const best = await resolveBestSave();
      if(best) applySave(best);
      await saveCloudNow().catch(()=>{});
    }
    render();
  }

  if(supabase?.auth?.onAuthStateChange){
    supabase.auth.onAuthStateChange(async (_event, session) => {
      user = session?.user ?? null;
      await initBestSaveFromCloud();
    });
  }

  // =========================
  // INIT: settings + local save
  // =========================
  const savedMusic = localStorage.getItem("musicEnabled");
  if(musicToggle) musicToggle.checked = (savedMusic !== "0");

  if(langSelect) langSelect.value = lang;
  applyLang(lang);

  const local = loadLocal();
  if(local) applySave(local);

  // start
  render();
  scheduleNextEvent();
  await initBestSaveFromCloud();

  // sync při skrytí tab
  document.addEventListener("visibilitychange", () => {
    if(document.visibilityState === "hidden"){
      saveLocal();
      if(user) saveCloudNow().catch(()=>{});
    }
  });
});
