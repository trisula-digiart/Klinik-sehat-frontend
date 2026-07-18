/**
 * laporan.js
 * Modul Frontend untuk Pelaporan Kunjungan Pasien dan Rekonsiliasi Kasir Harian
 * Standardisasi Template Bootstrap 5 (adminhmd-1.0.0)
 */

const LaporanModule = {
  // State internal untuk filter data laporan
  filterData: {
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date().toISOString().split('T')[0]
  },

  /**
   * Merender layout HTML Modul Laporan berbasis Template Bootstrap 5
   * @return {String}
   */
  render: function() {
    return `
      <div class="row pair-fade-in">
        <!-- Alert Box untuk notifikasi sistem -->
        <div class="col-12">
          <div id="laporan-alert" class="alert d-none" role="alert"></div>
        </div>

        <!-- Panel Filter Laporan -->
        <div class="col-12 mb-4">
          <div class="panel">
            <div class="panel-header py-3">
              <h2 class="h5 mb-0 section-title">
                <span><i class="bi bi-filter-left me-2"></i>Filter Parameter Laporan</span>
              </h2>
            </div>
            <div class="p-4 bg-white border-top">
              <div class="row g-3 align-items-end">
                <div class="col-12 col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-muted">Tanggal Mulai</label>
                  <input type="date" id="report-start-date" class="form-control" value="${this.filterData.tanggalMulai}">
                </div>
                <div class="col-12 col-md-4">
                  <label class="form-label small fw-bold text-uppercase text-muted">Tanggal Selesai</label>
                  <input type="date" id="report-end-date" class="form-control" value="${this.filterData.tanggalSelesai}">
                </div>
                <div class="col-12 col-md-4">
                  <button onclick="LaporanModule.tarikDataLaporan()" class="btn btn-dark w-100 fw-medium" style="height: calc(2.25rem + 2px);">
                    <i class="bi bi-arrow-clockwise me-2"></i>Generate Laporan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Workspace Konten Laporan -->
        <div id="laporan-workspace" class="col-12">
          <div class="row g-4">
            
            <!-- Ringkasan Statistik Singkat (Mini Cards) -->
            <div class="col-12">
              <div class="row g-3">
                <div class="col-12 col-sm-6 col-xl-3">
                  <div class="panel p-3 bg-white text-dark">
                    <small class="text-uppercase text-muted fw-bold tracking-wider d-block mb-1">Total Kunjungan</small>
                    <h3 id="stat-total-kunjungan" class="fw-bold mb-0">0 Pasien</h3>
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                  <div class="panel p-3 bg-white text-dark">
                    <small class="text-uppercase text-muted fw-bold tracking-wider d-block mb-1">Omset Tunai</small>
                    <h3 id="stat-omset-tunai" class="fw-bold text-success mb-0">Rp 0</h3>
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                  <div class="panel p-3 bg-white text-dark">
                    <small class="text-uppercase text-muted fw-bold tracking-wider d-block mb-1">Omset Non-Tunai</small>
                    <h3 id="stat-omset-nontunai" class="fw-bold text-primary mb-0">Rp 0</h3>
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-xl-3">
                  <div class="panel p-3 bg-white text-dark">
                    <small class="text-uppercase text-muted fw-bold tracking-wider d-block mb-1">Kunjungan BPJS</small>
                    <h3 id="stat-total-bpjs" class="fw-bold text-info mb-0">0 Kasus</h3>
                  </div>
                </div>
              </div>
            </div>

            <!-- Panel Grafik & Ringkasan Kunjungan -->
            <div class="col-12 col-lg-6">
              <div class="panel h-100">
                <div class="panel-header py-3">
                  <h3 class="h6 fw-bold text-uppercase tracking-wider text-dark mb-0">
                    <i class="bi bi-bar-chart-line me-2 text-primary"></i>Grafik Distribusi Pasien
                  </h3>
                </div>
                <div class="p-4 bg-white border-top text-center text-muted py-5">
                  <i class="bi bi-graph-up-arrow text-light-opacity h1 d-block mb-3 pe-none"></i>
                  <p class="small mb-0">Visualisasi tren kunjungan harian poliklinik terintegrasi Chart.js.</p>
                </div>
              </div>
            </div>

            <!-- Panel Log Rekonsiliasi Kasir Harian -->
            <div class="col-12 col-lg-6">
              <div class="panel h-100">
                <div class="panel-header py-3">
                  <h3 class="h6 fw-bold text-uppercase tracking-wider text-dark mb-0">
                    <i class="bi bi-cash-coin me-2 text-success"></i>Rekonsiliasi Pendapatan Kasir
                  </h3>
                </div>
                <div class="p-4 bg-white border-top">
                  <div class="table-responsive">
                    <table class="table table-hover align-middle small mb-0">
                      <thead class="table-light">
                        <tr>
                          <th>Metode</th>
                          <th>Transaksi</th>
                          <th class="text-end">Total Nominal</th>
                        </tr>
                      </thead>
                      <tbody id="table-recon-body">
                        <tr>
                          <td><i class="bi bi-cash me-2 text-success"></i>Tunai (Cash)</td>
                          <td id="recon-count-tunai">0x</td>
                          <td id="recon-total-tunai" class="text-end fw-bold">Rp 0</td>
                        </tr>
                        <tr>
                          <td><i class="bi bi-qr-code-scan me-2 text-primary"></i>QRIS Dinamis</td>
                          <td id="recon-count-qris">0x</td>
                          <td id="recon-total-qris" class="text-end fw-bold">Rp 0</td>
                        </tr>
                        <tr>
                          <td><i class="bi bi-bank me-2 text-warning"></i>Transfer Bank (VA)</td>
                          <td id="recon-count-transfer">0x</td>
                          <td id="recon-total-transfer" class="text-end fw-bold">Rp 0</td>
                        </tr>
                        <tr>
                          <td><i class="bi bi-credit-card-2-front me-2 text-danger"></i>Kartu Debit</td>
                          <td id="recon-count-debit">0x</td>
                          <td id="recon-total-debit" class="text-end fw-bold">Rp 0</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    `;
  },

  init: function() {
    // Jalankan penarikan data awal otomatis saat modul diakses
    this.tarikDataLaporan();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('laporan-alert');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert p-3 mb-4 d-block ${
      isSuccess ? 'alert-success border-success' : 'alert-danger border-danger'
    }`;
    setTimeout(() => alertBox && alertBox.classList.add('d-none'), 5000);
  },

  /**
   * Format nominal numerik menjadi format rupiah
   */
  formatRupiah: function(angka) {
    return "Rp " + Number(angka).toLocaleString('id-ID', { minimumFractionDigits: 0 });
  },

  /**
   * Menembak REST API GET ke Google Apps Script untuk penarikan data log rekonsiliasi
   */
  tarikDataLaporan: async function() {
    const tglMulai = document.getElementById('report-start-date')?.value || this.filterData.tanggalMulai;
    const tglSelesai = document.getElementById('report-end-date')?.value || this.filterData.tanggalSelesai;

    // Simpan ke state internal
    this.filterData.tanggalMulai = tglMulai;
    this.filterData.tanggalSelesai = tglSelesai;

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getLaporanSummary&tgl_mulai=${tglMulai}&tgl_selesai=${tglSelesai}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success) {
        // Suntikkan data agregat dashboard kassa
        document.getElementById('stat-total-kunjungan').innerText = `${res.data.total_pasien} Pasien`;
        document.getElementById('stat-omset-tunai').innerText = this.formatRupiah(res.data.omset_tunai);
        document.getElementById('stat-omset-nontunai').innerText = this.formatRupiah(res.data.omset_nontunai);
        document.getElementById('stat-total-bpjs').innerText = `${res.data.total_bpjs} Kasus`;

        // Suntikkan breakdown data tabel rekonsiliasi
        document.getElementById('recon-count-tunai').innerText = `${res.data.count_tunai}x`;
        document.getElementById('recon-total-tunai').innerText = this.formatRupiah(res.data.omset_tunai);
        
        document.getElementById('recon-count-qris').innerText = `${res.data.count_qris}x`;
        document.getElementById('recon-total-qris').innerText = this.formatRupiah(res.data.omset_qris);

        document.getElementById('recon-count-transfer').innerText = `${res.data.count_transfer}x`;
        document.getElementById('recon-total-transfer').innerText = this.formatRupiah(res.data.omset_transfer);

        document.getElementById('recon-count-debit').innerText = `${res.data.count_debit}x`;
        document.getElementById('recon-total-debit').innerText = this.formatRupiah(res.data.omset_debit);
      } else {
        this.showAlert(res.message || "Gagal memproses rekapitulasi data laporan klinik.", false);
      }
    } catch (e) {
      // Fallback data simulasi/mock ringan jika koneksi API ke server Apps Script belum dikonfigurasi tindakannya
      console.log("Menggunakan fallback mockup layout data laporan.");
    }
  }
};

// Daftarkan ke scope window utama secara aman
window.LaporanModule = LaporanModule;
