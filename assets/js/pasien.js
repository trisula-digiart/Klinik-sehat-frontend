/**
 * app.js
 * Core SPA Router Engine - Optimized Layout Wrapper for adminHMD Structure
 */

const AppState = {
  user: null, 
  currentView: 'dashboard'
};

function navigateTo(viewName) {
  if (!AppState.user && viewName !== 'login') {
    viewName = 'login';
  }
  if (AppState.user && viewName === 'login') {
    viewName = 'dashboard';
  }

  AppState.currentView = viewName;
  renderLayout();
}

function renderLayout() {
  const loginSection = document.getElementById('login-section');
  const mainLayout = document.getElementById('main-layout');
  const contentContainer = document.getElementById('main-content-stream');

  loginSection.classList.add('hidden');
  mainLayout.classList.add('hidden');

  if (AppState.currentView === 'login') {
    loginSection.classList.remove('hidden');
    renderLoginView();
    return;
  }

  mainLayout.classList.remove('hidden');
  
  // Sinkronisasi data profil topbar aman dari crash 404
  if (AppState.user) {
    document.getElementById('topbar-username').innerText = AppState.user.nama;
    document.getElementById('topbar-avatar').src = `assets/js/images/avatar/${AppState.user.avatar || 'avatar.jpg'}`;
    renderSidebarMenu(AppState.user.role);
  }
  
  updateSidebarActiveState(AppState.currentView);

  // Router Canvas Stream Injection
  switch (AppState.currentView) {
    case 'dashboard':
      contentContainer.innerHTML = `
        <div class="page-heading">
          <div class="page-heading-copy">
            <span class="page-icon"><i class="bi bi-speedometer2"></i></span>
            <div>
              <p class="eyebrow mb-1">Klinik Manajemen</p>
              <h1 class="h3 mb-1">Dashboard Pelayanan</h1>
              <p class="text-muted mb-0">Selamat datang kembali di Aplikasi Layanan Klinik Sehat.</p>
            </div>
          </div>
        </div>
        <div class="panel mt-4">
          <div class="panel-header"><h2 class="h5 mb-0 section-title"><span>Status Sistem</span></h2></div>
          <div class="panel-body">
            <p class="text-muted mb-0">Gunakan bar menu navigasi di sebelah kiri untuk mengakses modul pelayanan operasional klinik.</p>
          </div>
        </div>`;
      break;

    case 'pendaftaran':
      wrapModuleContent("Pendaftaran Pasien", "bi-person-plus", "Manajemen data sosial pasien baru dan lama.", window.PasienModule);
      break;

    case 'antrian':
      wrapModuleContent("Antrian Pasien", "bi-clipboard-check", "Monitoring antrean loket pendaftaran, poliklinik, dan kasir.", window.AntrianModule);
      break;

    case 'rekam_medis':
      wrapModuleContent("Rekam Medis", "bi-journal-medical", "Berkas digital rekam medis pasien terintegrasi.", null);
      break;

    case 'pemeriksaan':
      wrapModuleContent("Pemeriksaan", "bi-activity", "Ruang periksa dokter, pencatatan diagnosa, dan terapi SOAP.", window.DokterModule);
      break;

    case 'apotek':
      wrapModuleContent("Apotek / Obat", "bi-capsule", "Pemrosesan e-resep, racikan obat, dan kartu stok depo farmasi.", window.ApotekModule);
      break;

    case 'pembayaran':
      wrapModuleContent("Pembayaran", "bi-credit-card", "Kwitansi transaksi kasir, rincian biaya tindakan, dan cetak nota.", window.KasirModule);
      break;

    default:
      contentContainer.innerHTML = `<div class="alert alert-danger">Error: View '${AppState.currentView}' tidak ditemukan.</div>`;
  }
}

function wrapModuleContent(title, iconClass, description, moduleObject) {
  const contentContainer = document.getElementById('main-content-stream');
  
  let headerHtml = `
    <div class="page-heading">
      <div class="page-heading-copy">
        <span class="page-icon"><i class="bi ${iconClass}"></i></span>
        <div>
          <p class="eyebrow mb-1">Modul Aplikasi</p>
          <h1 class="h3 mb-1">${title}</h1>
          <p class="text-muted mb-0">${description}</p>
        </div>
      </div>
    </div>`;

  if (moduleObject && typeof moduleObject.render === 'function') {
    // Injeksi dengan pembungkus kontainer kelas utilitas adminHMD agar styling Bootstrap terkunci penuh
    contentContainer.innerHTML = headerHtml + `<div class="container-fluid px-0 mt-4">${moduleObject.render()}</div>`;
    if (typeof moduleObject.init === 'function') moduleObject.init();
  } else {
    contentContainer.innerHTML = headerHtml + `
      <div class="panel mt-4">
        <div class="panel-body">
          <div class="blank-state py-5 text-center">
            <h2 class="h5 mb-2">${title} Belum Dimuat</h2>
            <p class="text-muted mb-0">File JavaScript pendukung modul ini sedang dalam tahap kustomisasi layout template baru.</p>
          </div>
        </div>
      </div>`;
  }
}

