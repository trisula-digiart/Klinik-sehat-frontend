/**
 * app.js
 * Core Single Page Application (SPA) Engine, Client-side Router, & Session Management
 */

// Global App State
const AppState = {
  user: null, // Menyimpan objek user { username, nama, role } jika sudah login
  currentView: 'login' // View default saat pertama kali aplikasi dimuat
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

  // Guard 2: Jika sudah login tapi mencoba akses halaman login, alihkan ke dashboard/layanan utama
  if (AppState.user && viewName === 'login') {
    viewName = 'pendaftaran'; // Menu default pertama setelah login staf admin
  }

  AppState.currentView = viewName;
  renderLayout();
}

/**
 * Mengatur visibilitas kontainer utama berdasarkan view aktif dan hak akses role
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

  // Router Switcher: Memuat placeholder layout spesifik modul aplikasi
  switch (AppState.currentView) {
    case 'pendaftaran':
      contentContainer.innerHTML = window.PasienModule ? window.PasienModule.render() : `<h2 class="text-xl font-bold">Modul Pendaftaran Pasien</h2><p class="text-gray-600 mt-2">Script pasien.js belum dimuat.</p>`;
      if (window.PasienModule && window.PasienModule.init) window.PasienModule.init();
      break;

    case 'antrian':
      contentContainer.innerHTML = window.AntrianModule ? window.AntrianModule.render() : `<h2 class="text-xl font-bold">Modul Antrean Live</h2><p class="text-gray-600 mt-2">Script antrian.js belum dimuat.</p>`;
      if (window.AntrianModule && window.AntrianModule.init) window.AntrianModule.init();
      break;

    case 'dokter':
      contentContainer.innerHTML = window.DokterModule ? window.DokterModule.render() : `<h2 class="text-xl font-bold">Modul Pemeriksaan Dokter (SOAP)</h2><p class="text-gray-600 mt-2">Script dokter.js belum dimuat.</p>`;
      if (window.DokterModule && window.DokterModule.init) window.DokterModule.init();
      break;

    case 'apotek':
      contentContainer.innerHTML = window.ApotekModule ? window.ApotekModule.render() : `<h2 class="text-xl font-bold">Modul Farmasi & E-Resep</h2><p class="text-gray-600 mt-2">Script apotek.js belum dimuat.</p>`;
      if (window.ApotekModule && window.ApotekModule.init) window.ApotekModule.init();
      break;

    case 'kasir':
      contentContainer.innerHTML = window.KasirModule ? window.KasirModule.render() : `<h2 class="text-xl font-bold">Modul Kasir & Billing Pembayaran</h2><p class="text-gray-600 mt-2">Script kasir.js belum dimuat.</p>`;
      if (window.KasirModule && window.KasirModule.init) window.KasirModule.init();
      break;

    default:
      contentContainer.innerHTML = `<div class="p-6 text-red-500 font-bold">Error: View '${AppState.currentView}' tidak valid.</div>`;
  }
}

/**
 * Merender daftar menu navigasi sidebar sesuai dengan Role Pengguna
 * @param {String} role Peran pengguna (Admin/Dokter/Apoteker/Kasir)
 */
function renderSidebarMenu(role) {
  const sidebarNav = document.getElementById('sidebar-navigation');
  
  const menuItems = [
    { id: 'pendaftaran', label: 'Pendaftaran Pasien', icon: '👤', roles: ['Admin'] },
    { id: 'antrian', label: 'Monitor Antrean', icon: '📋', roles: ['Admin', 'Dokter', 'Apoteker', 'Kasir'] },
    { id: 'dokter', label: 'Ruang Periksa Dokter', icon: '🩺', roles: ['Dokter'] },
    { id: 'apotek', label: 'Farmasi / Apotek', icon: '💊', roles: ['Apoteker'] },
    { id: 'kasir', label: 'Kasir & Billing', icon: '💳', roles: ['Kasir'] }
  ];

  let htmlMenu = `<div class="mb-6"><h1 class="text-white text-xl font-bold tracking-wide">Klinik Sehat</h1><p class="text-xs text-emerald-400 mt-1">Staf: ${AppState.user.nama} (${role})</p></div><nav class="space-y-1 flex-1">`;

  menuItems.forEach(item => {
    if (item.roles.includes(role)) {
      htmlMenu += `
        <button onclick="navigateTo('${item.id}')" id="menu-btn-${item.id}" class="w-full flex items-center space-x-3 text-left px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition duration-200 text-sm font-medium">
          <span>${item.icon}</span>
          <span>${item.label}</span>
        </button>
      `;
    }
  });

  htmlMenu += `</nav><div class="mt-auto pt-4 border-t border-slate-700"><button onclick="executeLogout()" class="w-full flex items-center space-x-3 text-left px-4 py-2 rounded-lg text-red-400 hover:bg-red-900/40 hover:text-red-300 transition duration-200 text-sm font-medium"><span>🚪</span><span>Log Out</span></button></div>`;
  
  sidebarNav.innerHTML = htmlMenu;
}

function updateSidebarActiveState(activeId) {
  const buttons = document.querySelectorAll('[id^="menu-btn-"]');
  buttons.forEach(btn => {
    btn.classList.remove('bg-emerald-600', 'text-white');
    btn.classList.add('text-gray-300');
  });
  
  const activeBtn = document.getElementById(`menu-btn-${activeId}`);
  if (activeBtn) {
    activeBtn.classList.remove('text-gray-300');
    activeBtn.classList.add('bg-emerald-600', 'text-white');
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
    // MODIFIKASI: Menyuntikkan token langsung ke URL Parameter sebagai fallback penanganan CORS Web App
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
      
      // Auto routing berdasarkan role setelah login berhasil
      if (AppState.user.role === 'Admin') navigateTo('pendaftaran');
      else if (AppState.user.role === 'Dokter') navigateTo('dokter');
      else if (AppState.user.role === 'Apoteker') navigateTo('apotek');
      else if (AppState.user.role === 'Kasir') navigateTo('kasir');
      else navigateTo('antrian');
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
