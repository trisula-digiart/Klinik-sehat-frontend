/**
 * antrian.js
 * Modul Frontend untuk Papan Monitor Antrean Live, Manajemen Pemanggilan, dan Update Status
 */

const AntrianModule = {
  // State lokal untuk manajemen data antrean di frontend
  currentPoli: 'POLI-UMUM',
  listAntrian: [],

  /**
   * Merender struktur tampilan dasar dashboard antrean
   * @return {String}
   */
  render: function() {
    return `
      <div class="space-y-6 animate-fadeIn">
        <!-- Header & Dropdown Filter Poliklinik -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 space-y-4 sm:space-y-0">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Monitor Antrean Live</h2>
            <p class="text-sm text-slate-500 mt-1">Manajemen pemanggilan urutan pasien dan pembaruan status layanan poliklinik.</p>
          </div>
          <div class="flex items-center space-x-3">
            <label class="text-xs font-bold uppercase tracking-wider text-slate-500">Pilih Poliklinik:</label>
            <select id="filter-poli-antrian" onchange="AntrianModule.handlePoliChange(this.value)" class="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="POLI-UMUM">Poli Umum (A)</option>
              <option value="POLI-GIGI">Poli Gigi (B)</option>
              <option value="POLI-ANAK">Poli Anak (C)</option>
            </select>
          </div>
        </div>

        <!-- Papan Tampilan Utama Pemanggilan (Hero Section) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Box Kiri: Display Pemanggilan Utama -->
          <div class="bg-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between border border-slate-800 lg:col-span-1">
            <div>
              <span class="text-xs font-bold uppercase tracking-widest text-emerald-400 block mb-1">Panggilan Aktif</span>
              <h3 id="display-nama-pasien" class="text-xl font-bold truncate">Tidak Ada Pasien</h3>
              <p id="display-poli-nama" class="text-xs text-slate-400 mt-1">Poli Umum</p>
            </div>
            
            <div class="my-8 text-center">
              <span class="block text-xs text-slate-400 uppercase tracking-wider">Nomor Urut</span>
              <span id="display-nomor-antrian" class="text-6xl font-black tracking-tight text-emerald-500 mt-2 block">---</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <button onclick="AntrianModule.panggilSuara()" class="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm py-3 rounded-xl transition shadow-lg shadow-emerald-700/20 active:scale-95">
                🔊 Panggil
              </button>
              <button onclick="AntrianModule.cetakUlangStruk()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm py-3 rounded-xl transition active:scale-95">
                🖨️ Struk
              </button>
            </div>
          </div>

          <!-- Tabel Kanan: Alur Kerja Antrean Terjadwal -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden flex flex-col">
            <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h4 class="text-sm font-bold text-slate-700 uppercase tracking-wider">Daftar Urutan Monitor</h4>
              <button onclick="AntrianModule.muatDataAntrian()" class="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1">
                <span>🔄</span> <span>Refresh Data</span>
              </button>
            </div>

            <div class="overflow-x-auto flex-1">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-200 bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th class="py-3 px-4">No. Antrean</th>
                    <th class="py-3 px-4">No. RM</th>
                    <th class="py-3 px-4">Nama Pasien</th>
                    <th class="py-3 px-4">Status</th>
                    <th class="py-3 px-4 text-center">Aksi Operasional</th>
                  </tr>
                </thead>
                <tbody id="tbody-antrian-live" class="divide-y divide-slate-100 text-sm text-slate-700">
                  <!-- Baris data di-render dinamis melalui JS -->
                </tbody>
              </table>
              <div id="antrian-empty-state" class="hidden text-center py-12 text-slate-400">
                Tidak ada antrean aktif pada poliklinik ini hari ini.
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  /**
   * Inisialisasi modul setelah komponen disuntikkan ke DOM
   */
  init: function() {
    this.currentPoli = document.getElementById('filter-poli-antrian').value;
    this.muatDataAntrian();
  },

  /**
   * Mengatur pergantian poliklinik tujuan
   */
  handlePoliChange: function(val) {
    this.currentPoli = val;
    this.muatDataAntrian();
  },

  /**
   * Menarik daftar data antrean harian secara asinkron dari API server GAS
   */
  muatDataAntrian: async function() {
    const tbody = document.getElementById('tbody-antrian-live');
    const emptyState = document.getElementById('antrian-empty-state');
    
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-xs text-slate-400 font-medium">Sinkronisasi data antrean server...</td></tr>`;
    emptyState.classList.add('hidden');

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=listAntrianHariIni&id_poli=${this.currentPoli}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        this.listAntrian = res.data;
        tbody.innerHTML = '';
        
        // Cari antrean yang sedang berstatus 'Dipanggil' untuk dijadikan display utama
        const antrianAktif = this.listAntrian.find(a => a.status === 'Dipanggil') || this.listAntrian[0];
        this.updateHeroDisplay(antrianAktif);

        // Render baris data ke tabel
        this.listAntrian.forEach(item => {
          let statusBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
          if (item.status === 'Dipanggil') statusBadgeClass = "bg-blue-50 text-blue-700 border-blue-200 animate-pulse";
          if (item.status === 'Pemeriksaan') statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
          if (item.status === 'Apotek') statusBadgeClass = "bg-purple-50 text-purple-700 border-purple-200";
          if (item.status === 'Selesai') statusBadgeClass = "bg-slate-100 text-slate-600 border-slate-200";

          let tombolAksi = '';
          if (item.status === 'Menunggu') {
            tombolAksi = `<button onclick="AntrianModule.ubahStatus('${item.id_antrian}', 'Dipanggil')" class="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition">Panggil</button>`;
          } else if (item.status === 'Dipanggil') {
            tombolAksi = `<button onclick="AntrianModule.ubahStatus('${item.id_antrian}', 'Pemeriksaan')" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition">Mulai Periksa</button>`;
          } else {
            tombolAksi = `<span class="text-xs text-slate-400 italic">No Action Needed</span>`;
          }

          tbody.innerHTML += `
            <tr class="hover:bg-slate-50/80 transition duration-150">
              <td class="py-3.5 px-4 font-bold text-slate-800">${item.no_antrian}</td>
              <td class="py-3.5 px-4 text-xs font-mono">${item.no_rm}</td>
              <td class="py-3.5 px-4 font-medium">${item.nama_pasien || '-'}</td>
              <td class="py-3.5 px-4">
                <span class="px-2.5 py-1 rounded-md text-xs font-semibold border ${statusBadgeClass}">${item.status}</span>
              </td>
              <td class="py-3.5 px-4 text-center">${tombolAksi}</td>
            </tr>
          `;
        });
      } else {
        this.listAntrian = [];
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        this.updateHeroDisplay(null);
      }
    } catch (err) {
      tbody.innerHTML = '';
      emptyState.classList.remove('hidden');
      emptyState.innerText = "Gagal memproses muat data antrean dari server.";
    }
  },

  /**
   * Memperbarui visual komponen hero display pemanggilan aktif
   */
  updateHeroDisplay: function(antrian) {
    const dNama = document.getElementById('display-nama-pasien');
    const dPoli = document.getElementById('display-poli-nama');
    const dNomor = document.getElementById('display-nomor-antrian');

    if (antrian) {
      dNama.innerText = antrian.nama_pasien || 'Pasien Tanpa Nama';
      dPoli.innerText = this.currentPoli === 'POLI-UMUM' ? 'Poliklinik Umum' : (this.currentPoli === 'POLI-GIGI' ? 'Poliklinik Gigi' : 'Poliklinik Anak');
      dNomor.innerText = antrian.no_antrian;
      
      // Simpan referensi id antrian aktif di data attribute untuk trigger fungsi suara/struk
      dNomor.setAttribute('data-active-id', antrian.id_antrian);
    } else {
      dNama.innerText = "Tidak Ada Pasien";
      dPoli.innerText = "---";
      dNomor.innerText = "---";
      dNomor.removeAttribute('data-active-id');
    }
  },

  /**
   * Mengubah status siklus antrean via POST API ke server
   */
  ubahStatus: async function(idAntrian, statusBaru) {
    try {
      const response = await fetch(CONFIG.BASE_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          api_key: CONFIG.API_KEY,
          action: 'updateStatusAntrian',
          id_antrian: idAntrian,
          status_baru: statusBaru
        })
      });

      const res = await response.json();
      if (res.success) {
        if (statusBaru === 'Dipanggil') {
          // Trigger otomatis Text-to-Speech saat status berubah menjadi panggil
          const item = this.listAntrian.find(a => a.id_antrian === idAntrian);
          if (item) this.eksekusiSuaraSynthesizer(item.no_antrian);
        }
        this.muatDataAntrian();
      } else {
        alert("Gagal memperbarui antrean: " + res.message);
      }
    } catch (err) {
      alert("Error sistem koneksi saat memperbarui status antrean.");
    }
  },

  /**
   * Menjalankan fungsi panggil manual menggunakan Text-to-Speech API bawaan browser
   */
  panggilSuara: function() {
    const dNomor = document.getElementById('display-nomor-antrian');
    const nomorStr = dNomor.innerText;
    
    if (nomorStr === '---') return;
    this.eksekusiSuaraSynthesizer(nomorStr);
  },

  eksekusiSuaraSynthesizer: function(nomorAntrian) {
    if ('speechSynthesis' in window) {
      // Pecah karakter antrean agar dieja jelas (misal: A 0 0 1)
      const ejaan = nomorAntrian.split('').join(' ');
      const text = `Nomor antrean, ${ejaan}, silakan menuju ke ruang periksa poliklinik.`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID'; // Menggunakan dialek Bahasa Indonesia resmi
      utterance.rate = 0.85;    // Sedikit diperlambat agar terdengar natural di speaker klinik
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Browser Anda tidak mendukung fitur panggilan suara otomatis (TTS).");
    }
  },

  /**
   * Menghasilkan struktur tata letak nota cetak struk untuk thermal printer kassa pendaftaran
   */
  cetakUlangStruk: function() {
    const dNomor = document.getElementById('display-nomor-antrian').innerText;
    const dNama = document.getElementById('display-nama-pasien').innerText;
    const dPoli = document.getElementById('display-poli-nama').innerText;

    if (dNomor === '---') return;

    const tglStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

    // Membuka window baru khusus layout struk mini thermal printer 58mm
    const printWindow = window.open('', '_blank', 'width=300,height=400');
    printWindow.document.write(`
      <html>
      <head>
        <title>Struk Antrean</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 48mm; padding: 2mm; text-align: center; font-size: 12px; color:#000; }
          .line { border-top: 1px dashed #000; margin: 5px 0; }
          .nomor { font-size: 32px; font-weight: bold; margin: 10px 0; }
          .footer { font-size: 10px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <h3>KLINIK SEHAT</h3>
        <p>Sistem Antrean Elektronik</p>
        <div class="line"></div>
        <p><strong>${dPoli}</strong></p>
        <div class="nomor">${dNomor}</div>
        <p>Nama: ${dNama}</p>
        <div class="line"></div>
        <p class="footer">${tglStr}<br>Budayakan Mengantre Demi Kenyamanan Bersama</p>
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

// Daftarkan modul ke scope global window agar dimuat sempurna oleh app.js
window.AntrianModule = AntrianModule;
