/**
 * pasien.js
 * Modul Frontend untuk Manajemen Pendaftaran Pasien Baru & Check-in Antrean Poliklinik
 */

const PasienModule = {
  /**
   * Merender layout HTML untuk halaman Pendaftaran & Antrean
   * @return {String}
   */
  render: function() {
    return `
      <div class="space-y-8 animate-fadeIn">
        <!-- Header Halaman -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 border-b border-slate-200 pb-5">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Pendaftaran Pasien & Antrean</h2>
            <p class="text-sm text-slate-500 mt-1">Registrasi pasien baru atau masukkan pasien terdaftar ke dalam antrean layanan poliklinik.</p>
          </div>
        </div>

        <!-- Alert Notification Box -->
        <div id="pasien-alert" class="hidden p-4 rounded-xl text-sm font-medium border transition-all duration-300"></div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Kiri: Form Registrasi Pasien Baru (2 Kolom Wide jika single, tapi kita bagi 1:2 dengan pencarian) -->
          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1">
            <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <span>📝</span> <span>Pasien Baru</span>
            </h3>
            <form id="form-registrasi-pasien" onsubmit="PasienModule.handleRegistrasi(event)" class="space-y-4">
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">NIK (Nomor Induk Kependudukan)</label>
                <input type="text" id="reg-nik" required maxlength="16" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Nama Lengkap Pasien</label>
                <input type="text" id="reg-nama" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tgl Lahir</label>
                  <input type="date" id="reg-tgl-lahir" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Gender</label>
                  <select id="reg-jk" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Jenis Penjamin</label>
                <select id="reg-penjamin" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="Umum">Umum (Mandiri)</option>
                  <option value="BPJS">BPJS Kesehatan</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Nomor HP</label>
                <input type="tel" id="reg-hp" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Alamat Domisili</label>
                <textarea id="reg-alamat" rows="2" required class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
              </div>
              <button type="submit" id="btn-submit-pasien" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 rounded-lg shadow-sm transition duration-150">
                Daftarkan Pasien Baru
              </button>
            </form>
          </div>

          <!-- Kanan: Pencarian Pasien & Check-in Antrean Poli (2 Kolom Wide) -->
          <div class="space-y-6 lg:col-span-2">
            
            <!-- Blok Cari Pasien -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 class="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
                <span>🔍</span> <span>Cari & Daftarkan ke Antrean Poliklinik</span>
              </h3>
              <div class="flex space-x-2 mb-6">
                <input type="text" id="search-keyword" placeholder="Masukkan NIK, Nama, atau Nomor RM Pasien..." class="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <button onclick="PasienModule.cariPasien()" class="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition duration-150">
                  Cari Pasien
                </button>
              </div>

              <!-- Hasil Pencarian -->
              <div id="search-results-container" class="hidden border border-slate-100 rounded-xl overflow-hidden bg-slate-50 p-4 space-y-4">
                <div class="border-b border-slate-200 pb-3">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Data Pasien Ditemukan:</h4>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <span class="block text-xs text-slate-400">No. RM</span>
                      <span id="target-no-rm" class="text-sm font-bold text-slate-700">-</span>
                    </div>
                    <div>
                      <span class="block text-xs text-slate-400">Nama Pasien</span>
                      <span id="target-nama" class="text-sm font-medium text-slate-700">-</span>
                    </div>
                    <div>
                      <span class="block text-xs text-slate-400">NIK</span>
                      <span id="target-nik" class="text-sm text-slate-700">-</span>
                    </div>
                    <div>
                      <span class="block text-xs text-slate-400">Penjamin</span>
                      <span id="target-penjamin" class="text-sm font-semibold px-2 py-0.5 rounded text-xs inline-block bg-slate-200 text-slate-800">-</span>
                    </div>
                  </div>
                </div>

                <!-- Form Tujuan Antrean -->
                <div class="pt-2">
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Tentukan Tujuan Poliklinik & Dokter:</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-xs font-semibold text-slate-600 mb-1">Poliklinik Tujuan</label>
                      <select id="queue-poli" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="POLI-UMUM">Poli Umum (Prefix A)</option>
                        <option value="POLI-GIGI">Poli Gigi (Prefix B)</option>
                        <option value="POLI-ANAK">Poli Anak (Prefix C)</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-600 mb-1">Dokter Spesialis / Pemeriksa</label>
                      <select id="queue-dokter" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                        <option value="DR-001">dr. Ahmad Faisal</option>
                        <option value="DR-002">drg. Citra Lestari</option>
                        <option value="DR-003">dr. Budi Santoso, Sp.A</option>
                      </select>
                    </div>
                  </div>
                  <div class="mt-4 flex justify-end">
                    <button onclick="PasienModule.checkInAntrean()" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-6 py-2.5 rounded-lg shadow-sm transition duration-150">
                      Masukkan ke Antrean Kerja
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- Placeholder jika data kosong -->
              <div id="search-empty-placeholder" class="text-center py-8 text-slate-400 text-sm">
                Silakan ketik kata kunci pencarian di atas untuk memproses antrean.
              </div>

            </div>
          </div>

        </div>
      </div>
    `;
  },

  /**
   * Inisialisasi Event Listener pasca DOM komponen di-render
   */
  init: function() {
    // Sesi setup awal jika diperlukan
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('pasien-alert');
    alertBox.innerText = message;
    alertBox.className = `p-4 rounded-xl text-sm font-medium border transition-all duration-300 block ${
      isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
    }`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => alertBox.classList.add('hidden'), 5000);
  },

  /**
   * Mengirim data registrasi pasien ke backend GAS
   */
  handleRegistrasi: async function(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-submit-pasien');
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Memproses Pendaftaran...";

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'tambahPasien',
      nik: document.getElementById('reg-nik').value,
      nama: document.getElementById('reg-nama').value,
      tanggal_lahir: document.getElementById('reg-tgl-lahir').value,
      jenis_kelamin: document.getElementById('reg-jk').value,
      jenis_penjamin: document.getElementById('reg-penjamin').value,
      nomor_hp: document.getElementById('reg-hp').value,
      alamat: document.getElementById('reg-alamat').value
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
        this.showAlert(`Sukses! Pasien baru berhasil didaftarkan. Nomor RM: ${res.data.no_rm}`);
        document.getElementById('form-registrasi-pasien').reset();
        
        // Otomatis masukkan ke kolom pencarian biar bisa langsung di-checkin poli
        document.getElementById('search-keyword').value = res.data.no_rm;
        this.cariPasien();
      } else {
        this.showAlert(res.message || "Gagal mendaftarkan pasien.", false);
      }
    } catch (err) {
      this.showAlert("Error: Tidak dapat terhubung ke server backend.", false);
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Daftarkan Pasien Baru";
    }
  },

  // Menyimpan data pasien terpilih sementara untuk kebutuhan check-in antrean
  selectedPasienRM: null,

  /**
   * Mengambil data pencarian pasien dari API Backend
   */
  cariPasien: async function() {
    const kw = document.getElementById('search-keyword').value.trim();
    const resultsContainer = document.getElementById('search-results-container');
    const emptyPlaceholder = document.getElementById('search-empty-placeholder');

    if (!kw) {
      this.showAlert("Masukkan kata kunci pencarian (NIK/Nama/RM).", false);
      return;
    }

    resultsContainer.classList.add('hidden');
    emptyPlaceholder.innerText = "Sedang mencari data pasien...";

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=cariPasien&keyword=${encodeURIComponent(kw)}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        // Ambil data pertama hasil pencarian terdekat
        const pasien = res.data[0];
        
        this.selectedPasienRM = pasien.no_rm;
        document.getElementById('target-no-rm').innerText = pasien.no_rm;
        document.getElementById('target-nama').innerText = pasien.nama;
        document.getElementById('target-nik').innerText = pasien.nik;
        
        const penjaminBadge = document.getElementById('target-penjamin');
        penjaminBadge.innerText = pasien.jenis_penjamin;
        if (pasien.jenis_penjamin === 'BPJS') {
          penjaminBadge.className = "text-sm font-semibold px-2 py-0.5 rounded text-xs inline-block bg-blue-100 text-blue-800";
        } else {
          penjaminBadge.className = "text-sm font-semibold px-2 py-0.5 rounded text-xs inline-block bg-amber-100 text-amber-800";
        }

        emptyPlaceholder.classList.add('hidden');
        resultsContainer.classList.remove('hidden');
      } else {
        emptyPlaceholder.innerText = "Data pasien tidak ditemukan. Silakan daftarkan sebagai pasien baru di panel sebelah kiri.";
        this.selectedPasienRM = null;
      }
    } catch (err) {
      emptyPlaceholder.innerText = "Gagal memproses pencarian pasien.";
      this.showAlert("Error koneksi data saat mencari pasien.", false);
    }
  },

  /**
   * Check-in pasien terdaftar ke antrean poliklinik tertentu
   */
  checkInAntrean: async function() {
    if (!this.selectedPasienRM) {
      this.showAlert("Silakan cari dan pilih pasien terlebih dahulu.", false);
      return;
    }

    const poli = document.getElementById('queue-poli').value;
    const dokter = document.getElementById('queue-dokter').value;

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'tambahAntrian',
      no_rm: this.selectedPasienRM,
      id_poli: poli,
      id_dokter: dokter
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
        this.showAlert(`Sukses! Nomor Antrean berhasil dicetak: ${res.data.no_antrian} (${poli})`);
        // Reset tampilan pencarian antrean
        document.getElementById('search-results-container').classList.add('hidden');
        document.getElementById('search-empty-placeholder').classList.remove('hidden');
        document.getElementById('search-empty-placeholder').innerText = "Silakan ketik kata kunci pencarian di atas untuk memproses antrean.";
        document.getElementById('search-keyword').value = "";
        this.selectedPasienRM = null;
      } else {
        this.showAlert(res.message || "Gagal memproses check-in antrean.", false);
      }
    } catch (err) {
      this.showAlert("Error: Koneksi server bermasalah saat check-in.", false);
    }
  }
};

// Pasang objek ke lingkup window agar bisa dieksekusi oleh mesin router app.js secara dinamis
window.PasienModule = PasienModule;
