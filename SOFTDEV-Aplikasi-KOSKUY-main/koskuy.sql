-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 17 Jun 2026 pada 04.31
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `koskuy`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `booking`
--

CREATE TABLE `booking` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `kamar_id` int(11) NOT NULL,
  `tanggal_mulai` date NOT NULL,
  `durasi_bulan` int(11) NOT NULL,
  `total_harga` int(11) NOT NULL,
  `status` enum('Menunggu Pembayaran','Sudah Bayar','Disetujui','Ditolak','Dibatalkan') NOT NULL DEFAULT 'Menunggu Pembayaran',
  `metode_pembayaran` varchar(50) DEFAULT NULL,
  `nomor_pembayaran` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `booking`
--

INSERT INTO `booking` (`id`, `user_id`, `kamar_id`, `tanggal_mulai`, `durasi_bulan`, `total_harga`, `status`, `metode_pembayaran`, `nomor_pembayaran`, `created_at`) VALUES
(1, 3, 4, '2026-06-16', 1, 1600000, 'Sudah Bayar', 'QRIS', 'QRIS_KOSKUY_1', '2026-06-16 08:19:58'),
(2, 6, 5, '2026-06-16', 1, 2100000, 'Sudah Bayar', 'VA', '12345 67890 12345', '2026-06-16 08:21:02'),
(3, 7, 5, '2026-06-16', 1, 2100000, 'Sudah Bayar', 'QRIS', 'QRIS_KOSKUY_3', '2026-06-16 09:01:42'),
(4, 7, 5, '2026-07-16', 1, 2100000, 'Sudah Bayar', 'VA', '12345 67890 12345', '2026-06-16 09:11:23');

-- --------------------------------------------------------

--
-- Struktur dari tabel `fasilitas`
--

CREATE TABLE `fasilitas` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `deskripsi` text NOT NULL,
  `gambar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `fasilitas`
--

INSERT INTO `fasilitas` (`id`, `nama`, `deskripsi`, `gambar`, `created_at`) VALUES
(1, 'Dapur Bersama', 'Tersedia dapur bersama yang dilengkapi berbagai fasilitas untuk menunjang kebutuhan memasak penghuni.\n- Kompor siap pakai\n- Alat masak lengkap\n- Alat makan tersedia\n- Area dapur bersih dan nyaman', 'http://localhost/koskuy_api/uploads/dapur.png', '2026-06-15 14:52:58'),
(2, 'Area Parkiran', '- Area parkir luas untuk mobil dan motor\n- Akses keluar-masuk kendaraan yang mudah\n- Lingkungan parkir rapi dan nyaman untuk penghuni', 'http://localhost/koskuy_api/uploads/parkiran.png', '2026-06-15 14:52:58'),
(3, 'Balkon', 'Tersedia balkon yang luas dan nyaman untuk bersantai. Balkon juga dilengkapi area mencuci dan menjemur pakaian serta mesin cuci yang dapat digunakan secara gratis.\n- Mesin cuci gratis\n- Area jemur pakaian\n- Balkon luas untuk bersantai\n- Ventilasi dan pencahayaan yang baik', 'http://localhost/koskuy_api/uploads/img_6a31184505d51.png', '2026-06-15 14:52:58');

-- --------------------------------------------------------

--
-- Struktur dari tabel `kamar`
--

CREATE TABLE `kamar` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kategori` enum('Standard','Deluxe') NOT NULL DEFAULT 'Standard',
  `harga` int(11) NOT NULL,
  `lokasi` varchar(255) NOT NULL,
  `fasilitas` text NOT NULL,
  `deskripsi` text NOT NULL,
  `gambar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `kamar`
--

INSERT INTO `kamar` (`id`, `nama`, `kategori`, `harga`, `lokasi`, `fasilitas`, `deskripsi`, `gambar`, `created_at`) VALUES
(4, 'Kamar Standard', 'Standard', 1600000, 'Kamar Minimalis  dan PK AC 1/2', 'WiFi, AC, K. Mandi Dalam, Water Heater', 'Nikmati kenyamanan maksimal di Kamar Standard kami. Dirancang dengan sentuhan modern minimalis, kamar ini menawarkan fungsionalitas optimal, pencahayaan alami yang melimpah, dan furnitur premium untuk memastikan istirahat berkualitas Anda.\nkamar ini sangat cocok untuk profesional muda yang mencari ketenangan di tengah hiruk-pikuk kota. Nikmati juga fasilitas Free Wi-Fi super cepat dan area parkir yang luas untuk kendaraan Anda. Akses mudah ke pusat bisnis dan berbagai area hiburan!', 'http://localhost/koskuy_api/uploads/img_6a300e9fc80373.82309368.png', '2026-06-15 14:39:29'),
(5, 'Kamar Deluxe', 'Deluxe', 2100000, 'Kamar Lebih Luas dan PK AC 1', 'WiFi, AC, K. Mandi Dalam, Water Heater, K. Lebih Luas', 'Tingkatkan standar kenyamanan Anda bersama Kamar Deluxe kami. Menawarkan ukuran ruangan yang lebih luas, tipe Deluxe memberikan kebebasan ekstra untuk Anda yang menghargai ruang gerak dan privasi maksimal di tengah kota.\nManjakan diri Anda dengan kesejukan instan dari AC 1 PK yang kuat. Dilengkapi dengan Free Wi-Fi untuk produktivitas Anda dan area parkir luas yang aman. Pilihan terbaik untuk profesional yang menginginkan kenyamanan tanpa kompromi!', 'http://localhost/koskuy_api/uploads/img_6a300eca0761c2.88660396.png', '2026-06-15 14:40:28');

-- --------------------------------------------------------

--
-- Struktur dari tabel `keluhan`
--

CREATE TABLE `keluhan` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `detail_keluhan` text NOT NULL,
  `status` enum('Pending','Diproses','Selesai') NOT NULL DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `prioritas` enum('Normal','Tinggi') NOT NULL DEFAULT 'Normal',
  `gambar` varchar(255) DEFAULT NULL,
  `kategori` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `keluhan`
--

INSERT INTO `keluhan` (`id`, `user_id`, `booking_id`, `detail_keluhan`, `status`, `created_at`, `prioritas`, `gambar`, `kategori`) VALUES
(1, 6, 2, 'AC bocor tolong perbaiki ', 'Selesai', '2026-06-16 08:25:03', 'Normal', NULL, NULL),
(2, 3, NULL, 'banyak tamu berseliweran ribut', 'Selesai', '2026-06-16 08:31:45', 'Normal', 'http://localhost/koskuy_api/uploads/img_6a3109eed87e2.png', 'fasilitas'),
(3, 7, 3, 'saluran pembuangan tersumbat', 'Pending', '2026-06-16 09:07:52', 'Normal', NULL, NULL),
(4, 7, NULL, 'lantai balkon licin', 'Pending', '2026-06-16 09:10:25', 'Normal', 'http://localhost/koskuy_api/uploads/img_6a3112f2bc1bf.jpeg', 'fasilitas');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ulasan`
--

