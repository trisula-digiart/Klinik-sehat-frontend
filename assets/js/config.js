/**
 * config.js
 * Konfigurasi Global REST API Endpoint untuk Koneksi ke Backend Google Apps Script
 */

const CONFIG = {
  // GANTI dengan URL Web App URL yang didapatkan setelah Deploy/Publish Google Apps Script Anda
  BASE_URL: "https://script.google.com/macros/s/AKfycbyr_xZi9qdUFXy6fprJcrl-Jqe36j28fJYAQ23eWO8J5h5j0vFxtBTijt6WKOlq6_R1/exec",
  
  // Wajib sama dengan token API_KEY yang ada di file Main.gs backend
  API_KEY: "KLINIK_SEHAT_SECRET_TOKEN_2026"
};

// Bekukan objek agar konfigurasi tidak dapat diubah secara tidak sengaja oleh script lain
Object.freeze(CONFIG);
