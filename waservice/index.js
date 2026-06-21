const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isClientReady = false;

client.on('qr', (qr) => {
    console.log('\n=========================================');
    console.log('QR RECEIVED! Silakan scan dengan HP Anda:');
    console.log('=========================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n=========================================');
    console.log('CLIENT IS READY! Sistem WhatsApp aktif.');
    console.log('=========================================\n');
    isClientReady = true;
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
    isClientReady = false;
});

client.initialize();

// Helper to format phone number
function formatPhoneNumber(number) {
    if (!number) return null;
    let clean = number.toString().replace(/\D/g, '');
    if (clean.startsWith('0')) {
        clean = '62' + clean.slice(1);
    } else if (clean.startsWith('8')) {
        clean = '62' + clean;
    }
    return `${clean}@c.us`;
}

// Endpoint to send messages
app.post('/send-message', async (req, res) => {
    if (!isClientReady) {
        return res.status(503).json({ status: 'error', message: 'WhatsApp client is not ready yet. Please check the server console and scan the QR code if necessary.' });
    }

    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ status: 'error', message: 'Phone number and message are required.' });
    }

    const chatId = formatPhoneNumber(number);

    try {
        await client.sendMessage(chatId, message);
        console.log(`[BERHASIL] Pesan terkirim ke: ${number}`);
        res.status(200).json({ status: 'success', message: 'Message sent successfully.' });
    } catch (error) {
        console.error(`[GAGAL] Gagal mengirim pesan ke ${number}:`, error);
        res.status(500).json({ status: 'error', message: 'Failed to send message.', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server WhatsApp API berjalan di http://localhost:${PORT}`);
    console.log('Tunggu beberapa saat hingga Client Ready atau muncul QR Code...');
});
