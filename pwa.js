(()=>{
  const isAndroid=/Android/i.test(navigator.userAgent);
  const isStandalone=matchMedia('(display-mode: standalone)').matches;
  const showSyncState=message=>{
    let el=document.querySelector('.pwa-sync-state');
    if(!el){el=document.createElement('div');el.className='pwa-sync-state';document.body.appendChild(el)}
    el.textContent=message;el.classList.add('show');clearTimeout(window.__pwaSyncToast);window.__pwaSyncToast=setTimeout(()=>el.classList.remove('show'),1300)
  };
  const refresh=async()=>{
    try{if(typeof loadTickets==='function'){await loadTickets();showSyncState('Synced ✦')}}catch(err){console.warn('PWA sync failed',err)}
  };
  if((isAndroid||isStandalone)&&'serviceWorker'in navigator){
    addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(err=>console.warn('SW registration failed',err)));
  }
  if(!isStandalone)return;
  document.documentElement.classList.add('pwa-standalone');
  addEventListener('DOMContentLoaded',()=>{
    const dock=document.createElement('nav');
    dock.className='pwa-dock';dock.setAttribute('aria-label','Magic Ticket app navigation');
    dock.innerHTML='<button type="button" data-action="home">Archive</button><button type="button" data-action="add" aria-label="Add ticket">＋</button><button type="button" data-action="sync">Sync</button>';
    dock.addEventListener('click',e=>{
      const action=e.target.closest('button')?.dataset.action;if(!action)return;
      if(action==='home')scrollTo({top:0,behavior:'smooth'});
      if(action==='add')document.getElementById('openAddTicket')?.click();
      if(action==='sync')refresh();
    });
    document.body.appendChild(dock);
  });
  addEventListener('focus',refresh);
  addEventListener('online',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
  addEventListener('load',()=>{
    try{
      if(typeof db!=='undefined'&&db&&typeof hasSupabase!=='undefined'&&hasSupabase){
        db.channel('magic-ticket-pwa-sync').on('postgres_changes',{event:'*',schema:'public',table:'tickets'},refresh).subscribe();
      }
    }catch(err){console.warn('Realtime sync unavailable',err)}
  });
})();
