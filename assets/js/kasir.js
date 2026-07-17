/**
 * kasir.js
 * Modul Frontend untuk Billing Kasir, Akumulasi Biaya Otomatis, Settlement Transaksi, dan Cetak Invoice
 */

const KasirModule = {
  // State internal untuk menyimpan data tagihan aktif yang sedang diproses
  activeBillingData: null,

  /**
   * Merender layout HTML Dashboard Kasir & Billing
   * @return {String}
   */
  render: function() {
    return `
      <div class="space-y-6 animate-fadeIn">
        <!-- Header Halaman -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 space-y-4 sm:space-y-0">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Billing Kasir & Pembayaran</h2>
            <p class="text-sm text-slate-500 mt-1">Kalkulasi agregat biaya perawatan, pemilihan metode transaksi, dan cetak invoice pembayaran.</p>
          </div>
        </div>

        <!-- Alert Box -->
        <div id="kasir-alert" class="hidden p-4 rounded-xl text-sm font-medium border transition-all duration-300 mb-4"></div>

        <!-- Panel Lookup Input -->
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-end sm:space-x-3 space-y-3 sm:space-y-0">
          <div class="flex-1 w-full">
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Masukkan ID Antrean Aktif (Contoh: ANT-2026...)</label>
            <input type="text" id="kasir-search-id" placeholder="Ketik atau scan ID Antrean pasien..." class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          </div>
          <button onclick="KasirModule.hitungBilling()" class="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm px-6 py-2 rounded-lg transition h-10">
            Kalkulasi Tagihan
          </button>
        </div>

        <!-- Workspace Billing Terkalkulasi -->
        <div id="kasir-workspace" class="hidden grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Kiri (7 Kolom): Rincian Komponen Invoice Tagihan -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-7 space-y-5">
            <div class="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider">📋 Rincian Komponen Biaya</h3>
              <span id="invoice-penjamin-badge" class="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">-</span>
            </div>

            <!-- Manifes Detail Pasien -->
            <div class="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-600">
              <div>No. RM: <span id="invoice-no-rm" class="font-bold text-slate-800"></span></div>
              <div>Nama Pasien: <span id="invoice-nama" class="font-bold text-slate-800"></span></div>
            </div>

            <!-- Rincian Itemized Harga -->
            <div class="space-y-3 pt-2">
              <div class="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span class="text-slate-600">Biaya Pendaftaran / Registrasi Awal</span>
                <span id="cost-registrasi" class="font-semibold text-slate-800">Rp 0</span>
              </div>
              <div class="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span class="text-slate-600">Biaya Pemeriksaan Klinis Umum/Spesialis</span>
                <span id="cost-periksa" class="font-semibold text-slate-800">Rp 0</span>
              </div>
              <div class="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span class="text-slate-600">Biaya Tindakan / Terapi Dokter</span>
                <span id="cost-tindakan" class="font-semibold text-slate-800">Rp 0</span>
              </div>
              
              <!-- Sub-blok Apotek -->
              <div class="border-b border-slate-100 pb-2 space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-600">Akumulasi Total Obat Farmasi (E-Resep)</span>
                  <span id="cost-obat" class="font-semibold text-slate-800">Rp 0</span>
                </div>
                <div id="invoice-detail-obat-list" class="text-xs text-slate-400 pl-4 space-y-1 list-none">
                  <!-- List breakdown obat akan masuk di sini -->
                </div>
              </div>
            </div>

            <!-- Grand Total Display -->
            <div class="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-inner">
              <span class="text-xs uppercase tracking-wider font-bold text-slate-400">Total Tagihan Bersih (Grand Total)</span>
              <span id="invoice-grand-total" class="text-xl font-black text-emerald-400">Rp 0</span>
            </div>
          </div>

          <!-- Kanan (5 Kolom): Settlement Pembayaran -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-5 space-y-5">
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">💳 Metode Pembayaran & Pelunasan</h3>
            
            <div class="space-y-4 text-sm">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Pilih Metode Transaksi</label>
                <select id="settle-metode" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="Tunai">Tunai (Cash)</option>
                  <option value="QRIS">QRIS Dinamis</option>
                  <option value="Transfer">Transfer Bank (VA)</option>
                  <option value="Debit">Kartu Debit</option>
                </select>
              </div>

              <div id="container-kembalian" class="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 mb-1">Jumlah Uang Diterima (Rp)</label>
                  <input type="number" id="settle-bayar-nominal" oninput="KasirModule.hitungKembalian()" class="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none">
                </div>
                <div class="flex justify-between items-center text-xs pt-1">
                  <span class="text-slate-500 font-medium">Uang Kembalian:</span>
                  <span id="settle-kembalian-text" class="font-bold text-slate-800 text-sm">Rp 0</span>
                </div>
              </div>

              <button onclick="KasirModule.prosesPelunasan()" id="btn-proses-bayar" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3 rounded-xl shadow-md transition duration-150 active:scale-[0.99]">
                🎯 Cetak Invoice & Selesaikan Transaksi
              </button>
            </div>
          </div>

        </div>

        <!-- Empty State Workspace -->
        <div id="kasir-empty-workspace" class="text-center py-16 bg-white border border-slate-200 rounded-2xl text-slate-400 text-sm italic">
          Masukkan ID Antrean pasien di atas, lalu tekan kalkulasi untuk menarik data tagihan resmi klinik.
        </div>
      </div>
    `;
  },

  init: function() {
    this.activeBillingData = null;
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('kasir-alert');
    alertBox.innerText = message;
    alertBox.className = `p-4 rounded-xl text-sm font-medium border transition-all duration-300 block mb-4 ${
      isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
    }`;
    setTimeout(() => alertBox.classList.add('hidden'), 5000);
  },

  /**
   * Format angka nominal reguler ke mata uang Rupiah IDR
   */
  formatRupiah: function(angka) {
    return "Rp " + Number(angka).toLocaleString('id-ID', { minimumFractionDigits: 0 });
  },

  /**
   * Menembak GET API ke server GAS untuk kalkulasi komponen biaya agregat
   */
  hitungBilling: async function() {
    const idAntrian = document.getElementById('kasir-search-id').value.trim();
    const workspace = document.getElementById('kasir-workspace');
    const emptyBox = document.getElementById('kasir-empty-workspace');

    if (!idAntrian) {
      this.showAlert("Silakan masukkan ID Antrean pasien terlebih dahulu.", false);
      return;
    }

    workspace.classList.add('hidden');
    emptyBox.innerText = "Sedang menarik kompilasi data billing server...";
    emptyBox.classList.remove('hidden');

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
          ? "px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800"
          : "px-2.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800";

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
            listObat.innerHTML += `<li>• ${o.nama_obat} (Qty: ${o.jumlah} x ${this.formatRupiah(o.harga_satuan)}) = ${this.formatRupiah(o.subtotal)}</li>`;
          });
        } else {
          listObat.innerHTML = '<li class="italic text-slate-400">Tidak ada rincian konsumsi obat farmasi.</li>';
        }

        // Set default value form bayar
        document.getElementById('settle-bayar-nominal').value = res.data.total_tagihan;
        document.getElementById('settle-kembalian-text').innerText = "Rp 0";

        emptyBox.classList.add('hidden');
        workspace.classList.remove('hidden');
      } else {
        emptyBox.innerText = res.message || "Data transaksi antrean tidak ditemukan atau sudah diselesaikan.";
        this.activeBillingData = null;
      }
    } catch (e) {
      emptyBox.innerText = "Gagal memproses hitung invoice kasir.";
      this.showAlert("Error: Sambungan REST API bermasalah.", false);
    }
  },

  /**
   * Logika interaktif menghitung sisa kembalian tunai (Cashback Counter)
   */
  hitungKembalian: function() {
    if (!this.activeBillingData) return;
    const uangMasuk = Number(document.getElementById('settle-bayar-nominal').value) || 0;
    const totalTagihan = this.activeBillingData.total_tagihan;
    const sisa = uangMasuk - totalTagihan;

    const kembalianText = document.getElementById('settle-kembalian-text');
    if (sisa < 0) {
      kembalianText.innerText = "Uang Kurang!";
      kembalianText.className = "font-bold text-red-600 text-sm";
    } else {
      kembalianText.innerText = this.formatRupiah(sisa);
      kembalianText.className = "font-bold text-slate-800 text-sm";
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
        
        // Pemicu cetak invoice nota fisik ke thermal printer kassa kasir
        this.cetakNotaInvoiceFisik(res.data.id_invoice);

        // Reset workspace kasir
        this.activeBillingData = null;
        document.getElementById('kasir-search-id').value = '';
        document.getElementById('kasir-workspace').classList.add('hidden');
        document.getElementById('kasir-empty-workspace').classList.remove('hidden');
        document.getElementById('kasir-empty-workspace').innerText = "Masukkan ID Antrean pasien di atas, lalu tekan kalkulasi untuk menarik data tagihan resmi klinik.";
      } else {
        this.showAlert(res.message || "Gagal memproses log kassa kasir.", false);
        btn.disabled = false;
        btn.innerText = "Cetak Invoice & Selesaikan Transaksi";
      }
    } catch (err) {
      this.showAlert("Error: Sambungan internet API server putus.", false);
      btn.disabled = false;
      btn.innerText = "Cetak Invoice & Selesaikan Transaksi";
    }
  },

  /**
   * Menghasilkan visual nota print layout mini thermal printer 58mm untuk kuitansi sah pasien
   */
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

// Daftarkan ke scope window utama
window.KasirModule = KasirModule;
