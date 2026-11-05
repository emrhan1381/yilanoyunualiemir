const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
const COLS=25,ROWS=15,CELL=32;
canvas.width=COLS*CELL;canvas.height=ROWS*CELL;
const scoreEl=document.getElementById("score"),bestEl=document.getElementById("best"),levelEl=document.getElementById("level");
const overlay=document.getElementById("overlay"),titleEl=document.getElementById("overlay-title"),textEl=document.getElementById("overlay-text");
const startBtn=document.getElementById("start-btn"),pauseBtn=document.getElementById("pause-btn");
const portraits=Array.from({length:5},(_,i)=>{const im=new Image();im.src=`assets/kafa${i+1}.jpg`;return im;});
let snake=[{x:7,y:7},{x:6,y:7},{x:5,y:7}],direction={x:1,y:0},nextDirection={x:1,y:0};
let food={x:15,y:7,portrait:0},score=0,best=Number(localStorage.getItem("kafaYilaniRekor")||0);
let running=false,paused=false,timer=null;
bestEl.textContent=String(best).padStart(4,"0");
function randomCell(){let p;do{p={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)}}while(snake.some(s=>s.x===p.x&&s.y===p.y));return p}
function spawnFood(){food={...randomCell(),portrait:Math.floor(Math.random()*portraits.length)}}
function updateStats(){scoreEl.textContent=String(score).padStart(4,"0");levelEl.textContent=String(Math.floor(score/5)+1).padStart(2,"0");bestEl.textContent=String(best).padStart(4,"0")}
function schedule(){clearInterval(timer);timer=setInterval(tick,Math.max(65,155-Math.floor(score/5)*9))}
function reset(){snake=[{x:7,y:7},{x:6,y:7},{x:5,y:7}];direction={x:1,y:0};nextDirection={x:1,y:0};score=0;paused=false;running=true;spawnFood();updateStats();overlay.classList.add("hidden");pauseBtn.textContent="Ⅱ DURAKLAT";schedule();draw()}
function endGame(){running=false;clearInterval(timer);titleEl.textContent="OYUN BİTTİ";textEl.textContent=`Skorun: ${score} • Rekor: ${best}`;startBtn.textContent="TEKRAR OYNA";overlay.classList.remove("hidden")}
function tick(){if(!running||paused)return;direction=nextDirection;const head={x:snake[0].x+direction.x,y:snake[0].y+direction.y};if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS){endGame();return}const eating=head.x===food.x&&head.y===food.y;const body=eating?snake:snake.slice(0,-1);if(body.some(s=>s.x===head.x&&s.y===head.y)){endGame();return}snake.unshift(head);if(eating){score++;if(score>best){best=score;localStorage.setItem("kafaYilaniRekor",String(best))}spawnFood();updateStats();schedule()}else snake.pop();draw()}
function draw(){
ctx.fillStyle="#172747";ctx.fillRect(0,0,canvas.width,canvas.height);
for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
ctx.fillStyle=(x+y)%2===0?"#26385d":"#223455";ctx.fillRect(x*CELL+1,y*CELL+1,CELL-2,CELL-2);
ctx.strokeStyle="#172747";ctx.lineWidth=1;ctx.strokeRect(x*CELL+.5,y*CELL+.5,CELL-1,CELL-1)
}
// Yem: fotoğrafı tüm kareye sığdır, belirgin çerçeveyle göster.
const fx=food.x*CELL,fy=food.y*CELL;
ctx.fillStyle="#f4f7ff";ctx.fillRect(fx+1,fy+1,CELL-2,CELL-2);
const portrait=portraits[food.portrait];
if(portrait.complete&&portrait.naturalWidth){
ctx.save();ctx.beginPath();ctx.rect(fx+3,fy+3,CELL-6,CELL-6);ctx.clip();
ctx.drawImage(portrait,fx+3,fy+3,CELL-6,CELL-6);ctx.restore();
}else{
ctx.fillStyle="#ff6b91";ctx.fillRect(fx+3,fy+3,CELL-6,CELL-6);
ctx.fillStyle="#172747";ctx.font="bold 17px monospace";ctx.textAlign="center";ctx.fillText("A",fx+CELL/2,fy+22)
}
ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.strokeRect(fx+1,fy+1,CELL-2,CELL-2);
snake.forEach((part,i)=>{
const px=part.x*CELL+2,py=part.y*CELL+2;
ctx.fillStyle=i===0?"#a5f36b":"#70ce43";ctx.fillRect(px,py,CELL-4,CELL-4);
if(i===0){ctx.fillStyle="#183016";if(direction.x!==0){ctx.fillRect(px+(direction.x===1?CELL-10:6),py+8,3,3);ctx.fillRect(px+(direction.x===1?CELL-10:6),py+CELL-13,3,3)}else{ctx.fillRect(px+8,py+(direction.y===1?CELL-10:6),3,3);ctx.fillRect(px+CELL-13,py+(direction.y===1?CELL-10:6),3,3)}}
})
}
function changeDirection(dir){const map={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}},d=map[dir];if(!d)return;if(d.x===-direction.x&&d.y===-direction.y)return;nextDirection=d}
function togglePause(){if(!running)return;paused=!paused;pauseBtn.textContent=paused?"▶ DEVAM ET":"Ⅱ DURAKLAT";if(paused){titleEl.textContent="DURAKLATILDI";textEl.textContent="Hazır olduğunda devam edebilirsin.";startBtn.textContent="DEVAM ET";overlay.classList.remove("hidden")}else overlay.classList.add("hidden")}
document.addEventListener("keydown",e=>{const keys={ArrowUp:"up",w:"up",ArrowDown:"down",s:"down",ArrowLeft:"left",a:"left",ArrowRight:"right",d:"right"};if(keys[e.key]){e.preventDefault();changeDirection(keys[e.key])}if(e.key===" "){e.preventDefault();togglePause()}});
document.querySelectorAll("[data-dir]").forEach(btn=>btn.addEventListener("pointerdown",e=>{e.preventDefault();changeDirection(btn.dataset.dir)}));
startBtn.addEventListener("click",()=>{if(running&&paused){paused=false;overlay.classList.add("hidden");pauseBtn.textContent="Ⅱ DURAKLAT"}else reset()});
pauseBtn.addEventListener("click",togglePause);document.getElementById("restart-btn").addEventListener("click",reset);
portraits.forEach(im=>{im.onload=()=>draw();im.onerror=()=>draw()});spawnFood();updateStats();draw();
