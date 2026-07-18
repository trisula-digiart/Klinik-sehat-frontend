/**
 * app.js
 * Core SPA Router Engine - Path Customization for assets/js/ Folder Structure
 * Integrated Dashboard Realtime Statistics & Charting Engine
 */

// Pengaman deklarasi ganda variable state SPA
window.AppState = window.AppState || {
  user: null, 
  currentView: 'dashboard'
};
const AppState = window.AppState;

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

  if (!loginSection || !mainLayout || !contentContainer) return;

  loginSection.classList.add('hidden');
  mainLayout.classList.add('hidden');

  if (AppState.currentView === 'login') {
    loginSection.classList.remove('hidden');
    renderLoginView();
    return;
  }

  mainLayout.classList.remove('hidden');
  
  // Sinkronisasi Data Profil Topbar dengan penyesuaian folder images
  const topbarUser = document.getElementById('topbar-username');
  const topbarAv = document.getElementById('topbar-avatar');
  if (topbarUser && AppState.user) topbarUser.innerText = AppState.user.nama;
  if (topbarAv && AppState.user) topbarAv.src = `assets/js/images/avatar/${AppState.user.avatar}`;

  renderSidebarMenu(AppState.user ? AppState.user.role : '');
  updateSidebarActiveState(AppState.currentView);

  // Router Engine & Safe Wrapper Injection
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

        <!-- WIDGET STATISTIK DASHBOARD KLINIK REALTIME SINKRON -->
        <div class="row g-4 mt-2 animate-fadeIn text-dark">
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="panel p-3 bg-white border rounded-3 h-100 d-flex align-items-center">
              <div class="p-3 rounded-circle bg-primary-subtle text-primary me-3">
                <i class="bi bi-people-fill fs-3"></i>
              </div>
              <div>
                <small class="text-muted text-uppercase fw-bold tracking-wider" style="font-size: 0.75rem;">Total Pasien</small>
                <h3 class="fw-bold mb-0 mt-1" id="dash-card-total-pasien">---</h3>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="panel p-3 bg-white border rounded-3 h-100 d-flex align-items-center">
              <div class="p-3 rounded-circle bg-warning-subtle text-warning me-3">
                <i class="bi bi-hourglass-split fs-3"></i>
              </div>
              <div>
                <small class="text-muted text-uppercase fw-bold tracking-wider" style="font-size: 0.75rem;">Antrean Aktif</small>
                <h3 class="fw-bold mb-0 mt-1" id="dash-card-antrean-aktif">---</h3>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="panel p-3 bg-white border rounded-3 h-100 d-flex align-items-center">
              <div class="p-3 rounded-circle bg-success-subtle text-success me-3">
                <i class="bi bi-check2-circle fs-3"></i>
              </div>
              <div>
                <small class="text-muted text-uppercase fw-bold tracking-wider" style="font-size: 0.75rem;">Selesai Periksa</small>
                <h3 class="fw-bold mb-0 mt-1" id="dash-card-selesai-periksa">---</h3>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="panel p-3 bg-white border rounded-3 h-100 d-flex align-items-center">
              <div class="p-3 rounded-circle bg-danger-subtle text-danger me-3">
                <i class="bi bi-cash-stack fs-3"></i>
              </div>
              <div>
                <small class="text-muted text-uppercase fw-bold tracking-wider" style="font-size: 0.75rem;">Omset Tunai Hari Ini</small>
                <h3 class="fw-bold mb-0 mt-1" id="dash-card-omset-tunai">---</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- PANEL MIDDLE: GRAFIK KUNJUNGAN 7 HARI & STATUS ANTREAN POLI HARI INI -->
        <div class="row g-4 mt-2 text-dark">
          <!-- Kiri: Grafik Kunjungan 7 Hari -->
          <div class="col-12 col-lg-7">
            <div class="panel p-4 bg-white border rounded-3 h-100">
              <div class="panel-header border-b pb-3 mb-3">
                <h3 class="h6 text-uppercase fw-bold text-secondary mb-0">
                  <i class="bi bi-graph-up-arrow me-2 text-primary"></i>Tren Kunjungan Pasien (7 Hari Terakhir)
                </h3>
              </div>
              <div style="position: relative; height: 230px; width: 100%;">
                <canvas id="dash-chart-kunjungan"></canvas>
              </div>
            </div>
          </div>

          <!-- Kanan: Status Antrean Poliklinik Hari Ini -->
          <div class="col-12 col-lg-5">
            <div class="panel p-4 bg-white border rounded-3 h-100">
              <div class="panel-header border-b pb-3 mb-3">
                <h3 class="h6 text-uppercase fw-bold text-secondary mb-0">
                  <i class="bi bi-clipboard2-pulse me-2 text-info"></i>Status Antrian Poliklinik Hari Ini
                </h3>
              </div>
              <div class="list-group list-group-flush small">
                <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2.5">
                  <div>
                    <strong class="d-block">Poli Umum</strong>
                    <span class="text-muted style-code">Prefix Kode Antrean A</span>
                  </div>
                  <span class="badge bg-primary rounded-pill px-3 py-2" id="dash-poli-umum">0 Pasien</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2.5">
                  <div>
                    <strong class="d-block">Poli Gigi</strong>
                    <span class="text-muted style-code">Prefix Kode Antrean B</span>
                  </div>
                  <span class="badge bg-warning text-dark rounded-pill px-3 py-2" id="dash-poli-gigi">0 Pasien</span>
                </div>
                <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-2.5">
                  <div>
                    <strong class="d-block">Poli Anak / KIA</strong>
                    <span class="text-muted style-code">Prefix Kode Antrean C</span>
                  </div>
                  <span class="badge bg-success rounded-pill px-3 py-2" id="dash-poli-anak">0 Pasien</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PANEL BAWAH: JADWAL DOKTER HARI INI & STATUS OPERASIONAL -->
        <div class="row g-4 mt-2 text-dark">
          <div class="col-12">
            <div class="panel p-4 bg-white border rounded-3">
              <div class="panel-header border-b pb-3 mb-3">
                <h3 class="h6 text-uppercase fw-bold text-secondary mb-0">
                  <i class="bi bi-calendar3 me-2 text-success"></i>Jadwal Dokter Bertugas Hari Ini
                </h3>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 small text-nowrap">
                  <thead class="table-light">
                    <tr>
                      <th>Nama Dokter</th>
                      <th>Spesialisasi</th>
                      <th>Jam Operasional Shift</th>
                      <th class="text-center">Status Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody id="dash-tbody-jadwal-dokter">
                    <tr>
                      <td colspan="4" class="text-center text-muted py-3">Memuat informasi jadwal dokter...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="panel mt-4 bg-light text-dark">
          <div class="panel-header mb-2"><h2 class="h5 mb-0 section-title" style="font-size:0.9rem;"><span>Status Operasional Sistem</span></h2></div>
          <p class="text-muted mb-0 small">Seluruh modul inti SIMRS v3.0 terhubung sukses dengan Google Apps Script Cloud Engine. Gunakan bar menu navigasi di sebelah kiri untuk memproses data operasional poliklinik secara realtime.</p>
        </div>`;
      
      // Trigger asinkronus fetch data sinkronisasi dashboard riil & pembuatan grafik
      loadDashboardData();
      break;

    case 'pendaftaran':
      wrapModuleContent("Pendaftaran Pasien", "bi-person-plus", "Manajemen data sosial pasien baru dan lama.", window.PasienModule);
      break;

    case 'antrian':
      wrapModuleContent("Antrian Pasien", "bi-clipboard-check", "Monitoring antrean loket pendaftaran, poliklinik, dan kasir.", window.AntrianModule);
      break;

    case 'rekam_medis':
      wrapModuleContent("Rekam Medis", "bi-journal-medical", "Berkas digital rekam medis pasien terintegrasi.", window.RekamMedisModule);
      break;
      
    case 'pemeriksaan':
      wrapModuleContent("Pemeriksaan", "bi-activity", "Ruang periksa dokter, pencatatan diagnosa, dan terapi SOAP.", window.PemeriksaanModule);
      break;

    case 'apotek':
      wrapModuleContent("Apotek / Obat", "bi-capsule", "Pemrosesan e-resep, racikan obat, dan kartu stok depo farmasi.", window.ApotekModule);
      break;

    case 'pembayaran':
      wrapModuleContent("Pembayaran", "bi-credit-card", "Kwitansi transaksi kasir, rincian biaya tindakan, dan cetak nota.", window.KasirModule);
      break;

    case 'laporan':
      wrapModuleContent("Laporan", "bi-bar-chart-line", "Pelaporan kunjungan pasien dan rekonsiliasi kasir harian.", window.LaporanModule);
      break;

    case 'jadwal_dokter':
      wrapModuleContent("Jadwal Dokter", "bi-calendar3", "Manajemen shift dokter dan kuota pendaftaran harian.", window.JadwalDokterModule);
      break;

    case 'pengguna':
      wrapModuleContent("Pengguna", "bi-people", "Manajemen otorisasi akun personil klinik.", window.PenggunaModule);
      break;

    case 'pengaturan':
      wrapModuleContent("Pengaturan", "bi-gear", "Konfigurasi parameter dasar dan integrasi sistem server.", window.PengaturanModule);
      break;

    default:
      contentContainer.innerHTML = `<div class="alert alert-danger">Error: View '${AppState.currentView}' tidak valid.</div>`;
  }
}

/**
 * FUNGSI AJAX CORE ENGINE: Sinkronisasi Data Riil & Grafik Dashboard
 */
async function loadDashboardData() {
  try {
    const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getDashboardData`;
    const response = await fetch(url, { method: 'GET', mode: 'cors' });
    const res = await response.json();

    if (res.success && res.data) {
      const d = res.data;

      // 1. Inject Data Riil Info Cards
      document.getElementById('dash-card-total-pasien').innerText = Number(d.cards.total_pasien).toLocaleString('id-ID');
      document.getElementById('dash-card-antrean-aktif').innerText = `${d.cards.antrean_aktif} Pasien`;
      document.getElementById('dash-card-selesai-periksa').innerText = `${d.cards.selesai_periksa} Kasus`;
      document.getElementById('dash-card-omset-tunai').innerText = "Rp " + (d.cards.omset_tunai / 1000).toLocaleString('id-ID', {maximumFractionDigits:1}) + "k";

      // 2. Inject Ringkasan Antrean Poliklinik
      document.getElementById('dash-poli-umum').innerText = `${d.poliklinik.umum} Pasien`;
      document.getElementById('dash-poli-gigi').innerText = `${d.poliklinik.gigi} Pasien`;
      document.getElementById('dash-poli-anak').innerText = `${d.poliklinik.anak} Pasien`;

      // 3. Inject Tabel Jadwal Dokter Hari Ini
      const tbodyDokter = document.getElementById('dash-tbody-jadwal-dokter');
      if (tbodyDokter && d.jadwal_dokter.length > 0) {
        tbodyDokter.innerHTML = d.jadwal_dokter.map(dok => `
          <tr>
            <td class="fw-bold text-dark"><i class="bi bi-person-badge me-2 text-primary"></i>${dok.nama}</td>
            <td><span class="badge bg-light text-dark border px-2 py-1">${dok.spesialisasi}</span></td>
            <td class="font-monospace">${dok.jam_kerja}</td>
            <td class="text-center"><span class="badge text-bg-success px-2 py-1"><i class="bi bi-check-circle me-1"></i>${dok.status || 'Bertugas'}</span></td>
          </tr>
        `).join('');
      }

      // 4. Inisialisasi Visual Grafik Realtime Menggunakan Chart.js
      const ctx = document.getElementById('dash-chart-kunjungan');
      if (ctx && window.Chart) {
        // Hancurkan objek chart lama jika ada re-render SPA untuk mencegah memori bocor
        if (window.myDashboardChartInstance) {
          window.myDashboardChartInstance.destroy();
        }

        window.myDashboardChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: d.chart.labels,
            datasets: [{
              label: 'Jumlah Kunjungan Pasien',
              data: d.chart.datasets,
              borderColor: '#0d6efd',
              backgroundColor: 'rgba(13, 110, 253, 0.05)',
              borderWidth: 3,
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#0d6efd',
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1, color: '#6c757d' },
                grid: { borderDash: [5, 5] }
              },
              x: {
                ticks: { color: '#6c757d' },
                grid: { display: false }
              }
            }
          }
        });
      }
    }
  } catch (error) {
    console.error("Gagal sinkronisasi data dashboard realtime:", error);
  }
}

