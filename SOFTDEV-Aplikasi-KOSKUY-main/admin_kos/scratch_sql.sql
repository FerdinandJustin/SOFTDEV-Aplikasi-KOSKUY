USE koskuy;
SELECT '--- KAMAR ---' as label;
SELECT id, nama, kategori, harga FROM kamar;
SELECT '--- BOOKING ---' as label;
SELECT id, user_id, kamar_id, tanggal_mulai, durasi_bulan, total_harga, status FROM booking;
