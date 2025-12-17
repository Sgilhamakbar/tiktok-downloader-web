const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function isValidTikTokUrl(stringUrl) {
    try {
        const urlObj = new URL(stringUrl);
        return urlObj.hostname.includes('tiktok.com');
    } catch (err) { return false; }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/download', async (req, res) => {
    const { url } = req.body;

    if (!url || !isValidTikTokUrl(url)) {
        return res.json({ success: false, error: 'Link tidak valid!' });
    }

    try {
        const response = await axios.get(`https://www.tikwm.com/api/?url=${url}`);
        const data = response.data;

        if (data.code === 0) {
            // Cek jika gambar
            if (data.data.images && data.data.images.length > 0) {
                return res.json({ success: false, error: 'Maaf, ini postingan Foto Slide.' });
            }

            // KIRIM SEMUA OPSI KUALITAS KE FRONTEND
            res.json({
                success: true,
                title: data.data.title,
                cover: data.data.cover,
                author: data.data.author.nickname,
                // Opsi Download:
                video_url: data.data.play,      // Kualitas Standar (No Watermark)
                hd_url: data.data.hdplay,       // Kualitas HD (Jika ada)
                music_url: data.data.music      // Audio Only (MP3)
            });
        } else {
            res.json({ success: false, error: 'Video tidak ditemukan.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server v2 berjalan di Port ${PORT}`);
});