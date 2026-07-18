/**
 * app.js
 * Core Single Page Application (SPA) Engine, Client-side Router, & Session Management
 */

// Global App State
const AppState = {
  user: null, // Menyimpan objek user { username, nama, role } jika sudah login
  currentView: 'pendaftaran' // View default setelah login sukses
};

/**
 * Hub inti untuk mengelola perutean tampilan halaman (views) secara dinamis
 * @param {String} viewName Nama target halaman yang ingin ditampilkan
 */
function navigateTo(viewName) {
  // Guard 1: Proteksi Akses Jika Belum Login
  if (!AppState.user && viewName !== 'login') {
    viewName = 'login';
  }

  // Guard 2: Jika sudah login tapi mencoba akses halaman login, alihkan ke default
  if (AppState.user && viewName === 'login') {
    viewName = 'pendaftaran';
  }

  AppState.currentView = viewName;
  renderLayout();
}

/**
 * Mengatur visibilitas kontainer utama berdasarkan view aktif
 */
function renderLayout() {
  const loginSection = document.getElementById('login-section');
  const mainLayout = document.getElementById('main-layout');
  const contentContainer = document.getElementById('main-content-stream');

  // Sembunyikan semua layout utama dulu
  loginSection.classList.add('hidden');
  mainLayout.classList.add('hidden');

  // Kondisi 1: Tampilan Login Screen
  if (AppState.currentView === 'login') {
    loginSection.classList.remove('hidden');
    renderLoginView();
    return;
  }

  // Kondisi 2: Tampilan Aplikasi Utama (Setelah Login Sukses)
  mainLayout.classList.remove('hidden');
  renderSidebarMenu(AppState.user.role);
  
  // Aktifkan visual menu terpilih pada sidebar
  updateSidebarActiveState(AppState.currentView);

  // Router Switcher: Memuat placeholder layout spesifik modul aplikasi sesuai Gambar Target
  switch (AppState.currentView) {
    case 'dashboard':
      contentContainer.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 class="text-2xl font-bold text-slate-800">Dashboard Utama</h2>
          <p class="text-gray-600 mt-2">Selamat datang di Sistem Informasi Klinik Sehat. Silakan pilih menu di samping untuk memulai pelayanan.</p>
        </div>`;
      break;

    case 'pendaftaran':
      contentContainer.innerHTML = window.PasienModule ? window.PasienModule.render() : `<h2 class="text-xl font-bold">Modul Pendaftaran Pasien</h2><p class="text-gray-600 mt-2">Script pasien.js belum dimuat.</p>`;
      if (window.PasienModule && window.PasienModule.init) window.PasienModule.init();
      break;

    case 'antrian':
      contentContainer.innerHTML = window.AntrianModule ? window.AntrianModule.render() : `<h2 class="text-xl font-bold">Modul Antrean Pasien</h2><p class="text-gray-600 mt-2">Script antrian.js belum dimuat.</p>`;
      if (window.AntrianModule && window.AntrianModule.init) window.AntrianModule.init();
      break;

    case 'rekam_medis':
      contentContainer.innerHTML = `<h2 class="text-xl font-bold">Modul Rekam Medis</h2><p class="text-gray-600 mt-2">Riwayat rekam medis pasien terintegrasi.</p>`;
      break;

    case 'pemeriksaan':
      contentContainer.innerHTML = window.DokterModule ? window.DokterModule.render() : `<h2 class="text-xl font-bold">Modul Pemeriksaan Dokter (SOAP)</h2><p class="text-gray-600 mt-2">Script dokter.js belum dimuat.</p>`;
      if (window.DokterModule && window.DokterModule.init) window.DokterModule.init();
      break;

    case 'apotek':
      contentContainer.innerHTML = window.ApotekModule ? window.ApotekModule.render() : `<h2 class="text-xl font-bold">Modul Apotek / Obat</h2><p class="text-gray-600 mt-2">Script apotek.js belum dimuat.</p>`;
      if (window.ApotekModule && window.ApotekModule.init) window.ApotekModule.init();
      break;

    case 'pembayaran':
      contentContainer.innerHTML = window.KasirModule ? window.KasirModule.render() : `<h2 class="text-xl font-bold">Modul Pembayaran & Billing</h2><p class="text-gray-600 mt-2">Script kasir.js belum dimuat.</p>`;
      if (window.KasirModule && window.KasirModule.init) window.KasirModule.init();
      break;

    case 'laporan':
      contentContainer.innerHTML = `<h2 class="text-xl font-bold">Modul Laporan Pendapatan & Kunjungan</h2><p class="text-gray-600 mt-2">Analisis data performa klinik.</p>`;
      break;

    case 'jadwal_dokter':
      contentContainer.innerHTML = `<h2 class="text-xl font-bold">Modul Jadwal Dokter</h2><p class="text-gray-600 mt-2">Manajemen operasional jadwal dokter klinik.</p>`;
      break;

    case 'pengguna':
      contentContainer.innerHTML = `<h2 class="text-xl font-bold">Modul Manajemen Pengguna</h2><p class="text-gray-600 mt-2">Pengaturan akun staf, role, dan password.</p>`;
      break;

    case 'pengaturan':
      contentContainer.innerHTML = `<h2 class="text-xl font-bold">Modul Pengaturan Sistem</h2><p class="text-gray-600 mt-2">Konfirmasi parameter operasional klinik.</p>`;
      break;

    default:
      contentContainer.innerHTML = `<div class="p-6 text-red-500 font-bold">Error: View '${AppState.currentView}' tidak valid.</div>`;
  }
}

/**
 * Merender daftar menu navigasi sidebar lengkap sesuai Gambar Target
 * @param {String} role Peran pengguna (Admin/Dokter/Apoteker/Kasir)
 */
function renderSidebarMenu(role) {
  const sidebarNav = document.getElementById('sidebar-navigation');
  
  // 10 Item Menu Lengkap Sesuai Struktur Gambar 1 yang lo kirim
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠', roles: ['Admin', 'Dokter', 'Apoteker', 'Kasir'] },
    { id: 'pendaftaran', label: 'Pendaftaran Pasien', icon: '👤', roles: ['Admin'] },
    { id: 'antrian', label: 'Antrian Pasien', icon: '📋', roles: ['Admin', 'Dokter', 'Apoteker', 'Kasir'] },
    { id: 'rekam_medis', label: 'Rekam Medis', icon: '💼', roles: ['Admin', 'Dokter'] },
    { id: 'pemeriksaan', label: 'Pemeriksaan', icon: '🩺', roles: ['Admin', 'Dokter'] },
    { id: 'apotek', label: 'Apotek / Obat', icon: '💊', roles: ['Admin', 'Apoteker'] },
    { id: 'pembayaran', label: 'Pembayaran', icon: '💳', roles: ['Admin', 'Kasir'] },
    { id: 'laporan', label: 'Laporan', icon: '📊', roles: ['Admin'] },
    { id: 'jadwal_dokter', label: 'Jadwal Dokter', icon: '📅', roles: ['Admin', 'Dokter', 'Apoteker', 'Kasir'] },
    { id: 'pengguna', label: 'Pengguna', icon: '👥', roles: ['Admin'] },
    { id: 'pengaturan', label: 'Pengaturan', icon: '⚙️', roles: ['Admin'] }
  ];

  let htmlMenu = `
    <div class="mb-6">
      <h1 class="text-white text-xl font-bold tracking-wide">Klinik Sehat</h1>
      <p class="text-xs text-emerald-400 mt-1">Staf: ${AppState.user.nama} (${role})</p>
    </div>
    <nav class="space-y-1 flex-1 overflow-y-auto pr-1">`;

  menuItems.forEach(item => {
    // Memastikan Admin bisa melihat semua menu, role lain menyesuaikan rule array item.roles
    if (role === 'Admin' || item.roles.includes(role)) {
      htmlMenu += `
        <button onclick="navigateTo('${item.id}')" id="menu-btn-${item.id}" class="w-full flex items-center space-x-3 text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition duration-200 text-sm font-medium mb-1">
          <span class="text-base">${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `;
    }
  });

  htmlMenu += `
    </nav>
    <div class="mt-auto pt-4 border-t border-slate-700">
      <button onclick="executeLogout()" class="w-full flex items-center space-x-3 text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/40 hover:text-red-300 transition duration-200 text-sm font-medium">
        <span>🚪</span>
        <span>Log Out</span>
      </button>
    </div>`;
  
  sidebarNav.innerHTML = htmlMenu;
}

function updateSidebarActiveState(activeId) {
  const buttons = document.querySelectorAll('[id^="menu-btn-"]');
  buttons.forEach(btn => {
    btn.classList.remove('bg-emerald-600', 'text-white', 'bg-blue-600');
    btn.classList.add('text-gray-300');
  });
  
  const activeBtn = document.getElementById(`menu-btn-${activeId}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-gray-300');
    // Beri warna biru khusus untuk top dashboard agar senada dengan header gambar lo, sisanya warna emerald hijau
    if (activeId === 'dashboard') {
      activeBtn.classList.add('bg-blue-600', 'text-white');
    } else {
      activeBtn.classList.add('bg-emerald-600', 'text-white');
    }
  }
}

/**
 * Menyuntikkan form login interaktif ke layar utama
 */
function renderLoginView() {
  const loginSection = document.getElementById('login-section');
  loginSection.innerHTML = `
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-slate-800 tracking-tight">Klinik Sehat</h2>
        <p class="text-sm text-gray-500 mt-2">Sistem Informasi Manajemen Pelayanan Pasien</p>
      </div>
      <div id="login-error-box" class="hidden mb-4 p-3 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-200"></div>
      <form id="main-login-form" onsubmit="executeLogin(event)" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input type="text" id="login-username" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input type="password" id="login-password" required class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
        </div>
        <button type="submit" id="login-submit-btn" class="w-full bg-emerald-600 text-white font-medium text-sm py-3 rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition duration-150 shadow-md shadow-emerald-600/10">Masuk Ke Sistem</button>
      </form>
    </div>
  `;
}

/**
 * Interseptor Aksi submit Form Login untuk menembak API Backend GAS
 */
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
      AppState.user = resData.data;
      
      // Auto routing awal diarahkan ke menu pendaftaran pasien
      navigateTo('pendaftaran');
    } else {
      errorBox.innerText = resData.message || "Username atau Password salah.";
      errorBox.classList.remove('hidden');
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Masuk Ke Sistem";
    }
  } catch (err) {
    errorBox.innerText = "Koneksi ke server gagal. Pastikan URL API GAS benar.";
    errorBox.classList.remove('hidden');
    btnSubmit.disabled = false;
    btnSubmit.innerText = "Masuk Ke Sistem";
  }
}

/**
 * Membersihkan sesi staf dan mereset view kembali ke login screen
 */
function executeLogout() {
  AppState.user = null;
  navigateTo('login');
}

// Inisialisasi Aplikasi Saat Window DOM Selesai Dimuat
window.addEventListener('DOMContentLoaded', () => {
  navigateTo('login');
});
