(() => {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = document.createElement('style');
  css.textContent = `
  .mf2-card{position:fixed;z-index:12000;pointer-events:none;transform-style:preserve-3d;perspective:900px;will-change:transform,left,top,width,height;filter:drop-shadow(0 24px 28px rgba(0,0,0,.65)) drop-shadow(0 0 18px rgba(83,255,145,.9))}
  .mf2-card img{display:block;width:100%;height:100%;object-fit:cover;border-radius:16px;border:1px solid rgba(176,255,205,.7);box-shadow:0 0 18px rgba(77,255,143,.5),0 0 55px rgba(37,218,108,.28)}
  .mf2-orbit{position:fixed;z-index:11998;pointer-events:none;width:240px;height:90px;border:2px solid rgba(101,255,158,.7);border-left-color:transparent;border-bottom-color:rgba(78,255,143,.12);border-radius:50%;filter:drop-shadow(0 0 8px #55ff98) blur(.2px);opacity:0}
  .mf2-trail{position:fixed;z-index:11997;pointer-events:none;height:3px;transform-origin:0 50%;border-radius:99px;background:linear-gradient(90deg,rgba(184,255,207,.95),rgba(74,255,139,.7) 28%,rgba(38,208,103,.22) 70%,transparent);box-shadow:0 0 8px #65ffa1,0 0 22px rgba(45,255,126,.7);filter:blur(.25px)}
  .mf2-particle{position:fixed;z-index:11999;pointer-events:none;width:4px;height:4px;border-radius:50%;background:#d8ffe5;box-shadow:0 0 7px #73ffa8,0 0 16px #38e47c;animation:mf2fade .7s ease-out forwards}
  @keyframes mf2fade{to{transform:translate(var(--px),var(--py)) scale(.05);opacity:0}}
  body.mf2-active .ticket-card:not(.magic-source){filter:brightness(.38) saturate(.55)!important;opacity:.48}
  body.mf2-active .app-shell{transition:filter .25s ease;filter:saturate(.88)}
  `;
  document.head.appendChild(css);

  const particles=(x,y,n=5)=>{for(let i=0;i<n;i++){const p=document.createElement('i');p.className='mf2-particle';p.style.left=(x+(Math.random()-.5)*18)+'px';p.style.top=(y+(Math.random()-.5)*18)+'px';p.style.setProperty('--px',((Math.random()-.5)*100)+'px');p.style.setProperty('--py',((Math.random()-.5)*80)+'px');document.body.appendChild(p);setTimeout(()=>p.remove(),800)}};
  const trail=(x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);if(len<4)return;const e=document.createElement('i');e.className='mf2-trail';e.style.left=x1+'px';e.style.top=y1+'px';e.style.width=Math.min(len,130)+'px';e.style.transform=`rotate(${Math.atan2(dy,dx)}rad)`;document.body.appendChild(e);e.animate([{opacity:.9,transform:e.style.transform+' scaleX(1)'},{opacity:0,transform:e.style.transform+' scaleX(.15)'}],{duration:520,easing:'ease-out'}).onfinish=()=>e.remove()};

  window.magicFlightV2 = function(source,t,direction='in'){
    return new Promise(resolve=>{
      if(!source||reduced()){resolve();return}
      document.body.classList.add('mf2-active');
      const sr=source.getBoundingClientRect();
      const ratio=sr.width/Math.max(sr.height,1);
      const tw=Math.min(innerWidth*(innerWidth<700?.72:.48),560), th=Math.min(innerHeight*.58,tw/Math.max(ratio,.65));
      const center={left:(innerWidth-tw)/2,top:(innerHeight-th)/2,width:tw,height:th};
      const start={left:sr.left,top:sr.top,width:sr.width,height:sr.height};
      const a=direction==='in'?start:center,b=direction==='in'?center:start;
      const f=document.createElement('div');f.className='mf2-card';f.innerHTML=`<img src="${String(t.image).replace(/"/g,'&quot;')}" alt="">`;
      Object.assign(f.style,{left:a.left+'px',top:a.top+'px',width:a.width+'px',height:a.height+'px'});document.body.appendChild(f);
      const orbit=document.createElement('i');orbit.className='mf2-orbit';document.body.appendChild(orbit);
      const dx=b.left-a.left,dy=b.top-a.top,side=(a.left+a.width/2<innerWidth/2?1:-1),arc=Math.min(300,Math.max(130,Math.abs(dx)*.35+110));
      const frames=direction==='in'?
      [
        {transform:'translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',offset:0},
        {transform:`translate3d(${dx*.14}px,${dy*.08-arc*.52}px,70px) rotateX(24deg) rotateY(${side*72}deg) rotateZ(${side*-22}deg) scale(1.03)`,offset:.22},
        {transform:`translate3d(${dx*.46+side*arc*.42}px,${dy*.35-arc}px,150px) rotateX(-18deg) rotateY(${side*154}deg) rotateZ(${side*28}deg) scale(1.13)`,offset:.48},
        {transform:`translate3d(${dx*.78-side*arc*.18}px,${dy*.72-arc*.28}px,80px) rotateX(10deg) rotateY(${side*252}deg) rotateZ(${side*-13}deg) scale(1.08)`,offset:.76},
        {transform:`translate3d(${dx}px,${dy}px,0) rotateX(0deg) rotateY(${side*360}deg) rotateZ(0deg) scale(1)`,offset:1}
      ]:
      [
        {transform:'translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',offset:0},
        {transform:`translate3d(${dx*.18-side*arc*.18}px,${dy*.18-arc*.25}px,80px) rotateX(-12deg) rotateY(${side*-105}deg) rotateZ(${side*15}deg) scale(.94)`,offset:.25},
        {transform:`translate3d(${dx*.52+side*arc*.35}px,${dy*.48-arc*.72}px,145px) rotateX(20deg) rotateY(${side*-215}deg) rotateZ(${side*-25}deg) scale(.82)`,offset:.55},
        {transform:`translate3d(${dx*.82}px,${dy*.78-arc*.2}px,50px) rotateX(-8deg) rotateY(${side*-315}deg) rotateZ(${side*12}deg) scale(.72)`,offset:.8},
        {transform:`translate3d(${dx}px,${dy}px,0) rotateX(0deg) rotateY(${side*-360}deg) rotateZ(0deg) scale(1)`,offset:1}
      ];
      const duration=direction==='in'?1450:1250;
      const anim=f.animate(frames,{duration,easing:'cubic-bezier(.18,.72,.18,1)',fill:'forwards'});
      let last=null,lastSpark=0;
      const tick=(now)=>{if(anim.playState==='finished')return;const r=f.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(last)trail(x,y,last.x,last.y);last={x,y};if(now-lastSpark>55){particles(x,y,3);lastSpark=now}orbit.style.left=(x-120)+'px';orbit.style.top=(y-45)+'px';orbit.style.opacity='.72';orbit.style.transform=`rotate(${now/5}deg) scale(${.75+Math.sin(now/130)*.08})`;requestAnimationFrame(tick)};requestAnimationFrame(tick);
      anim.onfinish=()=>{const r=f.getBoundingClientRect();particles(r.left+r.width/2,r.top+r.height/2,24);orbit.animate([{opacity:.7,transform:orbit.style.transform},{opacity:0,transform:orbit.style.transform+' scale(1.7)'}],{duration:320}).onfinish=()=>orbit.remove();f.remove();if(direction==='out')document.body.classList.remove('mf2-active');resolve()};
    });
  };

  // Capture clicks before app.js and replace only the visual flight function at runtime.
  const hook=()=>{
    if(typeof window.flyTicket==='function'&&!window.__mf2hooked){window.__mf2hooked=true;window.flyTicket=window.magicFlightV2;}
  };
  hook();setTimeout(hook,0);setTimeout(hook,250);setTimeout(hook,1000);
})();