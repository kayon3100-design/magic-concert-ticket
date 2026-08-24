const seedTickets = [
  { id: "seed-pink", title: "Let's Never Give A Sh*t", date: "27 Aug", location: "Ho Chi Minh City", image: "./ticket-pink.jpg", note: "Một tấm vé màu hồng, được giữ lại như một mảnh ký ức trong bộ sưu tập concert.", tags: ["Concert", "HCMC", "Memory"] },
  { id: "seed-anh-trai", title: "Anh Trai Vượt Ngàn Chông Gai 2026", date: "17 Oct 2026", location: "The Global City", image: "./ticket-anh-trai.jpg", note: "Day 1 & Day 2 tại khu vực Phú Long – Bình Trưng và The Global City.", tags: ["E-ticket", "2026", "The Global City"] },
  { id: "seed-pkl", title: "Giữa Một Vạn Tour · Chapter 5", date: "17 Oct 2026", location: "Nhà Thi Đấu Phú Thọ", image: "./ticket-phung-khanh-linh.jpg", note: "Live experience của Phùng Khánh Linh tại Nhà Thi Đấu Phú Thọ.", tags: ["Phùng Khánh Linh", "Live", "2026"] }
];

const config = window.MAGIC_ARCHIVE_CONFIG || {};
const hasSupabase = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
const db = hasSupabase ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
let tickets = [];
let previewUrl = "";
let activeTicket = null;

const $ = id => document.getElementById(id);
const library = $("library"), cardField = $("cardField"), ticketCount = $("ticketCount"), dust = $("dust");
const ticketModal = $("ticketModal"), addModal = $("addModal");
const modalImage = $("modalImage"), modalTitle = $("modalTitle"), modalDate = $("modalDate"), modalNote = $("modalNote"), modalTags = $("modalTags");
const ticketForm = $("ticketForm"), imageInput = $("ticketImage"), imagePreview = $("imagePreview"), uploadLabel = $("uploadLabel"), formStatus = $("formStatus"), saveTicket = $("saveTicket");
const deleteTicketBtn = $("deleteTicketBtn"), deleteStatus = $("deleteStatus");

function escapeHtml(value = "") {
  return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function shortDate(value) {
  if (!value) return "Memory";
  const d = new Date(value + (value.length === 10 ? "T00:00:00" : ""));
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
function fullDate(ticket) { return [ticket.date, ticket.location].filter(Boolean).join(" · "); }
function renderTickets() {
  ticketCount.textContent = tickets.length;
  cardField.innerHTML = tickets.map((t, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const positions = [
      `right:${5 + (row%2)*5}%;top:${12 + (row%3)*21}%;`,
      `right:${29 + (row%2)*6}%;bottom:${10 + (row%3)*17}%;`,
      `left:${35 + (row%2)*6}%;top:${43 + (row%2)*12}%;`,
      `left:${5 + (row%3)*8}%;bottom:${8 + (row%2)*20}%;`
    ];
    const dx = [-58, 46, -38, 64][col] + (row % 3) * 9;
    const dy = [34, -42, 52, -30][col] + (row % 2) * 12;
    const drift = [17, 21, 19, 24][col] + (row % 3);
    const scale = [0.94, 1.03, 0.98, 0.91][col];
    return `<button class="ticket-card" style="${positions[col]}--float-delay:-${(i*2.15)%12}s;--rot:${[-6,3,-2,5][col]}deg;--dx:${dx}px;--dy:${dy}px;--drift:${drift}s;--card-scale:${scale}" data-index="${i}" aria-label="Mở vé ${escapeHtml(t.title)}">
      <span class="card-aura"></span><span class="card-frame"><img src="${escapeHtml(t.image)}" alt="${escapeHtml(t.title)}" loading="lazy"></span>
      <span class="card-caption"><b>${escapeHtml(shortDate(t.date))}</b><small>${escapeHtml(t.title)}</small></span></button>`;
  }).join("");
  cardField.querySelectorAll(".ticket-card").forEach(card => card.addEventListener("click", () => openTicket(Number(card.dataset.index))));
}

function localTickets() { try { return JSON.parse(localStorage.getItem("magicArchiveTickets") || "[]"); } catch { return []; } }
function saveLocal(list) { localStorage.setItem("magicArchiveTickets", JSON.stringify(list)); }

async function loadTickets() {
  if (hasSupabase) {
    const { data, error } = await db.from("tickets").select("*").order("created_at", { ascending: true });
    if (!error && data) {
      const remote = data.map(t => ({ id:t.id, title:t.title, date:t.event_date || "", location:t.location || "", image:t.image_url, note:t.note || "", tags:t.tags || [], remote:true }));
      tickets = [...seedTickets, ...remote];
    } else {
      console.error(error); tickets = [...seedTickets];
    }
  } else {
    tickets = [...seedTickets, ...localTickets()];
  }
  renderTickets();
}

function openTicket(index) {
  const t = tickets[index]; if (!t) return;
  activeTicket = t;
  modalImage.src = t.image; modalImage.alt = t.title; modalTitle.textContent = t.title; modalDate.textContent = fullDate(t); modalNote.textContent = t.note || "Một ký ức concert được lưu trong thư viện.";
  modalTags.innerHTML = (t.tags || []).map(tag => `<span>${escapeHtml(tag)}</span>`).join("");
  deleteStatus.textContent = "";
  deleteTicketBtn.hidden = !t.remote;
  ticketModal.classList.add("open"); ticketModal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open");
}
function closeTicket() { ticketModal.classList.remove("open"); ticketModal.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open"); activeTicket = null; deleteStatus.textContent = ""; }
function openAdd() { addModal.classList.add("open"); addModal.setAttribute("aria-hidden", "false"); document.body.classList.add("modal-open"); formStatus.textContent = hasSupabase ? "" : "Demo mode: vé mới hiện trên thiết bị này. Kết nối Supabase để mọi người cùng thấy."; }
function closeAdd() { addModal.classList.remove("open"); addModal.setAttribute("aria-hidden", "true"); document.body.classList.remove("modal-open"); }

$("openAddTicket").addEventListener("click", openAdd);
document.querySelectorAll("[data-close-ticket]").forEach(el => el.addEventListener("click", closeTicket));
document.querySelectorAll("[data-close-add]").forEach(el => el.addEventListener("click", closeAdd));
document.addEventListener("keydown", e => { if (e.key === "Escape") { closeTicket(); closeAdd(); } });

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0]; if (!file) return;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file); imagePreview.src = previewUrl; imagePreview.hidden = false; uploadLabel.textContent = "Đổi ảnh";
});

