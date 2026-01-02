document.addEventListener("DOMContentLoaded", async () => {
  const SUPABASE_URL = "https://bmmaijlbpwgzhrxzxphf.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtbWFpamxicHdnemhyeHp4cGhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NjQ5MDcsImV4cCI6MjA4MjQ0MDkwN30.s0YQVnAjMXFu1pSI1NXZ2naSab179N0vQPglsmy3Pgw";
  const supabase = window.supabase?.createClient?.(SUPABASE_URL, SUPABASE_ANON_KEY);

  const on = (el, ev, fn, opts) => { if (el) el.addEventListener(ev, fn, opts); };

  // DOM
  const loading = document.getElementById("loading");
  const bgMusic = document.getElementById("bgMusic");
  const clickSnd = document.getElementById("clickSnd");

  const settingsModal = document.getElementById("settingsModal");
  const btnSettings = document.getElementById("btnSettings");
  const btnCloseSettings = document.getElementById("btnCloseSettings");
  const musicToggle = document.getElementById("musicToggle");
  const langSelect = document.getElementById("langSelect");

  const cloudStatus = document.getElementById("cloudStatus");
  const cloudHint = document.getElementById("cloudHint");

  const moneyEl = document.getElementById("money");
  const cpcEl = document.getElementById("cpc");
  const cpsEl = document.getElementById("cps");
  const comboEl = document.getElementById("combo");
  const critEl = document.getElementById("crit");
  const eventLine = document.getElementById("eventLine");

  const gopnikBtn = document.getElementById("gopnik");
  const gopnikImg = document.getElementById("gopnikImg");

  const btnCursor = document.getElementById("buyCursor");
  const btnGranny = document.getElementById("buyGranny");
  const btnClick = document.getElementById("buyClick");

  const spEl = document.getElementById("sp");
  const bonusEl = document.getElementById("bonus");
  const spGainEl = document.getElementById("spGain");
  const btnPrestige = document.getElementById("btnPrestige");

  // CONSTANTS
  const CURSOR_COST = 15, GRANNY_COST = 100, CLICK_COST = 50;
  const PRESTIGE_MIN = 100000, SP_BONUS_PER_POINT = 0.02;

  const COMBO_WINDOW_MS = 900, COMBO_ADD = 0.06, COMBO_MAX = 3.0;
  const CRIT_CHANCE = 0.10, CRIT_MULT = 3.0;

  const EVENT_MIN_MS = 45000, EVENT_MAX_MS = 90000;

  // i18n minimal
  const i18n = {
    cs: { buy:"Koupit", upgrade:"Vylepšit", eventNone:"—", eventVodka:"Vodka Rush", eventRaid:"Police Raid", eventMarket:"Slav Market",
      prestigeBtn:"Prestige (reset)", prestigeConfirm:(g)=>`Prestige? Získáš ${g} Slav Points.\nResetuje se peníze a upgradey.` },
    en: { buy:"Buy", upgrade:"Upgrade", eventNone:"—", eventVodka:"Vodka Rush", eventRaid:"Police Raid", eventMarket:"Slav Market",
      prestigeBtn:"Prestige (reset)", prestigeConfirm:(g)=>`Prestige? You gain ${g} Slav Points.\nMoney and upgrades reset.` }
  };
  let lang = localStorage.getItem("slavLang") || "cs";
  const t = () => i18n[lang] || i18n.cs;

  // GAME STATE
  let money = 0, cpc = 1, cps = 0, slavPoints = 0;
  let combo = 1.0, lastClickAt = 0;
  let activeEvent = null, eventEndsAt = 0, nextEventTimer = null;

  const imgs = ["gopnik_A.png", "gopnik_B.png", "gopnik_C.png"];
  let imgIndex = 0;

  let user = null;

  // BOOT FIX: aby se save nepřepsal nulou při startu
  let booting = true;

  // SAVE
  function getSave(){
    return { version: 6, money, cpc, cps, slavPoints, imgIndex, lang, updatedAt: Date.now() };
  }
  function applySave(d){
    money = d?.money ?? 0;
    cpc = d?.cpc ?? 1;
    cps = d?.cps ?? 0;
    slavPoints = d?.slavPoints ?? 0;
    imgIndex = d?.imgIndex ?? 0;
    lang = d?.lang ?? lang;
  }
  function saveLocal(){ localStorage.setItem("slavClickerSave", JSON.stringify(getSave())); }
  function loadLocal(){
    const s = localStorage.getItem("slavClickerSave");
    if(!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  }

  async function loadCloud(){
    if(!user || !supabase) return null;
    const { data, error } = await supabase.from("saves").select("data").eq("user_id", user.id).maybeSingle();
    if(error) return null;
    return data?.data ?? null;
  }
  async function saveCloudNow(){
    if(!user || !supabase) return;
    const payload = getSave();
    const { error } = await supabase.from("saves").upsert({ user_id: user.id, data: payload }, { onConflict: "user_id" });
    if(error){
      if(cloudStatus) cloudStatus.textContent = "chyba";
      if(cloudHint) cloudHint.textContent = "Cloud save chyba: " + error.message;
    }else{
      if(cloudStatus) cloudStatus.textContent = "online";
      if(cloudHint) cloudHint.textContent = "Uloženo (" + new Date().toLocaleTimeString() + ")";
    }
  }
  let cloudSaveTimer = null;
  function scheduleCloudSave(){
    if(!user) return;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(() => saveCloudNow().catch(()=>{}), 700);
  }

  async function resolveBestSave(){
    const local = loadLocal();
    const cloud = await loadCloud();
    if(!cloud) return local;
    if(!local) return cloud;
    return (cloud.updatedAt ?? 0) >= (local.updatedAt ?? 0) ? cloud : local;
  }

  // multipliers
  const prestigeMult = () => 1 + slavPoints * SP_BONUS_PER_POINT;
  const calcPrestigeGain = (m) => (m < PRESTIGE_MIN) ? 0 : Math.floor(Math.sqrt(m / PRESTIGE_MIN));

  function updateComboOnClick(){
    const now = Date.now();
    combo = (lastClickAt && now - lastClickAt <= COMBO_WINDOW_MS) ? Math.min(COMBO_MAX, combo + COMBO_ADD) : 1.0;
    lastClickAt = now;
  }
  const rollCrit = () => Math.random() < CRIT_CHANCE;

  function isEventActive(name){ return activeEvent === name && Date.now() < eventEndsAt; }
  function clickEventMultiplier(){ return isEventActive("vodka") ? 1.5 : isEventActive("raid") ? 2.0 : 1.0; }
  function cpsEventMultiplier(){ return isEventActive("raid") ? 0.5 : 1.0; }
  function shopDiscountMultiplier(){ return isEventActive("market") ? 0.70 : 1.0; }
  function effectiveCost(base){ return Math.ceil(base * shopDiscountMultiplier()); }

  function renderEventLine(){
    if(activeEvent && Date.now() >= eventEndsAt){ activeEvent = null; eventEndsAt = 0; }
    if(!eventLine) return;

    if(!activeEvent){ eventLine.textContent = t().eventNone; return; }

    const left = Math.max(0, Math.ceil((eventEndsAt - Date.now())/1000));
    const label = activeEvent === "vodka" ? t().eventVodka : activeEvent === "raid" ? t().eventRaid : t().eventMarket;
    eventLine.textContent = `${label}: ${left}s`;
  }

  function render(){
    const pm = prestigeMult();
    const effClick = cpc * pm * combo * clickEventMultiplier();
    const effCps = cps * pm * cpsEventMultiplier();

    if(moneyEl) moneyEl.textContent = String(Math.floor(money));
    if(cpcEl) cpcEl.textContent = String(Math.floor(effClick));
    if(cpsEl) cpsEl.textContent = effCps.toFixed(1);
    if(comboEl) comboEl.textContent = `x${combo.toFixed(2)}`;
    if(critEl) critEl.textContent = `${Math.round(CRIT_CHANCE*100)}%`;

    renderEventLine();

    const cCost = effectiveCost(CURSOR_COST);
    const gCost = effectiveCost(GRANNY_COST);
    const kCost = effectiveCost(CLICK_COST);

    if(btnCursor){ btnCursor.disabled = money < cCost; btnCursor.textContent = `${t().buy} (${cCost})`; }
    if(btnGranny){ btnGranny.disabled = money < gCost; btnGranny.textContent = `${t().buy} (${gCost})`; }
    if(btnClick){ btnClick.disabled = money < kCost; btnClick.textContent = `${t().upgrade} (${kCost})`; }

    const gain = calcPrestigeGain(money);
    if(spEl) spEl.textContent = String(slavPoints);
    if(bonusEl) bonusEl.textContent = `+${Math.round((pm-1)*100)}%`;
    if(spGainEl) spGainEl.textContent = String(gain);
    if(btnPrestige) btnPrestige.disabled = gain <= 0;
    if(btnPrestige) btnPrestige.textContent = t().prestigeBtn;

    // NEUKLÁDEJ během bootu (to byl bug)
    if(!booting){
      saveLocal();
      scheduleCloudSave();
    }
  }

  // SETTINGS modal
  on(btnSettings, "click", () => { if(settingsModal){ settingsModal.classList.add("show"); settingsModal.setAttribute("aria-hidden","false"); }});
  on(btnCloseSettings, "click", () => { if(settingsModal){ settingsModal.classList.remove("show"); settingsModal.setAttribute("aria-hidden","true"); }});
  on(settingsModal, "click", (e) => { if(e.target === settingsModal){ settingsModal.classList.remove("show"); settingsModal.setAttribute("aria-hidden","true"); }});

  on(musicToggle, "change", () => {
    const enabled = !!musicToggle?.checked;
    localStorage.setItem("musicEnabled", enabled ? "1" : "0");
    if(!bgMusic) return;
    if(enabled){ bgMusic.muted=false; bgMusic.volume=0.35; bgMusic.play().catch(()=>{}); }
    else { bgMusic.pause(); bgMusic.currentTime=0; }
  });
  on(langSelect, "change", () => {
    lang = langSelect?.value || "cs";
    localStorage.setItem("slavLang", lang);
    render();
  });

  // Prestige
  on(btnPrestige, "click", () => {
    const gain = calcPrestigeGain(money);
    if(gain <= 0) return;
    if(!confirm(t().prestigeConfirm(gain))) return;

    slavPoints += gain;
    money = 0; cpc = 1; cps = 0;
    combo = 1.0; lastClickAt = 0;
    activeEvent = null; eventEndsAt = 0;
    render();
  });

  // Shop
  on(btnCursor, "click", () => { const cost = effectiveCost(CURSOR_COST); if(money < cost) return; money -= cost; cps += 0.1; render(); });
  on(btnGranny, "click", () => { const cost = effectiveCost(GRANNY_COST); if(money < cost) return; money -= cost; cps += 1; render(); });
  on(btnClick, "click", () => { const cost = effectiveCost(CLICK_COST); if(money < cost) return; money -= cost; cpc += 1; render(); });

  // Click
  on(gopnikBtn, "click", () => {
    if(clickSnd){ clickSnd.currentTime=0; clickSnd.play().catch(()=>{}); }

    updateComboOnClick();

    let gain = cpc * prestigeMult() * combo * clickEventMultiplier();
    if(rollCrit()){
      gain *= CRIT_MULT;
      if(eventLine){
        eventLine.textContent = `💥 CRIT! +${Math.floor(gain)}`;
        setTimeout(renderEventLine, 900);
      }
    }
    money += gain;

    imgIndex = (imgIndex + 1) % imgs.length;
    if(gopnikImg){
      gopnikImg.src = imgs[imgIndex];
      gopnikImg.classList.remove("pop");
      void gopnikImg.offsetWidth;
      gopnikImg.classList.add("pop");
    }

    render();
  });

  setInterval(() => {
    if(!lastClickAt) return;
    if(Date.now() - lastClickAt > COMBO_WINDOW_MS && combo !== 1.0){ combo = 1.0; render(); }
  }, 250);

  setInterval(() => {
    money += cps * prestigeMult() * cpsEventMultiplier();
    render();
  }, 1000);

  // Events
  function scheduleNextEvent(){
    clearTimeout(nextEventTimer);
    const delay = EVENT_MIN_MS + Math.random() * (EVENT_MAX_MS - EVENT_MIN_MS);
    nextEventTimer = setTimeout(startRandomEvent, delay);
  }
  function startRandomEvent(){
    if(activeEvent && Date.now() < eventEndsAt){ scheduleNextEvent(); return; }
    const pool = ["vodka","raid","market"];
    activeEvent = pool[Math.floor(Math.random()*pool.length)];
    let dur = activeEvent === "raid" ? 10 : activeEvent === "market" ? 20 : 15;
    eventEndsAt = Date.now() + dur*1000;
    render();
    setTimeout(() => { if(Date.now() >= eventEndsAt){ activeEvent=null; eventEndsAt=0; render(); } scheduleNextEvent(); }, (dur+0.2)*1000);
  }

  // LOADING (start music)
  on(loading, "click", () => {
    if(musicToggle?.checked && bgMusic){ bgMusic.muted=false; bgMusic.volume=0.35; bgMusic.play().catch(()=>{}); }
    if(loading) loading.style.display = "none";
  }, { once:true });

  // SESSION
  async function refreshSession(){
    if(!supabase){ user=null; return; }
    const { data } = await supabase.auth.getSession();
    user = data?.session?.user ?? null;

    if(cloudStatus) cloudStatus.textContent = user ? "online" : "offline";
    if(cloudHint) cloudHint.textContent = user ? ("Přihlášen: " + (user.user_metadata?.username || user.email || "OK")) : "Nepřihlášen.";
  }

  async function initBestSave(){
    await refreshSession();

    // 1) local nejdřív
    const local = loadLocal();
    if(local) applySave(local);

    // 2) teprve potom cloud
    if(user){
      const best = await resolveBestSave();
      if(best) applySave(best);
      await saveCloudNow().catch(()=>{});
    }

    // 3) nastav UI hodnoty (langSelect)
    if(langSelect) langSelect.value = lang;

    // 4) první render bez ukládání
    render();

    // 5) teď povol ukládání
    booting = false;
    saveLocal();
    if(user) saveCloudNow().catch(()=>{});
  }

  supabase?.auth?.onAuthStateChange?.(async () => {
    await initBestSave();
  });

  // INIT
  const savedMusic = localStorage.getItem("musicEnabled");
  if(musicToggle) musicToggle.checked = (savedMusic !== "0");
  render();
  scheduleNextEvent();
  await initBestSave();

  document.addEventListener("visibilitychange", () => {
    if(document.visibilityState === "hidden"){
      saveLocal();
      if(user) saveCloudNow().catch(()=>{});
    }
  });
});
