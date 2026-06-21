const axios = require('axios');

const number = process.argv[2];
const message = process.argv[3] || 'Halo! Ini adalah pesan uji coba dari sistem Found It.';

if (!number) {
    console.log('Gunakan perintah: node test-wa.js <Nomor_HP_Anda> "[Pesan_Opsional]"');
    console.log('Contoh: node test-wa.js 081234567890');
    process.exit(1);
}

axios.post('http://localhost:3000/send-message', {
    number: number,
    message: message
}).then(res => {
    console.log('Respons Server:', res.data);
    console.log('✅ Pesan berhasil dikirim!');
}).catch(err => {
    console.error('❌ Gagal mengirim pesan!');
    console.error('Pesan Error:', err.response ? err.response.data : err.message);
    if (!err.response) {
        console.error('⚠️ Pastikan Anda sudah menyalakan "node index.js" di terminal terpisah!');
    }
});