async function fileToDataUrl(file) {
  return await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });
}

async function createTicket(event) {
  event.preventDefault();
  const file = imageInput.files?.[0];
  if (!file) { formStatus.textContent = "Chọn một ảnh vé trước nhé."; return; }
  if (file.size > 8 * 1024 * 1024) { formStatus.textContent = "Ảnh hơi lớn. Vui lòng chọn ảnh dưới 8 MB."; return; }
  saveTicket.disabled = true; saveTicket.textContent = "Saving…"; formStatus.textContent = "";
  const data = {
    title: $("ticketTitle").value.trim(), event_date: $("ticketDate").value || null, location: $("ticketLocation").value.trim(), note: $("ticketNote").value.trim(), tags: $("ticketTags").value.split(",").map(x => x.trim()).filter(Boolean)
  };
  try {
    if (hasSupabase) {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await db.storage.from(config.bucket || "ticket-images").upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicData } = db.storage.from(config.bucket || "ticket-images").getPublicUrl(path);
      const { error: insertError } = await db.from("tickets").insert({ ...data, image_url: publicData.publicUrl });
      if (insertError) throw insertError;
      await loadTickets();
    } else {
      const image = await fileToDataUrl(file);
      const list = localTickets(); list.push({ id: crypto.randomUUID(), title:data.title, date:data.event_date || "", location:data.location, image, note:data.note, tags:data.tags }); saveLocal(list); await loadTickets();
    }
    ticketForm.reset(); imagePreview.hidden = true; uploadLabel.textContent = "＋ Chọn ảnh vé"; formStatus.textContent = "Đã lưu ✦";
    setTimeout(closeAdd, 500);
  } catch (error) {
    console.error(error); formStatus.textContent = `Không lưu được: ${error.message || "unknown error"}`;
  } finally { saveTicket.disabled = false; saveTicket.textContent = "Save Ticket ✦"; }
}
ticketForm.addEventListener("submit", createTicket);

function storagePathFromPublicUrl(url = "") {
  const marker = `/storage/v1/object/public/${config.bucket || "ticket-images"}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

async function deleteActiveTicket() {
  const t = activeTicket;
  if (!t || !t.remote) return;
  if (!confirm(`Xóa vé “${t.title}”? Hành động này không thể hoàn tác.`)) return;
  deleteTicketBtn.disabled = true;
  deleteTicketBtn.textContent = "Deleting…";
  deleteStatus.textContent = "";
  try {
    const { error: rowError } = await db.from("tickets").delete().eq("id", t.id);
    if (rowError) throw rowError;
    const path = storagePathFromPublicUrl(t.image);
    if (path) {
      const { error: storageError } = await db.storage.from(config.bucket || "ticket-images").remove([path]);
      if (storageError) console.warn("Ticket row deleted, but image cleanup failed:", storageError);
    }
    closeTicket();
    await loadTickets();
  } catch (error) {
    console.error(error);
    deleteStatus.textContent = `Không xóa được: ${error.message || "unknown error"}`;
  } finally {
    deleteTicketBtn.disabled = false;
    deleteTicketBtn.textContent = "Delete Ticket";
  }
}

deleteTicketBtn.addEventListener("click", deleteActiveTicket);


if (window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("pointermove", event => {
    const x = (event.clientX / innerWidth - .5) * 2, y = (event.clientY / innerHeight - .5) * 2;
    library.style.setProperty("--mx", x.toFixed(3)); library.style.setProperty("--my", y.toFixed(3));
    document.querySelectorAll(".ticket-card").forEach((card, i) => { const depth = 7 + (i % 4) * 3; card.style.marginLeft = `${x * depth}px`; card.style.marginTop = `${y * depth * .45}px`; });
  }, { passive:true });
}
for (let i=0;i<42;i++){const p=document.createElement("i");p.style.left=`${Math.random()*100}%`;p.style.top=`${Math.random()*110}%`;p.style.animationDuration=`${8+Math.random()*15}s`;p.style.animationDelay=`${-Math.random()*16}s`;p.style.setProperty("--drift",`${-40+Math.random()*80}px`);p.style.opacity=`${.15+Math.random()*.55}`;dust.appendChild(p);}
loadTickets();
