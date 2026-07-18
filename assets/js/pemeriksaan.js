/**
 * pemeriksaan.js
 * Modul Frontend Rekam Medis & Pemeriksaan SOAP Dokter - Pure Bootstrap 5 Version
 */

const PemeriksaanModule = {
  // Menyimpan data pasien aktif yang sedang diperiksa di poli ini
  currentPasien: null,

  /**
   * Merender layout HTML halaman Pemeriksaan / SOAP Dokter
   * @return {String}
   */
  render: function() {
    return `
      <div class="animate-fadeIn">
        <!-- Alert Notification Box -->
        <div id="pemeriksaan-alert" class="hidden alert alert-dismissible fade show p-3 rounded-3 mb-4" role="alert"></div>

        <!-- Top Action Bar -->
        <div class="panel p-3 mb-4 bg-body-tertiary rounded-3 border d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center text-muted">
            <i class="bi bi-info-circle-fill text-primary me-2 fs-5"></i>
            <span class="small">Tekan tombol di samping untuk memuat pasien berstatus 'Pemeriksaan' di Poliklinik Anda.</span>
          </div>
          <button onclick="PemeriksaanModule.ambilPasienAktif()" class="btn btn-dark px-4 py-2 fw-semibold">
            <i class="bi bi-arrow-clockwise me-2"></i>Ambil Pasien Aktif
          </button>
        </div>

        <!-- Main Workspace (Muncul hanya jika ada pasien aktif) -->
        <div id="pemeriksaan-workspace" class="hidden row g-4">
          
          <!-- Kiri: Histori Rekam Medis Pasien -->
          <div class="col-12 col-lg-5">
            <div class="panel h-100 p-4 border rounded-3 bg-white">
              <div class="border-bottom pb-3 mb-4">
                <h3 class="h5 section-title mb-0 text-primary">
                  <i class="bi bi-clock-history me-2"></i>Histori Rekam Medis Pasien
                </h3>
              </div>
              
              <!-- Container Riwayat -->
              <div id="rm-history-container" class="overflow-y-auto" style="max-height: 550px;">
                <!-- Diisi via JavaScript -->
              </div>
            </div>
          </div>

          <!-- Kanan: Form Input SOAP Baru -->
          <div class="col-12 col-lg-7">
            <div class="panel p-4 border rounded-3 bg-white">
              <div class="border-bottom pb-3 mb-4">
                <h3 class="h5 section-title mb-0 text-success">
                  <i class="bi bi-file-earmark-medical me-2"></i>Input Rekam Medis Baru (SOAP)
                </h3>
              </div>

              <!-- Ringkasan Profil Pasien yang Sedang Diperiksa -->
              <div class="alert alert-success border-success-subtle p-3 mb-4 rounded-3 text-dark">
                <div class="row g-2 small">
                  <div class="col-6 col-md-3"><strong>No. RM:</strong> <span id="pasien-aktif-rm">-</span></div>
                  <div class="col-6 col-md-4"><strong>Nama:</strong> <span id="pasien-aktif-nama">-</span></div>
                  <div class="col-6 col-md-3"><strong>Penjamin:</strong> <span id="pasien-aktif-penjamin" class="badge bg-secondary">-</span></div>
                  <div class="col-6 col-md-2"><strong>Gender:</strong> <span id="pasien-aktif-jk">-</span></div>
                </div>
              </div>
              
              <form id="form-soap-dokter" onsubmit="PemeriksaanModule.simpanSOAP(event)">
                
                <!-- 1. VITAL SIGNS (OBJECTIVE) -->
                <h6 class="text-uppercase tracking-wider text-muted fw-bold small mb-3 border-bottom pb-1">1. Pemeriksaan Fisik & Tanda Vital (Objective)</h6>
                <div class="row g-3 mb-4">
                  <div class="col-6 col-md-4">
                    <label class="form-label small mb-1 text-muted">Tekanan Darah (mmHg)</label>
                    <input type="text" id="soap-td" placeholder="120/80" class="form-control">
                  </div>
                  <div class="col-6 col-md-4">
                    <label class="form-label small mb-1 text-muted">Nadi (x/menit)</label>
                    <input type="number" id="soap-nadi" placeholder="80" class="form-control">
                  </div>
                  <div class="col-6 col-md-4">
                    <label class="form-label small mb-1 text-muted">Suhu Tubuh (°C)</label>
                    <input type="text" id="soap-suhu" placeholder="36.5" class="form-control">
                  </div>
                  <div class="col-6 col-md-4">
                    <label class="form-label small mb-1 text-muted">Berat Badan (kg)</label>
                    <input type="number" id="soap-bb" placeholder="65" class="form-control">
                  </div>
                  <div class="col-6 col-md-4">
                    <label class="form-label small mb-1 text-muted">Tinggi Badan (cm)</label>
                    <input type="number" id="soap-tb" placeholder="170" class="form-control">
                  </div>
                  <div class="col-6 col-md-4">
                    <label class="form-label small mb-1 text-muted">Saturasi Oksigen (%)</label>
                    <input type="number" id="soap-saturasi" placeholder="98" class="form-control">
                  </div>
                </div>
                
                <!-- 2. ANAMNESA (SUBJECTIVE) -->
                <h6 class="text-uppercase tracking-wider text-muted fw-bold small mb-3 border-bottom pb-1">2. Keluhan Utama & Anamnesa (Subjective)</h6>
                <div class="mb-4">
                  <textarea id="soap-keluhan" rows="3" required placeholder="Tuliskan keluhan utama pasien dan anamnesa medis secara detail..." class="form-control"></textarea>
                </div>
                
                <!-- 3. DIAGNOSA & TINDAKAN (ASSESSMENT & PLAN) -->
                <div class="row g-3 mb-4">
                  <div class="col-12 col-md-6">
                    <h6 class="text-uppercase tracking-wider text-muted fw-bold small mb-2 border-bottom pb-1">3. Diagnosa Utama (ICD-10)</h6>
                    <input type="text" id="soap-icd10" required placeholder="Contoh: J00 - Common Cold" class="form-control">
                  </div>
                  <div class="col-12 col-md-6">
                    <h6 class="text-uppercase tracking-wider text-muted fw-bold small mb-2 border-bottom pb-1">4. Tindakan / Terapi Medis</h6>
                    <input type="text" id="soap-tindakan" placeholder="Contoh: Nebulisasi, Konseling diet" class="form-control">
                  </div>
                </div>
                
                <!-- 4. E-RESEP ELEKTRONIK -->
                <h6 class="text-uppercase tracking-wider text-muted fw-bold small mb-3 border-bottom pb-1">
                  <i class="bi bi-capsule me-1 text-danger"></i>Form Peresepan Obat Elektronik (E-Resep)
                </h6>
                <div class="row g-2 mb-3">
                  <div class="col-7">
                    <select id="resep-obat-select" class="form-select">
                      <!-- Diisi otomatis dari Master Obat -->
                    </select>
                  </div>
                  <div class="col-3">
                    <input type="number" id="resep-jumlah" min="1" placeholder="Jml" class="form-control">
                  </div>
                  <div class="col-2">
                    <button type="button" onclick="PemeriksaanModule.tambahObatKeResep()" class="btn btn-dark w-100">
                      <i class="bi bi-plus-lg"></i>
                    </button>
                  </div>
                </div>

                <!-- Tabel Item Resep Sementara -->
                <div class="table-responsive mb-4 border rounded-3">
                  <table class="table table-striped table-hover align-middle mb-0 text-center small">
                    <thead class="table-dark">
                      <tr>
                        <th>Nama Obat</th>
                        <th style="width: 100px;">Jumlah</th>
                        <th style="width: 80px;">Aksi</th>
                      </tr>
                    </thead>
                    <tbody id="resep-table-body">
                      <tr>
                        <td colspan="3" class="text-muted py-3">Belum ada obat yang diresepkan.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <button type="submit" id="btn-submit-soap" class="btn btn-success w-100 py-2.5 fw-bold">
                  <i class="bi bi-check-circle-fill me-2"></i>Simpan Rekam Medis & Selesaikan Pemeriksaan
                </button>
              </form>
            </div>
          </div>

        </div>

        <!-- Placeholder jika belum ada pasien aktif dipilih -->
        <div id="pemeriksaan-blank-state" class="blank-state py-5 text-center border rounded-3 bg-light text-muted my-4">
          <i class="bi bi-person-x display-4 d-block mb-3 text-opacity-25 text-secondary"></i>
          <p class="mb-0 fw-medium">Belum ada pasien aktif yang dipilih.</p>
          <span class="small text-muted">Klik tombol "Ambil Pasien Aktif" di atas untuk menarik antrean pemeriksaan saat ini.</span>
        </div>
      </div>
    `;
  },

  resepItems: [], // Array menampung obat yang diresepkan dokter sementara
  masterObat: [], // Data obat dari sheet master database obat

  init: function() {
    this.resepItems = [];
    this.currentPasien = null;
    this.loadMasterObat();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('pemeriksaan-alert');
    if(!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert alert-dismissible fade show p-3 rounded-3 mb-4 d-block ${
      isSuccess ? 'alert-success border-success-subtle text-success' : 'alert-danger border-danger-subtle text-danger'
    }`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { if(alertBox) alertBox.className = 'hidden'; }, 5000);
  },

  /**
   * Mengambil data master obat untuk pilihan e-resep harian
   */
  loadMasterObat: async function() {
    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getObat`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();
      if (res.success) {
        this.masterObat = res.data;
        this.populateObatDropdown();
      }
    } catch (err) {
      console.error("Gagal memuat master data obat:", err);
    }
  },

  populateObatDropdown: function() {
    const select = document.getElementById('resep-obat-select');
    if (!select) return;
    if (this.masterObat.length === 0) {
      select.innerHTML = `<option value="">Master obat kosong / belum siap</option>`;
      return;
    }
    select.innerHTML = this.masterObat.map(o => `<option value="${o.id_obat}">${o.nama_obat} (Stok: ${o.stok_aktual})</option>`).join('');
  },

  /**
   * Alur Utama: Menarik antrean hari ini dan menyaring pasien dengan status 'Pemeriksaan'
   */
  ambilPasienAktif: async function() {
    const workspace = document.getElementById('pemeriksaan-workspace');
    const blankState = document.getElementById('pemeriksaan-blank-state');

    try {
      // Panggil daftar antrean hari ini secara global tanpa filter poli (menarik data reaktif backend)
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=listAntrianHariIni`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        // Cari pasien pertama dalam array antrean harian yang statusnya tepat berbunyi 'Pemeriksaan'
        const pasienPemeriksaan = res.data.find(item => item.status === 'Pemeriksaan');

        if (pasienPemeriksaan) {
          this.currentPasien = pasienPemeriksaan;
          
          // Tampilkan workspace UI & Sembunyikan blank state
          blankState.classList.add('hidden');
          workspace.classList.remove('hidden');

          // Isi Profil Pasien ke Atas Form SOAP
          document.getElementById('pasien-aktif-rm').innerText = pasienPemeriksaan.no_rm;
          document.getElementById('pasien-aktif-nama').innerText = pasienPemeriksaan.nama_pasien;
          document.getElementById('pasien-aktif-penjamin').innerText = pasienPemeriksaan.jenis_penjamin || 'Umum';
          document.getElementById('pasien-aktif-jk').innerText = pasienPemeriksaan.jenis_kelamin || '-';

          this.showAlert(`Berhasil memuat data pemeriksaan aktif: ${pasienPemeriksaan.nama_pasien}`);
          
          // Tarik rekam jejak histori medis masa lalu pasien ini
          this.loadRiwayatMedis(pasienPemeriksaan.no_rm);
        } else {
          this.showAlert("Tidak ditemukan pasien yang berada dalam status 'Pemeriksaan' saat ini.", false);
          this.resetWorkspace();
        }
      } else {
        this.showAlert("Belum ada antrean masuk pada hari ini.", false);
        this.resetWorkspace();
      }
    } catch (err) {
      this.showAlert("Error: Gagal menyinkronkan data pasien aktif dari server backend.", false);
    }
  },

  resetWorkspace: function() {
    this.currentPasien = null;
    this.resepItems = [];
    document.getElementById('pemeriksaan-workspace').classList.add('hidden');
    document.getElementById('pemeriksaan-blank-state').classList.remove('hidden');
  },

  /**
   * Menarik data riwayat rekam medis masa lalu pasien dari backend
   */
  loadRiwayatMedis: async function(noRM) {
    const container = document.getElementById('rm-history-container');
    container.innerHTML = `<span class="spinner-border spinner-border-sm text-primary d-block mx-auto my-3" role="status"></span>`;

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getRiwayatRM&no_rm=${encodeURIComponent(noRM)}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        container.innerHTML = res.data.map(rm => `
          <div class="card mb-3 shadow-sm border border-light-subtle rounded-3">
            <div class="card-header bg-light py-2 small fw-semibold d-flex justify-content-between">
              <span><i class="bi bi-calendar3 me-1 text-muted"></i>${String(rm.tanggal_periksa).substring(0, 10)}</span>
              <span class="text-secondary">ID: ${rm.id_rm}</span>
            </div>
            <div class="card-body p-3 text-start small">
              <p class="mb-1"><strong>Keluhan:</strong> ${rm.keluhan_utama}</p>
              <p class="mb-1"><strong>Diagnosa (ICD-10):</strong> <span class="badge text-bg-info">${rm.diagnosa_icd10}</span></p>
              <p class="mb-1"><strong>Tindakan:</strong> ${rm.tindakan || '-'}</p>
              <div class="mt-2 pt-2 border-top">
                <span class="d-block text-uppercase text-muted fw-bold style-card" style="font-size:10px;">Vital Signs:</span>
                <span class="text-muted">TD: ${rm.tekanan_darah || '-'} mmHg | Suhu: ${rm.suhu || '-'} °C | Nadi: ${rm.nadi || '-'} /mnt | BB: ${rm.berat_badan || '-'} kg</span>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = `
          <div class="text-center text-muted py-4">
            <i class="bi bi-folder-symlink display-6 d-block mb-2 opacity-50"></i>
            <span class="small">Pasien baru. Belum memiliki histori kunjungan medis sebelumnya.</span>
          </div>`;
      }
    } catch (err) {
      container.innerHTML = `<div class="text-danger small text-center py-3">Gagal memuat histori medis.</div>`;
    }
  },

  tambahObatKeResep: function() {
    const select = document.getElementById('resep-obat-select');
    const inputJumlah = document.getElementById('resep-jumlah');
    
    const idObat = select.value;
    const jumlah = parseInt(inputJumlah.value, 10);

    if (!idObat || isNaN(jumlah) || jumlah <= 0) {
      alert("Pilih obat dan tentukan jumlah resep secara valid!");
      return;
    }

    const obatObj = this.masterObat.find(o => o.id_obat === idObat);
    if (!obatObj) return;

    // Cek duplikasi di baris list resep sementara
    const adaItem = this.resepItems.find(item => item.id_obat === idObat);
    if (adaItem) {
      adaItem.jumlah += jumlah;
    } else {
      this.resepItems.push({
        id_obat: idObat,
        nama_obat: obatObj.nama_obat,
        jumlah: jumlah
      });
    }

    inputJumlah.value = "";
    this.renderResepTable();
  },

  hapusItemResep: function(index) {
    this.resepItems.splice(index, 1);
    this.renderResepTable();
  },

  renderResepTable: function() {
    const tbody = document.getElementById('resep-table-body');
    if (this.resepItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-muted py-3">Belum ada obat yang diresepkan.</td></tr>`;
      return;
    }

    tbody.innerHTML = this.resepItems.map((item, idx) => `
      <tr>
        <td class="text-start fw-medium">${item.nama_obat}</td>
        <td><span class="badge bg-dark">${item.jumlah} Pcs</span></td>
        <td>
          <button type="button" onclick="PemeriksaanModule.hapusItemResep(${idx})" class="btn btn-outline-danger btn-sm border-0">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Mengirim form SOAP terisi dan menutup sesi pemeriksaan antrean
   */
  simpanSOAP: async function(e) {
    e.preventDefault();
    if (!this.currentPasien) return;

    const btnSubmit = document.getElementById('btn-submit-soap');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Menyimpan Data SOAP...`;

    // Susun payload rekam medis lengkap
    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'simpanSOAP',
      no_rm: this.currentPasien.no_rm,
      id_antrian: this.currentPasien.id_antrian,
      id_dokter: this.currentPasien.id_dokter || 'DR-001',
      keluhan_utama: document.getElementById('soap-keluhan').value,
      tekanan_darah: document.getElementById('soap-td').value,
      nadi: document.getElementById('soap-nadi').value,
      suhu: document.getElementById('soap-suhu').value,
      berat_badan: document.getElementById('soap-bb').value,
      tinggi_badan: document.getElementById('soap-tb').value,
      saturasi: document.getElementById('soap-saturasi').value,
      diagnosa_icd10: document.getElementById('soap-icd10').value,
      tindakan: document.getElementById('soap-tindakan').value,
      resep_json: this.resepItems // Dikirim langsung sebagai array object
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
        this.showAlert(`Sukses! Rekam medis ${res.data.id_rm} berhasil dicatat. Status antrean diperbarui.`);
        document.getElementById('form-soap-dokter').reset();
        this.resetWorkspace();
      } else {
        this.showAlert(res.message || "Gagal menyimpan rekam medis.", false);
      }
    } catch (err) {
      this.showAlert("Error: Putus koneksi saat mengirim data SOAP ke server.", false);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>Simpan Rekam Medis & Selesaikan Pemeriksaan`;
    }
  }
};

window.PemeriksaanModule = PemeriksaanModule;
