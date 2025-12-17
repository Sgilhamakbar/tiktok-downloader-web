const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// PENTING: Gunakan PORT dari sistem cloud, atau 3000 kalau di laptop
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- UPDATE AGAR BISA BACA INDEX.HTML ---
app.use(express.static(__dirname)); 

// --- FUNGSI SATPAM (VALIDATOR) ---
function isValidTikTokUrl(stringUrl) {
    try {
        const urlObj = new URL(stringUrl);
        return urlObj.hostname.includes('tiktok.com');
    } catch (err) {
        return false; 
    }
}

// Route Tampilan Utama
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Route Download
app.post('/download', async (req, res) => {
    const { url } = req.body;

    if (!url) return res.status(400).json({ error: 'Mohon masukkan URL TikTok.' });

    if (!isValidTikTokUrl(url)) {
        return res.json({ success: false, error: 'Bahaya! Link ini bukan dari TikTok. 🛡️' });
    }

    try {
        const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
        const data = response.data;

        if (data.code === 0) {
            if (data.data.images && data.data.images.length > 0) {
                return res.json({ success: false, error: 'Link ini berisi Foto Slide. Web ini khusus Video ya! 😅' });
            }
            res.json({
                success: true,
                title: data.data.title,
                cover: data.data.cover,
                download_url: data.data.play 
            });
        } else {
            res.json({ success: false, error: 'Video tidak ditemukan / Link Private.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di Port ${PORT}`);
});