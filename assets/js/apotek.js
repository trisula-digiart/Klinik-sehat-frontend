/**
 * apotek.js
 * Modul Frontend untuk Dashboard Farmasi, Verifikasi Resep, Master Data Obat, & Eksekusi Potong Stok Farmasi - adminHMD Pure Bootstrap 5 Version
 */

const ApotekModule = {
  // State internal untuk menyimpan antrean resep aktif dan master obat dari server
  listResepMasuk: [],
  listMasterObat: [],
  selectedAntrianId: null,

  /**
   * Merender layout HTML untuk halaman Dashboard Farmasi murni Bootstrap 5 template adminHMD
   * @return {String}
   */
  render: function() {
    return `
      <div class="animate-fadeIn">
        <!-- Notifikasi Box -->
        <div id="apotek-alert" class="hidden alert alert-dismissible fade show p-3 rounded-3 mb-4" role="alert"></div>
        
        <!-- Peringatan Batas Stok Kritis -->
        <div id="apotek-stock-critical-box" class="hidden alert alert-warning p-3 rounded-3 mb-4" role="alert">
          <strong class="d-block small text-uppercase tracking-wider mb-2"><i class="bi bi-exclamation-triangle-fill me-2"></i>Peringatan Batas Stok Kritis:</strong>
          <ul id="list-stock-alerts" class="mb-0 ps-3 small"></ul>
        </div>

        <!-- Tombol Aksi & Kontrol Header atas -->
        <div class="panel mb-4">
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <span class="small fw-medium text-muted">
              <i class="bi bi-prescription2 text-primary me-2"></i>Manajemen Penyerahan Obat & e-Resep Apotek
            </span>
            <div class="d-flex gap-2">
              <button onclick="ApotekModule.muatDataMasterObat()" class="btn btn-outline-primary btn-sm px-3">
                <i class="bi bi-box-seam me-1"></i>Sinkronisasi Master Obat
              </button>
              <button onclick="ApotekModule.muatAntreanResep()" class="btn btn-dark btn-sm px-3 py-2">
                <i class="bi bi-arrow-clockwise me-1"></i>Perbarui Resep Masuk
              </button>
            </div>
          </div>
        </div>

        <!-- Workspace Konten: Split Screen Row -->
        <div class="row g-4 align-items-start mb-4">
          
          <!-- PANEL KIRI: Daftar E-Resep Masuk dari Ruang Dokter -->
          <div class="col-12 col-lg-5">
            <div class="panel" style="height: 480px; display: flex; flex-direction: column;">
              <div class="panel-header border-b pb-3 mb-3">
                <h3 class="h6 section-title mb-0">
                  <i class="bi bi-download me-2"></i>Antrean Masuk Resep
                </h3>
              </div>
              
              <div id="list-resep-container" class="flex-grow-1 overflow-y-auto pe-1 custom-scrollbar small">
                <div class="text-center py-4 text-muted">
                  <span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>Sedang menyinkronkan data...
                </div>
              </div>
            </div>
          </div>

          <!-- PANEL KANAN: Lembar Kerja Detail Verifikasi & Penyerahan -->
          <div class="col-12 col-lg-7">
            <div class="panel" style="height: 480px; display: flex; flex-direction: column;">
              <div class="panel-header border-b pb-3 mb-3">
                <h3 class="h6 section-title mb-0">
                  <i class="bi bi-file-earmark-medical me-2"></i>Detail Lembar Kerja Farmasi
                </h3>
              </div>
              
              <div id="detail-resep-workspace" class="flex-grow-1 d-flex flex-column justify-content-between small">
                <div class="blank-state py-5 text-center my-auto mx-auto text-muted">
                  <i class="bi bi-clipboard2-pulse display-5 d-block mb-2 text-opacity-25 text-secondary"></i>
                  <span class="italic text-muted">Silakan pilih salah satu antrean resep di sebelah kiri untuk memulai peracikan dan penyerahan obat.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PANEL BAWAH: DATA MASTER INVENTORI OBAT CLINIC REALTIME -->
        <div class="row">
          <div class="col-12">
            <div class="panel">
              <div class="panel-header border-b pb-3 mb-3 d-flex justify-content-between align-items-center">
                <h3 class="h6 section-title mb-0">
                  <i class="bi bi-grid-3x3-gap-fill me-2 text-success"></i>Master Inventori Obat Gudang (tb_obat)
                </h3>
                <span class="badge bg-success-subtle text-success" id="total-jenis-obat">0 Items</span>
              </div>
              <div class="table-responsive small custom-scrollbar" style="max-height: 350px; overflow-y: auto;">
                <table class="table table-sm table-hover table-striped align-middle border text-center mb-0">
                  <thead class="bg-light sticky-top" style="z-index: 10;">
                    <tr class="text-muted tracking-wider small">
                      <th class="p-2">Kode Obat</th>
                      <th class="p-2 text-start">Nama Obat</th>
                      <th class="p-2">Jenis</th>
                      <th class="p-2">Satuan</th>
                      <th class="p-2">Harga Beli</th>
                      <th class="p-2">Harga Jual</th>
                      <th class="p-2">Stok Aktual</th>
                      <th class="p-2">Stok Min</th>
                      <th class="p-2">Expired Date</th>
                    </tr>
                  </thead>
                  <tbody id="master-obat-table-body">
                    <tr>
                      <td colspan="9" class="text-center py-4 text-muted">
                        <span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>Memuat data inventori obat dari Google Sheet...
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

  /**
   * Inisialisasi awal modul setelah elemen masuk ke DOM
   */
  init: function() {
    this.listResepMasuk = [];
    this.listMasterObat = [];
    this.selectedAntrianId = null;
    this.muatAntreanResep();
    this.muatDataMasterObat();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('apotek-alert');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert alert-dismissible fade show p-3 rounded-3 mb-4 d-block ${
      isSuccess ? 'alert-success border-success-subtle text-success' : 'alert-danger border-danger-subtle text-danger'
    }`;
    setTimeout(() => { if(alertBox) alertBox.className = 'hidden'; }, 5000);
  },

  /**
   * Mengambil data master seluruh obat langsung dari table sheet (tb_obat) backend GAS
   */
  muatDataMasterObat: async function() {
    const tbody = document.getElementById('master-obat-table-body');
    const totalBadge = document.getElementById('total-jenis-obat');
    if (!tbody) return;

    try {
      // Menembak endpoint GAS API untuk aksi getObat / getMasterObat
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getObat`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data && res.data.length > 0) {
        this.listMasterObat = res.data;
        if(totalBadge) totalBadge.innerText = `${res.data.length} Jenis Obat`;
        tbody.innerHTML = '';

        this.listMasterObat.forEach(obat => {
          // Format mata uang rupiah ringkas
          const hargaBeli = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(obat.harga_beli || 0);
          const hargaJual = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(obat.harga_jual || 0);
          
          // Deteksi warning jika stok aktual di bawah atau sama dengan stok minimum
          const isStokKritis = Number(obat.stok_aktual) <= Number(obat.stok_minimal);
          const trStyle = isStokKritis ? 'table-danger fw-medium' : '';
          const stokBadge = isStokKritis ? `<span class="badge bg-danger text-white"><i class="bi bi-exclamation-triangle-fill me-1"></i>${obat.stok_aktual}</span>` : obat.stok_aktual;

          tbody.innerHTML += `
            <tr class="${trStyle}">
              <td class="font-mono fw-bold text-secondary">${obat.id_obat}</td>
              <td class="text-start fw-semibold">${obat.nama_obat}</td>
              <td><span class="badge bg-light text-dark border">${obat.jenis}</span></td>
              <td>${obat.satuan}</td>
              <td class="text-end">${hargaBeli}</td>
              <td class="text-end text-primary fw-bold">${hargaJual}</td>
              <td>${stokBadge}</td>
              <td class="text-muted">${obat.stok_minimal}</td>
              <td class="font-mono text-center small">${obat.expired_date ? obat.expired_date.split('T')[0] : '-'}</td>
            </tr>
          `;
        });
      } else {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-muted">Data tabel 'tb_obat' di Google Sheet kosong atau aksi api 'getObat' belum terdaftar.</td></tr>`;
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-danger"><i class="bi bi-exclamation-octagon-fill me-1"></i>Gagal menyinkronkan data master gudang obat dari server.</td></tr>`;
    }
  },

  /**
   * Membaca antrean pasien berstatus 'Apotek' dari backend GAS
   */
  muatAntreanResep: async function() {
    const container = document.getElementById('list-resep-container');
    if (!container) return;
    container.innerHTML = `
      <div class="text-center py-4 text-muted">
        <span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>Memanggil data resep...
      </div>`;
    
    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getAntreanResep`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        this.listResepMasuk = res.data;
        container.innerHTML = '';

        this.listResepMasuk.forEach(item => {
          const isSelected = item.id_antrian === this.selectedAntrianId;
          container.innerHTML += `
            <div onclick="ApotekModule.pilihResep('${item.id_antrian}')" class="p-3 border rounded-3 mb-2 transition" style="cursor: pointer; ${
              isSelected 
                ? 'background-color: var(--bs-primary-bg-subtle); border-color: var(--bs-primary-border-subtle);' 
                : 'background-color: var(--bs-light-bg-subtle); border-color: var(--bs-border-color);'
            }">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold text-body">${item.no_antrian} - ${item.nama_pasien}</span>
                <span class="badge text-bg-secondary font-mono">${item.no_rm}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center small text-muted" style="font-size:0.8rem;">
                <span><i class="bi bi-box-seam me-1"></i>${item.resep.length} Jenis Obat</span>
                <span class="text-primary fw-semibold">Proses <i class="bi bi-arrow-right-short"></i></span>
              </div>
            </div>
          `;
        });

        if (this.selectedAntrianId) {
          this.pilihResep(this.selectedAntrianId);
        }
      } else {
        this.listResepMasuk = [];
        container.innerHTML = `
          <div class="blank-state py-5 text-center my-auto mx-auto text-muted">
            <i class="bi bi-inbox display-6 d-block mb-2 text-opacity-25 text-secondary"></i>
            <span class="italic small">Tidak ada antrean resep masuk saat ini.</span>
          </div>`;
        document.getElementById('detail-resep-workspace').innerHTML = `
          <div class="blank-state py-5 text-center my-auto mx-auto text-muted">
            <i class="bi bi-check-circle-fill display-6 text-success d-block mb-2"></i>
            <span class="small text-muted">Antrean resep kosong. Semua resep dokter telah selesai diproses.</span>
          </div>
        `;
      }
    } catch (e) {
      container.innerHTML = `
        <div class="text-center py-4 text-danger small">
          <i class="bi bi-exclamation-octagon-fill me-1"></i>Gagal menyinkronkan data apotek.
        </div>`;
    }
  },

  /**
   * Mengaktifkan detail resep ke dalam workspace lembar kerja apoteker
   */
  pilihResep: function(idAntrian) {
    this.selectedAntrianId = idAntrian;
    const item = this.listResepMasuk.find(a => a.id_antrian === idAntrian);
    const workspace = document.getElementById('detail-resep-workspace');

    if (!item) {
      this.muatAntreanResep();
      return;
    }

    this.refreshLeftPanelHighlight();

    let tabelResepHTML = '';
    item.resep.forEach((obat, idx) => {
      tabelResepHTML += `
        <tr class="transition">
          <td class="p-2 text-center">${idx + 1}</td>
          <td class="p-2 text-start ps-3 fw-semibold text-body">${obat.nama_obat || obat.id_obat}</td>
          <td class="p-2 font-bold text-body bg-light">${obat.jumlah}</td>
          <td class="p-2 text-muted italic small">Signa 3dd1 (Valid)</td>
        </tr>
      `;
    });

    workspace.innerHTML = `
      <div class="overflow-y-auto flex-grow-1 pe-1 custom-scrollbar mb-3" style="overflow-x: hidden;">
        <!-- Informasi Ringkas Pasien -->
        <div class="border rounded-3 p-3 text-bg-dark mb-4 shadow-sm">
          <div class="row g-2">
            <div class="col-6">
              <span class="d-block text-uppercase tracking-wider text-muted mb-1" style="font-size: 0.65rem;">Nama Pasien:</span>
              <span class="fw-bold text-info">${item.nama_pasien}</span>
            </div>
            <div class="col-6 text-end">
              <span class="d-block text-uppercase tracking-wider text-muted mb-1" style="font-size: 0.65rem;">ID Registrasi Antrean:</span>
              <span class="font-mono fw-bold">${item.id_antrian}</span>
            </div>
          </div>
        </div>

        <!-- Tabel Detail Resep Fisik -->
        <div class="table-responsive border rounded-3 bg-white mb-3">
          <table class="table table-sm table-hover mb-0 text-center align-middle" style="font-size: 0.85rem;">
            <thead>
              <tr class="bg-body-secondary text-muted uppercase tracking-wider small">
                <th class="p-2" style="width: 50px;">No</th>
                <th class="p-2 text-start ps-3">Nama Obat Racikan / Paten</th>
                <th class="p-2" style="width: 100px;">Jumlah (Qty)</th>
                <th class="p-2" style="width: 140px;">Aturan Pakai</th>
              </tr>
            </thead>
            <tbody>
              ${tabelResepHTML}
            </tbody>
          </table>
        </div>
        
        <div class="border rounded-3 p-3 bg-body-secondary text-muted small">
          <span class="fw-bold text-body d-block mb-1"><i class="bi bi-lightbulb-fill text-warning me-1"></i>Prosedur Kerja Apoteker:</span>
          <p class="mb-0" style="font-size: 0.8rem;">Pastikan item obat di atas telah diracik/diambil sesuai dengan dosis kuantitas dokter. Menekan tombol konfirmasi di bawah akan memotong nilai stok pada data master gudang secara otomatis.</p>
        </div>
      </div>

      <!-- Button Aksi Submit Final -->
      <div class="pt-3 border-top bg-white">
        <button onclick="ApotekModule.konfirmasiPenyerahan('${item.id_antrian}')" id="btn-serah-obat" class="btn btn-success w-100 py-2.5 rounded-3 shadow">
          <i class="bi bi-capsule-pill me-2"></i>Konfirmasi Peracikan & Serahkan Obat Ke Pasien
        </button>
      </div>
    `;
  },

  refreshLeftPanelHighlight: function() {
    const container = document.getElementById('list-resep-container');
    if (!container) return;
    const items = container.children;
    
    this.listResepMasuk.forEach((item, idx) => {
      if (items[idx]) {
        if (item.id_antrian === this.selectedAntrianId) {
          items[idx].style.backgroundColor = "var(--bs-primary-bg-subtle)";
          items[idx].style.borderColor = "var(--bs-primary-border-subtle)";
        } else {
          items[idx].style.backgroundColor = "var(--bs-light-bg-subtle)";
          items[idx].style.borderColor = "var(--bs-border-color)";
        }
      }
    });
  },

  /**
   * Menembak POST API ke server untuk mengurangi stok obat (Atomic Update)
   */
  konfirmasiPenyerahan: async function(idAntrian) {
    const btn = document.getElementById('btn-serah-obat');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Mengamankan Transaksi Stok Gudang...`;
    }

    try {
      const response = await fetch(CONFIG.BASE_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          api_key: CONFIG.API_KEY,
          action: 'serahkanObat',
          id_antrian: idAntrian
        })
      });

      const res = await response.json();

      if (res.success) {
        this.showAlert("Sukses! Resep berhasil diserahkan dan alur dialihkan menuju Kasir Billing.");
        this.selectedAntrianId = null;
        this.handleStockAlerts(res.alerts || []);
        this.muatAntreanResep();
        this.muatDataMasterObat(); // Auto-refresh data master obat setelah transaksi terpotong
      } else {
        this.showAlert(res.message || "Gagal memproses penyerahan obat.", false);
        if(btn) {
          btn.disabled = false;
          btn.innerHTML = `<i class="bi bi-capsule-pill me-2"></i>Konfirmasi Peracikan & Serahkan Obat Ke Pasien`;
        }
      }
    } catch (err) {
      this.showAlert("Error: Sambungan internet terputus dari API server.", false);
      if(btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-capsule-pill me-2"></i>Konfirmasi Peracikan & Serahkan Obat Ke Pasien`;
      }
    }
  },

  /**
   * Mengatur visibilitas kotak peringatan stok jika ada indikasi item menyentuh stok minimal
   */
  handleStockAlerts: function(alertsArray) {
    const box = document.getElementById('apotek-stock-critical-box');
    const ul = document.getElementById('list-stock-alerts');
    if (!box || !ul) return;
    
    if (alertsArray && alertsArray.length > 0) {
      ul.innerHTML = '';
      alertsArray.forEach(alertText => {
        ul.innerHTML += `<li>${alertText}</li>`;
      });
      box.classList.remove('hidden');
    } else {
      box.classList.add('hidden');
    }
  }
};

window.ApotekModule = ApotekModule;
