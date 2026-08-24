const CACHE='magic-ticket-shell-v4';
const SHELL=['./','./index.html','./styles.css?v=43','./app.js?v=43','./config.js','./pwa.css?v=3','./pwa.js?v=4','./admin-search.css?v=1','./admin-search.js?v=1','./magic-flight-v2.js?v=3','./manifest.webmanifest','./magic-ticket-icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(
    fetch(req,{cache:'no-store'})
      .then(res=>{if(res&&res.ok){const copy=res.clone();caches.open(CACHE).then(cache=>cache.put(req,copy))}return res})
      .catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html')))
  );
});