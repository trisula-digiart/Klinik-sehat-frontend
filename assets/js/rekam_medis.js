/**
 * rekam_medis.js
 * Modul Frontend untuk Pencarian & Manajemen Berkas Rekam Medis Digital Pasien - adminHMD Pure Bootstrap 5 Version
 */

const RekamMedisModule = {
  selectedPasienRM: null,

  /**
   * Merender struktur halaman Rekam Medis murni Bootstrap 5 template adminHMD
   * @return {String}
   */
  render: function() {
    return `
      <div class="animate-fadeIn">
        <!-- Notifikasi Box -->
        <div id="rm-alert" class="hidden alert alert-dismissible fade show p-3 rounded-3 mb-4" role="alert"></div>

        <!-- Filter Pencarian Pasien -->
        <div class="panel mb-4">
          <div class="row align-items-center g-3">
            <div class="col-12 col-md-6">
              <span class="small fw-medium text-muted">
                <i class="bi bi-folder2-open text-primary me-2"></i>Arsip & Dokumen Rekam Medis Digital Pasien
              </span>
            </div>
            <div class="col-12 col-md-6">
              <div class="input-group">
                <input type="text" id="rm-search-keyword" placeholder="Masukkan NIK, Nama, atau No. RM Pasien..." class="form-control form-control-sm">
                <button onclick="RekamMedisModule.cariRekamMedis()" class="btn btn-dark btn-sm px-3" type="button">
                  <i class="bi bi-search me-1"></i>Cari Berkas
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Workspace Utama: Riwayat Arsip Kunjungan -->
        <div class="row g-4 align-items-start">
          
          <!-- PANEL KIRI: Ringkasan Biodata Sosial Pasien -->
          <div class="col-12 col-lg-4">
            <div class="panel" style="min-height: 500px;">
              <div class="panel-header border-b pb-3 mb-3">
                <h3 class="h6 section-title mb-0">
                  <i class="bi bi-person-badge me-2"></i>Identitas Pasien
                </h3>
              </div>
              <div id="rm-patient-biodata" class="small text-muted">
                <div class="blank-state py-5 text-center my-auto mx-auto">
                  <i class="bi bi-person-vcard display-5 d-block mb-2 text-opacity-25 text-secondary"></i>
                  <span class="italic">Cari pasien terlebih dahulu untuk memuat ringkasan identitas.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- PANEL KANAN: Timeline / Daftar Kunjungan Rekam Medis -->
          <div class="col-12 col-lg-8">
            <div class="panel" style="min-height: 500px; display: flex; flex-direction: column;">
              <div class="panel-header border-b pb-3 mb-3">
                <h4 class="h6 section-title mb-0">
                  <i class="bi bi-clock-history me-2"></i>Daftar Riwayat Kunjungan & SOAP Medis
                </h4>
              </div>

              <div id="rm-history-stream" class="flex-grow-1 overflow-y-auto pe-1 custom-scrollbar text-muted small">
                <div class="blank-state py-5 text-center my-auto mx-auto">
                  <i class="bi bi-journal-x display-5 d-block mb-2 text-opacity-25 text-secondary"></i>
                  <span class="italic">Daftar riwayat pemeriksaan klinis akan tampil secara kronologis di sini.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  /**
   * Inisialisasi awal modul
   */
  init: function() {
    this.selectedPasienRM = null;
  },

  showAlert: function(message, isSuccess = true) {
    const alertBox = document.getElementById('rm-alert');
    alertBox.innerText = message;
    alertBox.className = `alert alert-dismissible fade show p-3 rounded-3 mb-4 d-block ${
      isSuccess ? 'alert-success border-success-subtle text-success' : 'alert-danger border-danger-subtle text-danger'
    }`;
    setTimeout(() => alertBox.className = 'hidden', 5000);
  },

  /**
   * Menjalankan pencarian rekam medis terintegrasi via API
   */
  cariRekamMedis: async function() {
    const kw = document.getElementById('rm-search-keyword').value.trim();
    const biodataBox = document.getElementById('rm-patient-biodata');
    const streamBox = document.getElementById('rm-history-stream');

    if (!kw) {
      this.showAlert("Masukkan kata kunci pencarian (NIK/Nama/No.RM).", false);
      return;
    }

    biodataBox.innerHTML = `<div class="text-center py-4"><span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>Mencari data sosial...</div>`;
    streamBox.innerHTML = `<div class="text-center py-4"><span class="spinner-border spinner-border-sm text-primary me-2" role="status"></span>Menarik berkas klinis...</div>`;

    try {
      // Step 1: Cari profil pasien
      const patientUrl = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=cariPasien&keyword=${encodeURIComponent(kw)}`;
      const patientRes = await fetch(patientUrl, { method: 'GET', mode: 'cors' });
      const patientData = await patientRes.json();

      if (patientData.success && patientData.data.length > 0) {
        const pasien = patientData.data[0];
        this.selectedPasienRM = pasien.no_rm;

        // Render Panel Identitas Pasien
        biodataBox.innerHTML = `
          <div class="table-responsive border rounded-3 bg-light p-2 mb-3">
            <table class="table table-sm table-borderless mb-0 align-middle text-muted" style="font-size: 0.8rem;">
              <tr><td class="fw-bold text-secondary" style="width: 100px;">No. RM</td><td>: <span class="fw-bold text-body font-mono text-primary">${pasien.no_rm}</span></td></tr>
              <tr><td class="fw-bold text-secondary">Nama Lengkap</td><td>: <span class="fw-medium text-body">${pasien.nama}</span></td></tr>
              <tr><td class="fw-bold text-secondary">NIK</td><td>: <span class="text-body">${pasien.nik}</span></td></tr>
              <tr><td class="fw-bold text-secondary">Tgl Lahir</td><td>: <span class="text-body">${pasien.tanggal_lahir}</span></td></tr>
              <tr><td class="fw-bold text-secondary">Gender</td><td>: <span class="text-body">${pasien.jenis_kelamin}</span></td></tr>
              <tr><td class="fw-bold text-secondary">Penjamin</td><td>: <span class="badge ${pasien.jenis_penjamin === 'BPJS' ? 'bg-primary' : 'bg-warning text-dark'}">${pasien.jenis_penjamin}</span></td></tr>
              <tr><td class="fw-bold text-secondary">Nomor HP</td><td>: <span class="text-body">${pasien.nomor_hp || '-'}</span></td></tr>
              <tr><td class="fw-bold text-secondary">Alamat</td><td>: <span class="text-body d-block text-wrap" style="max-width:180px;">${pasien.alamat}</span></td></tr>
            </table>
          </div>
        `;

        // Step 2: Tarik Histori SOAP Klinis Pasien
        this.muatAlurKronologisRM(pasien.no_rm);
      } else {
        this.resetWorkspace("Data pasien tidak ditemukan.");
      }
    } catch (err) {
      this.resetWorkspace("Gagal memproses pencarian berkas.");
      this.showAlert("Error sinkronisasi database rekam medis.", false);
    }
  },

  /**
   * Memuat rentetan rekam medis dari server ke panel kanan secara kronologis
   */
  muatAlurKronologisRM: async function(noRM) {
    const streamBox = document.getElementById('rm-history-stream');

    try {
      const url = `${CONFIG.BASE_URL}?api_key=${CONFIG.API_KEY}&action=getRiwayatRM&no_rm=${noRM}`;
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      const res = await response.json();

      if (res.success && res.data.length > 0) {
        streamBox.innerHTML = '';
        res.data.forEach(rm => {
          const tglStr = new Date(rm.tanggal_periksa).toLocaleDateString('id-ID', { dateStyle: 'medium' });
          
          let resepHTML = '<span class="text-muted italic small">Tanpa resep obat</span>';
          if (rm.resep_json && rm.resep_json.length > 0) {
            resepHTML = '<ul class="list-group list-group-flush border rounded-3 mt-1" style="font-size:0.8rem;">';
            rm.resep_json.forEach(o => {
              resepHTML += `<li class="list-group-item bg-light p-2"><i class="bi bi-capsule-pill me-1 text-primary"></i>${o.id_obat} <span class="badge bg-secondary float-end">${o.jumlah} Pcs</span></li>`;
            });
            resepHTML += '</ul>';
          }

          streamBox.innerHTML += `
            <div class="border rounded-3 p-3 mb-3 bg-light">
              <div class="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                <span class="fw-bold text-body"><i class="bi bi-calendar-event me-2 text-primary"></i>${tglStr}</span>
                <span class="badge text-bg-secondary font-mono">${rm.id_rm}</span>
              </div>
              <div class="row g-1 text-center small bg-white border rounded-3 p-2 mb-2 text-muted">
                <div class="col-4 border-end">TD: <span class="fw-bold text-body">${rm.tekanan_darah || '-'}</span></div>
                <div class="col-4 border-end">Suhu: <span class="fw-bold text-body">${rm.suhu || '-'}°C</span></div>
                <div class="col-4">Nadi: <span class="fw-bold text-body">${rm.nadi || '-'}</span></div>
              </div>
              <div class="mb-2">
                <span class="d-block small fw-bold text-uppercase tracking-wider text-muted" style="font-size:0.7rem;">Anamnesa & Keluhan (Subjective):</span>
                <p class="mb-0 text-body fw-medium mt-0.5">${rm.keluhan_utama}</p>
              </div>
              <div class="row g-2 mb-2">
                <div class="col-6">
                  <span class="d-block small fw-bold text-uppercase tracking-wider text-muted" style="font-size:0.7rem;">ICD-10 (Assessment):</span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle mt-0.5">${rm.diagnosa_icd10}</span>
                </div>
                <div class="col-6">
                  <span class="d-block small fw-bold text-uppercase tracking-wider text-muted" style="font-size:0.7rem;">Tindakan Klinik (Plan):</span>
                  <span class="text-body d-block mt-0.5">${rm.tindakan || '-'}</span>
                </div>
              </div>
              <div class="pt-2 border-top">
                <span class="d-block small fw-bold text-uppercase tracking-wider text-muted mb-1" style="font-size:0.7rem;">Terapi E-Resep Obat:</span>
                ${resepHTML}
              </div>
            </div>
          `;
        });
      } else {
        streamBox.innerHTML = `
          <div class="blank-state py-5 text-center my-auto mx-auto text-muted">
            <i class="bi bi-person-workspace display-5 text-success d-block mb-2"></i>
            <span class="fw-bold text-success d-block mb-1">Kunjungan Perdana</span>
            <span class="small text-muted">Pasien terdaftar namun belum memiliki catatan rekam medis SOAP.</span>
          </div>`;
      }
    } catch (err) {
      streamBox.innerHTML = `<div class="text-center py-4 text-danger small"><i class="bi bi-x-octagon-fill me-1"></i>Gagal menarik data histori klinis.</div>`;
    }
  },

  resetWorkspace: function(msg) {
    this.selectedPasienRM = null;
    document.getElementById('rm-patient-biodata').innerHTML = `
      <div class="blank-state py-5 text-center my-auto mx-auto text-muted">
        <i class="bi bi-person-vcard display-5 d-block mb-2 text-opacity-25 text-secondary"></i>
        <span>${msg}</span>
      </div>`;
    document.getElementById('rm-history-stream').innerHTML = `
      <div class="blank-state py-5 text-center my-auto mx-auto text-muted">
        <i class="bi bi-journal-x display-5 d-block mb-2 text-opacity-25 text-secondary"></i>
        <span>${msg}</span>
      </div>`;
  }
};

window.RekamMedisModule = RekamMedisModule;
