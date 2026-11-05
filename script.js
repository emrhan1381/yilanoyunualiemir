(() => {
"use strict";
const canvas=document.getElementById("game");
const ctx=canvas && canvas.getContext("2d");
const COLS=12, ROWS=7, CELL=64;
if(!canvas || !ctx) { console.error("Oyun alanı bulunamadı."); return; }
canvas.width=COLS*CELL; canvas.height=ROWS*CELL;
const $=id=>document.getElementById(id);
const scoreEl=$("score"), bestEl=$("best"), levelEl=$("level");
const overlay=$("overlay"), titleEl=$("overlay-title"), textEl=$("overlay-text");
const startBtn=$("start-btn"), pauseBtn=$("pause-btn"), restartBtn=$("restart-btn");
const portraitSheet=$("portrait-sheet");
if(!startBtn || !overlay || !pauseBtn) { console.error("Oyun arayüzü eksik."); return; }

function readBest(){try{return Number(localStorage.getItem("kafaYilaniRekor")||0)||0;}catch(e){return 0;}}
function saveBest(value){try{localStorage.setItem("kafaYilaniRekor",String(value));}catch(e){}}
let snake=[{x:5,y:3},{x:4,y:3},{x:3,y:3}];
let direction={x:1,y:0}, nextDirection={x:1,y:0};
let food={x:9,y:3,portrait:1}, score=0, best=readBest();
let running=false, paused=false, timer=null;
bestEl.textContent=String(best).padStart(4,"0");

function randomCell(){
 let p;
 do { p={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)}; }
 while(snake.some(s=>s.x===p.x&&s.y===p.y));
 return p;
}
function spawnFood(){food={...randomCell(),portrait:1+Math.floor(Math.random()*4)};}
function updateStats(){
 scoreEl.textContent=String(score).padStart(4,"0");
 levelEl.textContent=String(Math.floor(score/5)+1).padStart(2,"0");
 bestEl.textContent=String(best).padStart(4,"0");
}
function schedule(){
 clearInterval(timer);
 timer=setInterval(tick,Math.max(65,155-Math.floor(score/5)*9));
}
function reset(){
 clearInterval(timer);
 snake=[{x:7,y:7},{x:6,y:7},{x:5,y:7}];
 direction={x:1,y:0}; nextDirection={x:1,y:0};
 score=0; paused=false; running=true;
 spawnFood(); updateStats();
 overlay.classList.add("hidden");
 startBtn.textContent="OYUNA BAŞLA";
 pauseBtn.textContent="Ⅱ DURAKLAT";
 draw(); schedule();
}
function endGame(){
 running=false; clearInterval(timer);
 titleEl.textContent="OYUN BİTTİ";
 textEl.textContent="Skorun: "+score+" • Rekor: "+best;
 startBtn.textContent="TEKRAR OYNA";
 overlay.classList.remove("hidden");
}
function tick(){
 if(!running||paused)return;
 direction=nextDirection;
 const head={x:snake[0].x+direction.x,y:snake[0].y+direction.y};
 if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS){endGame();return;}
 const eating=head.x===food.x&&head.y===food.y;
 const body=eating?snake:snake.slice(0,-1);
 if(body.some(s=>s.x===head.x&&s.y===head.y)){endGame();return;}
 snake.unshift(head);
 if(eating){
  score++;
  if(score>best){best=score;saveBest(best);}
  spawnFood(); updateStats(); schedule();
 } else snake.pop();
 draw();
}
function draw(){
 ctx.fillStyle="#172747";ctx.fillRect(0,0,canvas.width,canvas.height);
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
  ctx.fillStyle=(x+y)%2===0?"#26385d":"#223455";
  ctx.fillRect(x*CELL+1,y*CELL+1,CELL-2,CELL-2);
  ctx.strokeStyle="#172747";ctx.lineWidth=1;
  ctx.strokeRect(x*CELL+.5,y*CELL+.5,CELL-1,CELL-1);
 }
 // Yem: gövdede kullanılmayan Aliemir fotoğraflarından biri.
 const fx=food.x*CELL, fy=food.y*CELL;
 if(portraitSheet && portraitSheet.complete && portraitSheet.naturalWidth>=320){
  ctx.save();
  ctx.beginPath();
  ctx.rect(fx+2,fy+2,CELL-4,CELL-4);
  ctx.clip();
  ctx.drawImage(portraitSheet,food.portrait*64,0,64,64,fx+2,fy+2,CELL-4,CELL-4);
  ctx.restore();
  ctx.strokeStyle="#ffe5a3";ctx.lineWidth=2;
  ctx.strokeRect(fx+1,fy+1,CELL-2,CELL-2);
 }else{
  ctx.fillStyle="#ff6b91";ctx.fillRect(fx+2,fy+2,CELL-4,CELL-4);
  ctx.fillStyle="#172747";ctx.font="bold 22px monospace";ctx.textAlign="center";
  ctx.fillText("A",fx+CELL/2,fy+CELL/2+7);
 }
 // Yılanın başı: dil çıkaran Aliemir fotoğrafı (ilk portre).
 // Gövde: diğer Aliemir fotoğrafları; her parça bir kare.
 snake.forEach((part,i)=>{
  const px=part.x*CELL+2,py=part.y*CELL+2;
  const faceIndex=i===0?0:1+((i-1)%4);
  if(portraitSheet && portraitSheet.complete && portraitSheet.naturalWidth>=320){
   ctx.save();
   ctx.beginPath();
   ctx.rect(px,py,CELL-4,CELL-4);
   ctx.clip();
   ctx.drawImage(portraitSheet,faceIndex*64,0,64,64,px,py,CELL-4,CELL-4);
   ctx.restore();
  }else{
   ctx.fillStyle=i===0?"#a5f36b":"#70ce43";
   ctx.fillRect(px,py,CELL-4,CELL-4);
  }
  ctx.strokeStyle=i===0?"#ffe5a3":"#9bf06e";
  ctx.lineWidth=i===0?2:1;
  ctx.strokeRect(px+.5,py+.5,CELL-5,CELL-5);
 });

}
function changeDirection(dir){
 const map={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
 const d=map[dir]; if(!d)return;
 if(d.x===-direction.x&&d.y===-direction.y)return;
 nextDirection=d;
}
function togglePause(){
 if(!running)return;
 paused=!paused;
 pauseBtn.textContent=paused?"▶ DEVAM ET":"Ⅱ DURAKLAT";
 if(paused){
  titleEl.textContent="DURAKLATILDI";
  textEl.textContent="Hazır olduğunda devam edebilirsin.";
  startBtn.textContent="DEVAM ET";
  overlay.classList.remove("hidden");
 }else overlay.classList.add("hidden");
}
function startOrResume(){
 if(running&&paused){
  paused=false;overlay.classList.add("hidden");pauseBtn.textContent="Ⅱ DURAKLAT";
  return;
 }
 reset();
}
startBtn.addEventListener("click",startOrResume);
pauseBtn.addEventListener("click",togglePause);
restartBtn && restartBtn.addEventListener("click",reset);
document.addEventListener("keydown",e=>{
 const keys={ArrowUp:"up",w:"up",ArrowDown:"down",s:"down",ArrowLeft:"left",a:"left",ArrowRight:"right",d:"right"};
 if(keys[e.key]){e.preventDefault();changeDirection(keys[e.key]);}
 if(e.key===" "){e.preventDefault();togglePause();}
});
document.querySelectorAll("[data-dir]").forEach(btn=>{
 btn.addEventListener("pointerdown",e=>{e.preventDefault();changeDirection(btn.dataset.dir);});
});
if(portraitSheet){portraitSheet.addEventListener("load",draw);}
spawnFood();updateStats();draw();
})();