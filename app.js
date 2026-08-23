const tickets = [
  {
    title: "Let's Never Give A Sh*t",
    date: "27 Aug · Ho Chi Minh City",
    image: "./ticket-pink.jpg",
    note: "Một tấm vé màu hồng, được giữ lại như một mảnh ký ức trong bộ sưu tập concert.",
    tags: ["Concert", "HCMC", "Memory"]
  },
  {
    title: "Anh Trai Vượt Ngàn Chông Gai 2026",
    date: "17 Oct 2026 · 19:00",
    image: "./ticket-anh-trai.jpg",
    note: "Day 1 & Day 2 tại khu vực Phú Long – Bình Trưng và The Global City.",
    tags: ["E-ticket", "2026", "The Global City"]
  },
  {
    title: "Giữa Một Vạn Tour · Chapter 5",
    date: "17 Oct 2026 · 19:00",
    image: "./ticket-phung-khanh-linh.jpg",
    note: "Live experience của Phùng Khánh Linh tại Nhà Thi Đấu Phú Thọ.",
    tags: ["Phùng Khánh Linh", "Live", "2026"]
  }
];

const library = document.getElementById("library");
const modal = document.getElementById("ticketModal");
const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDate = document.getElementById("modalDate");
const modalNote = document.getElementById("modalNote");
const modalTags = document.getElementById("modalTags");
const ticketCount = document.getElementById("ticketCount");
const dust = document.getElementById("dust");

if (ticketCount) ticketCount.textContent = tickets.length;

function openTicket(index) {
  const ticket = tickets[index];
  if (!ticket) return;
  modalImage.src = ticket.image;
  modalImage.alt = ticket.title;
  modalTitle.textContent = ticket.title;
  modalDate.textContent = ticket.date;
  modalNote.textContent = ticket.note;
  modalTags.innerHTML = ticket.tags.map(tag => `<span>${tag}</span>`).join("");
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  setTimeout(() => document.querySelector(".close-btn")?.focus(), 80);
}

function closeTicket() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.querySelectorAll(".ticket-card").forEach(card => {
  card.addEventListener("click", () => openTicket(Number(card.dataset.ticket)));
});
document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeTicket));
document.addEventListener("keydown", e => { if (e.key === "Escape" && modal.classList.contains("open")) closeTicket(); });

if (window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("pointermove", event => {
    const x = (event.clientX / window.innerWidth - .5) * 2;
    const y = (event.clientY / window.innerHeight - .5) * 2;
    library.style.setProperty("--mx", x.toFixed(3));
    library.style.setProperty("--my", y.toFixed(3));

    document.querySelectorAll(".ticket-card").forEach((card, i) => {
      const depth = [8, 15, 11][i] || 10;
      card.style.marginLeft = `${x * depth}px`;
      card.style.marginTop = `${y * depth * .45}px`;
    });
  }, { passive: true });
}

for (let i = 0; i < 42; i++) {
  const p = document.createElement("i");
  p.style.left = `${Math.random() * 100}%`;
  p.style.top = `${Math.random() * 110}%`;
  p.style.animationDuration = `${8 + Math.random() * 15}s`;
  p.style.animationDelay = `${-Math.random() * 16}s`;
  p.style.setProperty("--drift", `${-40 + Math.random() * 80}px`);
  p.style.opacity = `${.15 + Math.random() * .55}`;
  dust.appendChild(p);
}
