/**
 * apotek.js
 * Modul Frontend untuk Dashboard Farmasi, Verifikasi Resep, & Eksekusi Potong Stok Farmasi
 */

const ApotekModule = {
  // State internal untuk menyimpan antrean resep aktif dari server
  listResepMasuk: [],
  selectedAntrianId: null,

  /**
   * Merender layout HTML untuk halaman Dashboard Farmasi
   * @return {String}
   */
  render: function() {
    return `
      <div class="space-y-6 animate-fadeIn">
        <!-- Header Halaman -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 space-y-4 sm:space-y-0">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Farmasi & Apotek</h2>
            <p class="text-sm text-slate-500 mt-1">Pemrosesan e-resep masuk, verifikasi ketersediaan obat, dan konfirmasi penyerahan farmasi.</p>
          </div>
          <div>
            <button onclick="ApotekModule.muatAntreanResep()" class="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition flex items-center space-x-1.5">
              <span>🔄</span> <span>Perbarui Resep Masuk</span>
            </button>
          </div>
        </div>

        <!-- Alert & Critical Stock Alert Box -->
        <div id="apotek-alert" class="hidden p-4 rounded-xl text-sm font-medium border transition-all duration-300"></div>
        <div id="apotek-stock-critical-box" class="hidden p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs space-y-1">
          <strong class="block text-sm font-semibold">⚠️ Peringatan Batas Stok Kritis:</strong>
          <ul id="list-stock-alerts" class="list-disc list-inside space-y-0.5"></ul>
        </div>

        <!-- Workspace Konten -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- PANEL KIRI (5 Kolom): Daftar E-Resep Masuk dari Ruang Dokter -->
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-5 h-[650px] flex flex-col">
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <span>📥</span> <span>Antrean Masuk Resep</span>
            </h3>
            
            <div id="list-resep-container" class="flex-1 overflow-y-auto space-y-3 pr-1 text-sm">
              <!-- Item resep masuk disuntikkan dinamis via JS -->
              <div class="text-center py-12 text-slate-400 italic text-xs">
                Sedang menyinkronkan data resep dari server...
              </div>
            </div>
          </div>

          <!-- PANEL KANAN (7 Kolom): Lembar Kerja Detail Verifikasi & Penyerahan -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-7 h-[650px] flex flex-col">
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <span>📋</span> <span>Detail Lembar Kerja Farmasi</span>
            </h3>
            
            <div id="detail-resep-workspace" class="flex-1 flex flex-col justify-between text-sm">
              <div class="text-center py-12 text-slate-400 italic text-xs my-auto">
                Silakan pilih salah satu antrean resep di sebelah kiri untuk memulai peracikan dan penyerahan obat.
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
    this.selectedAntrianId = null;
    this.muatAntreanResep();
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('apotek-alert');
    alertBox.innerText = message;
    alertBox.className = `p-4 rounded-xl text-sm font-medium border transition-all duration-300 block mb-4 ${
      isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
    }`;
    setTimeout(() => alertBox.classList.add('hidden'), 5000);
  },

  /**
   * Membaca antrean pasien berstatus 'Apotek' dari backend GAS
   */
  muatAntreanResep: async function() {
    const container = document.getElementById('list-resep-container');
    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-400 font-medium">Memanggil data resep...</div>`;
    
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
            <div onclick="ApotekModule.pilihResep('${item.id_antrian}')" class="p-4 rounded-xl border transition cursor-pointer flex flex-col space-y-2 ${
              isSelected 
                ? 'bg-emerald-50/70 border-emerald-400 shadow-sm' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }">
              <div class="flex justify-between items-center">
                <span class="text-sm font-bold text-slate-800">${item.no_antrian} - ${item.nama_pasien}</span>
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border text-slate-400">${item.no_rm}</span>
              </div>
              <div class="text-xs text-slate-500 flex justify-between items-center">
                <span>📦 Komponen: ${item.resep.length} Jenis Obat</span>
                <span class="text-[11px] text-emerald-600 font-semibold">Klik untuk Proses →</span>
              </div>
            </div>
          `;
        });

        // Jika ada resep terpilih sebelumnya, perbarui workspace detailnya
        if (this.selectedAntrianId) {
          this.pilihResep(this.selectedAntrianId);
        }
      } else {
        this.listResepMasuk = [];
        container.innerHTML = `<div class="text-center py-12 text-slate-400 italic text-xs">Tidak ada antrean resep masuk saat ini.</div>`;
        document.getElementById('detail-resep-workspace').innerHTML = `
          <div class="text-center py-12 text-slate-400 italic text-xs my-auto">
            Antrean resep kosong. Semua resep dokter telah selesai diproses.
          </div>
        `;
      }
    } catch (e) {
      container.innerHTML = `<div class="text-center py-12 text-red-400 italic text-xs">Gagal menyinkronkan data apotek.</div>`;
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

    // Refresh highlight panel kiri tanpa memuat ulang API
    this.refreshLeftPanelHighlight();

    let tabelResepHTML = '';
    item.resep.forEach((obat, idx) => {
      tabelResepHTML += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 font-medium text-slate-700">${idx + 1}</td>
          <td class="p-3 font-semibold text-slate-800">${obat.nama_obat || obat.id_obat}</td>
          <td class="p-3 text-center font-bold text-slate-900 bg-slate-50/50">${obat.jumlah}</td>
          <td class="p-3 text-xs text-slate-500 italic">Signa 3dd1 (Valid)</td>
        </tr>
      `;
    });

    workspace.innerHTML = `
      <div class="space-y-5 overflow-y-auto flex-1 pr-1">
        <!-- Informasi Ringkas Pasien -->
        <div class="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-2 gap-4 border border-slate-800 shadow-sm">
          <div>
            <span class="block text-[10px] uppercase tracking-wider text-slate-400">Nama Pasien:</span>
            <span class="text-sm font-bold text-emerald-400">${item.nama_pasien}</span>
          </div>
          <div class="text-right">
            <span class="block text-[10px] uppercase tracking-wider text-slate-400">Nomor Registrasi Antrean:</span>
            <span class="text-sm font-mono font-bold">${item.id_antrian}</span>
          </div>
        </div>

        <!-- Tabel Detail Resep Fisik -->
        <div class="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-100 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th class="p-3 w-12">No</th>
                <th class="p-3">Nama Obat Racikan / Paten</th>
                <th class="p-3 text-center w-24">Jumlah (Qty)</th>
                <th class="p-3 w-32">Aturan Pakai</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              ${tabelResepHTML}
            </tbody>
          </table>
        </div>
        
        <div class="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-500 space-y-1">
          <span class="font-bold text-slate-700 block">💡 Prosedur Kerja Apoteker:</span>
          <p>Pastikan item obat di atas telah diracik/diambil sesuai dengan dosis kuantitas dokter. Menekan tombol konfirmasi di bawah akan memotong nilai stok pada data master gudang secara otomatis.</p>
        </div>
      </div>

      <!-- Button Aksi Submit Final -->
      <div class="pt-4 border-t border-slate-100 bg-white">
        <button onclick="ApotekModule.konfirmasiPenyerahan('${item.id_antrian}')" id="btn-serah-obat" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3 rounded-xl shadow-md transition duration-150 active:scale-[0.99]">
          💊 Konfirmasi Peracikan & Serahkan Obat Ke Pasien
        </button>
      </div>
    `;
  },

  refreshLeftPanelHighlight: function() {
    const container = document.getElementById('list-resep-container');
    const items = container.children;
    
    this.listResepMasuk.forEach((item, idx) => {
      if (items[idx]) {
        if (item.id_antrian === this.selectedAntrianId) {
          items[idx].className = "p-4 rounded-xl border transition cursor-pointer flex flex-col space-y-2 bg-emerald-50/70 border-emerald-400 shadow-sm";
        } else {
          items[idx].className = "p-4 rounded-xl border transition cursor-pointer flex flex-col space-y-2 bg-slate-50 border-slate-200 hover:bg-slate-100/70";
        }
      }
    });
  },

  /**
   * Menembak POST API ke server untuk mengurangi stok obat (Atomic Update)
   */
  konfirmasiPenyerahan: async function(idAntrian) {
    const btn = document.getElementById('btn-serah-obat');
    btn.disabled = true;
    btn.innerText = "Mengamankan Transaksi Stok Gudang...";

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
        
        // Bersihkan state pilihan karena antrean ini sudah hilang/lunas stok
        this.selectedAntrianId = null;
        
        // Periksa dan tampilkan alert jika ada notifikasi stok menyentuh angka kritis minimum
        this.handleStockAlerts(res.alerts || []);
        
        // Segera muat ulang data antrean
        this.muatAntreanResep();
      } else {
        this.showAlert(res.message || "Gagal memproses penyerahan obat.", false);
        btn.disabled = false;
        btn.innerText = "Konfirmasi Peracikan & Serahkan Obat Ke Pasien";
      }
    } catch (err) {
      this.showAlert("Error: Sambungan internet terputus dari API server.", false);
      btn.disabled = false;
      btn.innerText = "Konfirmasi Peracikan & Serahkan Obat Ke Pasien";
    }
  },

  /**
   * Mengatur visibilitas kotak peringatan stok jika ada indikasi item menyentuh stok minimal
   */
  handleStockAlerts: function(alertsArray) {
    const box = document.getElementById('apotek-stock-critical-box');
    const ul = document.getElementById('list-stock-alerts');
    
    if (alertsArray.length > 0) {
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

// Pasang modul ke scope window global
window.ApotekModule = ApotekModule;
