const seedTickets = [
  { id:"seed-pink", title:"Let's Never Give A Sh*t", date:"27 Aug", location:"Ho Chi Minh City", image:"./ticket-pink.jpg", note:"Một tấm vé màu hồng, được giữ lại như một mảnh ký ức trong bộ sưu tập concert.", tags:["Concert","HCMC","Memory"] },
  { id:"seed-anh-trai", title:"Anh Trai Vượt Ngàn Chông Gai 2026", date:"17 Oct 2026", location:"The Global City", image:"./ticket-anh-trai.jpg", note:"Day 1 & Day 2 tại khu vực Phú Long – Bình Trưng và The Global City.", tags:["E-ticket","2026","The Global City"] },
  { id:"seed-pkl", title:"Giữa Một Vạn Tour · Chapter 5", date:"17 Oct 2026", location:"Nhà Thi Đấu Phú Thọ", image:"./ticket-phung-khanh-linh.jpg", note:"Live experience của Phùng Khánh Linh tại Nhà Thi Đấu Phú Thọ.", tags:["Phùng Khánh Linh","Live","2026"] }
];
const config=window.MAGIC_ARCHIVE_CONFIG||{};
const hasSupabase=Boolean(config.supabaseUrl&&config.supabaseAnonKey&&window.supabase);
const db=hasSupabase?window.supabase.createClient(config.supabaseUrl,config.supabaseAnonKey):null;
let tickets=[],previewUrl="",activeTicket=null;
const $=id=>document.getElementById(id);
const library=$("library"),cardField=$("cardField"),ticketCount=$("ticketCount"),dust=$("dust");
const ticketModal=$("ticketModal"),addModal=$("addModal"),modalImage=$("modalImage"),modalTitle=$("modalTitle"),modalDate=$("modalDate"),modalNote=$("modalNote"),modalTags=$("modalTags");
const ticketForm=$("ticketForm"),imageInput=$("ticketImage"),imagePreview=$("imagePreview"),uploadLabel=$("uploadLabel"),formStatus=$("formStatus"),saveTicket=$("saveTicket"),deleteTicketBtn=$("deleteTicketBtn"),deleteStatus=$("deleteStatus");
function escapeHtml(v=""){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function shortDate(v){if(!v)return"Memory";const d=new Date(v+(v.length===10?"T00:00:00":""));return Number.isNaN(d.getTime())?v:d.toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}
function fullDate(t){return[t.date,t.location].filter(Boolean).join(" · ")}
function seeded(n,salt=0){const x=Math.sin((n+1)*9283.17+salt*71.33)*43758.5453;return x-Math.floor(x)}
function renderTickets(){
  ticketCount.textContent=tickets.length;
  const mobile=matchMedia("(max-width:820px)").matches;
  const cols=mobile?2:5;
  const rows=Math.max(1,Math.ceil(tickets.length/cols));
  const fieldHeight=mobile?Math.max(innerHeight-62,460+rows*155):Math.max(innerHeight-74,420+rows*118);
  library.style.minHeight=`${fieldHeight}px`;
  cardField.innerHTML=tickets.map((t,i)=>{
    const col=i%cols,row=Math.floor(i/cols);
    const lane=(col+.5)/cols*100;
    const x=Math.max(4,Math.min(92,lane+(seeded(i,1)-.5)*(mobile?18:12)));
    const y=Math.max(18,Math.min(94,(210+row*(mobile?150:112)+(seeded(i,2)-.5)*70)/fieldHeight*100));
    const dx=Math.round((seeded(i,3)-.5)*(mobile?70:150));
    const dy=Math.round((seeded(i,4)-.5)*(mobile?85:120));
    const dx2=Math.round((seeded(i,7)-.5)*(mobile?55:110));
    const dy2=Math.round((seeded(i,8)-.5)*(mobile?65:95));
    const drift=(14+seeded(i,5)*14).toFixed(1);
    const scale=(.78+seeded(i,6)*.30).toFixed(2);
    const rot=(-8+seeded(i,9)*16).toFixed(1);
    return `<button class="ticket-card" style="left:${x}%;top:${y}%;--float-delay:-${(i*2.37)%17}s;--rot:${rot}deg;--dx:${dx}px;--dy:${dy}px;--dx2:${dx2}px;--dy2:${dy2}px;--drift:${drift}s;--card-scale:${scale}" data-index="${i}" aria-label="Mở vé ${escapeHtml(t.title)}"><span class="card-aura"></span><span class="card-frame"><img src="${escapeHtml(t.image)}" alt="${escapeHtml(t.title)}" loading="lazy"></span><span class="card-caption"><b>${escapeHtml(shortDate(t.date))}</b><small>${escapeHtml(t.title)}</small></span></button>`
  }).join("");
  cardField.querySelectorAll(".ticket-card").forEach(c=>c.addEventListener("click",()=>openTicket(Number(c.dataset.index))))
}
function localTickets(){try{return JSON.parse(localStorage.getItem("magicArchiveTickets")||"[]")}catch{return[]}}
function saveLocal(list){localStorage.setItem("magicArchiveTickets",JSON.stringify(list))}
async function loadTickets(){if(hasSupabase){const{data,error}=await db.from("tickets").select("*").order("created_at",{ascending:true});if(!error&&data){const remote=data.map(t=>({id:t.id,title:t.title,date:t.event_date||"",location:t.location||"",image:t.image_url,note:t.note||"",tags:t.tags||[],remote:true}));tickets=[...seedTickets,...remote]}else{console.error(error);tickets=[...seedTickets]}}else tickets=[...seedTickets,...localTickets()];renderTickets()}
function openTicket(i){const t=tickets[i];if(!t)return;activeTicket=t;modalImage.src=t.image;modalImage.alt=t.title;modalTitle.textContent=t.title;modalDate.textContent=fullDate(t);modalNote.textContent=t.note||"Một ký ức concert được lưu trong thư viện.";modalTags.innerHTML=(t.tags||[]).map(tag=>`<span>${escapeHtml(tag)}</span>`).join("");deleteStatus.textContent="";deleteTicketBtn.hidden=!t.remote;ticketModal.classList.add("open");ticketModal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open")}
function closeTicket(){ticketModal.classList.remove("open");ticketModal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");activeTicket=null;deleteStatus.textContent=""}
function openAdd(){addModal.classList.add("open");addModal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");formStatus.textContent=hasSupabase?"":"Demo mode: vé mới hiện trên thiết bị này. Kết nối Supabase để mọi người cùng thấy."}
function closeAdd(){addModal.classList.remove("open");addModal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
$("openAddTicket").addEventListener("click",openAdd);document.querySelectorAll("[data-close-ticket]").forEach(e=>e.addEventListener("click",closeTicket));document.querySelectorAll("[data-close-add]").forEach(e=>e.addEventListener("click",closeAdd));document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeTicket();closeAdd()}});
imageInput.addEventListener("change",()=>{const f=imageInput.files?.[0];if(!f)return;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(f);imagePreview.src=previewUrl;imagePreview.hidden=false;uploadLabel.textContent="Đổi ảnh"});
async function fileToDataUrl(file){return await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file)})}
async function createTicket(e){e.preventDefault();const file=imageInput.files?.[0];if(!file){formStatus.textContent="Chọn một ảnh vé trước nhé.";return}if(file.size>8*1024*1024){formStatus.textContent="Ảnh hơi lớn. Vui lòng chọn ảnh dưới 8 MB.";return}saveTicket.disabled=true;saveTicket.textContent="Saving…";formStatus.textContent="";const data={title:$("ticketTitle").value.trim(),event_date:$("ticketDate").value||null,location:$("ticketLocation").value.trim(),note:$("ticketNote").value.trim(),tags:$("ticketTags").value.split(",").map(x=>x.trim()).filter(Boolean)};try{if(hasSupabase){const ext=(file.name.split(".").pop()||"jpg").toLowerCase(),path=`${Date.now()}-${crypto.randomUUID()}.${ext}`;const{error:ue}=await db.storage.from(config.bucket||"ticket-images").upload(path,file,{contentType:file.type,upsert:false});if(ue)throw ue;const{data:pd}=db.storage.from(config.bucket||"ticket-images").getPublicUrl(path);const{error:ie}=await db.from("tickets").insert({...data,image_url:pd.publicUrl});if(ie)throw ie;await loadTickets()}else{const image=await fileToDataUrl(file),list=localTickets();list.push({id:crypto.randomUUID(),title:data.title,date:data.event_date||"",location:data.location,image,note:data.note,tags:data.tags});saveLocal(list);await loadTickets()}ticketForm.reset();imagePreview.hidden=true;uploadLabel.textContent="＋ Chọn ảnh vé";formStatus.textContent="Đã lưu ✦";setTimeout(closeAdd,500)}catch(err){console.error(err);formStatus.textContent=`Không lưu được: ${err.message||"unknown error"}`}finally{saveTicket.disabled=false;saveTicket.textContent="Save Ticket ✦"}}
ticketForm.addEventListener("submit",createTicket);
function storagePathFromPublicUrl(url=""){const marker=`/storage/v1/object/public/${config.bucket||"ticket-images"}/`,idx=url.indexOf(marker);return idx===-1?null:decodeURIComponent(url.slice(idx+marker.length))}
async function deleteActiveTicket(){const t=activeTicket;if(!t||!t.remote)return;if(!confirm(`Xóa vé “${t.title}”? Hành động này không thể hoàn tác.`))return;deleteTicketBtn.disabled=true;deleteTicketBtn.textContent="Deleting…";deleteStatus.textContent="";try{const{error:re}=await db.from("tickets").delete().eq("id",t.id);if(re)throw re;const path=storagePathFromPublicUrl(t.image);if(path){const{error:se}=await db.storage.from(config.bucket||"ticket-images").remove([path]);if(se)console.warn("Ticket row deleted, but image cleanup failed:",se)}closeTicket();await loadTickets()}catch(err){console.error(err);deleteStatus.textContent=`Không xóa được: ${err.message||"unknown error"}`}finally{deleteTicketBtn.disabled=false;deleteTicketBtn.textContent="Delete Ticket"}}
deleteTicketBtn.addEventListener("click",deleteActiveTicket);
if(matchMedia("(pointer:fine)").matches)window.addEventListener("pointermove",e=>{const x=(e.clientX/innerWidth-.5)*2,y=(e.clientY/innerHeight-.5)*2;library.style.setProperty("--mx",x.toFixed(3));library.style.setProperty("--my",y.toFixed(3));document.querySelectorAll(".ticket-card").forEach((c,i)=>{const depth=3+(i%5)*2;c.style.marginLeft=`${x*depth}px`;c.style.marginTop=`${y*depth*.35}px`})},{passive:true});
for(let i=0;i<42;i++){const p=document.createElement("i");p.style.left=`${Math.random()*100}%`;p.style.top=`${Math.random()*110}%`;p.style.animationDuration=`${8+Math.random()*15}s`;p.style.animationDelay=`${-Math.random()*16}s`;p.style.setProperty("--drift",`${-40+Math.random()*80}px`);p.style.opacity=`${.15+Math.random()*.55}`;dust.appendChild(p)}
addEventListener("resize",()=>{clearTimeout(window.__ticketResize);window.__ticketResize=setTimeout(renderTickets,180)},{passive:true});
loadTickets();