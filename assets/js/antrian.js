/**
 * antrian.js
 * Modul Frontend untuk Papan Monitor Antrean Live, Manajemen Pemanggilan, dan Update Status - adminHMD Pure Bootstrap 5 Version
 */

const AntrianModule = {
  // State lokal untuk manajemen data antrean di frontend
  currentPoli: 'POLI-UMUM',
  listAntrian: [],

  /**
   * Merender struktur tampilan dasar dashboard antrean murni Bootstrap 5 template adminHMD
   * @return {String}
   */
  render: function() {
    return `
      <div class="animate-fadeIn">
        <!-- Header & Dropdown Filter Poliklinik -->
        <div class="panel mb-4">
          <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
            <span class="small fw-medium text-muted">
              <i class="bi bi-clipboard-check text-primary me-2"></i>Manajemen Alur Panggilan & Antrean Live Pasien
            </span>
            <div class="d-flex align-items-center gap-2">
              <label class="small fw-bold text-uppercase text-muted mb-0" style="font-size: 0.75rem; white-space: nowrap;">Pilih Poliklinik:</label>
              <select id="filter-poli-antrian" onchange="AntrianModule.handlePoliChange(this.value)" class="form-select form-select-sm" style="width: 180px;">
                <option value="POLI-UMUM">Poli Umum (A)</option>
                <option value="POLI-GIGI">Poli Gigi (B)</option>
                <option value="POLI-ANAK">Poli Anak (C)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Papan Tampilan Utama Pemanggilan (Hero Section) & Tabel -->
        <div class="row g-4 align-items-start">
          
          <!-- PANEL KIRI: Display Pemanggilan Utama (Hero Call Box) -->
          <div class="col-12 col-lg-4">
            <div class="panel text-bg-dark border-secondary p-4 text-center d-flex flex-column justify-content-between" style="min-height: 400px;">
              <div>
                <span class="d-block small fw-bold text-uppercase tracking-wider text-success mb-2" style="font-size: 0.75rem;">Panggilan Aktif</span>
                <h3 id="display-nama-pasien" class="h5 fw-bold text-white text-truncate mb-1">Tidak Ada Pasien</h3>
                <p id="display-poli-nama" class="small text-muted mb-0">Poliklinik Umum</p>
              </div>
              
              <div class="my-4">
                <span class="d-block small text-muted text-uppercase tracking-wider" style="font-size: 0.75rem;">Nomor Urut</span>
                <span id="display-nomor-antrian" class="display-3 fw-black text-success my-2 d-block tracking-tight">---</span>
              </div>

              <div class="row g-2">
                <div class="col-6">
                  <button onclick="AntrianModule.panggilSuara()" class="btn btn-success w-100 py-2.5 fw-bold shadow-sm">
                    <i class="bi bi-volume-up-fill me-1"></i>Panggil
                  </button>
                </div>
                <div class="col-6">
                  <button onclick="AntrianModule.cetakUlangStruk()" class="btn btn-secondary w-100 py-2.5 fw-bold shadow-sm">
                    <i class="bi bi-printer-fill me-1"></i>Struk
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- PANEL KANAN: Alur Kerja Antrean Terjadwal -->
          <div class="col-12 col-lg-8">
            <div class="panel" style="min-height: 400px; display: flex; flex-direction: column;">
              <div class="panel-header border-b pb-3 mb-3 d-flex justify-content-between align-items-center">
                <h4 class="h6 section-title mb-0">
                  <i class="bi bi-list-ol me-2"></i>Daftar Urutan Monitor
                </h4>
                <button onclick="AntrianModule.muatDataAntrian()" class="btn btn-link text-primary btn-sm p-0 m-0 text-decoration-none fw-semibold small">
                  <i class="bi bi-arrow-clockwise me-1"></i>Refresh Data
                </button>
              </div>

              <div class="table-responsive border rounded-3 bg-white flex-grow-1 mb-0">
                <table class="table table-sm table-hover mb-0 text-center align-middle" style="font-size: 0.85rem;">
                  <thead>
                    <tr class="bg-body-secondary text-muted uppercase tracking-wider small">
                      <th class="p-2" style="width: 100px;">No. Antrean</th>
                      <th class="p-2" style="width: 90px;">No. RM</th>
                      <th class="p-2 text-start ps-3">Nama Pasien</th>
                      <th class="p-2" style="width: 120px;">Status</th>
                      <th class="p-2" style="width: 130px;">Aksi Operasional</th>
                    </tr>
                  </thead>
                  <tbody id="tbody-antrian-live">
                    <!-- Data di-render dinamis via JS -->
                  </tbody>
                </table>
                <div id="antrian-empty-state" class="hidden blank-state py-5 text-center my-auto mx-auto text-muted">
                  <i class="bi bi-clipboard-x display-6 d-block mb-2 text-opacity-25 text-secondary"></i>
                  <span class="small italic">Tidak ada antrean aktif pada poliklinik ini hari ini.</span>
                </div>
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
    
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>Sinkronisasi data antrean server...</td></tr>`;
    emptyState.classList.add('hidden');

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=listAntrianHariIni&id_poli=${this.currentPoli}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        this.listAntrian = res.data;
        tbody.innerHTML = '';
        
        const antrianAktif = this.listAntrian.find(a => a.status === 'Dipanggil') || this.listAntrian[0];
        this.updateHeroDisplay(antrianAktif);

        this.listAntrian.forEach(item => {
          let statusBadgeClass = "text-bg-warning";
          if (item.status === 'Dipanggil') statusBadgeClass = "text-bg-primary";
          if (item.status === 'Pemeriksaan') statusBadgeClass = "text-bg-success";
          if (item.status === 'Apotek') statusBadgeClass = "text-bg-info text-dark";
          if (item.status === 'Selesai') statusBadgeClass = "text-bg-secondary";

          let tombolAksi = '';
          if (item.status === 'Menunggu') {
            tombolAksi = `<button onclick="AntrianModule.ubahStatus('${item.id_antrian}', 'Dipanggil')" class="btn btn-dark btn-sm py-1 px-2 text-nowrap" style="font-size:0.75rem;"><i class="bi bi-volume-up-fill me-1"></i>Panggil</button>`;
          } else if (item.status === 'Dipanggil') {
            tombolAksi = `<button onclick="AntrianModule.ubahStatus('${item.id_antrian}', 'Pemeriksaan')" class="btn btn-success btn-sm py-1 px-2 text-nowrap" style="font-size:0.75rem;"><i class="bi bi-play-fill me-1"></i>Mulai Periksa</button>`;
          } else {
            tombolAksi = `<span class="text-muted italic small">Selesai</span>`;
          }

          tbody.innerHTML += `
            <tr class="transition">
              <td class="p-2 fw-bold text-body">${item.no_antrian}</td>
              <td class="p-2 font-mono text-muted small">${item.no_rm}</td>
              <td class="p-2 text-start ps-3 fw-medium text-body">${item.nama_pasien || '-'}</td>
              <td class="p-2">
                <span class="badge ${statusBadgeClass} px-2 py-1 small">${item.status}</span>
              </td>
              <td class="p-2">${tombolAksi}</td>
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
      emptyState.innerHTML = `<span class="text-danger small"><i class="bi bi-exclamation-triangle-fill me-1"></i>Gagal memproses muat data antrean dari server.</span>`;
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
      const ejaan = nomorAntrian.split('').join(' ');
      const text = `Nomor antrean, ${ejaan}, silakan menuju ke ruang periksa poliklinik.`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.85;
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

window.AntrianModule = AntrianModule;
