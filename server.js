const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// PENGATURAN PORT
// Ini penting agar jalan di Laptop (3000) DAN di Render (Otomatis)
const PORT = process.env.PORT || 3000;

// --- MIDDLEWARE (PENGAWAL) ---
app.use(cors());                 // Izinkan akses
app.use(express.json());         // Agar bisa baca data JSON
app.use(express.static(__dirname)); // Agar bisa baca file index.html di satu folder

// --- FUNGSI BANTUAN (VALIDASI) ---
function isValidTikTokUrl(stringUrl) {
    // Cek apakah teksnya ada, dan mengandung kata 'tiktok.com'
    return stringUrl && stringUrl.includes('tiktok.com');
}

// --- ROUTE 1: HALAMAN UTAMA ---
// Saat orang buka website, kasih file index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// --- ROUTE 2: PROSES DOWNLOAD ---
app.post('/download', async (req, res) => {
    let { url } = req.body;

    // 1. PEMBERSIHAN LINK (AUTO-CLEAN)
    // Berguna jika user copy dari tombol Share WA yang ada teks panjangnya.
    // Kita cari bagian yang dimulai dengan "http"
    const urlMatch = url.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
        url = urlMatch[0]; // Ambil hanya link-nya saja
    }

    console.log("Memproses URL:", url); // Cek di terminal link apa yang masuk

    // 2. CEK KEAMANAN
    if (!isValidTikTokUrl(url)) {
        return res.json({ 
            success: false, 
            error: 'Link tidak valid! Pastikan link mengandung tiktok.com' 
        });
    }

    try {
        // 3. MINTA DATA KE API TIKWM
        const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
        const data = response.data;

        // 4. CEK HASIL DARI API
        if (data.code === 0) {
            
            // Cek apakah ini Gambar/Slide (Bukan Video)
            if (data.data.images && data.data.images.length > 0) {
                return res.json({ 
                    success: false, 
                    error: 'Maaf, ini postingan Foto Slide. Web ini khusus Video ya! 😅' 
                });
            }

            // 5. KIRIM DATA KE FRONTEND
            // Kita kirim judul, cover, author, dan 3 jenis link download
            res.json({
                success: true,
                title: data.data.title,
                cover: data.data.cover,
                author: data.data.author.nickname,
                video_url: data.data.play,      // Kualitas Standar (No Watermark)
                hd_url: data.data.hdplay,       // Kualitas HD (Jika ada)
                music_url: data.data.music      // Audio Only (MP3)
            });

        } else {
            // Jika API bilang video tidak ditemukan
            res.json({ 
                success: false, 
                error: 'Video tidak ditemukan / Link Private / Dihapus.' 
            });
        }

    } catch (error) {
        console.error("Error Server:", error.message);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

// --- MENYALAKAN SERVER ---
app.listen(PORT, () => {
    console.log(`Server SIAP! Berjalan di Port ${PORT}`);
    console.log(`Buka di browser: http://localhost:${PORT}`);
});