/**
 * pendaftaran.js
 * Modul Frontend Pendaftaran Pasien Baru & Fast-Track Antrean Poliklinik
 * Aman dari bentrokan global variabel (Safe State Pattern)
 */

window.PendaftaranModule = window.PendaftaranModule || {
  // Tempat menyimpan data pencarian pasien aktif di panel kanan
  pasienDitemukan: null,

  /**
   * Merender komponen UI layout pendaftaran berdasarkan screenshot template
   */
  render: function() {
    return `
      <div class="row pair-fade-in">
        <div class="col-12">
          <div id="pendaftaran-alert" class="alert d-none" role="alert"></div>
        </div>

        <!-- PANEL KIRI: Input Form Pendaftaran Pasien Baru -->
        <div class="col-12 col-lg-6 mb-4">
          <div class="panel">
            <div class="panel-header py-3">
              <h2 class="h5 mb-0 section-title">
                <span><i class="bi bi-person-plus me-2 text-primary"></i>Pasien Baru</span>
              </h2>
            </div>
            <div class="p-4 bg-white border-top">
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
                <button type="submit" id="btn-submit-pasien" class="btn btn-primary w-100 py-2.5 fw-bold">
                  <i class="bi bi-person-check me-2"></i>Daftarkan Pasien Baru
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- PANEL KANAN: Cari & Distribusi Antrean Kerja Poliklinik -->
        <div class="col-12 col-lg-6 mb-4">
          <div class="panel h-100">
            <div class="panel-header py-3">
              <h2 class="h5 mb-0 section-title">
                <span><i class="bi bi-search me-2 text-primary"></i>Cari & Daftarkan ke Antrean Poliklinik</span>
              </h2>
            </div>
            <div class="p-4 bg-white border-top">
              <!-- Kolom Pencarian Global -->
              <div class="input-group mb-4">
                <input type="text" id="pendaftaran-search-key" placeholder="Masukkan NIK, Nama, atau Nomor RM Pasien..." class="form-control form-control-lg">
                <button onclick="PendaftaranModule.cariPasien()" class="btn btn-dark fw-bold px-4" type="button">Cari Pasien</button>
              </div>

              <!-- Slot Container Dinamis Hasil Distribusi Data Pasien -->
              <div id="antrean-action-workspace">
                <div class="text-center py-5 text-muted border border-dashed rounded-3">
                  <i class="bi bi-card-list text-secondary h1 d-block mb-3"></i>
                  Silakan ketik kata kunci pencarian di atas atau daftarkan pasien baru untuk memproses antrean.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: function() {
    this.pasienDitemukan = null;
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('pendaftaran-alert');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert p-3 mb-4 d-block ${isSuccess ? 'alert-success border-success' : 'alert-danger border-danger'}`;
    setTimeout(() => alertBox.classList.add('d-none'), 5000);
  },

  /**
   * Mengirim data form pendaftaran ke `Main.gs`
   */
  handleDaftarPasien: async function(event) {
    event.preventDefault();
    const btn = document.getElementById('btn-submit-pasien');
    btn.disabled = true;
    btn.innerText = "Memproses Database Pasien Baru...";

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'tambahPasien',
      nik: document.getElementById('reg-nik').value.trim(),
      nama: document.getElementById('reg-nama').value.trim(),
      tgl_lahir: document.getElementById('reg-tgllahir').value,
      gender: document.getElementById('reg-gender').value,
      penjamin: document.getElementById('reg-penjamin').value,
      hp: document.getElementById('reg-hp').value.trim(),
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

        // >>> LOGIC FAST-TRACK DISINI: Lempar no_rm baru ke form kanan & render otomatis <<<
        document.getElementById('pendaftaran-search-key').value = res.data.no_rm;
        this.renderPasienTerpilih(res.data);
      } else {
        this.showAlert(res.message || "Gagal menyimpan pasien baru.", false);
      }
    } catch (e) {
      this.showAlert("Error: Sambungan internet server terputus.", false);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-person-check me-2"></i>Daftarkan Pasien Baru`;
    }
  },

  /**
   * Melakukan pencarian manual untuk pasien lama
   */
  cariPasien: async function() {
    const keyword = document.getElementById('pendaftaran-search-key').value.trim();
    if (!keyword) {
      alert("Masukkan NIK, Nama, atau No RM untuk mencari!");
      return;
    }

    const workspace = document.getElementById('antrean-action-workspace');
    workspace.innerHTML = `<div class="text-center py-4 text-secondary">Sedang mencari data pasien di database...</div>`;

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=cariPasien&keyword=${encodeURIComponent(keyword)}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data && res.data.length > 0) {
        // Ambil data pertama hasil pencarian
        this.renderPasienTerpilih(res.data[0]);
      } else {
        workspace.innerHTML = `
          <div class="alert alert-warning text-center">
            Pasien tidak ditemukan. Periksa kembali kata kunci atau daftarkan baru di form sebelah kiri.
          </div>`;
      }
    } catch (e) {
      workspace.innerHTML = `<div class="alert alert-danger text-center">Gagal terhubung dengan server database.</div>`;
    }
  },

  /**
   * Menyuntikkan detail data pasien ke panel kanan & memunculkan form pilihan Poliklinik Kerja
   */
  renderPasienTerpilih: function(pasien) {
    this.pasienDitemukan = pasien;
    const workspace = document.getElementById('antrean-action-workspace');

    workspace.innerHTML = `
      <div class="p-3 bg-light rounded-3 border border-primary-subtle mb-4 pair-fade-in">
        <small class="text-uppercase text-muted fw-bold d-block mb-2">Data Pasien Ditemukan:</small>
        <div class="row g-2 small">
          <div class="col-6">No. RM: <strong class="text-dark d-block">${pasien.no_rm}</strong></div>
          <div class="col-6">Nama Pasien: <strong class="text-dark d-block">${pasien.nama}</strong></div>
          <div class="col-6">NIK: <span class="text-secondary d-block">${pasien.nik}</span></div>
          <div class="col-6">Penjamin: <span class="badge bg-primary px-2 py-1">${pasien.penjamin || 'Umum'}</span></div>
        </div>
      </div>

      <div class="panel border p-3 rounded-3 bg-white pair-fade-in">
        <h4 class="h6 fw-bold text-uppercase text-muted mb-3">Tentukan Tujuan Poliklinik & Dokter:</h4>
        <div class="mb-3">
          <label class="form-label small fw-medium">Poliklinik Tujuan</label>
          <select id="antrean-poli" class="form-select">
            <option value="Poli Umum">Poli Umum (Prefix A)</option>
            <option value="Poli Gigi">Poli Gigi (Prefix B)</option>
            <option value="Poli KIA">Poli KIA (Prefix C)</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="form-label small fw-medium">Dokter Spesialis / Pemeriksa</label>
          <select id="antrean-dokter" class="form-select">
            <option value="dr. Ahmad Faisal">dr. Ahmad Faisal</option>
            <option value="drg. Citra Lestari">drg. Citra Lestari</option>
            <option value="dr. Eka Wijaya">dr. Eka Wijaya</option>
          </select>
        </div>
        <button onclick="PendaftaranModule.kirimKeAntreanKerja()" id="btn-submit-antrean" class="btn btn-success w-100 py-2.5 fw-bold">
          <i class="bi bi-box-arrow-in-right me-2"></i>Masukkan ke Antrean Kerja
        </button>
      </div>
    `;
  },

  /**
   * Menembak POST API `action=tambahAntrian` untuk memasukkan pasien ke antrean live hari ini
   */
  kirimKeAntreanKerja: async function() {
    if (!this.pasienDitemukan) return;

    const btn = document.getElementById('btn-submit-antrean');
    btn.disabled = true;
    btn.innerText = "Mengalokasikan Nomor Urut Antrean...";

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'tambahAntrian',
      no_rm: this.pasienDitemukan.no_rm,
      nama_poli: document.getElementById('antrean-poli').value,
      nama_dokter: document.getElementById('antrean-dokter').value
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
        alert(`Sukses! Pasien berhasil masuk antrean poliklinik dengan Nomor Urut: ${res.data.no_antrian}`);
        
        // Reset Workspace Kanan kembali ke kondisi awal kosong
        this.pasienDitemukan = null;
        document.getElementById('pendaftaran-search-key').value = '';
        document.getElementById('antrean-action-workspace').innerHTML = `
          <div class="text-center py-5 text-muted border border-dashed rounded-3">
            <i class="bi bi-card-list text-secondary h1 d-block mb-3"></i>
            Silakan ketik kata kunci pencarian di atas atau daftarkan pasien baru untuk memproses antrean.
          </div>`;
      } else {
        this.showAlert(res.message || "Gagal memasukkan ke antrean.", false);
      }
    } catch (e) {
      this.showAlert("Error: Sambungan internet server terputus.", false);
    } finally {
      if(btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-box-arrow-in-right me-2"></i>Masukkan ke Antrean Kerja`;
      }
    }
  }
};
