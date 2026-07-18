/**
 * pendaftaran.js
 * Modul Frontend Pendaftaran Pasien Baru & Live Queue Monitor Harian
 */

window.PasienModule = window.PasienModule || {
  pasienAktif: null,

  render: function() {
    return `
      <div class="row pair-fade-in">
        <div class="col-12">
          <div id="pendaftaran-alert" class="alert d-none" role="alert"></div>
        </div>

        <!-- PANEL KIRI: Input Form Pendaftaran Pasien Baru -->
        <div class="col-12 col-lg-5 mb-4">
          <div class="card border-0 shadow-sm rounded-3">
            <div class="card-body p-4 bg-white">
              <div class="d-flex align-items-center mb-4">
                <div class="p-2 bg-primary-subtle text-primary rounded-3 me-3">
                  <i class="bi bi-person-plus-fill h5 mb-0"></i>
                </div>
                <h2 class="h5 mb-0 fw-bold text-dark">Pasien Baru</h2>
              </div>
              
              <form id="form-pasien-baru" onsubmit="PasienModule.handleDaftarPasien(event)">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase text-muted">NIK (Nomor Induk Kependudukan)</label>
                  <input type="number" id="reg-nik" class="form-control" required placeholder="Masukkan 16 digit NIK">
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase text-muted">Nama Lengkap Pasien</label>
                  <input type="text" id="reg-nama" class="form-control" required placeholder="Nama sesuai KTP">
                </div>
                <div class="row mb-3">
                  <div class="col-6">
                    <label class="form-label small fw-bold text-uppercase text-muted">Tgl Lahir</label>
                    <input type="date" id="reg-tgllahir" class="form-control" required>
                  </div>
                  <div class="col-6">
                    <label class="form-label small fw-bold text-uppercase text-muted">Gender</label>
                    <select id="reg-gender" class="form-select">
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase text-muted">Jenis Penjamin</label>
                  <select id="reg-penjamin" class="form-select">
                    <option value="Umum (Mandiri)">Umum (Mandiri)</option>
                    <option value="BPJS Kesehatan">BPJS Kesehatan</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase text-muted">Nomor HP</label>
                  <input type="tel" id="reg-hp" class="form-control" required placeholder="Contoh: 0812XXXXXXXX">
                </div>
                <div class="mb-4">
                  <label class="form-label small fw-bold text-uppercase text-muted">Alamat Domisili</label>
                  <textarea id="reg-alamat" class="form-control" rows="3" required placeholder="Alamat lengkap tempat tinggal saat ini"></textarea>
                </div>
                <button type="submit" id="btn-submit-pasien" class="btn btn-primary w-100 py-2.5 fw-bold text-white shadow-sm">
                  <i class="bi bi-person-check me-2"></i>Daftarkan Pasien Baru
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- PANEL KANAN: Cari & Monitor Alokasi Poliklinik Kerja -->
        <div class="col-12 col-lg-7 mb-4">
          <div class="card border-0 shadow-sm rounded-3 bg-white mb-4">
            <div class="card-body p-4">
              <div class="d-flex align-items-center mb-3">
                <div class="p-2 bg-primary-subtle text-primary rounded-3 me-3">
                  <i class="bi bi-search h5 mb-0"></i>
                </div>
                <h2 class="h5 mb-0 fw-bold text-dark">Cari & Daftarkan ke Antrean Poliklinik</h2>
              </div>

              <!-- Bar Pencarian Global -->
              <div class="input-group mb-4 shadow-sm rounded">
                <input type="text" id="pendaftaran-search-key" placeholder="Masukkan NIK, Nama, atau Nomor RM Pasien..." class="form-control form-control-lg">
                <button onclick="PasienModule.cariPasienManual()" class="btn btn-dark fw-bold px-4" type="button">Cari Pasien</button>
              </div>

              <!-- Area Eksplisit / Eksekusi Form Alokasi Poli -->
              <div id="antrean-execution-card" class="d-none border border-primary-subtle rounded-3 p-4 bg-light mb-4 shadow-sm">
                <div class="row g-2 small border-bottom pb-3 mb-3 text-dark">
                  <div class="col-6 col-sm-3">No. RM: <strong class="text-primary d-block font-monospace" id="exc-rm">-</strong></div>
                  <div class="col-6 col-sm-4">Nama Pasien: <strong class="d-block" id="exc-nama">-</strong></div>
                  <div class="col-6 col-sm-3">NIK: <span class="text-secondary d-block font-monospace" id="exc-nik">-</span></div>
                  <div class="col-6 col-sm-2 text-end">
                    <span class="badge bg-primary px-2 py-1" id="exc-penjamin">Umum</span>
                  </div>
                </div>

                <div class="row g-3">
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-bold text-muted">Poliklinik Tujuan</label>
                    <select id="antrean-poli" class="form-select form-select-sm">
                      <option value="Poli Umum">Poli Umum (Prefix A)</option>
                      <option value="Poli Gigi">Poli Gigi (Prefix B)</option>
                      <option value="Poli KIA">Poli KIA (Prefix C)</option>
                    </select>
                  </div>
                  <div class="col-12 col-sm-6">
                    <label class="form-label small fw-bold text-muted">Dokter Pemeriksa</label>
                    <select id="antrean-dokter" class="form-select form-select-sm">
                      <option value="dr. Ahmad Faisal">dr. Ahmad Faisal</option>
                      <option value="drg. Citra Lestari">drg. Citra Lestari</option>
                      <option value="dr. Eka Wijaya">dr. Eka Wijaya</option>
                    </select>
                  </div>
                  <div class="col-12 text-end mt-3">
                    <button onclick="PasienModule.batalEksekusi()" class="btn btn-sm btn-light border me-2 fw-medium px-3">Batal</button>
                    <button onclick="PasienModule.kirimKeAntreanKerja()" id="btn-submit-antrean" class="btn btn-sm btn-success fw-bold px-4 text-white shadow-sm">
                      <i class="bi bi-box-arrow-in-right me-1"></i> Masukkan ke Antrean Kerja
                    </button>
                  </div>
                </div>
              </div>

              <!-- REAL-TIME MONITORING PASIEN PER HARI INI -->
              <div class="mt-4 pt-2 border-top">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h3 class="h6 text-uppercase fw-bold text-secondary mb-0">
                    <i class="bi bi-calendar-check-fill me-2 text-warning"></i>Daftar Pendaftaran Pasien Hari Ini
                  </h3>
                  <button onclick="PasienModule.loadLiveMonitor()" class="btn btn-sm btn-outline-secondary px-3" type="button" title="Refresh Tabel">
                    <i class="bi bi-arrow-clockwise me-1"></i> Sync Data
                  </button>
                </div>
                <div class="table-responsive border rounded-3" style="max-height: 300px; overflow-y: auto;">
                  <table class="table table-hover align-middle mb-0 small text-nowrap">
                    <thead class="table-light fw-bold text-muted position-sticky top-0 shadow-sm z-1">
                      <tr>
                        <th class="py-2.5 px-3">No. RM</th>
                        <th class="py-2.5">Nama Pasien</th>
                        <th class="py-2.5">Penjamin</th>
                        <th class="py-2.5 text-center">Tindakan</th>
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

  init: function() {
    this.pasienAktif = null;
    this.loadLiveMonitor();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('pendaftaran-alert');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert p-3 mb-4 d-block ${isSuccess ? 'alert-success border-success' : 'alert-danger border-danger'}`;
    setTimeout(() => alertBox.classList.add('d-none'), 5000);
  },

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
            <td class="py-2"><span class="badge bg-light text-dark border px-2 py-0.5">${pasien.jenis_penjamin || 'Umum'}</span></td>
            <td class="py-2 text-center">
              <button onclick='PasienModule.pilihPasienDariTabel(${JSON.stringify(pasien)})' class="btn btn-xs btn-primary fw-bold py-0.5 px-2 shadow-xs">
                <i class="bi bi-box-arrow-up me-1"></i> Proses Alokasi
              </button>
            </td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-5 text-muted">
              <i class="bi bi-folder-x h2 d-block mb-2 text-secondary"></i>
              Belum ada pendaftaran pasien untuk hari ini.
            </td>
          </tr>`;
      }
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-danger">Gagal sinkronisasi antrean monitor.</td></tr>`;
    }
  },

  handleDaftarPasien: async function(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-pasien');
    btn.disabled = true;
    btn.innerText = "Mendaftarkan ke Database...";

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'tambahPasien',
      nik: document.getElementById('reg-nik').value.trim(),
      nama: document.getElementById('reg-nama').value.trim(),
      tanggal_lahir: document.getElementById('reg-tgllahir').value,
      jenis_kelamin: document.getElementById('reg-gender').value,
      jenis_penjamin: document.getElementById('reg-penjamin').value,
      nomor_hp: document.getElementById('reg-hp').value.trim(),
      alamat: document.getElementById('reg-alamat').value.trim()
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
        this.showAlert(`Sukses mendaftarkan pasien! RM Baru: ${res.data.no_rm}`);
        document.getElementById('form-pasien-baru').reset();

        const pasienBaru = {
          no_rm: res.data.no_rm,
          nik: payload.nik,
          nama: payload.nama,
          jenis_penjamin: payload.jenis_penjamin
        };
        
        this.pilihPasienDariTabel(pasienBaru);
      } else {
        this.showAlert(res.message || "Gagal menyimpan pasien.", false);
      }
    } catch (e) {
      this.showAlert("Error: Sambungan internet terputus.", false);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-person-check me-2"></i>Daftarkan Pasien Baru`;
      this.loadLiveMonitor();
    }
  },

  pilihPasienDariTabel: function(pasien) {
    this.pasienAktif = pasien;
    
    document.getElementById('pendaftaran-search-key').value = pasien.no_rm;
    document.getElementById('exc-rm').innerText = pasien.no_rm;
    document.getElementById('exc-nama').innerText = pasien.nama;
    document.getElementById('exc-nik').innerText = pasien.nik || '-';
    document.getElementById('exc-penjamin').innerText = pasien.jenis_penjamin || 'Umum';
    
    const exCard = document.getElementById('antrean-execution-card');
    exCard.classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  cariPasienManual: async function() {
    const keyword = document.getElementById('pendaftaran-search-key').value.trim();
    if (!keyword) return alert("Masukkan NIK, Nama, atau No RM untuk mencari!");

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=cariPasien&keyword=${encodeURIComponent(keyword)}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data && res.data.length > 0) {
        const pasien = res.data[0];
        pasien.jenis_penjamin = pasien.jenis_penjamin || pasien.penjamin;
        this.pilihPasienDariTabel(pasien);
      } else {
        alert("Pasien tidak ditemukan di master database.");
      }
    } catch (e) {
      alert("Gagal memproses pencarian pasien.");
    }
  },

  batalEksekusi: function() {
    this.pasienAktif = null;
    document.getElementById('pendaftaran-search-key').value = '';
    document.getElementById('antrean-execution-card').classList.add('d-none');
  },

  kirimKeAntreanKerja: async function() {
    if (!this.pasienAktif) return;

    const btn = document.getElementById('btn-submit-antrean');
    btn.disabled = true;
    btn.innerText = "Memproses...";

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'tambahAntrian',
      no_rm: this.pasienAktif.no_rm,
      id_poli: document.getElementById('antrean-poli').value,
      id_dokter: document.getElementById('antrean-dokter').value
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
        alert(`Sukses! Pasien masuk antrean kerja dengan Nomor Urut: ${res.data.no_antrian}`);
        this.batalEksekusi();
      } else {
        this.showAlert(res.message || "Gagal mengalokasikan nomor antrean.", false);
      }
    } catch (e) {
      this.showAlert("Error: Sambungan internet server terputus.", false);
    } finally {
      this.loadLiveMonitor();
    }
  }
};
