/**
 * pasien.js
 * Modul Frontend untuk Pendaftaran Pasien Baru & Check-in Antrean - adminHMD Pure Bootstrap 5 Version
 */

const PasienModule = {
  selectedPasienRM: null,

  /**
   * Merender layout HTML untuk halaman Pendaftaran & Antrean menggunakan komponen asli adminHMD
   * @return {String}
   */
  render: function() {
    return `
      <div class="animate-fadeIn">
        <!-- Alert Notification Box Bawaan Bootstrap -->
        <div id="pasien-alert" class="hidden alert alert-dismissible fade show p-3 rounded-3 mb-4" role="alert"></div>

        <div class="row g-4 text-dark">
          
          <!-- Kiri: Form Registrasi Pasien Baru -->
          <div class="col-12 col-lg-5">
            <div class="panel">
              <div class="panel-header border-b pb-3 mb-4">
                <h3 class="h5 section-title mb-0">
                  <i class="bi bi-pencil-square me-2"></i>Pasien Baru
                </h3>
              </div>
              
              <form id="form-registrasi-pasien" onsubmit="PasienModule.handleRegistrasi(event)">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase tracking-wider text-muted mb-1">NIK (Nomor Induk Kependudukan)</label>
                  <input type="text" id="reg-nik" required maxlength="16" class="form-control">
                </div>
                
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase tracking-wider text-muted mb-1">Nama Lengkap Pasien</label>
                  <input type="text" id="reg-nama" required class="form-control">
                </div>
                
                <div class="row g-3 mb-3">
                  <div class="col-6">
                    <label class="form-label small fw-bold text-uppercase tracking-wider text-muted mb-1">Tgl Lahir</label>
                    <input type="date" id="reg-tgl-lahir" required class="form-control">
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-bold text-uppercase tracking-wider text-muted mb-1">Gender</label>
                    <select id="reg-jk" required class="form-select">
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase tracking-wider text-muted mb-1">Jenis Penjamin</label>
                  <select id="reg-penjamin" required class="form-select">
                    <option value="Umum">Umum (Mandiri)</option>
                    <option value="BPJS">BPJS Kesehatan</option>
                  </select>
                </div>
                
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase tracking-wider text-muted mb-1">Nomor HP</label>
                  <input type="tel" id="reg-hp" required class="form-control">
                </div>
                
                <div class="mb-4">
                  <label class="form-label small fw-bold text-uppercase tracking-wider text-muted mb-1">Alamat Domisili</label>
                  <textarea id="reg-alamat" rows="3" required class="form-control"></textarea>
                </div>
                
                <button type="submit" id="btn-submit-pasien" class="btn btn-primary w-100 py-2.5">
                  <i class="bi bi-person-plus-fill me-2"></i>Daftarkan Pasien Baru
                </button>
              </form>
            </div>
          </div>

          <!-- Kanan: Pencarian Pasien, Check-in Antrean Poli & Monitor Terintegrasi -->
          <div class="col-12 col-lg-7">
            <div class="panel mb-4">
              <div class="panel-header border-b pb-3 mb-4">
                <h3 class="h5 section-title mb-0">
                  <i class="bi bi-search me-2"></i>Cari & Daftarkan ke Antrean Poliklinik
                </h3>
              </div>
              
              <div class="input-group mb-4">
                <input type="text" id="search-keyword" placeholder="Masukkan NIK, Nama, atau Nomor RM Pasien..." class="form-control py-2.5">
                <button onclick="PasienModule.cariPasien()" class="btn btn-dark px-4" type="button">
                  Cari Pasien
                </button>
              </div>

              <!-- Hasil Pencarian Wrapper -->
              <div id="search-results-container" class="hidden border rounded-3 p-4 bg-body-secondary mb-4">
                <div class="border-bottom pb-3 mb-4">
                  <h4 class="small fw-bold text-uppercase tracking-wider text-muted mb-3">Data Pasien Ditemukan:</h4>
                  <div class="row g-3">
                    <div class="col-6 col-md-3">
                      <span class="d-block small text-muted">No. RM</span>
                      <span id="target-no-rm" class="fw-bold text-body">-</span>
                    </div>
                    <div class="col-6 col-md-3">
                      <span class="d-block small text-muted">Nama Pasien</span>
                      <span id="target-nama" class="fw-medium text-body">-</span>
                    </div>
                    <div class="col-6 col-md-3">
                      <span class="d-block small text-muted">NIK</span>
                      <span id="target-nik" class="text-body">-</span>
                    </div>
                    <div class="col-6 col-md-3">
                      <span class="d-block small text-muted">Penjamin</span>
                      <span id="target-penjamin" class="badge text-bg-secondary mt-1">-</span>
                    </div>
                  </div>
                </div>

                <!-- Form Tujuan Antrean -->
                <div class="pt-2">
                  <h4 class="small fw-bold text-uppercase tracking-wider text-muted mb-3">Tentukan Tujuan Poliklinik & Dokter:</h4>
                  <div class="row g-3 mb-4">
                    <div class="col-12 col-md-6">
                      <label class="form-label small text-muted">Poliklinik Tujuan</label>
                      <select id="queue-poli" class="form-select">
                        <option value="POLI-UMUM">Poli Umum (Prefix A)</option>
                        <option value="POLI-GIGI">Poli Gigi (Prefix B)</option>
                        <option value="POLI-ANAK">Poli Anak (Prefix C)</option>
                      </select>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label small text-muted">Dokter Spesialis / Pemeriksa</label>
                      <select id="queue-dokter" class="form-select">
                        <option value="DR-001">dr. Ahmad Faisal</option>
                        <option value="DR-002">drg. Citra Lestari</option>
                        <option value="DR-003">dr. Budi Santoso, Sp.A</option>
                      </select>
                    </div>
                  </div>
                  <div class="d-flex justify-content-end">
                    <button onclick="PasienModule.checkInAntrean()" class="btn btn-success px-4 py-2">
                      <i class="bi bi-clipboard-plus me-2"></i>Masukkan ke Antrean Kerja
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Placeholder jika data kosong -->
              <div id="search-empty-placeholder" class="blank-state py-4 text-center text-muted mb-4 border rounded-3 border-dashed">
                <i class="bi bi-person-vcard fs-2 d-block mb-2 text-secondary opacity-50"></i>
                <p class="mb-0 small px-3">Silakan ketik kata kunci pencarian di atas untuk memproses antrean.</p>
              </div>

              <!-- REAL-TIME MONITOR HARI INI (AMNESTI LAYOUT: STRUKTUR DI DALAM PANEL UTAMA KANAN) -->
              <div class="mt-4 pt-4 border-top">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h4 class="h6 text-uppercase fw-bold text-secondary mb-0" style="font-size: 0.8rem;">
                    <i class="bi bi-calendar-check me-2 text-warning"></i>Pasien Terdaftar Hari Ini
                  </h4>
                  <button onclick="PasienModule.loadLiveMonitor()" class="btn btn-xs btn-outline-secondary px-2 py-0.5" type="button">
                    <i class="bi bi-arrow-clockwise me-1"></i> Sync Data
                  </button>
                </div>
                
                <div class="table-responsive border rounded-3" style="max-height: 250px; overflow-y: auto;">
                  <table class="table table-hover align-middle mb-0 small text-nowrap">
                    <thead class="table-light fw-bold text-muted position-sticky top-0 shadow-sm z-1">
                      <tr>
                        <th class="py-2 px-3">No. RM</th>
                        <th class="py-2">Nama Pasien</th>
                        <th class="py-2">Penjamin</th>
                        <th class="py-2 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody id="pendaftaran-live-monitor-tbody">
                      <tr>
                        <td colspan="4" class="text-center py-4 text-muted">Memuat data monitor pasien hari ini...</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;
  },

  /**
   * Inisialisasi Event Listener pasca DOM komponen di-render
   */
  init: function() {
    this.selectedPasienRM = null;
    this.loadLiveMonitor();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('pasien-alert');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert alert-dismissible fade show p-3 rounded-3 mb-4 d-block ${
      isSuccess ? 'alert-success border-success-subtle text-success' : 'alert-danger border-danger-subtle text-danger'
    }`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => alertBox.className = 'hidden', 5000);
  },

  /**
   * Menarik data realtime antrean pasien hari ini dari Apps Script
   */
  loadLiveMonitor: async function() {
    const tbody = document.getElementById('pendaftaran-live-monitor-tbody');
    if (!tbody) return;

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getPasienPendingHariIni`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data && res.data.length > 0) {
        tbody.innerHTML = res.data.map(pasien => `
          <tr>
            <td class="py-2 px-3 fw-bold font-monospace text-primary">${pasien.no_rm}</td>
            <td class="py-2 fw-medium text-dark">${pasien.nama}</td>
            <td class="py-2"><span class="badge ${pasien.jenis_penjamin === 'BPJS' ? 'text-bg-primary' : 'text-bg-warning text-dark'} border px-2 py-0.5">${pasien.jenis_penjamin || 'Umum'}</span></td>
            <td class="py-2 text-center">
              <button onclick='PasienModule.pilihPasienDariTabel(${JSON.stringify(pasien)})' class="btn btn-xs btn-primary fw-bold py-0.5 px-2">
                <i class="bi bi-box-arrow-up me-1"></i> Alokasi
              </button>
            </td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-4 text-muted small">
              <i class="bi bi-folder-x d-block mb-1 fs-4 text-secondary opacity-50"></i>
              Belum ada pendaftaran pasien hari ini.
            </td>
          </tr>`;
      }
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-danger small">Gagal sinkronisasi antrean monitor.</td></tr>`;
    }
  },

  /**
   * Memilih pasien dari live monitor bawah untuk dialokasikan ke form atas
   */
  pilihPasienDariTabel: function(pasien) {
    this.selectedPasienRM = pasien.no_rm;
    
    document.getElementById('search-keyword').value = pasien.no_rm;
    document.getElementById('target-no-rm').innerText = pasien.no_rm;
    document.getElementById('target-nama').innerText = pasien.nama;
    document.getElementById('target-nik').innerText = pasien.nik || '-';
    
    const penjaminBadge = document.getElementById('target-penjamin');
    if (penjaminBadge) {
      penjaminBadge.innerText = pasien.jenis_penjamin || 'Umum';
      if (pasien.jenis_penjamin === 'BPJS') {
        penjaminBadge.className = "badge text-bg-primary mt-1";
      } else {
        penjaminBadge.className = "badge text-bg-warning text-dark mt-1";
      }
    }

    const emptyPlaceholder = document.getElementById('search-empty-placeholder');
    const resultsContainer = document.getElementById('search-results-container');
    if (emptyPlaceholder) emptyPlaceholder.classList.add('hidden');
    if (resultsContainer) resultsContainer.classList.remove('hidden');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Mengirim data registrasi pasien ke backend GAS
   */
  handleRegistrasi: async function(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-submit-pasien');
    if (!btnSubmit) return;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Memproses...`;

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'tambahPasien',
      nik: document.getElementById('reg-nik').value,
      nama: document.getElementById('reg-nama').value,
      tanggal_lahir: document.getElementById('reg-tgl-lahir').value,
      jenis_kelamin: document.getElementById('reg-jk').value,
      jenis_penjamin: document.getElementById('reg-penjamin').value,
      nomor_hp: document.getElementById('reg-hp').value,
      alamat: document.getElementById('reg-alamat').value
    };

    try {
      const response = await fetch(CONFIG.BASE_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      const res = await response.json();

      if (res.success) {
        this.showAlert(`Sukses! Pasien baru berhasil didaftarkan. Nomor RM: ${res.data.no_rm}`);
        document.getElementById('form-registrasi-pasien').reset();
        
        document.getElementById('search-keyword').value = res.data.no_rm;
        this.cariPasien();
      } else {
        this.showAlert(res.message || "Gagal mendaftarkan pasien.", false);
      }
    } catch (err) {
      this.showAlert("Error: Tidak dapat terhubung ke server backend.", false);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<i class="bi bi-person-plus-fill me-2"></i>Daftarkan Pasien Baru`;
      this.loadLiveMonitor();
    }
  },

  /**
   * Mengambil data pencarian pasien dari API Backend
   */
  cariPasien: async function() {
    const kw = document.getElementById('search-keyword').value.trim();
    const resultsContainer = document.getElementById('search-results-container');
    const emptyPlaceholder = document.getElementById('search-empty-placeholder');

    if (!kw) {
      this.showAlert("Masukkan kata kunci pencarian (NIK/Nama/RM).", false);
      return;
    }

    if (resultsContainer) resultsContainer.classList.add('hidden');
    if (emptyPlaceholder) emptyPlaceholder.innerHTML = `<span class="spinner-border spinner-border-sm text-primary mb-2 d-block mx-auto" role="status"></span>Sedang mencari data pasien...`;

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=cariPasien&keyword=${encodeURIComponent(kw)}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        const pasien = res.data[0];
        
        this.selectedPasienRM = pasien.no_rm;
        document.getElementById('target-no-rm').innerText = pasien.no_rm;
        document.getElementById('target-nama').innerText = pasien.nama;
        document.getElementById('target-nik').innerText = pasien.nik;
        
        const penjaminBadge = document.getElementById('target-penjamin');
        if (penjaminBadge) {
          penjaminBadge.innerText = pasien.jenis_penjamin || pasien.penjamin || 'Umum';
          if (penjaminBadge.innerText === 'BPJS') {
            penjaminBadge.className = "badge text-bg-primary mt-1";
          } else {
            penjaminBadge.className = "badge text-bg-warning text-dark mt-1";
          }
        }

        if (emptyPlaceholder) emptyPlaceholder.classList.add('hidden');
        if (resultsContainer) resultsContainer.classList.remove('hidden');
      } else {
        if (emptyPlaceholder) {
          emptyPlaceholder.innerHTML = `
            <i class="bi bi-exclamation-circle text-danger display-6 d-block mb-2"></i>
            Data pasien tidak ditemukan. Silakan daftarkan sebagai pasien baru di panel sebelah kiri.`;
        }
        this.selectedPasienRM = null;
      }
    } catch (err) {
      if (emptyPlaceholder) emptyPlaceholder.innerHTML = `<i class="bi bi-x-circle text-danger display-6 d-block mb-2"></i>Gagal memproses pencarian pasien.`;
      this.showAlert("Error koneksi data saat mencari pasien.", false);
    }
  },

  /**
   * Check-in pasien terdaftar ke antrean poliklinik tertentu
   */
  checkInAntrean: async function() {
    if (!this.selectedPasienRM) {
      this.showAlert("Silakan cari dan pilih pasien terlebih dahulu.", false);
      return;
    }

    const poli = document.getElementById('queue-poli').value;
    const dokter = document.getElementById('queue-dokter').value;

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'tambahAntrian',
      no_rm: this.selectedPasienRM,
      id_poli: poli,
      id_dokter: dokter
    };

    try {
      const response = await fetch(CONFIG.BASE_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });

      const res = await response.json();

      if (res.success) {
        this.showAlert(`Sukses! Nomor Antrean berhasil dicetak: ${res.data.no_antrian} (${poli})`);
        if (resultsContainer) resultsContainer.classList.add('hidden');
        if (emptyPlaceholder) {
          emptyPlaceholder.classList.remove('hidden');
          emptyPlaceholder.innerHTML = `
            <i class="bi bi-person-vcard display-4 d-block mb-3 text-opacity-25 text-secondary"></i>
            <p class="mb-0">Silakan ketik kata kunci pencarian di atas untuk memproses antrean.</p>`;
        }
        document.getElementById('search-keyword').value = "";
        this.selectedPasienRM = null;
      } else {
        this.showAlert(res.message || "Gagal memproses check-in antrean.", false);
      }
    } catch (err) {
      this.showAlert("Error: Koneksi server bermasalah saat check-in.", false);
    } finally {
      this.loadLiveMonitor();
    }
  }
};

window.PasienModule = PasienModule;