function wrapModuleContent(title, iconClass, description, moduleObject) {
  const contentContainer = document.getElementById('main-content-stream');
  if (!contentContainer) return;
  
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
    contentContainer.innerHTML = headerHtml + `<div class="mt-4">${moduleObject.render()}</div>`;
    if (typeof moduleObject.init === 'function') moduleObject.init();
  } else {
    contentContainer.innerHTML = headerHtml + `
      <div class="panel mt-4">
        <div class="blank-state py-5 text-center">
          <h2 class="h5 mb-2">${title} Belum Dimuat</h2>
          <p class="text-muted mb-0">File JavaScript pendukung modul ini sedang dalam tahap kustomisasi layout template baru.</p>
        </div>
      </div>`;
  }
}

function renderSidebarMenu(role) {
  const sidebarNav = document.getElementById('sidebar-navigation');
  if (!sidebarNav) return;
  
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

  const userAvatar = AppState.user ? (AppState.user.avatar || 'avatar.jpg') : 'avatar.jpg';
  const username = AppState.user ? AppState.user.nama : 'Guest';

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
      <strong>${username}</strong>
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
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

function renderLoginView() {
  const loginSection = document.getElementById('login-section');
  if (!loginSection) return;
  loginSection.innerHTML = `
    <main class="auth-page">
      <section class="auth-card">
        <a class="auth-brand" href="#"><span class="brand-icon"><i class="bi bi-grid-1x2-fill"></i></span><span><strong>Klinik Sehat</strong><small>Sistem Informasi Manajemen Pelayanan Pasien</small></span></a>
        <div class="auth-visual"><img src="assets/js/images/png/dasher-ai.png" alt="Visual"></div>
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

  if (!errorBox || !btnSubmit) return;

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
      
      localStorage.setItem('simrs_user_session', JSON.stringify(AppState.user));
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
  localStorage.removeItem('simrs_user_session');
  navigateTo('login');
}

window.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('.sidebar-toggle');
    const backdrop = e.target.closest('[data-sidebar-close]');
    const shell = document.getElementById('main-layout');
    
    if (toggleBtn || backdrop) {
      if (shell) {
        shell.classList.toggle('sidebar-open');
      }
    }

    const themeBtn = e.target.closest('[data-theme-toggle]');
    if (themeBtn) {
      document.body.classList.toggle('dark-theme');
      const icon = themeBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('bi-moon-stars');
        icon.classList.toggle('bi-sun');
      }
    }
  });

  const savedSession = localStorage.getItem('simrs_user_session');
  if (savedSession) {
    try {
      AppState.user = JSON.parse(savedSession);
      renderLayout();
    } catch (e) {
      localStorage.removeItem('simrs_user_session');
      navigateTo('login');
    }
  } else {
    navigateTo('login');
  }
});