CREATE TABLE `ulasan` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `kamar_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `komentar` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `balasan_admin` text DEFAULT NULL,
  `tanggal_balasan` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `ulasan`
--

INSERT INTO `ulasan` (`id`, `user_id`, `kamar_id`, `rating`, `komentar`, `created_at`, `balasan_admin`, `tanggal_balasan`) VALUES
(1, 3, 4, 5, 'Kamar bagus, fasilitas lengkap dan lingkungan aman', '2026-06-16 08:22:03', NULL, NULL),
(2, 6, 5, 4, 'fasilitas lengkap dan lokasi strategis', '2026-06-16 08:23:16', NULL, NULL),
(3, 7, 5, 5, 'kos bersih dan  dekat kampus', '2026-06-16 09:06:50', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','admin') NOT NULL DEFAULT 'customer',
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `phone`, `created_at`) VALUES
(3, 'kevin', 'kevin@gmail.com', '$2y$10$96uLC.PUxBuMMLTmNrG49OtPJND45ty.2qSKX3vfuAtFFp3tCMWwu', 'customer', '081247951402', '2026-06-15 06:37:23'),
(4, 'admin1', 'adminKos@gmail.com', '$2y$10$jConeQVt2IeB98Xt25XCiOgh9uMrNCsbGOqt7hUdRMiCZjT2cCAwy', 'admin', '081245689564', '2026-06-15 06:56:29'),
(6, 'Hartono', 'Hartono@gmail.com', '$2y$10$W3SpSIAtDC7QDxAeZWXf0.9JgFp98YnT6S3IejG.0VtjQbKA2QYkK', 'customer', '6281245695485', '2026-06-15 16:55:06'),
(7, 'Anton', 'anton@gmail.com', '$2y$10$2Njar4t0/QmT1RKHg9gS8u8Iw5KdDpgJipol.jicDc.6cez8XjLOC', 'customer', '081245635985', '2026-06-16 08:57:25');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `kamar_id` (`kamar_id`);

--
-- Indeks untuk tabel `fasilitas`
--
ALTER TABLE `fasilitas`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `kamar`
--
ALTER TABLE `kamar`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `keluhan`
--
ALTER TABLE `keluhan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `ulasan`
--
ALTER TABLE `ulasan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `kamar_id` (`kamar_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `booking`
--
ALTER TABLE `booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `fasilitas`
--
ALTER TABLE `fasilitas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `kamar`
--
ALTER TABLE `kamar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `keluhan`
--
ALTER TABLE `keluhan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `ulasan`
--
ALTER TABLE `ulasan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`kamar_id`) REFERENCES `kamar` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `keluhan`
--
ALTER TABLE `keluhan`
  ADD CONSTRAINT `keluhan_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `ulasan`
--
ALTER TABLE `ulasan`
  ADD CONSTRAINT `ulasan_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ulasan_ibfk_2` FOREIGN KEY (`kamar_id`) REFERENCES `kamar` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
