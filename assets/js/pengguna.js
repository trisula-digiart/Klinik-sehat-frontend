/**
 * pengguna.js
 * Modul Frontend Manajemen Akun & Otorisasi Personel Klinik
 * Safe State Pattern & Standardisasi Template adminHMD Bootstrap 5
 * Integrasi Penuh Komponen Keamanan Input Password & Google Sheets Cloud Sync
 */

window.PenggunaModule = window.PenggunaModule || {
  listPengguna: [],

  /**
   * Merender layout HTML Modul Pengguna dengan tambahan input field Password bawaan adminHMD
   * @return {String}
   */
  render: function() {
    return `
      <div class="row pair-fade-in text-dark">
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

                <!-- INTEGRASI INPUT PASSED: SINKRONISASI PENGISIAN KREDENSIAL KE KOLOM C -->
                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1" id="label-pengguna-password">Password Akses</label>
                  <input type="password" id="pengguna-password" required placeholder="Masukkan kata sandi akun" class="form-control">
                  <small class="text-muted d-block mt-1" id="help-pengguna-password">Kata sandi minimal berisi 5 karakter keamanan.</small>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-bold text-muted text-uppercase mb-1">Hak Akses (Role)</label>
                  <select id="pengguna-role" required class="form-select font-medium text-dark">
                    <option value="Admin">Admin Klinik</option>
                    <option value="Dokter">Dokter</option>
                    <option value="Perawat">Perawat</option>
                    <option value="Kasir">Kasir</option>
                    <option value="Apoteker">Apoteker</option>
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
            <div class="panel-header py-3 d-flex justify-content-between align-items-center">
              <h3 class="h6 fw-bold text-uppercase tracking-wider text-dark mb-0">
                <i class="bi bi-people me-2 text-success"></i>Daftar Manajemen Otorisasi Personel
              </h3>
              <button onclick="PenggunaModule.muatDaftarPengguna()" class="btn btn-xs btn-outline-secondary py-0.5 px-2 small" type="button">
                <i class="bi bi-arrow-clockwise"></i> Sync Database
              </button>
            </div>
            <div class="p-4 bg-white border-top">
              <div class="table-responsive" style="max-height: 480px; overflow-y: auto;">
                <table class="table table-hover align-middle mb-0 text-center">
                  <thead class="table-light text-secondary position-sticky top-0 z-1 shadow-sm">
                    <tr>
                      <th class="text-start py-2.5">Nama Personel</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody id="table-pengguna-body">
                    <tr>
                      <td colspan="5" class="text-center py-5 text-muted italic">
                        <span class="spinner-border spinner-border-sm me-2 text-primary" role="status"></span>Menghubungkan ke Cloud Server SIMRS...
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
      isSuccess ? 'alert-success border-success text-success fw-medium' : 'alert-danger border-danger text-danger'
    }`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => alertBox && alertBox.classList.add('d-none'), 5000);
  },

  /**
   * Menarik daftar pengguna riil langsung dari server cloud Apps Script
   */
  muatDaftarPengguna: async function() {
    const tbody = document.getElementById('table-pengguna-body');
    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getPengguna`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data && res.data.length > 0) {
        this.listPengguna = res.data;
        this.renderPenggunaTable();
      } else {
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted small">Belum ada data personel terdaftar di database.</td></tr>`;
      }
    } catch (e) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center py-3 text-danger small">Gagal menyambungkan koneksi ke server Apps Script.</td></tr>`;
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
          <td class="text-start fw-medium text-dark py-2.5">
            <strong class="text-dark d-block">${p.nama}</strong>
            <small class="text-muted font-monospace" style="font-size:0.75rem;">ID-USR: ${p.id_pengguna}</small>
          </td>
          <td class="font-monospace text-secondary">${p.username}</td>
          <td><span class="badge bg-light text-dark border px-2.5 py-1.5">${p.role}</span></td>
          <td>
            <span class="badge ${isAktif ? 'bg-success text-white' : 'bg-danger text-white'} px-2 py-1.5 rounded">
              ${p.status}
            </span>
          </td>
          <td>
            <button onclick="PenggunaModule.editPengguna(${index})" class="btn btn-xs btn-outline-primary fw-bold px-2 py-0.5 me-1">
              <i class="bi bi-pencil-square"></i> Edit
            </button>
          </td>
        </tr>
      `;
    });
  },

  /**
   * Menangani submit form kirim data ke server Google Sheets secara riil permanen
   */
  handleSimpanPengguna: async function(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-pengguna');
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Sinkronisasi Cloud...`;

    const idPengguna = document.getElementById('pengguna-id').value;
    const passValue = document.getElementById('pengguna-password').value;

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'simpanPengguna',
      id_pengguna: idPengguna || null,
      nama: document.getElementById('pengguna-nama').value.trim(),
      username: document.getElementById('pengguna-username').value.trim(),
      password: passValue ? passValue.trim() : null,
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
        this.showAlert(res.message || "Sukses mengamankan data kredensial personel klinik.");
        this.resetForm();
        this.muatDaftarPengguna();
      } else {
        this.showAlert(res.message || "Gagal memproses data akun.", false);
      }
    } catch (err) {
      this.showAlert("Error: Sambungan internet terputus, gagal mengirim data ke Google Sheets.", false);
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
    
    // Ubah aturan input password menjadi opsional saat melakukan proses edit data
    const passInput = document.getElementById('pengguna-password');
    if (passInput) {
      passInput.required = false;
      passInput.placeholder = "Kosongkan jika tidak ingin mengubah password";
      document.getElementById('label-pengguna-password').innerText = "Password Baru (Opsional)";
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  resetForm: function() {
    document.getElementById('form-pengguna-klinik').reset();
    document.getElementById('pengguna-id').value = '';
    
    const passInput = document.getElementById('pengguna-password');
    if (passInput) {
      passInput.required = true;
      passInput.placeholder = "Masukkan kata sandi akun";
      document.getElementById('label-pengguna-password').innerText = "Password Akses";
    }
  }
};
