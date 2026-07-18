/**
 * kasir.js
 * Modul Frontend untuk Billing Kasir, Akumulasi Biaya Otomatis, Settlement Transaksi, dan Cetak Invoice
 * Standardisasi Template Bootstrap 5 (adminhmd-1.0.0)
 */

const KasirModule = {
  // State internal untuk menyimpan data tagihan aktif yang sedang diproses
  activeBillingData: null,

  /**
   * Merender layout HTML Dashboard Kasir & Billing berbasis Template Bootstrap 5
   * @return {String}
   */
  render: function() {
    return `
      <div class="row pair-fade-in">
        <!-- Alert Box untuk notifikasi sistem -->
        <div class="col-12">
          <div id="kasir-alert" class="alert d-none" role="alert"></div>
        </div>

        <!-- Panel Lookup Input & Live Queue Monitor -->
        <div class="col-12 mb-4">
          <div class="panel">
            <div class="panel-header py-3 d-flex justify-content-between align-items-center">
              <h2 class="h5 mb-0 section-title">
                <span><i class="bi bi-people me-2 text-primary"></i>Antrean Pembayaran Live Pasien</span>
              </h2>
              <button onclick="KasirModule.loadAntreanKasir()" class="btn btn-sm btn-outline-secondary">
                <i class="bi bi-arrow-clockwise me-1"></i> Refresh Antrean
              </button>
            </div>
            <div class="p-4 bg-white border-top">
              <!-- Kotak Pencarian Manual (Tetap dipertahankan sebagai opsi cadangan) -->
              <div class="row g-3 align-items-end mb-4">
                <div class="col-12 col-md-9">
                  <label class="form-label small fw-bold text-uppercase text-muted tracking-wider mb-2">
                    Cari Berdasarkan ID Antrean Pasien
                  </label>
                  <input type="text" id="kasir-search-id" placeholder="Ketik atau scan ID Antrean pasien..." class="form-control form-control-lg">
                </div>
                <div class="col-12 col-md-3">
                  <button onclick="KasirModule.hitungBillingManual()" class="btn btn-dark btn-lg w-100 fw-medium text-nowrap" style="height: calc(3.5rem + 2px);">
                    Kalkulasi Tagihan
                  </button>
                </div>
              </div>

              <!-- TABEL LIVE ANTREAN OTOMATIS -->
              <div class="table-responsive border rounded-3">
                <table class="table table-hover align-middle mb-0 text-center">
                  <thead class="table-dark small text-uppercase tracking-wider">
                    <tr>
                      <th class="py-3">No. Urut</th>
                      <th class="py-3">ID Antrean</th>
                      <th class="py-3">No. RM</th>
                      <th class="py-3">Nama Pasien</th>
                      <th class="py-3">Poliklinik</th>
                      <th class="py-3">Status</th>
                      <th class="py-3">Aksi Operasional</th>
                    </tr>
                  </thead>
                  <tbody id="live-antrean-kasir-list">
                    <tr>
                      <td colspan="7" class="text-muted py-4 italic">Sedang memuat daftar pasien aktif dari server...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Workspace Billing Terkalkulasi -->
        <div id="kasir-workspace" class="col-12 d-none">
          <div class="row g-4">
            
            <!-- Kiri (7 Kolom): Rincian Komponen Invoice Tagihan -->
            <div class="col-12 col-lg-7">
              <div class="panel h-100">
                <div class="panel-header py-3 d-flex justify-content-between align-items-center">
                  <h3 class="h6 fw-bold text-uppercase tracking-wider text-dark mb-0">
                    <i class="bi bi-receipt me-2 text-primary"></i> Rincian Komponen Biaya
                  </h3>
                  <span id="invoice-penjamin-badge" class="badge bg-secondary px-2.5 py-1.5">-</span>
                </div>
                
                <div class="p-4 bg-white border-top">
                  <!-- Manifes Detail Pasien -->
                  <div class="row g-2 bg-light p-3 rounded-3 border mb-4 text-secondary small mx-0">
                    <div class="col-6">No. RM: <span id="invoice-no-rm" class="fw-bold text-dark"></span></div>
                    <div class="col-6">Nama Pasien: <span id="invoice-nama" class="fw-bold text-dark"></span></div>
                  </div>

                  <!-- Rincian Itemized Harga -->
                  <div class="list-group list-group-flush mb-4">
                    <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                      <span class="text-secondary">Biaya Pendaftaran / Registrasi Awal</span>
                      <span id="cost-registrasi" class="fw-bold text-dark">Rp 0</span>
                    </div>
                    <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                      <span class="text-secondary">Biaya Pemeriksaan Klinis Umum/Spesialis</span>
                      <span id="cost-periksa" class="fw-bold text-dark">Rp 0</span>
                    </div>
                    <div class="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                      <span class="text-secondary">Biaya Tindakan / Terapi Dokter</span>
                      <span id="cost-tindakan" class="fw-bold text-dark">Rp 0</span>
                    </div>
                    
                    <!-- Sub-blok Apotek -->
                    <div class="list-group-item px-0 py-3">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-secondary">Akumulasi Total Obat Farmasi (E-Resep)</span>
                        <span id="cost-obat" class="fw-bold text-dark">Rp 0</span>
                      </div>
                      <ul id="invoice-detail-obat-list" class="list-unstyled ps-3 small text-muted mb-0">
                        <!-- List breakdown obat akan masuk di sini -->
                      </ul>
                    </div>
                  </div>

                  <!-- Grand Total Display -->
                  <div class="card bg-dark text-white border-0 shadow-sm">
                    <div class="card-body p-4 d-flex justify-content-between align-items-center">
                      <span class="small text-uppercase tracking-wider fw-bold text-white-50">Total Tagihan Bersih</span>
                      <span id="invoice-grand-total" class="h3 fw-black text-success mb-0">Rp 0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Kanan (5 Kolom): Settlement Pembayaran -->
            <div class="col-12 col-lg-5">
              <div class="panel h-100">
                <div class="panel-header py-3">
                  <h3 class="h6 fw-bold text-uppercase tracking-wider text-dark mb-0">
                    <i class="bi bi-wallet2 me-2 text-success"></i> Metode Pembayaran
                  </h3>
                </div>
                
                <div class="p-4 bg-white border-top">
                  <div class="mb-4">
                    <label class="form-label small fw-bold text-uppercase text-muted mb-2">Pilih Metode Transaksi</label>
                    <select id="settle-metode" class="form-select font-medium text-dark">
                      <option value="Tunai">Tunai (Cash)</option>
                      <option value="QRIS">QRIS Dinamis</option>
                      <option value="Transfer">Transfer Bank (VA)</option>
                      <option value="Debit">Kartu Debit</option>
                    </select>
                  </div>

                  <div id="container-kembalian" class="bg-light p-4 rounded-3 border mb-4">
                    <div class="mb-3">
                      <label class="form-label small fw-bold text-secondary mb-2">Jumlah Uang Diterima (Rp)</label>
                      <input type="number" id="settle-bayar-nominal" oninput="KasirModule.hitungKembalian()" class="form-control">
                    </div>
                    <div class="d-flex justify-content-between align-items-center pt-2 border-top border-2 border-white">
                      <span class="small text-secondary fw-medium">Uang Kembalian:</span>
                      <span id="settle-kembalian-text" class="fw-bold text-dark h5 mb-0">Rp 0</span>
                    </div>
                  </div>

                  <button onclick="KasirModule.prosesPelunasan()" id="btn-proses-bayar" class="btn btn-success btn-lg w-100 py-3 fw-bold shadow-sm">
                    <i class="bi bi-printer me-2"></i> Cetak Invoice & Selesaikan
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Empty State Workspace -->
        <div id="kasir-empty-workspace" class="col-12 mb-4">
          <div class="panel text-center py-5 bg-white">
            <div class="card-body text-muted py-4 italic border-0">
              <i class="bi bi-inboxes text-secondary h1 d-block mb-3 pe-none"></i>
              Pilih salah satu pasien di atas untuk memuat rincian billing tagihan resmi klinik.
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  /**
   * Inisialisasi awal modul kasir
   */
  init: function() {
    this.activeBillingData = null;
    this.loadAntreanKasir();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('kasir-alert');
    if (!alertBox) return;
    alertBox.innerText = message;
    alertBox.className = `alert p-3 mb-4 d-block ${
      isSuccess ? 'alert-success border-success' : 'alert-danger border-danger'
    }`;
    setTimeout(() => alertBox.classList.add('d-none'), 5000);
  },

  formatRupiah: function(angka) {
    return "Rp " + Number(angka).toLocaleString('id-ID', { minimumFractionDigits: 0 });
  },

  /**
   * Menarik daftar pasien yang memiliki status butuh pembayaran ('Apotek' atau 'Pembayaran')
   */
  loadAntreanKasir: async function() {
    const listContainer = document.getElementById('live-antrean-kasir-list');
    if (!listContainer) return;

    try {
      // Menggunakan API listAntrianHariIni yang sudah ada di Main.gs
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getAntreanKasir`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        // Filter pasien yang statusnya masuk ke koridor Kasir/Apotek
        const pasienKasir = res.data.filter(p => 
          p.status.toLowerCase() === 'apotek' || 
          p.status.toLowerCase() === 'pembayaran' ||
          p.status.toLowerCase() === 'pemeriksaan'
        );

        if (pasienKasir.length === 0) {
          listContainer.innerHTML = `<tr><td colspan="7" class="text-muted py-3">Tidak ada antrean pembayaran aktif saat ini.</td></tr>`;
          return;
        }

        listContainer.innerHTML = '';
        pasienKasir.forEach(p => {
          listContainer.innerHTML += `
            <tr>
              <td class="fw-bold">${p.no_antrian}</td>
              <td><code>${p.id_antrian}</code></td>
              <td>${p.no_rm}</td>
              <td class="text-start fw-medium">${p.nama_pasien}</td>
              <td>${p.nama_poli || 'Poli Umum'}</td>
              <td><span class="badge bg-warning text-dark px-2 py-1">${p.status}</span></td>
              <td>
                <button onclick="KasirModule.hitungBilling('${p.id_antrian}')" class="btn btn-sm btn-primary fw-medium px-3">
                  <i class="bi bi-calculator me-1"></i> Proses Tagihan
                </button>
              </td>
            </tr>
          `;
        });
      } else {
        listContainer.innerHTML = `<tr><td colspan="7" class="text-muted py-3">Tidak ada data antrean hari ini.</td></tr>`;
      }
    } catch (e) {
      listContainer.innerHTML = `<tr><td colspan="7" class="text-danger py-3">Gagal menyinkronkan antrean live dari server.</td></tr>`;
    }
  },

  hitungBillingManual: function() {
    const idAntrian = document.getElementById('kasir-search-id').value.trim();
    if (!idAntrian) {
      this.showAlert("Silakan isi ID Antrean terlebih dahulu.", false);
      return;
    }
    this.hitungBilling(idAntrian);
  },

  /**
   * Menembak GET API ke server GAS untuk kalkulasi komponen biaya agregat secara otomatis
   */
  hitungBilling: async function(idAntrian) {
    const workspace = document.getElementById('kasir-workspace');
    const emptyBox = document.getElementById('kasir-empty-workspace');

    workspace.classList.add('d-none');
    emptyBox.querySelector('.card-body').innerText = "Sedang menarik kompilasi data billing server...";
    emptyBox.classList.remove('d-none');

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getBillingDetail&id_antrian=${encodeURIComponent(idAntrian)}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success) {
        this.activeBillingData = res.data;
        
        // Suntikkan data manifest pasien
        document.getElementById('invoice-no-rm').innerText = res.data.no_rm;
        document.getElementById('invoice-nama').innerText = res.data.nama_pasien;
        
        const badge = document.getElementById('invoice-penjamin-badge');
        badge.innerText = res.data.jenis_penjamin;
        badge.className = res.data.jenis_penjamin === 'BPJS' 
          ? "badge bg-primary px-3 py-2 fw-bold"
          : "badge bg-warning text-dark px-3 py-2 fw-bold";

        // Suntikkan nominal komponen harga
        document.getElementById('cost-registrasi').innerText = this.formatRupiah(res.data.biaya_registrasi);
        document.getElementById('cost-periksa').innerText = this.formatRupiah(res.data.biaya_pemeriksaan);
        document.getElementById('cost-tindakan').innerText = this.formatRupiah(res.data.biaya_tindakan);
        document.getElementById('cost-obat').innerText = this.formatRupiah(res.data.biaya_obat);
        document.getElementById('invoice-grand-total').innerText = this.formatRupiah(res.data.total_tagihan);

        // Render manifes rincian obat detail item jika ada
        const listObat = document.getElementById('invoice-detail-obat-list');
        listObat.innerHTML = '';
        if (res.data.detail_obat && res.data.detail_obat.length > 0) {
          res.data.detail_obat.forEach(o => {
            listObat.innerHTML += `<li class="mb-1"><i class="bi bi-dot me-1"></i> ${o.nama_obat} (Qty: ${o.jumlah} x ${this.formatRupiah(o.harga_satuan)}) = ${this.formatRupiah(o.subtotal)}</li>`;
          });
        } else {
          listObat.innerHTML = '<li class="italic text-muted small pe-none">Tidak ada rincian konsumsi obat farmasi.</li>';
        }

        // Set default value form bayar
        document.getElementById('settle-bayar-nominal').value = res.data.total_tagihan;
        document.getElementById('settle-kembalian-text').innerText = "Rp 0";

        emptyBox.classList.add('d-none');
        workspace.classList.remove('d-none');
        
        // Naikkan window focus ke workspace area pembukuan biaya
        workspace.scrollIntoView({ behavior: 'smooth' });
      } else {
        emptyBox.querySelector('.card-body').innerText = res.message || "Data transaksi antrean tidak ditemukan atau sudah diselesaikan.";
        this.activeBillingData = null;
      }
    } catch (e) {
      emptyBox.querySelector('.card-body').innerText = "Gagal memproses hitung invoice kasir.";
      this.showAlert("Error: Sambungan REST API bermasalah.", false);
    }
  },

  hitungKembalian: function() {
    if (!this.activeBillingData) return;
    const uangMasuk = Number(document.getElementById('settle-bayar-nominal').value) || 0;
    const totalTagihan = this.activeBillingData.total_tagihan;
    const sisa = uangMasuk - totalTagihan;

    const kembalianText = document.getElementById('settle-kembalian-text');
    if (sisa < 0) {
      kembalianText.innerText = "Uang Kurang!";
      kembalianText.className = "fw-bold text-danger h5 mb-0";
    } else {
      kembalianText.innerText = this.formatRupiah(sisa);
      kembalianText.className = "fw-bold text-dark h5 mb-0";
    }
  },

  /**
   * Menembak POST API ke server untuk eksekusi final settlement status pembayaran lunas
   */
  prosesPelunasan: async function() {
    if (!this.activeBillingData) return;

    const uangMasuk = Number(document.getElementById('settle-bayar-nominal').value) || 0;
    if (uangMasuk < this.activeBillingData.total_tagihan) {
      alert("Peringatan: Jumlah nominal uang yang diterima kurang dari nilai tagihan resmi!");
      return;
    }

    const btn = document.getElementById('btn-proses-bayar');
    btn.disabled = true;
    btn.innerText = "Mengunci Nota Transaksi & Log Kas...";

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'prosesBayar',
      id_antrian: this.activeBillingData.id_antrian,
      biaya_registrasi: this.activeBillingData.biaya_registrasi,
      biaya_pemeriksaan: this.activeBillingData.biaya_pemeriksaan,
      biaya_tindakan: this.activeBillingData.biaya_tindakan,
      biaya_obat: this.activeBillingData.biaya_obat,
      total_tagihan: this.activeBillingData.total_tagihan,
      metode_pembayaran: document.getElementById('settle-metode').value
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
        this.showAlert(`Sukses! Pembayaran berhasil diselesaikan. Invoice: ${res.data.id_invoice}`);
        
        this.cetakNotaInvoiceFisik(res.data.id_invoice);

        // Reset workspace & reload antrean live terbaru
        this.activeBillingData = null;
        document.getElementById('kasir-search-id').value = '';
        document.getElementById('kasir-workspace').classList.add('d-none');
        document.getElementById('kasir-empty-workspace').classList.remove('d-none');
        document.getElementById('kasir-empty-workspace').querySelector('.card-body').innerHTML = `
          <i class="bi bi-inboxes text-secondary h1 d-block mb-3"></i>
          Pilih salah satu pasien di atas untuk memuat rincian billing tagihan resmi klinik.
        `;
        
        // Reload tabel otomatis
        this.loadAntreanKasir();
      } else {
        this.showAlert(res.message || "Gagal memproses log kassa kasir.", false);
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-printer me-2"></i> Cetak Invoice & Selesaikan`;
      }
    } catch (err) {
      this.showAlert("Error: Sambungan internet API server putus.", false);
      btn.disabled = false;
      btn.innerHTML = `<i class="bi bi-printer me-2"></i> Cetak Invoice & Selesaikan`;
    }
  },

  cetakNotaInvoiceFisik: function(idInvoice) {
    const data = this.activeBillingData;
    if (!data) return;

    const tglStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    const metode = document.getElementById('settle-metode').value;

    let itemsObatHTML = '';
    if (data.detail_obat && data.detail_obat.length > 0) {
      data.detail_obat.forEach(o => {
        itemsObatHTML += `<p style="text-align:left; margin:2px 0;">${o.nama_obat}<br> &nbsp;&nbsp; ${o.jumlah} x ${o.harga_satuan} = ${o.subtotal}</p>`;
      });
    }

    const printWindow = window.open('', '_blank', 'width=300,height=500');
    printWindow.document.write(`
      <html>
      <head>
        <title>Nota Kuitansi Klinik</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 48mm; padding: 1mm; text-align: center; font-size: 11px; color:#000; line-height: 1.3; }
          .line { border-top: 1px dashed #000; margin: 4px 0; }
          .bold-text { font-weight: bold; }
          .flex-row { display: flex; justify-content: space-between; margin: 2px 0; }
          .footer { font-size: 9px; margin-top: 12px; }
        </style>
      </head>
      <body>
        <h3 style="margin:2px 0;">KLINIK SEHAT</h3>
        <p style="margin:0; font-size:9px;">KUITANSI PEMBAYARAN RESMI</p>
        <div class="line"></div>
        <p style="text-align:left; margin:2px 0; font-size:9px;">
          Inv: ${idInvoice}<br>
          Tgl: ${tglStr}<br>
          RM : ${data.no_rm}<br>
          Nama: ${data.nama_pasien}
        </p>
        <div class="line"></div>
        
        <div class="flex-row"><span>Registrasi:</span><span>${data.biaya_registrasi}</span></div>
        <div class="flex-row"><span>Pemeriksaan:</span><span>${data.biaya_pemeriksaan}</span></div>
        <div class="flex-row"><span>Tindakan:</span><span>${data.biaya_tindakan}</span></div>
        
        ${itemsObatHTML ? '<div class="line"></div>' + itemsObatHTML : ''}
        
        <div class="line"></div>
        <div class="flex-row bold-text"><span>TOTAL:</span><span>${data.total_tagihan}</span></div>
        <div class="flex-row"><span>Metode:</span><span>${metode}</span></div>
        <div class="flex-row bold-text"><span>Status:</span><span>LUNAS</span></div>
        <div class="line"></div>
        <p class="footer">Terima Kasih Atas Kepercayaan Anda<br>Semoga Lekas Sembuh</p>
        <script>
          window.print();
          setTimeout(() => { window.close(); }, 500);
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
};

// Daftarkan ke scope window utama secara aman
window.KasirModule = KasirModule;
