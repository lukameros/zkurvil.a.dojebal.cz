document.addEventListener("DOMContentLoaded", async () => {
  // =========================
  // SUPABASE INIT
  // =========================
  const SUPABASE_URL = 'https://bmmaijlbpwgzhrxzxphf.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbWFpamxicHdnemhyeHp4cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjQ5MDcsImV4cCI6MjA4MjQ0MDkwN30.s0YQVnAjMXFu1pSI1NXZ2naSab179N0vQPglsmy3Pgw';

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // =========================
  // DOM refs
  // =========================
  const loading   = document.getElementById("loading");
  const bgMusic   = document.getElementById("bgMusic");
  const clickSnd  = document.getElementById("clickSnd");

  const settingsModal     = document.getElementById("settingsModal");
  const btnSettings       = document.getElementById("btnSettings");
  const btnCloseSettings  = document.getElementById("btnCloseSettings");
  const musicToggle       = document.getElementById("musicToggle");
  const langSelect        = document.getElementById("langSelect");

  // auth ui
  const authStatus = document.getElementById("authStatus");
  const authHint   = document.getElementById("authHint");
  const authEmail  = document.getElementById("authEmail");
  const authPass   = document.getElementById("authPass");
  const btnSignUp  = document.getElementById("btnSignUp");
  const btnSignIn  = document.getElementById("btnSignIn");
  const btnSignOut = document.getElementById("btnSignOut");
  const btnSync    = document.getElementById("btnSync");

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

  const spEl        = document.getElementById("sp");
  const bonusEl     = document.getElementById("bonus");
  const spGainEl    = document.getElementById("spGain");
  const btnPrestige = document.getElementById("btnPrestige");

  // =========================
  // GAME CONSTANTS
  // =========================
  const CURSOR_COST  = 15;
  const GRANNY_COST  = 100;
  const CLICK_COST   = 50;

  const PRESTIGE_MIN = 100000;
  const SP_BONUS_PER_POINT = 0.02;

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

  // =========================
  // i18n (min)
  // =========================
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
      prestigeConfirm: (gain)=>`Prestige? You gain ${gain} Slav Points.\nMoney and upgrades reset.`
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

    if(el("t_startHint")) el("t_startHint").textContent = tr.startHint;
    if(el("t_prestigeHint")) el("t_prestigeHint").textContent = tr.prestigeHint;
    if(btnPrestige) btnPrestige.textContent = tr.prestigeBtn;

    if(el("t_comboLabel")) el("t_comboLabel").textContent = tr.combo;
    if(el("t_critLabel")) el("t_critLabel").textContent = tr.crit;

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
  // Modal handlers
  // =========================
  btnSettings?.addEventListener("click", () => {
    settingsModal.classList.add("show");
    settingsModal.setAttribute("aria-hidden","false");
    if(musicToggle?.checked) applyMusicEnabled(true);
  });

  btnCloseSettings?.addEventListener("click", () => {
    settingsModal.classList.remove("show");
    settingsModal.setAttribute("aria-hidden","true");
  });

  settingsModal?.addEventListener("click", (e) => {
    if(e.target === settingsModal){
      settingsModal.classList.remove("show");
      settingsModal.setAttribute("aria-hidden","true");
    }
  });

  musicToggle?.addEventListener("change", () => applyMusicEnabled(musicToggle.checked));
  langSelect?.addEventListener("change", () => applyLang(langSelect.value));

  // =========================
  // GAME STATE
  // =========================
  let money = 0, cpc = 1, cps = 0;
  let slavPoints = 0;

  // combo
  let combo = 1.0;
  let lastClickAt = 0;

  // events
  let activeEvent = null; // vodka|raid|market|null
  let eventEndsAt = 0;
  let nextEventTimer = null;

  // supabase auth
  let user = null;

  // =========================
  // Multipliers + event effects
  // =========================
  function prestigeMult(){ return 1 + slavPoints * SP_BONUS_PER_POINT; }
  function calcPrestigeGain(currentMoney){
    if(currentMoney < PRESTIGE_MIN) return 0;
    return Math.floor(Math.sqrt(currentMoney / PRESTIGE_MIN));
  }

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
  // SAVE (local + cloud)
  // =========================
  function getSave(){
    return {
      version: 3,
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
  function saveLocal(){
    localStorage.setItem("slavClickerSave", JSON.stringify(getSave()));
  }
  function loadLocal(){
    const s = localStorage.getItem("slavClickerSave");
    if(!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  }

  // debounce cloud save
  let cloudSaveTimer = null;
  function scheduleCloudSave(){
    if(!user) return;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(() => saveCloudNow().catch(()=>{}), 800);
  }

  async function saveCloudNow(){
    if(!user) return;
    const payload = getSave();

    const { error } = await supabase
      .from("saves")
      .upsert({ user_id: user.id, data: payload }, { onConflict: "user_id" });

    if(error){
      authHint.textContent = "Cloud save chyba: " + error.message;
    }else{
      authHint.textContent = "Cloud save OK (" + new Date().toLocaleTimeString() + ")";
    }
  }

  async function loadCloud(){
    if(!user) return null;

    const { data, error } = await supabase
      .from("saves")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    if(error) return null;
    return data?.data ?? null;
  }

  async function resolveBestSave(){
    const local = loadLocal();
    const cloud = await loadCloud();

    // žádný cloud → použij local
    if(!cloud) return local;

    // žádný local → použij cloud
    if(!local) return cloud;

    // vyber novější
    if((cloud.updatedAt ?? 0) >= (local.updatedAt ?? 0)) return cloud;
    return local;
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
    const pm = prestigeMult();
    const cpsMult = pm * cpsEventMultiplier();

    moneyEl.textContent = Math.floor(money);

    const effClick = cpc * pm * combo * clickEventMultiplier();
    cpcEl.textContent = `${cpc} (≈ ${Math.floor(effClick)})`;

    cpsEl.textContent = (cps * cpsMult).toFixed(1);

    comboEl.textContent = `x${combo.toFixed(2)}`;
    critEl.textContent = `${Math.round(CRIT_CHANCE*100)}%`;
    renderEventLine();

    const cCost = effectiveCost(CURSOR_COST);
    const gCost = effectiveCost(GRANNY_COST);
    const kCost = effectiveCost(CLICK_COST);

    btnCursor.disabled = money < cCost;
    btnGranny.disabled = money < gCost;
    btnClick.disabled  = money < kCost;

    btnCursor.textContent = `${t().buy} (${cCost})`;
    btnGranny.textContent = `${t().buy} (${gCost})`;
    btnClick.textContent  = `${t().upgrade} (${kCost})`;

    const gain = calcPrestigeGain(money);
    spEl.textContent = String(slavPoints);
    bonusEl.textContent = `+${Math.round((pm - 1)*100)}%`;
    spGainEl.textContent = String(gain);
    btnPrestige.disabled = gain <= 0;

    saveLocal();
    scheduleCloudSave();
  }

  // =========================
  // Prestige
  // =========================
  function doPrestige(){
    const gain = calcPrestigeGain(money);
    if(gain <= 0) return;

    const ok = confirm(t().prestigeConfirm(gain));
    if(!ok) return;

    slavPoints += gain;

    money = 0;
    cpc = 1;
    cps = 0;

    combo = 1.0;
    lastClickAt = 0;

    activeEvent = null;
    eventEndsAt = 0;

    render();
  }
  btnPrestige.addEventListener("click", doPrestige);

  // =========================
  // Shop
  // =========================
  btnCursor.addEventListener("click", () => {
    const cost = effectiveCost(CURSOR_COST);
    if(money < cost) return;
    money -= cost;
    cps += 0.1;
    render();
  });

  btnGranny.addEventListener("click", () => {
    const cost = effectiveCost(GRANNY_COST);
    if(money < cost) return;
    money -= cost;
    cps += 1;
    render();
  });

  btnClick.addEventListener("click", () => {
    const cost = effectiveCost(CLICK_COST);
    if(money < cost) return;
    money -= cost;
    cpc += 1;
    render();
  });

  // =========================
  // Combo + crit click
  // =========================
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

  gopnikBtn.addEventListener("click", () => {
    if(clickSnd){
      clickSnd.currentTime = 0;
      clickSnd.play().catch(()=>{});
    }

    updateComboOnClick();

    let gain = cpc * prestigeMult() * combo * clickEventMultiplier();

    if(rollCrit()){
      gain *= CRIT_MULT;
      const old = eventLine.textContent;
      eventLine.textContent = `💥 CRIT! +${Math.floor(gain)}`;
      setTimeout(() => renderEventLine(), 900);
    }

    money += gain;

    imgIndex = (imgIndex + 1) % imgs.length;
    gopnikImg.src = imgs[imgIndex];
    gopnikImg.style.transform = "scale(1.05)";
    setTimeout(() => gopnikImg.style.transform = "scale(1)", 80);

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

  // passive
  setInterval(() => {
    const gain = cps * prestigeMult() * cpsEventMultiplier();
    money += gain;
    render();
  }, 1000);

  // =========================
  // Events scheduler
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
  // LOADING click (music)
  // =========================
  loading.addEventListener("click", () => {
    if(musicToggle?.checked) applyMusicEnabled(true);
    loading.style.display = "none";
  }, { once:true });

  // =========================
  // AUTH (Supabase)
  // =========================
  function setAuthUI(loggedIn, emailText){
    if(loggedIn){
      authStatus.textContent = `Přihlášen: ${emailText || "OK"}`;
      btnSignOut.disabled = false;
      btnSync.disabled = false;
    }else{
      authStatus.textContent = "Nepřihlášen";
      btnSignOut.disabled = true;
      btnSync.disabled = true;
    }
  }

  async function refreshSession(){
    const { data } = await supabase.auth.getSession();
    user = data?.session?.user ?? null;
    setAuthUI(!!user, user?.email);
  }

  btnSignUp.addEventListener("click", async () => {
    authHint.textContent = "Registruju...";
    const email = authEmail.value.trim();
    const password = authPass.value.trim();
    if(!email || !password){ authHint.textContent = "Zadej email a heslo."; return; }

    const { error } = await supabase.auth.signUp({ email, password });
    if(error){
      authHint.textContent = "SignUp chyba: " + error.message;
    }else{
      authHint.textContent = "OK. Zkontroluj email (ověření), pak se přihlas.";
    }
    await refreshSession();
  });

  btnSignIn.addEventListener("click", async () => {
    authHint.textContent = "Přihlašuji...";
    const email = authEmail.value.trim();
    const password = authPass.value.trim();
    if(!email || !password){ authHint.textContent = "Zadej email a heslo."; return; }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if(error){
      authHint.textContent = "SignIn chyba: " + error.message;
    }else{
      authHint.textContent = "Přihlášen. Načítám cloud...";
    }
    await refreshSession();

    // po loginu načti nejlepší save a aplikuj
    if(user){
      const best = await resolveBestSave();
      if(best){
        applySave(best);
        render();
        authHint.textContent = "Načteno (nejnovější save).";
      }
      // hned ulož aktuální (sjednocení)
      await saveCloudNow().catch(()=>{});
    }
  });

  btnSignOut.addEventListener("click", async () => {
    await supabase.auth.signOut();
    user = null;
    setAuthUI(false);
    authHint.textContent = "Odhlášeno.";
  });

  btnSync.addEventListener("click", async () => {
    if(!user) return;
    authHint.textContent = "Sync...";
    await saveCloudNow();
  });

  // auth state change
  supabase.auth.onAuthStateChange(async (_event, session) => {
    user = session?.user ?? null;
    setAuthUI(!!user, user?.email);

    if(user){
      const best = await resolveBestSave();
      if(best){
        applySave(best);
        render();
      }
    }
  });

  // =========================
  // INIT settings + save load
  // =========================
  const savedMusic = localStorage.getItem("musicEnabled");
  musicToggle.checked = (savedMusic !== "0");
  if(!musicToggle.checked){
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  if(langSelect) langSelect.value = lang;
  applyLang(lang);

  // load best (zatím local), pak když je session tak cloud merge
  const local = loadLocal();
  if(local) applySave(local);

  await refreshSession();
  if(user){
    const best = await resolveBestSave();
    if(best) applySave(best);
  }

  render();
  scheduleNextEvent();
});
