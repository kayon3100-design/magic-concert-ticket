(() => {
  const body = document.body;
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

  body.dataset.admin = 'false';

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
  const observer = new MutationObserver(runSearch);
  if (cardField) observer.observe(cardField, { childList: true });

  const cfg = window.MAGIC_ARCHIVE_CONFIG || {};
  const authClient = cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase
    ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey)
    : null;

  function openAdmin() {
    if (!adminModal) return;
    adminModal.classList.add('open');
    adminModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }
  function closeAdmin() {
    if (!adminModal) return;
    adminModal.classList.remove('open');
    adminModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (adminStatus) adminStatus.textContent = '';
  }
  document.querySelectorAll('[data-close-admin]').forEach(el => el.addEventListener('click', closeAdmin));
  adminBtn?.addEventListener('click', openAdmin);

  function setSession(session) {
    const isAdmin = Boolean(session?.user);
    body.dataset.admin = isAdmin ? 'true' : 'false';
    if (adminBtn) adminBtn.textContent = isAdmin ? 'Admin ✓' : 'Admin';
    if (adminForm) adminForm.style.display = isAdmin ? 'none' : 'grid';
    if (adminSession) adminSession.style.display = isAdmin ? 'block' : 'none';
    if (adminSessionEmail) adminSessionEmail.textContent = session?.user?.email || '';
  }

  async function initAuth() {
    if (!authClient) return;
    const { data } = await authClient.auth.getSession();
    setSession(data.session);
    authClient.auth.onAuthStateChange((_event, session) => setSession(session));
  }

  adminForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!authClient) {
      adminStatus.textContent = 'Supabase chưa được cấu hình.';
      return;
    }
    adminStatus.textContent = 'Đang đăng nhập…';
    const { data, error } = await authClient.auth.signInWithPassword({
      email: adminEmail.value.trim(),
      password: adminPassword.value
    });
    if (error) {
      adminStatus.textContent = 'Sai email hoặc mật khẩu.';
      return;
    }
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
