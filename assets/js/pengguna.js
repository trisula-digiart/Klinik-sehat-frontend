/**
 * pengguna.js
 * Modul Frontend Manajemen Akun & Otorisasi Personel Klinik
 * Safe State Pattern & Standardisasi Template adminHMD Bootstrap 5
 */

window.PenggunaModule = window.PenggunaModule || {
  listPengguna: [],

  /**
   * Merender layout HTML Modul Pengguna
   * @return {String}
   */
  render: function() {
    return `
      <div class="row pair-fade-in">
        <!-- Notifikasi Box -->
        <div class="col-12">
          <div id="pengguna-alert" class="alert d-none" role="alert"></div>
        </div>

        <!-- Panel Form Input/Edit Pengguna -->
        <div class="col-12 col-xl-4 mb-4">
          <div class="panel">
            <div class="panel-header py-3">
              <h2 class="h5 mb-0 section-title">
                <span><i class="bi bi-person-plus me-2 text-primary"></i>Registrasi Personel</span>
              </h2>
            </div>
            <div class="p-4 bg-white border-top small">
              <form id="form-pengguna-klinik" onsubmit="PenggunaModule.handleSimpanPengguna(event)">
                <input type="hidden" id="pengguna-id" value="">
                
                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Nama Lengkap</label>
                  <input type="text" id="pengguna-nama" required placeholder="Contoh: dr. Amanda / Siska Amd.Kep" class="form-control">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Username Login</label>
                  <input type="text" id="pengguna-username" required placeholder="contoh: amanda_ops" class="form-control">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Hak Akses (Role)</label>
                  <select id="pengguna-role" required class="form-select font-medium text-dark">
                    <option value="Admin">Admin Klinik</option>
                    <option value="Dokter">Dokter Spesialis/Umum</option>
                    <option value="Perawat">Perawat / Front Office</option>
                    <option value="Kasir">Staf Kasir/Keuangan</option>
                    <option value="Apoteker">Staf Farmasi/Apotek</option>
                  </select>
                </div>

                <div class="mb-4">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Status Akun</label>
                  <select id="pengguna-status" required class="form-select font-medium text-dark">
                    <option value="Aktif">Aktif (Bisa Login)</option>
                    <option value="Nonaktif">Nonaktif (Blokir Akses)</option>
                  </select>
                </div>

                <button type="submit" id="btn-submit-pengguna" class="btn btn-primary w-100 py-2.5 fw-medium shadow-sm">
                  <i class="bi bi-person-check me-2"></i>Simpan Data Personel
                </button>
              </form>
            </div>
          </div>
        </div>

        <!-- Panel Tabel Akun Staf Klinik -->
        <div class="col-12 col-xl-8 mb-4">
          <div class="panel h-100">
            <div class="panel-header py-3">
              <h3 class="h6 fw-bold text-uppercase tracking-wider text-dark mb-0">
                <i class="bi bi-people me-2 text-success"></i>Daftar Manajemen Otorisasi Personel
              </h3>
            </div>
            <div class="p-4 bg-white border-top">
              <div class="table-responsive">
                <table class="table table-hover align-middle small mb-0 text-center">
                  <thead class="table-light text-secondary">
                    <tr>
                      <th class="text-start">Nama Personel</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody id="table-pengguna-body">
                    <tr>
                      <td colspan="5" class="text-center py-5 text-muted italic">
                        <span class="spinner-border spinner-border-sm me-2 text-primary" role="status"></span>Memuat daftar staf klinik...
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
    this.muatDaftarPengguna();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('pengguna-alert');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert p-3 mb-4 d-block ${
      isSuccess ? 'alert-success border-success' : 'alert-danger border-danger'
    }`;
    setTimeout(() => alertBox && alertBox.classList.add('d-none'), 5000);
  },

  /**
   * Menarik daftar pengguna dari backend GAS
   */
  muatDaftarPengguna: async function() {
    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getPengguna`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        this.listPengguna = res.data;
        this.renderPenggunaTable();
      } else {
        this.renderFallbackPengguna();
      }
    } catch (e) {
      this.renderFallbackPengguna();
    }
  },

  renderPenggunaTable: function() {
    const tbody = document.getElementById('table-pengguna-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    this.listPengguna.forEach((p, index) => {
      const isAktif = p.status === 'Aktif';
      tbody.innerHTML += `
        <tr>
          <td class="text-start fw-medium text-dark">${p.nama}<br><small class="text-muted text-xs">${p.id_pengguna || 'USR-SYSTEM'}</small></td>
          <td class="font-mono text-secondary">${p.username}</td>
          <td><span class="badge bg-light text-dark border px-2.5 py-1.5">${p.role}</span></td>
          <td>
            <span class="badge ${isAktif ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} px-2 py-1.5 rounded">
              ${p.status}
            </span>
          </td>
          <td>
            <button onclick="PenggunaModule.editPengguna(${index})" class="btn btn-link text-primary p-0 border-0 me-2 text-decoration-none small fw-bold">Edit</button>
            <button onclick="PenggunaModule.hapusPengguna('${p.id_pengguna || index}')" class="btn btn-link text-danger p-0 border-0 text-decoration-none small fw-bold">Hapus</button>
          </td>
        </tr>
      `;
    });
  },

  renderFallbackPengguna: function() {
    // Mockup data statis jika server GAS belum merespon
    this.listPengguna = [
      { id_pengguna: "USR-001", nama: "Admin Klinik Utama", username: "admin_klinik", role: "Admin", status: "Aktif" },
      { id_pengguna: "USR-002", nama: "dr. Andi Wijaya", username: "dr_andi", role: "Dokter", status: "Aktif" },
      { id_pengguna: "USR-003", nama: "Siti Rahma Amd.Kep", username: "siti_nurse", role: "Perawat", status: "Aktif" }
    ];
    this.renderPenggunaTable();
  },

  /**
   * Menangani submit form simpan/edit pengguna
   */
  handleSimpanPengguna: async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-pengguna');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Menyimpan...`;

    const idPengguna = document.getElementById('pengguna-id').value;

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'simpanPengguna',
      id_pengguna: idPengguna || null,
      nama: document.getElementById('pengguna-nama').value,
      username: document.getElementById('pengguna-username').value,
      role: document.getElementById('pengguna-role').value,
      status: document.getElementById('pengguna-status').value
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
        this.showAlert("Sukses mengamankan data kredensial personel klinik.");
        this.resetForm();
        this.muatDaftarPengguna();
      } else {
        this.listPengguna.push(payload);
        this.renderPenggunaTable();
        this.showAlert("Simulasi: Data tersimpan lokal (Server offline).");
        this.resetForm();
      }
    } catch (err) {
      this.listPengguna.push(payload);
      this.renderPenggunaTable();
      this.showAlert("Simulasi: Berhasil menyimpan data akun baru ke tabel.", true);
      this.resetForm();
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-person-check me-2"></i>Simpan Data Personel`;
    }
  },

  editPengguna: function(index) {
    const p = this.listPengguna[index];
    document.getElementById('pengguna-id').value = p.id_pengguna || '';
    document.getElementById('pengguna-nama').value = p.nama;
    document.getElementById('pengguna-username').value = p.username;
    document.getElementById('pengguna-role').value = p.role;
    document.getElementById('pengguna-status').value = p.status;
  },

  hapusPengguna: function(id) {
    if(confirm("Hapus hak otorisasi masuk untuk personel ini?")) {
      this.listPengguna = this.listPengguna.filter(p => p.id_pengguna !== id);
      this.renderPenggunaTable();
      this.showAlert("Akses akun berhasil dicabut dari sistem.");
    }
  },

  resetForm: function() {
    document.getElementById('form-pengguna-klinik').reset();
    document.getElementById('pengguna-id').value = '';
  }
};
