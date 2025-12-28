const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const center = canvas.width/2;

let items = ["Vlož název","Vlož název","Vlož název","Vlož název","Vlož název","Vlož název"];
let colors = items.map(()=>randomColor());
let rotation=0, spinning=false, loggedIn=false;

const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const adminBadge = document.getElementById("adminBadge");
const consoleDiv = document.getElementById("console");

let snowFlakes = [];

/* Nastavení videa */
document.getElementById("menuVideo").src = "wf.mp4";

/* Random barvy */
function randomColor(){ return `hsl(${Math.random()*360},50%,50%)`; }

/* Konzole */
function log(msg,type=""){
    if(!loggedIn) return;
    const span = document.createElement("div");
    span.textContent = msg;
    if(type) span.className = type;
    consoleDiv.appendChild(span);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

/* Kreslení kola */
function drawWheel(showAll=true){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const displayItems = showAll ? items : items.filter(i=>i!=="Vlož název");
    const displayColors = showAll ? colors : colors.filter((c,i)=>items[i]!=="Vlož název");
    if(displayItems.length===0) return;
    const slice = 2*Math.PI/displayItems.length;
    displayItems.forEach((item,i)=>{
        ctx.beginPath();
        ctx.moveTo(center,center);
        ctx.arc(center,center,center, rotation+i*slice, rotation+(i+1)*slice);
        ctx.fillStyle = displayColors[i];
        ctx.fill();
        ctx.save();
        ctx.translate(center,center);
        ctx.rotate(rotation+i*slice+slice/2);
        ctx.textAlign="right";
        ctx.fillStyle="white";
        ctx.font="bold 18px sans-serif";
        ctx.fillText(item,center-10,5);
        ctx.restore();
    });
}
drawWheel();

/* Přidat / Smazat */
function addItem(){
    const input = document.getElementById("nameInput");
    const value = input.value.trim();
    if(!value) return;
    const index = items.indexOf("Vlož název");
    if(index!==-1){ items[index]=value; colors[index]=randomColor(); }
    else{ items.push(value); colors.push(randomColor()); }
    input.value="";
    drawWheel(true);
    log("Přidáno: "+value,"console-add");
}
function removeItem(){
    for(let i=items.length-1;i>=0;i--){
        if(items[i]!=="Vlož název"){ 
            log("Odstraněno: "+items[i],"console-remove");
            items.splice(i,1); colors.splice(i,1);
            drawWheel(true);
            return;
        }
    }
    alert("Není co mazat");
}

/* Spin */
function spin(){
    if(spinning) return;
    const realItems = items.filter(i=>i!=="Vlož název");
    if(realItems.length<1){ alert("Přidejte min. 2 názvy"); return; }
    spinning = true;
    log("Spuštěno otáčení","console-spin");
    let targetRotation = Math.random()*Math.PI*4+Math.PI*4;
    let frames = 150, currentFrame = 0, startRotation = rotation;
    function animate(){
        currentFrame++;
        let t = currentFrame/frames;
        let eased = 1-Math.pow(1-t,3);
        rotation = startRotation+targetRotation*eased;
        drawWheel(false);
        if(currentFrame<frames) requestAnimationFrame(animate);
        else finish(realItems);
    }
    animate();
}
function finish(realItems){
    spinning=false;
    const winner = realItems[Math.floor(Math.random()*realItems.length)];
    document.getElementById("winnerName").textContent=winner;
    document.getElementById("winnerBox").style.display="flex";
    log("Vítěz: "+winner,"console-winner");
}
function closeWinner(){ document.getElementById("winnerBox").style.display="none"; }

/* Login */
function showLogin(){ loginModal.style.display="flex"; }
function closeLogin(){ loginModal.style.display="none"; }
function login(){
    const user=document.getElementById("loginUser").value;
    const pass=document.getElementById("loginPass").value;
    if(user==="lukamer" && pass==="lukas89"){
        loggedIn=true;
        saveBtn.style.display="inline-block";
        loadBtn.style.display="inline-block";
        consoleDiv.style.display="block";
        adminBadge.style.display="block";
        loginModal.style.display="none";
        loginBtn.style.display="none";
        log("Login úspěšný");
    } else alert("Špatné jméno nebo heslo");
}

/* Save / Load */
function saveItems(){
    localStorage.setItem("koloItems",JSON.stringify(items));
    localStorage.setItem("koloColors",JSON.stringify(colors));
    log("Uloženo ✅");
}
function loadItems(){
    const i=localStorage.getItem("koloItems");
    const c=localStorage.getItem("koloColors");
    if(i && c){
        items=JSON.parse(i);
        colors=JSON.parse(c);
        drawWheel(true);
        log("Načteno ✅");
    }
}

/* Snowflakes jen při hře */
function createSnowflakes() {
    snowFlakes = [];
    const flakesCount = 200; 
    const wrapper = document.getElementById("wrapper");
    for (let i = 0; i < flakesCount; i++) {
        const f = document.createElement("div");
        f.className = "snowflake";
        f.textContent = "❄";
        const size = 8 + Math.random() * 20;
        f.style.fontSize = size + "px";
        f.style.opacity = (0.3 + Math.random() * 0.7).toString();
        wrapper.appendChild(f);
        snowFlakes.push({
            el: f,
            x: Math.random() * window.innerWidth,
            y: Math.random() * -window.innerHeight,
            speed: 1 + Math.random() * 3,
            drift: -0.5 + Math.random(),
            size: size
        });
    }
}
function snowLoop() {
    snowFlakes.forEach(f => {
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > window.innerHeight) { f.y = -f.size; f.x = Math.random() * window.innerWidth; }
        if (f.x > window.innerWidth) f.x = 0;
        if (f.x < 0) f.x = window.innerWidth;
        f.el.style.transform = `translate(${f.x}px,${f.y}px)`;
    });
    requestAnimationFrame(snowLoop);
}

