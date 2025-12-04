#  EC-SecretNote (Secure Chat)

Aplikasi pesan instan sederhana yang mengimplementasikan **Kriptografi Kurva Eliptik (Elliptic Curve Cryptography)** untuk keamanan **End-to-End Encryption (E2EE)**. Aplikasi ini dirancang sebagai tugas mata kuliah Kriptografi.

Aplikasi ini memungkinkan dua pengguna (atau lebih) berkomunikasi secara aman dalam satu jaringan lokal (LAN/WiFi) menggunakan perangkat berbeda (Laptop & HP), di mana server hanya bertindak sebagai perantara dan tidak pernah mengetahui isi pesan asli.

---

##  Fitur Utama

*   **End-to-End Encryption:** Pesan dienkripsi di browser pengirim dan hanya bisa didekripsi di browser penerima.
*   **Zero-Knowledge Server:** Server (database) hanya menyimpan *Ciphertext* (teks acak). Admin server tidak bisa membaca pesan.
*   **Cross-Platform:** Bisa dijalankan antar Laptop, atau Laptop dengan HP (Android/iOS) dalam satu WiFi.
*   **Secure Key Storage:** Private Key pengguna disimpan di server dalam keadaan terenkripsi password (AES), sehingga aman namun portabel (bisa login di device lain).

---

##  Konsep Kriptografi (Cara Kerja)

Aplikasi ini mengadopsi skema **ECIES (Elliptic Curve Integrated Encryption Scheme)** yang merupakan adaptasi modern dari prinsip ElGamal pada kurva eliptik. Menggunakan kurva `secp256k1` (standar Bitcoin).

### 1. Pembangkitan Kunci (Key Generation)
Setiap user memiliki pasangan kunci:
*   **Private Key ($d$):** Rahasia, disimpan di sisi klien (browser).
*   **Public Key ($Q$):** Disebar ke server, dimana $Q = d \times G$ (G adalah titik generator kurva).

### 2. Enkripsi Pesan (Pengirim: Alice)
Saat Alice ingin mengirim pesan ke Bob:
1.  Alice mengambil **Public Key Bob**.
2.  Alice membuat kunci sementara (Ephemeral Key, $r$).
3.  Alice menghitung **Shared Secret** ($S$) menggunakan rumus ECDH: $S = r \times PubKeyBob$.
4.  Titik $S$ di-hash (SHA-256) menjadi kunci simetris untuk mengenkripsi pesan teks (menggunakan AES).
5.  **Output:** Alice mengirim Paket berisi `{Ephemeral Public Key, Ciphertext}`.

### 3. Dekripsi Pesan (Penerima: Bob)
Saat Bob menerima pesan:
1.  Bob mengambil **Ephemeral Public Key** milik Alice dari paket.
2.  Bob menghitung **Shared Secret** ($S$) yang sama menggunakan Private Key-nya: $S = PrivKeyBob \times EphemeralPubAlice$.
3.  Hasil $S$ di-hash menjadi kunci AES.
4.  Kunci tersebut digunakan untuk membuka *Ciphertext* menjadi pesan asli.

---

##  Teknologi yang Digunakan

*   **Runtime:** Node.js
*   **Backend:** Express.js & Socket.io (Real-time communication)
*   **Frontend:** HTML5, Bootstrap 5
*   **Library Kriptografi:**
    *   `elliptic` (untuk operasi matematika kurva secp256k1)
    *   `crypto-js` (untuk hashing SHA256 dan enkripsi AES)
    *   `bcryptjs` & `ip` (Utilities)

---

##  Cara Instalasi & Menjalankan

Pastikan sudah menginstall **Node.js** di komputer Anda.

1.  **Clone Repository ini:**
    ```bash
    git clone https://github.com/UsernameKamu/EC-SecretNote.git
    cd EC-SecretNote
    ```

2.  **Install Library:**
    ```bash
    npm install
    ```

3.  **Jalankan Server:**
    ```bash
    node server.js
    ```

4.  **Akses Aplikasi:**
    Lihat tampilan di terminal untuk alamat akses.
    *   **Di Laptop Server:** Buka `http://localhost:3000`
    *   **Di HP / Laptop Lain:** Buka alamat IP yang muncul, contoh `http://192.168.1.x:3000`

---

##  Skenario Pengujian (Demo)

1.  **Device A (Laptop):** Register dengan nama `Alice`.
2.  **Device B (HP):** Buka IP Laptop, Register dengan nama `Bob`.
3.  **Kirim Pesan:**
    *   Alice memilih "Bob" dan mengirim "Rahasia Perusahaan".
    *   Pesan dikirim sebagai kode acak (Ciphertext).
4.  **Terima Pesan:**
    *   Di HP Bob, pesan masuk berupa kotak hitam (Ciphertext).
    *   Bob menekan tombol **"DEKRIPSI"**.
    *   Sistem menghitung Shared Secret di background dan menampilkan "Rahasia Perusahaan".

---

##  Troubleshooting Jaringan

Jika HP tidak bisa mengakses server:
1.  Pastikan Laptop dan HP terhubung ke **WiFi yang sama**.
2.  Matikan sementara **Windows Firewall** di Laptop.
3.  Pastikan mengetik alamat dengan `http://` (bukan https) dan sertakan port `:3000`.

---
