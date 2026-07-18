/**
 * app.js
 * Core SPA Engine & View Router - Tailored for adminHMD Template Mechanics
 */

const AppState = {
  user: null, // Berisi { username, nama, role, avatar } setelah auth sukses
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

  // Tampilkan Layout Utama & Update Informasi Topbar
  mainLayout.classList.remove('hidden');
  document.getElementById('topbar-username').innerText = AppState.user.nama;
  document.getElementById('topbar-avatar').src = `assets/images/avatar/${AppState.user.avatar}`;

  renderSidebarMenu(AppState.user.role);
  updateSidebarActiveState(AppState.currentView);

  // Router Kamar Konten Dinamis (Style Menggunakan Class .panel Template)
  switch (AppState.currentView) {
    case 'dashboard':
      contentContainer.innerHTML = `
        <div class="page-heading">
          <div class="page-heading-copy">
            <span class="page-icon"><i class="bi bi-speedometer2"></i></span>
            <div>
              <p class="eyebrow mb-1">Ringkasan Pelayanan</p>
              <h1 class="h3 mb-1">Dashboard Utama</h1>
              <p class="text-muted mb-0">Selamat datang kembali di Sistem Informasi Manajemen Klinik Sehat.</p>
            </div>
          </div>
        </div>
        <div class="panel mt-3">
          <div class="panel-header">
            <h2 class="h5 mb-1 section-title"><span>Sistem Operasional Aktif</span></h2>
          </div>
          <p class="text-muted">Silakan pilih modul menu di sebelah kiri untuk memulai penginputan data medis atau registrasi pasien.</p>
        </div>`;
      break;

    case 'pendaftaran':
      contentContainer.innerHTML = window.PasienModule ? window.PasienModule.render() : getDefaultPlaceholder("Pendaftaran Pasien", "bi-person-plus", "Form registrasi pasien baru dan pencarian data rekam medis lama.");
      if (window.PasienModule && window.PasienModule.init) window.PasienModule.init();
      break;

    case 'antrian':
      contentContainer.innerHTML = window.AntrianModule ? window.AntrianModule.render() : getDefaultPlaceholder("Antrian Pasien", "bi-list-check", "Manajemen antrean loket pendaftaran, poli dokter, dan kasir.");
      if (window.AntrianModule && window.AntrianModule.init) window.AntrianModule.init();
      break;

    case 'rekam_medis':
      contentContainer.innerHTML = getDefaultPlaceholder("Rekam Medis", "bi-folder2-open", "Arsip data rekam medis pasien terintegrasi.");
      break;

    case 'pemeriksaan':
      contentContainer.innerHTML = window.DokterModule ? window.DokterModule.render() : getDefaultPlaceholder("Pemeriksaan SOAP Dokter", "bi-heart-pulse", "Input pemeriksaan klinis dokter berbasis format SOAP.");
      if (window.DokterModule && window.DokterModule.init) window.DokterModule.init();
      break;

    case 'apotek':
      contentContainer.innerHTML = window.ApotekModule ? window.ApotekModule.render() : getDefaultPlaceholder("Apotek / Farmasi", "bi-capsule", "Pemrosesan resep dokter, manajemen stok obat, dan penyerahan obat ke pasien.");
      if (window.ApotekModule && window.ApotekModule.init) window.ApotekModule.init();
      break;

    case 'pembayaran':
      contentContainer.innerHTML = window.KasirModule ? window.KasirModule.render() : getDefaultPlaceholder("Pembayaran & Kasir", "bi-cash-coin", "Manajemen transaksi kasir, cetak kwitansi, dan invoice pasien.");
      if (window.KasirModule && window.KasirModule.init) window.KasirModule.init();
      break;

    case 'laporan':
      contentContainer.innerHTML = getDefaultPlaceholder("Laporan Klinik", "bi-bar-chart-line", "Statistik kunjungan pasien, omset keuangan, dan pelaporan internal.");
      break;

    case 'jadwal_dokter':
      contentContainer.innerHTML = getDefaultPlaceholder("Jadwal Dokter", "bi-calendar-event", "Manajemen shift operasional praktek dokter klinik.");
      break;

    case 'pengguna':
      contentContainer.innerHTML = getDefaultPlaceholder("Manajemen Pengguna", "bi-people", "Manajemen hak akses, role akun, dan password staf klinik.");
      break;

    case 'pengaturan':
      contentContainer.innerHTML = getDefaultPlaceholder("Pengaturan Sistem", "bi-gear", "Konfigurasi parameter dasar dan integrasi sistem server.");
      break;

    default:
      contentContainer.innerHTML = `<div class="alert alert-danger">Error: View '${AppState.currentView}' tidak valid.</div>`;
  }
}

