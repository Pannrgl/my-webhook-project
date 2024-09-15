const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middleware untuk parsing JSON
app.use(bodyParser.json());

// Middleware untuk menyajikan file statis dari direktori root dan css
app.use('/css', express.static(path.join(__dirname, 'css')));
const TELEGRAM_API_TOKEN = '';
const TELEGRAM_CHAT_ID = '';


// Route untuk menyajikan halaman utama
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route untuk menerima webhook dan menampilkan pesan pop-up
app.post('/webhook', (req, res) => {
    const alert = req.body;
    let message = '';

    if (alert.text.includes('BUY')) {
        message = `📈 BUY Signal: Sinyal Beli terdeteksi.\n💰 Harga saat ini: ${alert.price}`;
    } else if (alert.text.includes('SELL')) {
        message = `📉 SELL Signal: Sinyal Jual terdeteksi.\n💰 Harga saat ini: ${alert.price}`;
    }

    // Kirim pesan ke Telegram
    axios.post(`https://api.telegram.org/bot${TELEGRAM_API_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message
    }).then(response => {
        console.log('Message sent to Telegram:', response.data);

        // Emit pesan ke klien melalui Socket.io
        io.emit('alert', message);

        // Kirim respon ke klien
        res.status(200).send('Alert received and processed');
    }).catch(error => {
        console.error('Error sending message to Telegram:', error);
        res.status(500).send('Error processing alert');
    });
});

// Saat klien terhubung, siapkan listener untuk menerima pesan pop-up
io.on('connection', (socket) => {
    console.log('A user connected');

    // Tampilkan pesan pop-up saat menerima pesan dari server
    socket.on('popup', (message) => {
        console.log('Popup message:', message);
        // Tambahkan kode untuk menampilkan pesan pop-up di halaman utama di sini
        // Contoh: alert(message);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
