const express = require('express');
const axios = require('axios');
const cors = require('cors');
// Import pembatas kecepatan
const rateLimit = require('express-rate-limit'); 

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- 1. SETTING ANTI-SPAM ---
// Membatasi: 1 IP hanya boleh request 20 kali dalam 5 menit
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 menit
    max: 20, // Limit setiap IP maksimal 20 request
    message: { success: false, error: "Terlalu banyak request! Santai dulu 5 menit ya. ☕" }
});

// Pasang satpam ini di rute download
app.use('/download', limiter);
// -----------------------------

function isValidTikTokUrl(stringUrl) {
    return stringUrl && stringUrl.includes('tiktok.com');
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/download', async (req, res) => {
    let { url } = req.body;

    // Hapus log ini agar privasi lebih terjaga di server publik
    // console.log("Memproses URL:", url); 

    const urlMatch = url.match(/https?:\/\/[^\s]+/);
    if (urlMatch) { url = urlMatch[0]; }

    if (!isValidTikTokUrl(url)) {
        return res.json({ success: false, error: 'Link tidak valid!' });
    }

    try {
        const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
        const data = response.data;

        if (data.code === 0) {
            if (data.data.images && data.data.data.images.length > 0) {
                return res.json({ success: false, error: 'Maaf, ini postingan Foto Slide.' });
            }
            res.json({
                success: true,
                title: data.data.title,
                cover: data.data.cover,
                author: data.data.author.nickname,
                video_url: data.data.play,
                hd_url: data.data.hdplay,
                music_url: data.data.music
            });
        } else {
            res.json({ success: false, error: 'Video tidak ditemukan / Private.' });
        }
    } catch (error) {
        // Jangan tampilkan detail error server ke pengguna (bahaya), cukup pesan umum
        res.status(500).json({ error: 'Server sedang sibuk.' });
    }
});

// ... kode lainnya di atas ...

// --- KHUSUS ROBOTS.TXT (Supaya Google tidak bingung) ---
app.get('/robots.txt', (req, res) => {
    res.type('text/plain'); // Memaksa server bilang: "Ini Teks Biasa, Bukan HTML"
    res.send("User-agent: *\nAllow: /");
});

// --- MENYALAKAN SERVER (Ini yang paling bawah, jangan diubah) ---
app.listen(PORT, () => {
    // ...
});

// ... kode robots.txt yang tadi ...

// --- SITEMAP XML (Peta Situs untuk Google) ---
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml'); // Kasih tahu browser ini format XML
    const date = new Date().toISOString().split('T')[0]; // Tanggal hari ini
    
    // Ganti LINK_INI dengan link asli render kamu (tanpa garis miring di akhir)
    const myDomain = "https://tiktok-sgproject.onrender.com"; 

    res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>${myDomain}/</loc>
            <lastmod>${date}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>
    </urlset>`);
});

// ... app.listen ada di bawah sini ...

app.listen(PORT, () => {
    console.log(`Server Aman + Anti-Spam berjalan di Port ${PORT}`);
});