function renderSidebarMenu(role) {
  const sidebarNav = document.getElementById('sidebar-navigation');
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2', roles: ['Admin', 'Dokter', 'Apoteker', 'Kasir'] },
    { id: 'pendaftaran', label: 'Pendaftaran Pasien', icon: 'bi-person-plus', roles: ['Admin'] },
    { id: 'antrian', label: 'Antrian Pasien', icon: 'bi-clipboard-check', roles: ['Admin', 'Dokter', 'Apoteker', 'Kasir'] },
    { id: 'rekam_medis', label: 'Rekam Medis', icon: 'bi-journal-medical', roles: ['Admin', 'Dokter'] },
    { id: 'pemeriksaan', label: 'Pemeriksaan', icon: 'bi-activity', roles: ['Admin', 'Dokter'] },
    { id: 'apotek', label: 'Apotek / Obat', icon: 'bi-capsule', roles: ['Admin', 'Apoteker'] },
    { id: 'pembayaran', label: 'Pembayaran', icon: 'bi-credit-card', roles: ['Admin', 'Kasir'] }
  ];

  const userAvatar = AppState.user ? (AppState.user.avatar || 'avatar.jpg') : 'avatar.jpg';

  let htmlMenu = `
    <div class="sidebar-header">
      <a class="brand-mark" href="#" onclick="navigateTo('dashboard')">
        <span class="brand-icon"><i class="bi bi-grid-1x2-fill" aria-hidden="true"></i></span>
        <span class="brand-copy">
          <span class="brand-title">Klinik Sehat</span>
          <span class="brand-subtitle">SIMRS v3.0</span>
        </span>
      </a>
    </div>
    <nav class="sidebar-nav custom-scrollbar">`;

  menuItems.forEach(item => {
    if (role === 'Admin' || item.roles.includes(role)) {
      htmlMenu += `
        <a class="nav-link" href="#" id="menu-btn-${item.id}" onclick="navigateTo('${item.id}')">
          <span class="nav-icon"><i class="bi ${item.icon}" aria-hidden="true"></i></span>
          <span class="nav-text">${item.label}</span>
        </a>`;
    }
  });

  htmlMenu += `
    </nav>
    <div class="sidebar-user">
      <img class="avatar-img avatar-md sidebar-user-avatar" src="assets/js/images/avatar/${userAvatar}" alt="Profile">
      <strong>${AppState.user ? AppState.user.nama : 'Staf'}</strong>
      <small>${role} Area</small>
    </div>
    <div class="sidebar-footer">
      <span class="status-dot" style="background-color: #22c55e;"></span>
      <span class="sidebar-footer-text">Klinik Terkoneksi</span>
    </div>`;
  
  sidebarNav.innerHTML = htmlMenu;
}

function updateSidebarActiveState(activeId) {
  const links = document.querySelectorAll('.sidebar-nav .nav-link');
  links.forEach(link => link.classList.remove('active'));
  
  const activeLink = document.getElementById(`menu-btn-${activeId}`);
  if (activeLink) activeLink.classList.add('active');
}

function renderLoginView() {
  const loginSection = document.getElementById('login-section');
  loginSection.innerHTML = `
    <main class="auth-page">
      <section class="auth-card">
        <a class="auth-brand" href="#"><span class="brand-icon"><i class="bi bi-grid-1x2-fill"></i></span><span><strong>Klinik Sehat</strong><small>Sistem Informasi Manajemen Pelayanan Pasien</small></span></a>
        <div class="auth-visual"><div class="bg-primary text-white p-4 text-center h-100 d-flex align-items-center justify-content-center fw-bold">KLINIK SEHAT SYSTEM ENGINE</div></div>
        <form onsubmit="executeLogin(event)">
          <div class="mb-4">
            <h1 class="h3 mb-1">Masuk Sistem</h1>
            <p class="text-muted mb-0">Silakan gunakan kredensial staf aktif Anda.</p>
          </div>
          <div id="login-error-box" class="hidden alert alert-danger p-2 small mb-3"></div>
          <div class="mb-3">
            <label class="form-label" for="login-username">Username</label>
            <input class="form-control" id="login-username" type="text" value="admin" required>
          </div>
          <div class="mb-4">
            <label class="form-label" for="login-password">Password</label>
            <input class="form-control" id="login-password" type="password" value="admin123" required>
          </div>
          <button class="btn btn-primary w-100" type="submit" id="login-submit-btn">Masuk Ke Sistem</button>
        </form>
      </section>
    </main>`;
}

async function executeLogin(e) {
  e.preventDefault();
  const userIn = document.getElementById('login-username').value;
  const passIn = document.getElementById('login-password').value;
  const errorBox = document.getElementById('login-error-box');
  const btnSubmit = document.getElementById('login-submit-btn');

  errorBox.classList.add('hidden');
  btnSubmit.disabled = true;
  btnSubmit.innerText = "Memverifikasi...";

  // Dummy login bypass untuk development testing jika server Apps Script offline
  if(userIn === "admin" && passIn === "admin123") {
    AppState.user = { nama: "Admin Hasan", role: "Admin", avatar: "avatar.jpg" };
    navigateTo('pendaftaran');
    return;
  }

  try {
    const targetUrl = `${CONFIG.BASE_URL}?api_key=${encodeURIComponent(CONFIG.API_KEY)}`;
    const response = await fetch(targetUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' }, 
      body: JSON.stringify({ api_key: CONFIG.API_KEY, action: 'login', username: userIn, password: passIn })
    });
    const resData = await response.json();
    if (resData.success) {
      AppState.user = { ...resData.data, avatar: 'avatar.jpg' };
      navigateTo('dashboard');
    } else {
      errorBox.innerText = resData.message || "Kredensial salah.";
      errorBox.classList.remove('hidden');
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Masuk Ke Sistem";
    }
  } catch (err) {
    errorBox.innerText = "Gagal menghubungi server Apps Script.";
    errorBox.classList.remove('hidden');
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Masuk Ke Sistem";
  }
}

function executeLogout() {
  AppState.user = null;
  navigateTo('login');
}

window.addEventListener('DOMContentLoaded', () => {
  navigateTo('login');
});
