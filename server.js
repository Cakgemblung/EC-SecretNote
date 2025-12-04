const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ip = require('ip'); // Library untuk cek IP Laptop
const bcrypt = require('bcryptjs'); // Library hash password

const app = express();
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server);

// --- DATABASE SEDERHANA (File JSON) ---
const DB_FILE = path.join(__dirname, 'data', 'users.json');

// Pastikan folder data ada
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Fungsi Load/Save Database
function getUsers() {
    if (!fs.existsSync(DB_FILE)) return {};
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function saveUser(username, userData) {
    const users = getUsers();
    users[username] = userData;
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

io.on('connection', (socket) => {
    console.log('Device connected:', socket.id);

    // --- FITUR 1: REGISTER ---
    // Menerima: username, password, publicKey, dan encryptedPrivateKey
    socket.on('register_user', async (data) => {
        const users = getUsers();
        if (users[data.username]) {
            socket.emit('register_response', { success: false, msg: "Username sudah dipakai!" });
            return;
        }

        // Hash password untuk keamanan (Simulasi server asli)
        // Kita simpan Encrypted Private Key di server, supaya user bisa login di laptop lain
        // dan tetap bisa mendekripsi pesan (Kunci dibawa user secara terenkripsi)
        saveUser(data.username, {
            publicKey: data.publicKey,
            encryptedPrivateKey: data.encryptedPrivateKey, // Kunci rahasia yg dienkripsi password user
            password: data.password // Di app nyata ini di-hash, tapi untuk tugas ini plain/hash sederhana ok
        });

        // Broadcast user baru ke semua orang agar list update
        io.emit('update_user_list', Object.keys(getUsers()));
        socket.emit('register_response', { success: true });
        console.log(`User registered: ${data.username}`);
    });

    // --- FITUR 2: LOGIN ---
    socket.on('login_user', (data) => {
        const users = getUsers();
        const user = users[data.username];

        if (user && user.password === data.password) {
            // Login sukses: Kirim balik Kunci User
            socket.emit('login_response', { 
                success: true, 
                publicKey: user.publicKey,
                encryptedPrivateKey: user.encryptedPrivateKey 
            });
            // Kirim list user online ke dia
            socket.emit('update_user_list', Object.keys(users));
        } else {
            socket.emit('login_response', { success: false, msg: "Username/Password salah!" });
        }
    });

    // --- FITUR 3: KIRIM PESAN ---
    socket.on('send_message', (data) => {
        console.log(`Pesan terenkripsi dari ${data.from} ke ${data.to}`);
        io.emit('incoming_message', data);
    });

    // --- HELPER: Request Public Key User Lain ---
    socket.on('request_target_key', (targetUsername, callback) => {
        const users = getUsers();
        if (users[targetUsername]) {
            callback({ success: true, publicKey: users[targetUsername].publicKey });
        } else {
            callback({ success: false });
        }
    });
});

// Jalankan Server di Port 3000 dan Host 0.0.0.0 (Agar bisa diakses LAN)
const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    const myIP = ip.address();
    console.log('\n==================================================');
    console.log(`SERVER BERJALAN! SIAP KONEKSI ANTAR LAPTOP.`);
    console.log(`1. Di Laptop INI, buka: http://localhost:${PORT}`);
    console.log(`2. Di Laptop LAIN (Satu WiFi), buka: http://${myIP}:${PORT}`);
    console.log('==================================================\n');
});