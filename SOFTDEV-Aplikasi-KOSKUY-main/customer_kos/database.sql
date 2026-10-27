-- Database initialization script for kosKuy
CREATE DATABASE IF NOT EXISTS koskuy;
USE koskuy;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    phone VARCHAR(20) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Kamar (Rooms) Table
CREATE TABLE IF NOT EXISTS kamar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kategori ENUM('Standard', 'Deluxe') NOT NULL DEFAULT 'Standard',
    harga INT NOT NULL,
    lokasi VARCHAR(255) NOT NULL,
    fasilitas TEXT NOT NULL, -- Comma separated facilities list
    deskripsi TEXT NOT NULL,
    gambar VARCHAR(255) NULL, -- URL or local path
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Booking Table
CREATE TABLE IF NOT EXISTS booking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    kamar_id INT NOT NULL,
    tanggal_mulai DATE NOT NULL,
    durasi_bulan INT NOT NULL,
    total_harga INT NOT NULL,
    status ENUM('Menunggu Pembayaran', 'Sudah Bayar', 'Disetujui', 'Ditolak', 'Dibatalkan') NOT NULL DEFAULT 'Menunggu Pembayaran',
    metode_pembayaran VARCHAR(50) NULL,
    nomor_pembayaran VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kamar_id) REFERENCES kamar(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Keluhan (Complaints) Table
CREATE TABLE IF NOT EXISTS keluhan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NULL,
    detail_keluhan TEXT NOT NULL,
    status ENUM('Pending', 'Selesai') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Ulasan (Reviews) Table
CREATE TABLE IF NOT EXISTS ulasan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    kamar_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    komentar TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kamar_id) REFERENCES kamar(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Fasilitas (Facilities) Table
CREATE TABLE IF NOT EXISTS fasilitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    deskripsi TEXT NOT NULL,
    gambar VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEEDING DEFAULT USERS (Password hashes are bcrypt for 'admin123' and 'customer123')
INSERT INTO users (username, email, password, role, phone) VALUES 
('admin', 'admin@koskuy.com', '$2y$10$UoW1i/TjM51e5y2FfC0jJ.Kbe0b60K95Meq02W0kY0Uu37M20.a1W', 'admin', '081234567890'),
('customer', 'customer@gmail.com', '$2y$10$B5P8H/K78kEevZ6fUqY1f.1h4/h0b1u1z2q.c64vV9z5s0W5Xf1m6', 'customer', '089876543210')
ON DUPLICATE KEY UPDATE id=id;

-- SEEDING SAMPLE ROOMS
INSERT INTO kamar (nama, kategori, harga, lokasi, fasilitas, deskripsi, gambar) VALUES
('Kos Cozy Abadi - Kamar 101', 'Standard', 1200000, 'Grogol, Jakarta Barat', 'Kasur, Lemari, WiFi, Kamar Mandi Luar, Kipas Angin', 'Kos tipe standard dengan suasana tenang dan nyaman. Dekat dengan berbagai kampus dan pusat perbelanjaan.', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80'),
('Kos Executive Suite - Deluxe A', 'Deluxe', 2500000, 'Tanjung Duren, Jakarta Barat', 'AC, Kamar Mandi Dalam, Kasur Queen, Smart TV, Water Heater, WiFi, Kulkas Mini', 'Kos eksekutif mewah dengan fasilitas lengkap setara hotel. Lingkungan aman dengan CCTV 24 jam dan parkir luas.', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80')
ON DUPLICATE KEY UPDATE id=id;

-- SEEDING DEFAULT FACILITIES
INSERT INTO fasilitas (id, nama, deskripsi, gambar) VALUES
(1, 'Dapur Bersama', 'Tersedia dapur bersama yang dilengkapi berbagai fasilitas untuk menunjang kebutuhan memasak penghuni.\r\n• Kompor siap pakai\r\n• Alat masak lengkap\r\n• Alat makan tersedia\r\n• Area dapur bersih dan nyaman', 'http://localhost/koskuy_api/uploads/dapur.png'),
(2, 'Area Parkiran', '• Area parkir luas untuk mobil dan motor\r\n• Akses keluar-masuk kendaraan yang mudah\r\n• Lingkungan parkir rapi dan nyaman untuk penghuni', 'http://localhost/koskuy_api/uploads/parkiran.png'),
(3, 'Balkon', 'Tersedia balkon yang luas dan nyaman untuk bersantai. Balkon juga dilengkapi area mencuci dan menjemur pakaian serta mesin cuci yang dapat digunakan secara gratis.\r\n• Mesin cuci gratis\r\n• Area jemur pakaian\r\n• Balkon luas untuk bersantai\r\n• Ventilasi dan pencahayaan yang baik', 'http://localhost/koskuy_api/uploads/jemuran.png')
ON DUPLICATE KEY UPDATE id=id;

