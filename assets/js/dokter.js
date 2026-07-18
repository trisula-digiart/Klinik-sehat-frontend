/**
 * dokter.js
 * Modul Frontend untuk Ruang Periksa Dokter (SOAP Entry, Riwayat RM Split-Screen, & E-Resep) - adminHMD Pure Bootstrap 5 Version
 */

const DokterModule = {
  // State lokal untuk melacak pasien aktif yang sedang diperiksa
  activeAntrian: null,
  resepDraft: [],

  /**
   * Merender layout HTML dengan pendekatan Split-Screen murni Bootstrap 5 template adminHMD
   * @return {String}
   */
  render: function() {
    return `
      <div class="animate-fadeIn">
        <!-- Notifikasi Box -->
        <div id="dokter-alert" class="hidden alert alert-dismissible fade show p-3 rounded-3 mb-4" role="alert"></div>

        <!-- Tombol Aksi Pilih Pasien dari Antrean Aktif -->
        <div class="panel mb-4">
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <span class="small fw-medium text-muted">
              <i class="bi bi-info-circle-fill text-primary me-2"></i>Tekan tombol di samping untuk memuat pasien berstatus 'Pemeriksaan'
            </span>
            <button onclick="DokterModule.muatPasienPeriksa()" class="btn btn-dark btn-sm px-3 py-2">
              <i class="bi bi-arrow-clockwise me-1"></i>Ambil Pasien Aktif
            </button>
          </div>
        </div>

        <!-- Workspace Utama: Split Screen Row -->
        <div class="row g-4 align-items-start">
          
          <!-- PANEL KIRI: Riwayat Rekam Medis Pasien (Medical Record History) -->
          <div class="col-12 col-lg-5">
            <div class="panel" style="height: 700px; display: flex; flex-direction: column;">
              <div class="panel-header border-b pb-3 mb-3">
                <h3 class="h6 section-title mb-0">
                  <i class="bi bi-journal-text me-2"></i>Histori Rekam Medis Pasien
                </h3>
              </div>
              <div id="panel-riwayat-rm" class="flex-grow-1 overflow-y-auto pe-1 custom-scrollbar text-muted small">
                <div class="blank-state py-5 text-center my-auto mx-auto">
                  <i class="bi bi-folder-x display-5 d-block mb-2 text-opacity-25 text-secondary"></i>
                  <span class="italic text-muted">Belum ada pasien aktif yang dipilih.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- PANEL KANAN: Form Entry SOAP & E-Resep -->
          <div class="col-12 col-lg-7">
            <div class="panel" style="height: 700px; display: flex; flex-direction: column;">
              <div class="panel-header border-b pb-3 mb-3">
                <h3 class="h6 section-title mb-0">
                  <i class="bi bi-heart-pulse me-2"></i>Input Rekam Medis Baru (SOAP)
                </h3>
              </div>
              
              <form id="form-soap-dokter" onsubmit="DokterModule.handleSimpanSOAP(event)" class="flex-grow-1 overflow-y-auto pe-1 custom-scrollbar small" style="overflow-x: hidden;">
                
                <!-- Sub-section 1: Tanda Vital (Objective Data) -->
                <div class="border rounded-3 p-3 bg-body-secondary mb-4">
                  <h4 class="small fw-bold text-uppercase tracking-wider text-muted mb-3 border-bottom pb-2">1. Pemeriksaan Fisik & Tanda Vital (Objective)</h4>
                  <div class="row g-3">
                    <div class="col-6 col-sm-4">
                      <label class="form-label small text-muted mb-1">Tekanan Darah (mmHg)</label>
                      <input type="text" id="soap-td" placeholder="120/80" class="form-control form-control-sm text-center">
                    </div>
                    <div class="col-6 col-sm-4">
                      <label class="form-label small text-muted mb-1">Nadi (x/menit)</label>
                      <input type="text" id="soap-nadi" placeholder="80" class="form-control form-control-sm text-center">
                    </div>
                    <div class="col-6 col-sm-4">
                      <label class="form-label small text-muted mb-1">Suhu Tubuh (°C)</label>
                      <input type="text" id="soap-suhu" placeholder="36.5" class="form-control form-control-sm text-center">
                    </div>
                    <div class="col-6 col-sm-4">
                      <label class="form-label small text-muted mb-1">Berat Badan (kg)</label>
                      <input type="text" id="soap-bb" placeholder="65" class="form-control form-control-sm text-center">
                    </div>
                    <div class="col-6 col-sm-4">
                      <label class="form-label small text-muted mb-1">Tinggi Badan (cm)</label>
                      <input type="text" id="soap-tb" placeholder="170" class="form-control form-control-sm text-center">
                    </div>
                    <div class="col-6 col-sm-4">
                      <label class="form-label small text-muted mb-1">Saturasi Oksigen (%)</label>
                      <input type="text" id="soap-saturasi" placeholder="98" class="form-control form-control-sm text-center">
                    </div>
                  </div>
                </div>

                <!-- Sub-section 2: Keluhan Utama (Subjective) -->
                <div class="mb-4">
                  <label class="form-label small fw-bold text-uppercase tracking-wider text-muted mb-1">2. Keluhan Utama & Anamnesa (Subjective)</label>
                  <textarea id="soap-keluhan" required rows="3" placeholder="Tuliskan keluhan utama pasien dan anamnesa medis..." class="form-control"></textarea>
                </div>

                <!-- Sub-section 3: Diagnosa & Tindakan (Assessment & Plan) -->
                <div class="row g-3 mb-4">
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-bold text-uppercase tracking-wider text-muted mb-1">3. Diagnosa Utama (ICD-10)</label>
                    <input type="text" id="soap-icd10" required placeholder="Contoh: J00 - Common Cold" class="form-control">
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label small fw-bold text-uppercase tracking-wider text-muted mb-1">4. Tindakan / Terapi Medis</label>
                    <input type="text" id="soap-tindakan" placeholder="Contoh: Nebulisasi, Konseling diet" class="form-control">
                  </div>
                </div>

                <!-- Sub-section 4: E-Resep Elektronik -->
                <div class="border rounded-3 p-3 mb-4 bg-white">
                  <h4 class="small fw-bold text-uppercase tracking-wider text-muted mb-3 border-bottom pb-2">
                    <i class="bi bi-capsule text-primary me-1"></i>Form Peresepan Obat Elektronik (E-Resep)
                  </h4>
                  
                  <div class="row g-2 align-items-end border rounded-3 p-3 bg-body-secondary mb-3">
                    <div class="col-12 col-sm-6">
                      <label class="form-label small text-muted mb-1">Pilih Obat</label>
                      <select id="resep-id-obat" class="form-select form-select-sm">
                        <option value="OB-001">Paracetamol 500mg</option>
                        <option value="OB-002">Amoxicillin 500mg</option>
                        <option value="OB-003">Cetirizine 10mg</option>
                        <option value="OB-004">Ibuprofen 400mg</option>
                      </select>
                    </div>
                    <div class="col-6 col-sm-3">
                      <label class="form-label small text-muted mb-1">Jumlah</label>
                      <input type="number" id="resep-jumlah" min="1" value="10" class="form-control form-control-sm text-center">
                    </div>
                    <div class="col-6 col-sm-3">
                      <button type="button" onclick="DokterModule.tambahItemResep()" class="btn btn-dark btn-sm w-100 py-1.5">
                        <i class="bi bi-plus-lg me-1"></i>Masukkan
                      </button>
                    </div>
                  </div>

                  <!-- Daftar Draft Resep Table -->
                  <div class="table-responsive border rounded-3">
                    <table class="table table-sm table-hover mb-0 text-center align-middle" style="font-size: 0.85rem;">
                      <thead>
                        <tr class="bg-body-secondary text-muted">
                          <th class="p-2 text-start ps-3">Nama Obat</th>
                          <th class="p-2" style="width: 80px;">Qty</th>
                          <th class="p-2" style="width: 60px;">Aksi</th>
                        </tr>
                      </thead>
                      <tbody id="tbody-draft-resep">
                        <tr><td colspan="3" class="text-center p-3 text-muted italic">Belum ada obat dalam resep.</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Submit Panel -->
                <div class="pt-2">
                  <button type="submit" id="btn-submit-soap" class="btn btn-primary w-100 py-3 rounded-3 shadow">
                    <i class="bi bi-cloud-check-fill me-2"></i>Simpan Hasil Pemeriksaan & Selesaikan Periksa
                  </button>
                </div>

              </form>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  init: function() {
    this.resepDraft = [];
    this.activeAntrian = null;
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('dokter-alert');
    alertBox.innerText = message;
    alertBox.className = `alert alert-dismissible fade show p-3 rounded-3 mb-4 d-block ${
      isSuccess ? 'alert-success border-success-subtle text-success' : 'alert-danger border-danger-subtle text-danger'
    }`;
    setTimeout(() => alertBox.className = 'hidden', 5000);
  },

  /**
   * Mengambil data pasien yang status antreannya sedang 'Pemeriksaan' di poli terkait
   */
  muatPasienPeriksa: async function() {
    const badge = document.getElementById('dokter-active-patient-badge');
    badge.innerText = "Memeriksa antrean server...";
    
    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=listAntrianHariIni&id_poli=POLI-UMUM`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        const pasienAktif = res.data.find(a => a.status === 'Pemeriksaan');
        
        if (pasienAktif) {
          this.activeAntrian = pasienAktif;
          badge.className = "px-3 py-2 bg-success-subtle border border-success-subtle rounded-3 text-xs fw-bold text-success";
          badge.innerHTML = `<span class="spinner-grow spinner-grow-sm me-1" role="status"></span>Aktif: ${pasienAktif.no_antrian} - ${pasienAktif.nama_pasien}`;
          
          this.muatRiwayatRM(pasienAktif.no_rm);
          this.resepDraft = [];
          this.renderDraftResepTable();
        } else {
          this.resetWorkspace("Tidak ada pasien berstatus 'Pemeriksaan' di papan antrean.");
        }
      } else {
        this.resetWorkspace("Antrean hari ini kosong.");
      }
    } catch (e) {
      this.resetWorkspace("Gagal memuat pasien aktif.");
      this.showAlert("Error sinkronisasi ruang periksa dokter.", false);
    }
  },

  resetWorkspace: function(msg) {
    this.activeAntrian = null;
    const badge = document.getElementById('dokter-active-patient-badge');
    badge.className = "px-3 py-2 bg-body-secondary border rounded-3 text-xs fw-medium text-muted";
    badge.innerText = "Status: Menunggu Pasien Masuk...";
    document.getElementById('panel-riwayat-rm').innerHTML = `
      <div class="blank-state py-5 text-center my-auto mx-auto">
        <i class="bi bi-folder-x display-5 d-block mb-2 text-opacity-25 text-secondary"></i>
        <span class="italic text-muted">${msg}</span>
      </div>`;
  },

  /**
   * Membaca riwayat rekam medis lama pasien (Split-Screen View)
   */
  muatRiwayatRM: async function(noRM) {
    const container = document.getElementById('panel-riwayat-rm');
    container.innerHTML = `
      <div class="text-center py-4">
        <span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>Menarik berkas rekam medis...
      </div>`;

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getRiwayatRM&no_rm=${noRM}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        container.innerHTML = '';
        res.data.forEach(rm => {
          const tglStr = new Date(rm.tanggal_periksa).toLocaleDateString('id-ID', { dateStyle: 'medium' });
          
          let resepHTML = '<span class="text-muted italic small">Tanpa resep obat</span>';
          if (rm.resep_json && rm.resep_json.length > 0) {
            resepHTML = '<ul class="list-group list-group-flush border rounded-3 mt-1" style="font-size:0.8rem;">';
            rm.resep_json.forEach(o => {
              resepHTML += `<li class="list-group-item bg-light p-2"><i class="bi bi-capsule-pill me-1 text-primary"></i>${o.id_obat} <span class="badge bg-secondary float-end">${o.jumlah} Pcs</span></li>`;
            });
            resepHTML += '</ul>';
          }

          container.innerHTML += `
            <div class="border rounded-3 p-3 mb-3 bg-light">
              <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <span class="fw-bold text-body">${tglStr}</span>
                <span class="badge text-bg-secondary font-mono">${rm.id_rm}</span>
              </div>
              <div class="row g-1 text-center small bg-white border rounded-3 p-2 mb-2 text-muted">
                <div class="col-4 border-end">TD: <span class="fw-bold text-body">${rm.tekanan_darah || '-'}</span></div>
                <div class="col-4 border-end">Suhu: <span class="fw-bold text-body">${rm.suhu || '-'}°C</span></div>
                <div class="col-4">Nadi: <span class="fw-bold text-body">${rm.nadi || '-'}</span></div>
              </div>
              <div class="mb-2">
                <span class="d-block small fw-bold text-uppercase tracking-wider text-muted" style="font-size:0.7rem;">Anamnesa & Keluhan:</span>
                <p class="mb-0 text-body fw-medium mt-0.5">${rm.keluhan_utama}</p>
              </div>
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <span class="d-block small fw-bold text-uppercase tracking-wider text-muted" style="font-size:0.7rem;">ICD-10 Diagnosa:</span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle mt-0.5">${rm.diagnosa_icd10}</span>
                </div>
                <div class="col-6">
                  <span class="d-block small fw-bold text-uppercase tracking-wider text-muted" style="font-size:0.7rem;">Tindakan Klinik:</span>
                  <span class="text-body d-block mt-0.5">${rm.tindakan || '-'}</span>
                </div>
              </div>
              <div class="pt-2 border-top">
                <span class="d-block small fw-bold text-uppercase tracking-wider text-muted mb-1" style="font-size:0.7rem;">E-Resep Terbit:</span>
                ${resepHTML}
              </div>
            </div>
          `;
        });
      } else {
        container.innerHTML = `
          <div class="blank-state py-5 text-center my-auto mx-auto text-muted">
            <i class="bi bi-person-vcard display-5 d-block mb-2 text-opacity-25 text-success"></i>
            <span class="fw-medium text-success d-block mb-1">Pasien Baru Baru</span>
            <span class="small text-muted">Belum memiliki riwayat rekam medis di database.</span>
          </div>`;
      }
    } catch (err) {
      container.innerHTML = `
        <div class="text-center py-5 text-danger small">
          <i class="bi bi-exclamation-triangle-fill d-block display-6 mb-2"></i>Gagal memuat histori rekam medis.
        </div>`;
    }
  },

  /**
   * Menambahkan item obat ke dalam draft e-resep internal JS
   */
  tambahItemResep: function() {
    const selectObat = document.getElementById('resep-id-obat');
    const idObat = selectObat.value;
    const namaObat = selectObat.options[selectObat.selectedIndex].text;
    const jumlah = document.getElementById('resep-jumlah').value;

    if (!jumlah || Number(jumlah) < 1) return;

    const exist = this.resepDraft.find(item => item.id_obat === idObat);
    if (exist) {
      exist.jumlah = Number(exist.jumlah) + Number(jumlah);
    } else {
      this.resepDraft.push({
        id_obat: idObat,
        nama_obat: namaObat,
        jumlah: Number(jumlah)
      });
    }

    this.renderDraftResepTable();
  },

  hapusItemResep: function(idObat) {
    this.resepDraft = this.resepDraft.filter(item => item.id_obat !== idObat);
    this.renderDraftResepTable();
  },

  renderDraftResepTable: function() {
    const tbody = document.getElementById('tbody-draft-resep');
    if (this.resepDraft.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center p-3 text-muted italic">Belum ada obat dalam resep.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    this.resepDraft.forEach(item => {
      tbody.innerHTML += `
        <tr class="transition">
          <td class="p-2 text-start ps-3 fw-medium text-body">${item.nama_obat}</td>
          <td class="p-2 font-bold text-body">${item.jumlah}</td>
          <td class="p-2">
            <button type="button" onclick="DokterModule.hapusItemResep('${item.id_obat}')" class="btn btn-link text-danger btn-sm p-0 m-0 border-0 text-decoration-none fw-bold">✕</button>
          </td>
        </tr>
      `;
    });
  },

  /**
   * Mengirim data entri rekam medis SOAP komplit ke server backend GAS
   */
  handleSimpanSOAP: async function(e) {
    e.preventDefault();

    if (!this.activeAntrian) {
      this.showAlert("Pilih pasien aktif yang diperiksa terlebih dahulu sebelum men-submit.", false);
      return;
    }

    const btn = document.getElementById('btn-submit-soap');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Menyimpan Berkas...`;

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'simpanSOAP',
      no_rm: this.activeAntrian.no_rm,
      id_antrian: this.activeAntrian.id_antrian,
      id_dokter: this.activeAntrian.id_dokter,
      keluhan_utama: document.getElementById('soap-keluhan').value,
      tekanan_darah: document.getElementById('soap-td').value,
      nadi: document.getElementById('soap-nadi').value,
      suhu: document.getElementById('soap-suhu').value,
      berat_badan: document.getElementById('soap-bb').value,
      tinggi_badan: document.getElementById('soap-tb').value,
      saturasi: document.getElementById('soap-saturasi').value,
      diagnosa_icd10: document.getElementById('soap-icd10').value,
      tindakan: document.getElementById('soap-tindakan').value,
      resep_json: this.resepDraft
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
        this.showAlert("Sukses! Data SOAP Rekam Medis pasien berhasil diamankan di database master.");
        document.getElementById('form-soap-dokter').reset();
        this.resepDraft = [];
        this.renderDraftResepTable();
        this.resetWorkspace("Pemeriksaan klinis sebelumnya berhasil diselesaikan.");
      } else {
        this.showAlert(res.message || "Gagal menyimpan rekam medis.", false);
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-cloud-check-fill me-2"></i>Simpan Hasil Pemeriksaan & Selesaikan Periksa`;
      }
    } catch (err) {
      this.showAlert("Error: Gagal menghubungi server backend.", false);
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-cloud-check-fill me-2"></i>Simpan Hasil Pemeriksaan & Selesaikan Periksa`;
    }
  }
};

window.DokterModule = DokterModule;
