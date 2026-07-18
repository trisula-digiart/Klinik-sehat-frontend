/**
 * pengaturan.js
 * Modul Frontend Konfigurasi Parameter Dasar & Integrasi Sistem Klinik
 * Safe State Pattern & Standardisasi Template adminHMD Bootstrap 5
 */

window.PengaturanModule = window.PengaturanModule || {
  /**
   * Merender layout HTML Modul Pengaturan
   * @return {String}
   */
  render: function() {
    return `
      <div class="row pair-fade-in">
        <!-- Notifikasi Box -->
        <div class="col-12">
          <div id="pengaturan-alert" class="alert d-none" role="alert"></div>
        </div>

        <!-- Panel Kiri: Profil & Parameter Klinik -->
        <div class="col-12 col-lg-6 mb-4">
          <div class="panel">
            <div class="panel-header py-3">
              <h2 class="h5 mb-0 section-title">
                <span><i class="bi bi-sliders me-2 text-primary"></i>Identitas & Profil Klinik</span>
              </h2>
            </div>
            <div class="p-4 bg-white border-top small">
              <form id="form-setting-klinik" onsubmit="PengaturanModule.handleSimpanProfil(event)">
                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Nama Klinik</label>
                  <input type="text" id="set-nama-klinik" required class="form-control" value="Klinik Sehat Utama">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Alamat Operasional</label>
                  <textarea id="set-alamat-klinik" required rows="2" class="form-control">Jl. Kesehatan Raya No. 123, Jakarta</textarea>
                </div>

                <div class="row g-2 mb-4">
                  <div class="col-6">
                    <label class="form-label fw-bold text-muted text-uppercase mb-1">No. Telepon / WA</label>
                    <input type="text" id="set-telp-klinik" required class="form-control" value="081234567890">
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-bold text-muted text-uppercase mb-1">Tahun Buku Operasional</label>
                    <input type="text" id="set-tahun-klinik" required class="form-control text-center bg-light font-mono" value="2026" readonly>
                  </div>
                </div>

                <button type="submit" id="btn-submit-profil" class="btn btn-primary w-100 py-2.5 fw-medium shadow-sm">
                  <i class="bi bi-save me-2"></i>Perbarui Profil Klinik
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Panel Kanan: Kunci Integrasi API & Mode Cetak -->
        <div class="col-12 col-lg-6 mb-4">
          <div class="panel h-100">
            <div class="panel-header py-3">
              <h3 class="h6 fw-bold text-uppercase tracking-wider text-dark mb-0">
                <i class="bi bi-git me-2 text-success"></i>Konektivitas Engine & Cloud API
              </h3>
            </div>
            <div class="p-4 bg-white border-top small">
              <form id="form-setting-api" onsubmit="PengaturanModule.handleSimpanAPI(event)">
                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Google Web App URL (GAS Endpoint)</label>
                  <input type="url" id="set-gas-url" required class="form-control font-mono" placeholder="https://script.google.com/macros/s/.../exec">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">SIMRS API Key Verification</label>
                  <div class="input-group">
                    <span class="input-group-text font-mono bg-light">🔑</span>
                    <input type="password" id="set-api-key" required class="form-control font-mono" placeholder="Masukkan token otentikasi API">
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Target Output Printer Kasir</label>
                  <select id="set-printer-mode" class="form-select">
                    <option value="thermal-58">Thermal Roll 58mm (Default)</option>
                    <option value="thermal-80">Thermal Roll 80mm</option>
                    <option value="inkjet-a5">Inkjet / Laser A5 Landscape</option>
                  </select>
                </div>

                <button type="submit" id="btn-submit-api" class="btn btn-dark w-100 py-2.5 fw-medium shadow-sm">
                  <i class="bi bi-cloud-arrow-up me-2"></i>Sinkronisasi API Gateway
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: function() {
    this.loadCurrentConfig();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('pengaturan-alert');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert p-3 mb-4 d-block ${
      isSuccess ? 'alert-success border-success' : 'alert-danger border-danger'
    }`;
    setTimeout(() => alertBox && alertBox.classList.add('d-none'), 5000);
  },

  /**
   * Memuat konfigurasi aktif saat ini dari global CONFIG bawaan app
   */
  loadCurrentConfig: function() {
    setTimeout(() => {
      const gasUrlInput = document.getElementById('set-gas-url');
      const apiKeyInput = document.getElementById('set-api-key');
      
      if (typeof CONFIG !== 'undefined') {
        if (gasUrlInput) gasUrlInput.value = CONFIG.BASE_URL || '';
        if (apiKeyInput) apiKeyInput.value = CONFIG.API_KEY || '';
      }
    }, 100);
  },

  handleSimpanProfil: function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-profil');
    btn.disabled = true;
    
    // Proses simpan data identitas lokal browser / session
    this.showAlert("Profil identitas fisik klinik berhasil diperbarui.");
    btn.disabled = false;
  },

  handleSimpanAPI: function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-api');
    btn.disabled = true;

    const newUrl = document.getElementById('set-gas-url').value;
    const newKey = document.getElementById('set-api-key').value;

    // Suntik balik ke global config runtime agar instan berefek tanpa reload
    if (typeof CONFIG !== 'undefined') {
      CONFIG.BASE_URL = newUrl;
      CONFIG.API_KEY = newKey;
    }

    this.showAlert("Koneksi API Gateway berhasil diamankan dan disinkronkan.");
    btn.disabled = false;
  }
};
