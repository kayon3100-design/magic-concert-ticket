(() => {
  const body = document.body;
  body.dataset.admin = 'false';

  const topActions = document.querySelector('.top-actions');
  if (topActions && !document.getElementById('ticketSearch')) {
    const searchWrap = document.createElement('div');
    searchWrap.className = 'search-wrap';
    searchWrap.innerHTML = '<input id="ticketSearch" class="ticket-search" type="search" placeholder="Search tickets…" autocomplete="off" aria-label="Search concert tickets"><span class="search-icon">⌕</span>';
    topActions.insertBefore(searchWrap, topActions.firstChild);

    const adminBtn = document.createElement('button');
    adminBtn.id = 'adminBtn';
    adminBtn.className = 'admin-btn';
    adminBtn.type = 'button';
    adminBtn.textContent = 'Admin';
    topActions.appendChild(adminBtn);
  }

  const library = document.getElementById('library');
  if (library && !document.getElementById('searchEmpty')) {
    const empty = document.createElement('div');
    empty.id = 'searchEmpty';
    empty.className = 'search-empty';
    empty.textContent = 'Không tìm thấy vé phù hợp ✦';
    library.appendChild(empty);
  }

  if (!document.getElementById('adminModal')) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'adminModal';
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `
      <button class="modal-backdrop" data-close-admin aria-label="Đóng"></button>
      <article class="admin-panel">
        <button class="close-btn" data-close-admin aria-label="Đóng">×</button>
        <p class="eyebrow">ARCHIVE KEEPER</p>
        <h2>Admin</h2>
        <p>Khách chỉ xem và tìm vé. Đăng nhập để thêm hoặc xóa ký ức.</p>
        <form id="adminForm" class="admin-form">
          <label><span>Email</span><input id="adminEmail" type="email" autocomplete="username" required></label>
          <label><span>Password</span><input id="adminPassword" type="password" autocomplete="current-password" required></label>
          <div id="adminStatus" class="admin-status"></div>
          <button class="save-btn" type="submit">Sign in ✦</button>
        </form>
        <div id="adminSession" class="admin-session">
          <strong>Admin mode active ✦</strong>
          <small id="adminSessionEmail"></small><br>
          <button id="adminLogout" class="ghost-btn" type="button">Sign out</button>
        </div>
      </article>`;
    document.body.appendChild(modal);
  }

  const search = document.getElementById('ticketSearch');
  const cardField = document.getElementById('cardField');
  const empty = document.getElementById('searchEmpty');
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const adminForm = document.getElementById('adminForm');
  const adminEmail = document.getElementById('adminEmail');
  const adminPassword = document.getElementById('adminPassword');
  const adminStatus = document.getElementById('adminStatus');
  const adminSession = document.getElementById('adminSession');
  const adminSessionEmail = document.getElementById('adminSessionEmail');
  const adminLogout = document.getElementById('adminLogout');

  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  function runSearch() {
    if (!search || !cardField) return;
    const q = normalize(search.value);
    let visible = 0;
    cardField.querySelectorAll('.ticket-card').forEach(card => {
      const haystack = normalize(card.textContent);
      const match = !q || haystack.includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    });
    if (empty) empty.classList.toggle('show', Boolean(q) && visible === 0);
  }

  search?.addEventListener('input', runSearch);
  if (cardField) new MutationObserver(runSearch).observe(cardField, { childList: true });

  const cfg = window.MAGIC_ARCHIVE_CONFIG || {};
  const authClient = cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase
    ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
    : null;

  function openAdmin() {
    adminModal.classList.add('open');
    adminModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  function closeAdmin() {
    adminModal.classList.remove('open');
    adminModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    adminStatus.textContent = '';
  }
  document.querySelectorAll('[data-close-admin]').forEach(el => el.addEventListener('click', closeAdmin));
  adminBtn?.addEventListener('click', openAdmin);

  function setSession(session) {
    const isAdmin = Boolean(session?.user);
    body.dataset.admin = isAdmin ? 'true' : 'false';
    adminBtn.textContent = isAdmin ? 'Admin ✓' : 'Admin';
    adminForm.style.display = isAdmin ? 'none' : 'grid';
    adminSession.style.display = isAdmin ? 'block' : 'none';
    adminSessionEmail.textContent = session?.user?.email || '';
  }

  async function initAuth() {
    if (!authClient) return;
    const { data } = await authClient.auth.getSession();
    setSession(data.session);
    authClient.auth.onAuthStateChange((_event, session) => setSession(session));
  }

  adminForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!authClient) { adminStatus.textContent = 'Supabase chưa được cấu hình.'; return; }
    adminStatus.textContent = 'Đang đăng nhập…';
    const { data, error } = await authClient.auth.signInWithPassword({ email: adminEmail.value.trim(), password: adminPassword.value });
    if (error) { adminStatus.textContent = 'Sai email hoặc mật khẩu.'; return; }
    adminStatus.textContent = '';
    adminPassword.value = '';
    setSession(data.session);
  });

  adminLogout?.addEventListener('click', async () => {
    if (authClient) await authClient.auth.signOut();
    setSession(null);
  });

  initAuth();
})();
