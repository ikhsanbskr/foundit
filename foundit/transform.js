const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/OfficerLostList.jsx', 'utf8');

// Remove VerifyModal
code = code.replace(/\/\/ ─── Verification & Compare Modal.*?\/\/ ─── Main Component/s, '// ─── Main Component');

// Rename component
code = code.replace(/OfficerInventory/g, 'OfficerLostList');

// Fetch LOST instead of FOUND
code = code.replace(/type=FOUND/g, 'type=LOST');

// Remove handleUpdateStatus
code = code.replace(/const handleUpdateStatus.*?\}\);\n  \};/s, '');

// Titles
code = code.replace(/Inventaris Barang Temuan/g, 'Daftar Laporan Kehilangan');
code = code.replace(/Kelola dan verifikasi klaim barang temuan dengan laporan kehilangan\./g, 'Daftar referensi barang yang dilaporkan hilang oleh pengguna (Read-only).');

// Remove "Aksi" table header
code = code.replace(/<th className="px-6 py-4 font-semibold text-right">Aksi<\/th>/g, '');

// Remove "Aksi" table cell (the button td)
code = code.replace(/<td className="px-6 py-4 text-right">\s*<button[\s\S]*?<\/button>\s*<\/td>/g, '');

// Remove mobile action button
code = code.replace(/<button\s+onClick=\{.*?Verifikasi Kepemilikan\s+<\/button>/g, '');

// Remove VerifyModal rendering
code = code.replace(/\{selectedItem && \([\s\S]*?<VerifyModal[\s\S]*?\/>\s+\)\}/g, '');

fs.writeFileSync('src/pages/officer/OfficerLostList.jsx', code);
console.log("Done");
