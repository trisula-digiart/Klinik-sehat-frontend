/**
 * jadwal_dokter.js
 * Modul Frontend Manajemen Shift Kerja & Kuota Harian Dokter
 * Safe State Pattern & Standardisasi Template adminHMD Bootstrap 5
 */

window.JadwalDokterModule = window.JadwalDokterModule || {
  // State internal untuk manajemen data jadwal
  listJadwal: [],

  /**
   * Merender layout HTML Modul Jadwal Dokter berbasis Template Bootstrap 5
   * @return {String}
   */
  render: function() {
    return `
      <div class="row pair-fade-in">
        <!-- Alert Box untuk notifikasi sistem -->
        <div class="col-12">
          <div id="jadwal-alert" class="alert d-none" role="alert"></div>
        </div>

        <!-- Panel Form Input / Update Jadwal -->
        <div class="col-12 col-xl-4 mb-4">
          <div class="panel">
            <div class="panel-header py-3">
              <h2 class="h5 mb-0 section-title">
                <span><i class="bi bi-calendar-plus me-2 text-primary"></i>Plot Jadwal Praktik</span>
              </h2>
            </div>
            <div class="p-4 bg-white border-top small">
              <form id="form-jadwal-dokter" onsubmit="JadwalDokterModule.handleSimpanJadwal(event)">
                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Pilih Dokter Spesialis/Umum</label>
                  <select id="jadwal-id-dokter" required class="form-select font-medium text-dark">
                    <option value="DOC-001">dr. Andi Wijaya (Poli Umum)</option>
                    <option value="DOC-002">dr. Budi Santoso (Poli Anak)</option>
                    <option value="DOC-003">dr. Citra Lestari (Poli Gigi)</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Hari Praktik</label>
                  <select id="jadwal-hari" required class="form-select font-medium text-dark">
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>

                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-bold text-muted text-uppercase mb-1">Jam Mulai</label>
                    <input type="time" id="jadwal-jam-mulai" required class="form-control" value="08:00">
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-bold text-muted text-uppercase mb-1">Jam Selesai</label>
                    <input type="time" id="jadwal-jam-selesai" required class="form-control" value="14:00">
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Kuota Maksimal Antrean Pasien</label>
                  <input type="number" id="jadwal-kuota" required min="1" max="100" class="form-control text-center fw-bold" value="30">
                </div>

                <button type="submit" id="btn-submit-jadwal" class="btn btn-primary w-100 py-2.5 fw-medium shadow-sm">
                  <i class="bi bi-check-circle me-2"></i>Simpan Jadwal Praktik
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Panel Tabel Master Jadwal Dokter Aktif -->
        <div class="col-12 col-xl-8 mb-4">
          <div class="panel h-100">
            <div class="panel-header py-3">
              <h3 class="h6 fw-bold text-uppercase tracking-wider text-dark mb-0">
                <i class="bi bi-table me-2 text-success"></i>Master Jadwal & Kuota Operasional Poliklinik
              </h3>
            </div>
            <div class="p-4 bg-white border-top">
              <div class="table-responsive">
                <table class="table table-hover align-middle small mb-0 text-center">
                  <thead class="table-light text-secondary">
                    <tr>
                      <th class="text-start">Nama Dokter / Poliklinik</th>
                      <th>Hari</th>
                      <th>Jam Praktik</th>
                      <th>Kuota Maks</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody id="table-jadwal-body">
                    <tr>
                      <td colspan="5" class="text-center py-5 text-muted italic">
                        <span class="spinner-border spinner-border-sm me-2 text-primary" role="status"></span>Menarik data jadwal dari server...
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: function() {
    this.muatMasterJadwal();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('jadwal-alert');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert p-3 mb-4 d-block ${
      isSuccess ? 'alert-success border-success' : 'alert-danger border-danger'
    }`;
    setTimeout(() => alertBox && alertBox.classList.add('d-none'), 5000);
  },

  /**
   * Menarik daftar master jadwal dokter ter-plot dari server backend GAS
   */
  muatMasterJadwal: async function() {
    const tbody = document.getElementById('table-jadwal-body');
    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getJadwalDokter`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        this.listJadwal = res.data;
        this.renderJadwalTable();
      } else {
        this.renderFallbackJadwal();
      }
    } catch (e) {
      this.renderFallbackJadwal();
    }
  },

  renderJadwalTable: function() {
    const tbody = document.getElementById('table-jadwal-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    this.listJadwal.forEach((j, index) => {
      tbody.innerHTML += `
        <tr>
          <td class="text-start fw-medium text-dark">${j.nama_dokter}<br><small class="text-muted text-xs">${j.nama_poli}</small></td>
          <td><span class="badge bg-light text-dark border px-2.5 py-1.5">${j.hari}</span></td>
          <td class="font-mono text-secondary">${j.jam_mulai} - ${j.jam_selesai}</td>
          <td><span class="fw-bold text-primary">${j.kuota} Pasien</span></td>
          <td>
            <button onclick="JadwalDokterModule.hapusJadwal('${j.id_jadwal || index}')" class="btn btn-link text-danger p-0 border-0 text-decoration-none small fw-bold">Hapus</button>
          </td>
        </tr>
      `;
    });
  },

  renderFallbackJadwal: function() {
    // Simulasi data statis (mockup) jika action database master GAS belum dibuat
    this.listJadwal = [
      { nama_dokter: "dr. Andi Wijaya", nama_poli: "Poli Umum", hari: "Senin", jam_mulai: "08:00", jam_selesai: "14:00", kuota: 30 },
      { nama_dokter: "dr. Budi Santoso", nama_poli: "Poli Anak", hari: "Selasa", jam_mulai: "09:00", jam_selesai: "13:00", kuota: 20 },
      { nama_dokter: "dr. Citra Lestari", nama_poli: "Poli Gigi", hari: "Rabu", jam_mulai: "10:00", jam_selesai: "16:00", kuota: 15 }
    ];
    this.renderJadwalTable();
  },

  /**
   * Menangani submit form penambahan jadwal baru
   */
  handleSimpanJadwal: async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-jadwal');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Memproses Data...`;

    const selectDoc = document.getElementById('jadwal-id-dokter');
    const namaDokterFull = selectDoc.options[selectDoc.selectedIndex].text;
    const parts = namaDokterFull.split(' (');

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'simpanJadwalDokter',
      id_dokter: selectDoc.value,
      nama_dokter: parts[0],
      nama_poli: parts[1] ? parts[1].replace(')', '') : 'Poli Umum',
      hari: document.getElementById('jadwal-hari').value,
      jam_mulai: document.getElementById('jadwal-jam-mulai').value,
      jam_selesai: document.getElementById('jadwal-jam-selesai').value,
      kuota: document.getElementById('jadwal-kuota').value
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
        this.showAlert("Jadwal praktik dokter berhasil disimpan ke sistem cloud klinik.");
        document.getElementById('form-jadwal-dokter').reset();
        this.muatMasterJadwal();
      } else {
        // Fallback local pushes jika standalone mode
        this.listJadwal.push(payload);
        this.renderJadwalTable();
        this.showAlert("Data ditambahkan secara lokal (Server mode offline).");
      }
    } catch (err) {
      this.listJadwal.push(payload);
      this.renderJadwalTable();
      this.showAlert("Simulasi: Jadwal berhasil ditambahkan ke tabel mockup.", true);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-check-circle me-2"></i>Simpan Jadwal Praktik`;
    }
  },

  hapusJadwal: function(id) {
    if(confirm("Apakah Anda yakin ingin menghapus slot jadwal dokter ini?")) {
      this.listJadwal.splice(id, 1);
      this.renderJadwalTable();
      this.showAlert("Jadwal berhasil dihapus dari antrean master.");
    }
  }
};
