/**
 * pendaftaran.js
 * Modul Frontend Pendaftaran Pasien Baru & Monitor Pending Queue Antrean Poliklinik
 * Versi Fast-Track UI Terintegrasi Penuh
 */

window.PendaftaranModule = window.PendaftaranModule || {
  pasienTerpilih: null,

  render: function() {
    return `
      <div class="row pair-fade-in">
        <div class="col-12">
          <div id="pendaftaran-alert" class="alert d-none" role="alert"></div>
        </div>

        <!-- PANEL KIRI: Input Form Pendaftaran Pasien Baru -->
        <div class="col-12 col-lg-5 mb-4">
          <div class="panel shadow-sm border border-light-subtle rounded-3">
            <div class="panel-header py-3 px-4 bg-light border-bottom">
              <h2 class="h6 mb-0 text-dark fw-bold">
                <i class="bi bi-person-plus me-2 text-primary"></i>Pasien Baru
              </h2>
            </div>
            <div class="p-4 bg-white">
              <form id="form-pasien-baru" onsubmit="PendaftaranModule.handleDaftarPasien(event)">
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
                    <option value="Umum">Umum (Mandiri)</option>
                    <option value="BPJS">BPJS Kesehatan</option>
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

        <!-- PANEL KANAN: Cari & Monitor Queue Alokasi Poliklinik Kerja -->
        <div class="col-12 col-lg-7 mb-4">
          <div class="panel shadow-sm border border-light-subtle rounded-3 h-100 bg-white">
            <div class="panel-header py-3 px-4 bg-light border-bottom">
              <h2 class="h6 mb-0 text-dark fw-bold">
                <i class="bi bi-search me-2 text-primary"></i>Cari & Daftarkan ke Antrean Poliklinik
              </h2>
            </div>
            <div class="p-4">
              <!-- Bar Pencarian Global -->
              <div class="input-group mb-4 shadow-sm rounded">
                <input type="text" id="pendaftaran-search-key" placeholder="Masukkan NIK, Nama, atau Nomor RM Pasien..." class="form-control form-control-lg border-end-0">
                <button onclick="PendaftaranModule.cariPasienManual()" class="btn btn-dark fw-bold px-4" type="button">Cari Pasien</button>
              </div>

              <!-- Area Kerja Pemrosesan Pasien Aktif (Bisa via Submit Baru / via Klik Baris Tabel) -->
              <div id="antrean-execution-card" class="d-none mb-4"></div>

              <!-- LIVE PENDING QUEUE MONITOR TABLE -->
              <div class="mt-2">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h3 class="h6 text-uppercase fw-bold text-secondary mb-0">
                    <i class="bi bi-collection-play me-2 text-warning"></i>Pasien Belum Masuk Antrean Kerja Hari Ini
                  </h3>
                  <button onclick="PendaftaranModule.loadPendingQueue()" class="btn btn-sm btn-outline-secondary py-0 px-2" title="Refresh data">
                    <i class="bi bi-arrow-clockwise"></i> Sync
                  </button>
                </div>
                <div class="table-responsive border rounded-3 bg-light" style="max-height: 380px; overflow-y: auto;">
                  <table class="table table-hover align-middle mb-0 small bg-white text-nowrap">
                    <thead class="table-light position-sticky top-0 shadow-sm z-1 fw-bold text-muted">
                      <tr>
                        <th class="py-2 px-3">No. RM</th>
                        <th class="py-2">Nama Pasien</th>
                        <th class="py-2">Penjamin</th>
                        <th class="py-2 text-center">Aksi Kerja</th>
                      </tr>
                    </thead>
                    <tbody id="pendaftaran-pending-tbody">
                      <tr>
                        <td colspan="4" class="text-center py-4 text-muted">Memuat antrean tunda harian...</td>
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
    this.pasienTerpilih = null;
    this.loadPendingQueue();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('pendaftaran-alert');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert p-3 mb-4 d-block pair-fade-in ${isSuccess ? 'alert-success border-success' : 'alert-danger border-danger'}`;
    setTimeout(() => alertBox.classList.add('d-none'), 5000);
  },

  /**
   * Menarik list pasien terdaftar hari ini yang belum masuk antrean kerja
   */
  loadPendingQueue: async function() {
    const tbody = document.getElementById('pendaftaran-pending-tbody');
    if (!tbody) return;

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getPasienPendingHariIni`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data && res.data.length > 0) {
        tbody.innerHTML = res.data.map(pasien => `
          <tr class="pair-fade-in">
            <td class="py-2 px-3 fw-bold text-primary">${pasien.no_rm}</td>
            <td class="py-2 fw-medium">${pasien.nama}</td>
            <td class="py-2"><span class="badge bg-secondary-subtle text-secondary border px-2 py-0.5">${pasien.jenis_penjamin || 'Umum'}</span></td>
            <td class="py-2 text-center">
              <button onclick='PendaftaranModule.pilihPasienEksekusi(${JSON.stringify(pasien)})' class="btn btn-xs btn-outline-primary fw-bold py-0.5 px-2">
                <i class="bi bi-box-arrow-in-right me-1"></i> Proses
              </button>
            </td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="4" class="text-center py-5 text-muted">
              <i class="bi bi-check-circle text-success h3 d-block mb-2"></i>
              Semua pasien terdaftar telah dialokasikan ke poliklinik.
            </td>
          </tr>`;
      }
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-3 text-danger fw-medium">Gagal melakukan sinkronisasi database.</td></tr>`;
    }
  },

  /**
   * Mengirim data form pendaftaran ke backend `Main.gs`
   */
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

        // FAST-TRACK UX: Langsung lempar nomor RM ke form kanan dan tampilkan form eksekusi poliklinik
        document.getElementById('pendaftaran-search-key').value = res.data.no_rm;
        this.pilihPasienEksekusi(res.data);
      } else {
        this.showAlert(res.message || "Gagal menyimpan pasien.", false);
      }
    } catch (e) {
      this.showAlert("Error: Sambungan internet terputus.", false);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-person-check me-2"></i>Daftarkan Pasien Baru`;
      this.loadPendingQueue(); // Segarkan data tabel monitor
    }
  },

  /**
   * Melakukan pencarian manual untuk pasien lama
   */
  cariPasienManual: async function() {
    const keyword = document.getElementById('pendaftaran-search-key').value.trim();
    if (!keyword) return alert("Masukkan NIK, Nama, atau No RM untuk mencari!");

    const exCard = document.getElementById('antrean-execution-card');
    exCard.className = "d-block p-3 bg-light text-center text-muted small border rounded-3";
    exCard.innerHTML = "Mencari pasien...";

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=cariPasien&keyword=${encodeURIComponent(keyword)}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data && res.data.length > 0) {
        // Mapping schema search ke format form eksekusi
        const pasien = res.data[0];
        pasien.jenis_penjamin = pasien.jenis_penjamin || pasien.penjamin; 
        this.pilihPasienEksekusi(pasien);
      } else {
        exCard.className = "alert alert-warning text-center small p-3";
        exCard.innerHTML = "Pasien tidak ditemukan. Gunakan form kiri untuk mendaftarkan pasien baru.";
      }
    } catch (e) {
      exCard.className = "alert alert-danger text-center small p-3";
      exCard.innerHTML = "Gagal terhubung dengan server database klinik.";
    }
  },

  /**
   * Menampilkan form alokasi poliklinik untuk pasien aktif yang dipilih
   */
  pilihPasienEksekusi: function(pasien) {
    this.pasienTerpilih = pasien;
    const exCard = document.getElementById('antrean-execution-card');
    exCard.className = "p-4 bg-light rounded-3 border border-primary-subtle mb-4 pair-fade-in d-block shadow-sm";

    exCard.innerHTML = `
      <div class="row g-2 small border-bottom pb-3 mb-3 text-dark">
        <div class="col-6 col-sm-3">No. RM: <strong class="text-primary d-block font-monospace">${pasien.no_rm}</strong></div>
        <div class="col-6 col-sm-4">Nama Pasien: <strong class="d-block">${pasien.nama}</strong></div>
        <div class="col-6 col-sm-3">NIK: <span class="text-secondary d-block font-monospace">${pasien.nik}</span></div>
        <div class="col-6 col-sm-2 text-end">
          <span class="badge bg-primary px-2 py-1">${pasien.jenis_penjamin || 'Umum'}</span>
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
          <button onclick="PendaftaranModule.batalEksekusi()" class="btn btn-sm btn-light border me-2 fw-medium px-3">Batal</button>
          <button onclick="PendaftaranModule.kirimKeAntreanKerja()" id="btn-submit-antrean" class="btn btn-sm btn-success fw-bold px-4 text-white shadow-sm">
            <i class="bi bi-box-arrow-in-right me-1"></i> Masukkan ke Antrean Kerja
          </button>
        </div>
      </div>
    `;
    document.getElementById('pendaftaran-search-key').value = pasien.no_rm;
  },

  batalEksekusi: function() {
    this.pasienTerpilih = null;
    document.getElementById('pendaftaran-search-key').value = '';
    const exCard = document.getElementById('antrean-execution-card');
    exCard.className = "d-none";
    exCard.innerHTML = "";
  },

  /**
   * Menembak POST API action=tambahAntrian ke ControllerAntrian.gs
   */
  kirimKeAntreanKerja: async function() {
    if (!this.pasienTerpilih) return;

    const btn = document.getElementById('btn-submit-antrean');
    btn.disabled = true;
    btn.innerText = "Memproses...";

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'tambahAntrian',
      no_rm: this.pasienTerpilih.no_rm,
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
      this.loadPendingQueue(); // Segarkan data tabel pending monitor harian
    }
  }
};
