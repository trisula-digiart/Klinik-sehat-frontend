/**
 * dokter.js
 * Modul Frontend untuk Ruang Periksa Dokter (SOAP Entry, Riwayat RM Split-Screen, & E-Resep)
 */

const DokterModule = {
  // State lokal untuk melacak pasien aktif yang sedang diperiksa
  activeAntrian: null,
  resepDraft: [],

  /**
   * Merender layout HTML dengan pendekatan Split-Screen
   * @return {String}
   */
  render: function() {
    return `
      <div class="space-y-6 animate-fadeIn">
        <!-- Header Layanan -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 space-y-4 sm:space-y-0">
          <div>
            <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Ruang Periksa Dokter</h2>
            <p class="text-sm text-slate-500 mt-1">Pemeriksaan klinis pasien, input SOAP, diagnosa ICD-10, dan pembuatan e-resep elektronik.</p>
          </div>
          <div id="dokter-active-patient-badge" class="px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            Status: Menunggu Pasien Masuk...
          </div>
        </div>

        <!-- Notifikasi Box -->
        <div id="dokter-alert" class="hidden p-4 rounded-xl text-sm font-medium border transition-all duration-300"></div>

        <!-- Tombol Aksi Pilih Pasien dari Antrean Aktif -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <span class="text-sm font-medium text-slate-600">Tekan tombol di samping untuk memuat pasien berstatus 'Pemeriksaan'</span>
          <button onclick="DokterModule.muatPasienPeriksa()" class="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2 rounded-lg transition">
            🔄 Ambil Pasien Aktif
          </button>
        </div>

        <!-- Workspace Utama: Split Screen -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- PANEL KIRI (4 Kolom): Riwayat Rekam Medis (Medical Record History) -->
          <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 lg:col-span-5 h-[700px] flex flex-col">
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <span>📚</span> <span>Histori Rekam Medis Pasien</span>
            </h3>
            <div id="panel-riwayat-rm" class="flex-1 overflow-y-auto space-y-4 pr-1 text-slate-600 text-sm">
              <div class="text-center py-12 text-slate-400 italic text-xs">
                Belum ada pasien aktif yang dipilih.
              </div>
            </div>
          </div>

          <!-- PANEL KANAN (7 Kolom): Form Entry SOAP & E-Resep -->
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-7 h-[700px] flex flex-col">
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center space-x-2">
              <span>🩺</span> <span>Input Rekam Medis Baru (SOAP)</span>
            </h3>
            
            <form id="form-soap-dokter" onsubmit="DokterModule.handleSimpanSOAP(event)" class="flex-1 overflow-y-auto space-y-5 pr-1 text-sm">
              
              <!-- Sub-section 1: Tanda Vital (Objective Data) -->
              <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">1. Pemeriksaan Fisik & Tanda Vital (Objective)</h4>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">Tekanan Darah (mmHg)</label>
                    <input type="text" id="soap-td" placeholder="120/80" class="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">Nadi (x/menit)</label>
                    <input type="text" id="soap-nadi" placeholder="80" class="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">Suhu Tubuh (°C)</label>
                    <input type="text" id="soap-suhu" placeholder="36.5" class="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">Berat Badan (kg)</label>
                    <input type="text" id="soap-bb" placeholder="65" class="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">Tinggi Badan (cm)</label>
                    <input type="text" id="soap-tb" placeholder="170" class="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500">
                  </div>
                  <div>
                    <label class="block text-[11px] font-semibold text-slate-500 mb-1">Saturasi Oksigen (%)</label>
                    <input type="text" id="soap-saturasi" placeholder="98" class="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500">
                  </div>
                </div>
              </div>

              <!-- Sub-section 2: Keluhan Utama (Subjective) -->
              <div>
                <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">2. Keluhan Utama & Anamnesa (Subjective)</label>
                <textarea id="soap-keluhan" required rows="2" placeholder="Tuliskan keluhan utama pasien dan anamnesa medis..." class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"></textarea>
              </div>

              <!-- Sub-section 3: Diagnosa & Tindakan (Assessment & Plan) -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">3. Diagnosa Utama (ICD-10)</label>
                  <input type="text" id="soap-icd10" required placeholder="Contoh: J00 - Common Cold" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                </div>
                <div>
                  <label class="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">4. Tindakan / Terapi Medis</label>
                  <input type="text" id="soap-tindakan" placeholder="Contoh: Nebulisasi, Konseling diet" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                </div>
              </div>

              <!-- Sub-section 4: E-Resep Elektronik (JSON Engine) -->
              <div class="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                  <span>💊</span> <span>Form Peresepan Obat Elektronik (E-Resep)</span>
                </h4>
                
                <div class="grid grid-cols-3 gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div class="col-span-1">
                    <label class="block text-[10px] font-semibold text-slate-500 mb-1">Pilih Obat</label>
                    <select id="resep-id-obat" class="w-full px-2 py-1.5 border border-slate-300 bg-white rounded-md text-xs focus:outline-none">
                      <option value="OB-001">Paracetamol 500mg</option>
                      <option value="OB-002">Amoxicillin 500mg</option>
                      <option value="OB-003">Cetirizine 10mg</option>
                      <option value="OB-004">Ibuprofen 400mg</option>
                    </select>
                  </div>
                  <div class="col-span-1">
                    <label class="block text-[10px] font-semibold text-slate-500 mb-1">Jumlah</label>
                    <input type="number" id="resep-jumlah" min="1" value="10" class="w-full px-2 py-1 border border-slate-300 rounded-md text-xs text-center focus:outline-none">
                  </div>
                  <div class="col-span-1">
                    <button type="button" onclick="DokterModule.tambahItemResep()" class="w-full bg-slate-800 text-white text-xs font-medium py-1.5 rounded-md hover:bg-slate-700 transition">
                      + Masukkan
                    </button>
                  </div>
                </div>

                <!-- Daftar Draft Resep -->
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-slate-100 text-slate-500 font-semibold border-b border-slate-200">
                        <th class="p-2">Nama Obat</th>
                        <th class="p-2 text-center">Qty</th>
                        <th class="p-2 text-center">Hapus</th>
                      </tr>
                    </thead>
                    <tbody id="tbody-draft-resep" class="divide-y divide-slate-100 text-slate-700">
                      <tr><td colspan="3" class="text-center p-3 text-slate-400 italic">Belum ada obat dalam resep.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Submit Panel -->
              <div class="pt-2">
                <button type="submit" id="btn-submit-soap" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-3 rounded-xl shadow-md transition duration-150">
                  Simpan Hasil Pemeriksaan & Selesaikan Periksa
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    `;
  },

  init: function() {
    this.resepDraft = [];
    this.activeAntrian = null;
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('dokter-alert');
    alertBox.innerText = message;
    alertBox.className = `p-4 rounded-xl text-sm font-medium border transition-all duration-300 block mb-4 ${
      isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-600'
    }`;
    setTimeout(() => alertBox.classList.add('hidden'), 5000);
  },

  /**
   * Mengambil data pasien yang status antreannya sedang 'Pemeriksaan' di poli terkait
   */
  muatPasienPeriksa: async function() {
    const badge = document.getElementById('dokter-active-patient-badge');
    badge.innerText = "Memeriksa antrean server...";
    
    try {
      // Sebagai Dokter, kita default menarik antrean Poli Umum (bisa disesuaikan lewat config/session role kedepannya)
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=listAntrianHariIni&id_poli=POLI-UMUM`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        // Cari antrean yang statusnya khusus 'Pemeriksaan'
        const pasienAktif = res.data.find(a => a.status === 'Pemeriksaan');
        
        if (pasienAktif) {
          this.activeAntrian = pasienAktif;
          badge.className = "px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-700 animate-pulse";
          badge.innerText = `Memeriksa: ${pasienAktif.no_antrian} - ${pasienAktif.nama_pasien}`;
          
          this.muatRiwayatRM(pasienAktif.no_rm);
          this.resepDraft = [];
          this.renderDraftResepTable();
        } else {
          this.resetWorkspace("Tidak ada pasien berstatus 'Pemeriksaan' di papan antrean.");
        }
      } else {
        this.resetWorkspace("Antrean hari ini kosong.");
      }
    } catch (e) {
      this.resetWorkspace("Gagal memuat pasien aktif.");
      this.showAlert("Error sinkronisasi ruang periksa dokter.", false);
    }
  },

  resetWorkspace: function(msg) {
    this.activeAntrian = null;
    document.getElementById('dokter-active-patient-badge').className = "px-4 py-2 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600";
    document.getElementById('dokter-active-patient-badge').innerText = "Status: Menunggu...";
    document.getElementById('panel-riwayat-rm').innerHTML = `<div class="text-center py-12 text-slate-400 italic text-xs">${msg}</div>`;
  },

  /**
   * Membaca riwayat rekam medis lama pasien (Split-Screen View)
   */
  muatRiwayatRM: async function(noRM) {
    const container = document.getElementById('panel-riwayat-rm');
    container.innerHTML = `<div class="text-center py-8 text-xs text-slate-400">Menarik data rekam medis terdaftar...</div>`;

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getRiwayatRM&no_rm=${noRM}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        container.innerHTML = '';
        res.data.forEach(rm => {
          const tglStr = new Date(rm.tanggal_periksa).toLocaleDateString('id-ID', { dateStyle: 'medium' });
          
          // Parsing detail resep jika ada
          let resepHTML = '<span class="text-slate-400 italic">Tanpa resep obat</span>';
          if (rm.resep_json && rm.resep_json.length > 0) {
            resepHTML = '<ul class="list-disc list-inside space-y-0.5 text-slate-600 text-xs mt-1">';
            rm.resep_json.forEach(o => {
              // Fallback nama obat jika data object mentah
              resepHTML += `<li>${o.id_obat} (Jumlah: ${o.jumlah})</li>`;
            });
            resepHTML += '</ul>';
          }

          container.innerHTML += `
            <div class="border border-slate-200 p-4 rounded-xl space-y-2 bg-slate-50/50 hover:bg-slate-50 transition">
              <div class="flex justify-between items-center border-b border-slate-100 pb-1.5">
                <span class="text-xs font-bold text-slate-700">${tglStr}</span>
                <span class="text-[10px] font-mono font-semibold text-slate-400 bg-white border px-2 py-0.5 rounded">${rm.id_rm}</span>
              </div>
              <div class="grid grid-cols-3 gap-1 text-[11px] bg-white border p-1.5 rounded-lg text-slate-500">
                <div>TD: <span class="font-medium text-slate-700">${rm.tekanan_darah || '-'}</span></div>
                <div>Suhu: <span class="font-medium text-slate-700">${rm.suhu || '-'}°C</span></div>
                <div>Nadi: <span class="font-medium text-slate-700">${rm.nadi || '-'}</span></div>
              </div>
              <div>
                <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Keluhan / Anamnesa:</span>
                <p class="text-xs text-slate-700 mt-0.5 font-medium">${rm.keluhan_utama}</p>
              </div>
              <div class="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">ICD-10:</span>
                  <span class="text-xs font-semibold text-emerald-700">${rm.diagnosa_icd10}</span>
                </div>
                <div>
                  <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Tindakan:</span>
                  <span class="text-xs text-slate-600">${rm.tindakan || '-'}</span>
                </div>
              </div>
              <div class="pt-1 border-t border-slate-100">
                <span class="block text-[10px] font-bold uppercase tracking-wider text-slate-400">E-Resep:</span>
                ${resepHTML}
              </div>
            </div>
          `;
        });
      } else {
        container.innerHTML = `<div class="text-center py-12 text-slate-400 italic text-xs">Pasien Baru (Belum memiliki riwayat kunjungan klinik).</div>`;
      }
    } catch (err) {
      container.innerHTML = `<div class="text-center py-12 text-red-400 italic text-xs">Gagal memuat histori rekam medis.</div>`;
    }
  },

  /**
   * Menambahkan item obat ke dalam draft e-resep internal JS
   */
  tambahItemResep: function() {
    const selectObat = document.getElementById('resep-id-obat');
    const idObat = selectObat.value;
    const namaObat = selectObat.options[selectObat.selectedIndex].text;
    const jumlah = document.getElementById('resep-jumlah').value;

    if (!jumlah || Number(jumlah) < 1) return;

    // Cek duplikasi item obat di resep
    const exist = this.resepDraft.find(item => item.id_obat === idObat);
    if (exist) {
      exist.jumlah = Number(exist.jumlah) + Number(jumlah);
    } else {
      this.resepDraft.push({
        id_obat: idObat,
        nama_obat: namaObat,
        jumlah: Number(jumlah)
      });
    }

    this.renderDraftResepTable();
  },

  hapusItemResep: function(idObat) {
    this.resepDraft = this.resepDraft.filter(item => item.id_obat !== idObat);
    this.renderDraftResepTable();
  },

  renderDraftResepTable: function() {
    const tbody = document.getElementById('tbody-draft-resep');
    if (this.resepDraft.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="text-center p-3 text-slate-400 italic">Belum ada obat dalam resep.</td></tr>`;
      return;
    }

    tbody.innerHTML = '';
    this.resepDraft.forEach(item => {
      tbody.innerHTML += `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-2 font-medium text-slate-700">${item.nama_obat}</td>
          <td class="p-2 text-center font-bold text-slate-800">${item.jumlah}</td>
          <td class="p-2 text-center">
            <button type="button" onclick="DokterModule.hapusItemResep('${item.id_obat}')" class="text-red-500 hover:text-red-700 font-bold">✕</button>
          </td>
        </tr>
      `;
    });
  },

  /**
   * Mengirim data entri rekam medis SOAP komplit ke server backend GAS
   */
  handleSimpanSOAP: async function(e) {
    e.preventDefault();

    if (!this.activeAntrian) {
      this.showAlert("Pilih pasien aktif yang diperiksa terlebih dahulu sebelum men-submit.", false);
      return;
    }

    const btn = document.getElementById('btn-submit-soap');
    btn.disabled = true;
    btn.innerText = "Menyimpan Data SOAP & Resep...";

    const payload = {
      api_key: CONFIG.API_KEY,
      action: 'simpanSOAP',
      no_rm: this.activeAntrian.no_rm,
      id_antrian: this.activeAntrian.id_antrian,
      id_dokter: this.activeAntrian.id_dokter,
      keluhan_utama: document.getElementById('soap-keluhan').value,
      tekanan_darah: document.getElementById('soap-td').value,
      nadi: document.getElementById('soap-nadi').value,
      suhu: document.getElementById('soap-suhu').value,
      berat_badan: document.getElementById('soap-bb').value,
      tinggi_badan: document.getElementById('soap-tb').value,
      saturasi: document.getElementById('soap-saturasi').value,
      diagnosa_icd10: document.getElementById('soap-icd10').value,
      tindakan: document.getElementById('soap-tindakan').value,
      resep_json: this.resepDraft // Dikirim sebagai array object, akan di-stringify otomatis oleh JSON server
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
        this.showAlert("Sukses! Data SOAP Rekam Medis pasien berhasil diamankan di database master.");
        document.getElementById('form-soap-dokter').reset();
        this.resepDraft = [];
        this.renderDraftResepTable();
        this.resetWorkspace("Pemeriksaan klinis sebelumnya berhasil diselesaikan.");
      } else {
        this.showAlert(res.message || "Gagal menyimpan rekam medis.", false);
        btn.disabled = false;
        btn.innerText = "Simpan Hasil Pemeriksaan & Selesaikan Periksa";
      }
    } catch (err) {
      this.showAlert("Error: Gagal menghubungi server backend.", false);
      btn.disabled = false;
      btn.innerText = "Simpan Hasil Pemeriksaan & Selesaikan Periksa";
    }
  }
};

// Daftarkan ke scope window utama
window.DokterModule = DokterModule;