function getDefaultPlaceholder(title, iconClass, description) {
  return `
    <div class="page-heading">
      <div class="page-heading-copy">
        <span class="page-icon"><i class="bi ${iconClass}"></i></span>
        <div>
          <p class="eyebrow mb-1">Modul Aplikasi</p>
          <h1 class="h3 mb-1">${title}</h1>
          <p class="text-muted mb-0">${description}</p>
        </div>
      </div>
    </div>
    <div class="panel mt-3">
      <div class="blank-state py-5">
        <h2 class="h5 mb-2">${title} Selesai Disinkronkan</h2>
        <p class="text-muted mb-0">Komponen UI layout berhasil dialihkan sepenuhnya ke dalam arsitektur template baru.</p>
      </div>
    </div>`;
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
    { id: 'pembayaran', label: 'Pembayaran', icon: 'bi-credit-card', roles: ['Admin', 'Kasir'] },
    { id: 'laporan', label: 'Laporan', icon: 'bi-bar-chart-line', roles: ['Admin'] },
    { id: 'jadwal_dokter', label: 'Jadwal Dokter', icon: 'bi-calendar3', roles: ['Admin', 'Dokter', 'Apoteker', 'Kasir'] },
    { id: 'pengguna', label: 'Pengguna', icon: 'bi-people', roles: ['Admin'] },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'bi-gear', roles: ['Admin'] }
  ];

  const userAvatar = AppState.user.avatar || 'avatar.jpg';

  let htmlMenu = `
    <div class="sidebar-header">
      <a class="brand-mark" href="#" onclick="navigateTo('dashboard')">
        <span class="brand-icon"><i class="bi bi-grid-1x2-fill" aria-hidden="true"></i></span>
        <span class="brand-copy">
          <span class="brand-title">Klinik Sehat</span>
          <span class="brand-subtitle">SIM SIMRS v3.0</span>
        </span>
      </a>
    </div>
    <nav class="sidebar-nav custom-scrollbar" style="flex: 1; overflow-y: auto;">`;

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
      <img class="avatar-img avatar-md sidebar-user-avatar" src="assets/images/avatar/${userAvatar}" alt="Profile">
      <strong>${AppState.user.nama}</strong>
      <small>${role} Area</small>
    </div>
    <div class="sidebar-footer">
      <span class="status-dot"></span>
      <span class="sidebar-footer-text">Klinik Terkoneksi</span>
    </div>`;
  
  sidebarNav.innerHTML = htmlMenu;
}

function updateSidebarActiveState(activeId) {
  const links = document.querySelectorAll('.sidebar-nav .nav-link');
  links.forEach(link => link.classList.remove('active'));
  
  const activeLink = document.getElementById(`menu-btn-${activeId}`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

function renderLoginView() {
  const loginSection = document.getElementById('login-section');
  loginSection.innerHTML = `
    <main class="auth-page">
      <section class="auth-card">
        <a class="auth-brand" href="#"><span class="brand-icon"><i class="bi bi-grid-1x2-fill"></i></span><span><strong>Klinik Sehat</strong><small>Sistem Informasi Pelayanan Klinik</small></span></a>
        <div class="auth-visual"><img src="assets/images/png/dasher-ai.png" alt="Visual"></div>
        <form onsubmit="executeLogin(event)">
          <div class="mb-4">
            <h1 class="h3 mb-1">Masuk Sistem</h1>
            <p class="text-muted mb-0">Silakan gunakan kredensial staf aktif Anda.</p>
          </div>
          <div id="login-error-box" class="hidden alert alert-danger p-2 small mb-3"></div>
          <div class="mb-3">
            <label class="form-label" for="login-username">Username</label>
            <input class="form-control" id="login-username" type="text" required>
          </div>
          <div class="mb-4">
            <label class="form-label" for="login-password">Password</label>
            <input class="form-control" id="login-password" type="password" required>
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

  try {
    const targetUrl = `${CONFIG.BASE_URL}?api_key=${encodeURIComponent(CONFIG.API_KEY)}`;

    const response = await fetch(targetUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain' }, 
      body: JSON.stringify({
        api_key: CONFIG.API_KEY,
        action: 'login',
        username: userIn,
        password: passIn
      })
    });

    const resData = await response.json();

    if (resData.success) {
      AppState.user = {
        ...resData.data,
        avatar: resData.data.role === 'Dokter' ? 'avatar-2.jpg' : 'avatar.jpg'
      };
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