/* Menu tlačítka */
function startWheelGame() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("wrapper").style.display = "block";
    createSnowflakes();
    snowLoop();
}

function backToMenu(){
    document.getElementById("wrapper").style.display = "none";
    document.getElementById("mainMenu").style.display = "flex";
}
function showGuide() { alert("Zde budou návody!"); }
function showArchive() { alert("Zde bude archiv!"); }
function showGames() { alert("Zde budou hry!"); }
function showAction() { alert("Zde bude akce!"); }

// ===== Automatické pomalé otáčení kola =====

// ===== Automatické pomalé otáčení kola =====
let autoRotationSpeed = 0.002; // rychlost otáčení

function autoRotateWheel() {
    rotation += autoRotationSpeed;
    drawWheel(true); // vykreslí kolo s aktuální rotací
    requestAnimationFrame(autoRotateWheel);
}

// Spustit automatické otáčení při načtení hry
autoRotateWheel();

function addItem(){
    const input = document.getElementById("nameInput");
    const value = input.value.trim();
    if(!value) return;

    const index = items.indexOf("Vlož název");
    if(index !== -1){
        items[index] = value;
        colors[index] = randomColor();
    } else {
        items.push(value);
        colors.push(randomColor());
    }

    input.value = "";
    drawWheel(true);
    log("Přidáno: "+value,"console-add");

    // Aktivovat spin tlačítko jen pokud je min. 2 hráči
    const realPlayers = items.filter(i => i !== "Vlož název").length;
    document.querySelector(".spin").disabled = realPlayers < 2;

function showArchive() {
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("archive").style.display = "block";
    document.getElementById("archiveContent").innerHTML = "";
}

function backFromArchive() {
    document.getElementById("archive").style.display = "none";
    document.getElementById("mainMenu").style.display = "flex";
}

// Zobrazení fotek podle kategorie
function showCategory(category) {
    const contentDiv = document.getElementById("archiveContent");
    contentDiv.innerHTML = ""; // vyčistit předchozí obsah

    let images = [];
    if(category === "Hry") {
        images = ["hry1.jpg","hry2.jpg","hry3.jpg"];
    } else if(category === "Airsoft") {
        images = ["airsoft1.jpg","airsoft2.jpg","airsoft3.jpg"];
    }

    images.forEach(src => {
        const img = document.createElement("img");
        img.src = src;
        contentDiv.appendChild(img);
    });
}

}
