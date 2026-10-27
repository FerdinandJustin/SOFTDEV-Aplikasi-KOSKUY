<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Credentials
$host = "localhost";
$db_name = "koskuy";
$username = "root";
$password = "";
$conn = null;

// Connect to Database
try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->exec("set names utf8");
} catch(PDOException $exception) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $exception->getMessage()]);
    exit();
}

// Get the action from query parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Helper to get POST data
function getPostData() {
    return json_decode(file_get_contents("php://input"), true);
}

switch ($action) {
    // ==================== AUTHENTICATION ====================
    case 'register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing required fields"]);
                break;
            }

            // Check if user already exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$data['username'], $data['email']]);
            if ($stmt->fetch()) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Username or Email already exists"]);
                break;
            }

            // Hash password and insert
            $hashed_pass = password_hash($data['password'], PASSWORD_BCRYPT);
            $phone = isset($data['phone']) ? $data['phone'] : '';
            
            $stmt = $conn->prepare("INSERT INTO users (username, email, password, role, phone) VALUES (?, ?, ?, 'customer', ?)");
            if ($stmt->execute([$data['username'], $data['email'], $hashed_pass, $phone])) {
                http_response_code(201);
                echo json_encode(["status" => "success", "message" => "User registered successfully"]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Registration failed"]);
            }
        }
        break;

    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            if (empty($data['username']) || empty($data['password'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing username or password"]);
                break;
            }

            $stmt = $conn->prepare("SELECT id, username, email, password, role, phone FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$data['username'], $data['username']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && password_verify($data['password'], $user['password'])) {
                // Remove password hash from response
                unset($user['password']);
                echo json_encode(["status" => "success", "message" => "Login successful", "user" => $user]);
            } else {
                http_response_code(401);
                echo json_encode(["status" => "error", "message" => "Invalid username or password"]);
            }
        }
        break;

    // ==================== KAMAR (ROOMS) ====================
    case 'get_rooms':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $kategori = isset($_GET['kategori']) ? $_GET['kategori'] : '';
            $search = isset($_GET['search']) ? $_GET['search'] : '';
            
            $query = "SELECT k.*, IFNULL(AVG(u.rating), 0) as rating_rata 
                      FROM kamar k 
                      LEFT JOIN ulasan u ON k.id = u.kamar_id";
            $conditions = [];
            $params = [];

            if (!empty($kategori)) {
                $conditions[] = "k.kategori = ?";
                $params[] = $kategori;
            }
            if (!empty($search)) {
                $conditions[] = "(k.nama LIKE ? OR k.lokasi LIKE ? OR k.fasilitas LIKE ?)";
                $params[] = "%$search%";
                $params[] = "%$search%";
                $params[] = "%$search%";
            }

            if (count($conditions) > 0) {
                $query .= " WHERE " . implode(" AND ", $conditions);
            }
            
            $query .= " GROUP BY k.id ORDER BY k.id DESC";

            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calculate occupied counts
            $stmtStd = $conn->prepare("SELECT COUNT(DISTINCT b.user_id) as occupied FROM booking b JOIN kamar k ON b.kamar_id = k.id WHERE k.kategori = 'Standard' AND b.status IN ('Sudah Bayar', 'Disetujui')");
            $stmtStd->execute();
            $occStd = $stmtStd->fetch(PDO::FETCH_ASSOC);
            $occupiedStandard = intval($occStd['occupied']);
            $sisaStandard = max(0, 15 - $occupiedStandard);

            $stmtDlx = $conn->prepare("SELECT COUNT(DISTINCT b.user_id) as occupied FROM booking b JOIN kamar k ON b.kamar_id = k.id WHERE k.kategori = 'Deluxe' AND b.status IN ('Sudah Bayar', 'Disetujui')");
            $stmtDlx->execute();
            $occDlx = $stmtDlx->fetch(PDO::FETCH_ASSOC);
            $occupiedDeluxe = intval($occDlx['occupied']);
            $sisaDeluxe = max(0, 7 - $occupiedDeluxe);

            // Format rating as float and add sisa_kamar
            foreach ($rooms as &$room) {
                $room['rating_rata'] = round((float)$room['rating_rata'], 1);
                $room['sisa_kamar'] = ($room['kategori'] === 'Deluxe') ? $sisaDeluxe : $sisaStandard;
            }

            echo json_encode(["status" => "success", "data" => $rooms]);
        }
        break;

    case 'get_room_detail':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            
            $stmt = $conn->prepare("SELECT k.*, IFNULL(AVG(u.rating), 0) as rating_rata 
                                    FROM kamar k 
                                    LEFT JOIN ulasan u ON k.id = u.kamar_id 
                                    WHERE k.id = ? 
                                    GROUP BY k.id");
            $stmt->execute([$id]);
            $room = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($room) {
                $room['rating_rata'] = round((float)$room['rating_rata'], 1);
                
                // Calculate occupied counts
                $stmtStd = $conn->prepare("SELECT COUNT(DISTINCT b.user_id) as occupied FROM booking b JOIN kamar k ON b.kamar_id = k.id WHERE k.kategori = 'Standard' AND b.status IN ('Sudah Bayar', 'Disetujui')");
                $stmtStd->execute();
                $occStd = $stmtStd->fetch(PDO::FETCH_ASSOC);
                $occupiedStandard = intval($occStd['occupied']);
                $sisaStandard = max(0, 15 - $occupiedStandard);

                $stmtDlx = $conn->prepare("SELECT COUNT(DISTINCT b.user_id) as occupied FROM booking b JOIN kamar k ON b.kamar_id = k.id WHERE k.kategori = 'Deluxe' AND b.status IN ('Sudah Bayar', 'Disetujui')");
                $stmtDlx->execute();
                $occDlx = $stmtDlx->fetch(PDO::FETCH_ASSOC);
                $occupiedDeluxe = intval($occDlx['occupied']);
                $sisaDeluxe = max(0, 7 - $occupiedDeluxe);

                $room['sisa_kamar'] = ($room['kategori'] === 'Deluxe') ? $sisaDeluxe : $sisaStandard;
                
                // Get reviews
                $reviewStmt = $conn->prepare("SELECT u.*, us.username 
                                              FROM ulasan u 
                                              JOIN users us ON u.user_id = us.id 
                                              WHERE u.kamar_id = ? 
                                              ORDER BY u.created_at DESC");
                $reviewStmt->execute([$id]);
                $room['reviews'] = $reviewStmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(["status" => "success", "data" => $room]);
            } else {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Room not found"]);
            }
        }
        break;

    case 'add_room':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            if (empty($data['nama']) || empty($data['kategori']) || empty($data['harga']) || empty($data['lokasi'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing required fields"]);
                break;
            }

            $gambar = isset($data['gambar']) ? $data['gambar'] : 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80';
            $fasilitas = isset($data['fasilitas']) ? $data['fasilitas'] : '';
            $deskripsi = isset($data['deskripsi']) ? $data['deskripsi'] : '';

            $stmt = $conn->prepare("INSERT INTO kamar (nama, kategori, harga, lokasi, fasilitas, deskripsi, gambar) VALUES (?, ?, ?, ?, ?, ?, ?)");
            if ($stmt->execute([$data['nama'], $data['kategori'], $data['harga'], $data['lokasi'], $fasilitas, $deskripsi, $gambar])) {
                echo json_encode(["status" => "success", "message" => "Room added successfully", "id" => $conn->lastInsertId()]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to add room"]);
            }
        }
        break;

    case 'edit_room':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            
            if ($id <= 0 || empty($data['nama']) || empty($data['kategori']) || empty($data['harga']) || empty($data['lokasi'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing fields or invalid id"]);
                break;
            }

            $fasilitas = isset($data['fasilitas']) ? $data['fasilitas'] : '';
            $deskripsi = isset($data['deskripsi']) ? $data['deskripsi'] : '';
            $gambar = isset($data['gambar']) ? $data['gambar'] : '';

            $query = "UPDATE kamar SET nama = ?, kategori = ?, harga = ?, lokasi = ?, fasilitas = ?, deskripsi = ?";
            $params = [$data['nama'], $data['kategori'], $data['harga'], $data['lokasi'], $fasilitas, $deskripsi];

            if (!empty($gambar)) {
                $query .= ", gambar = ?";
                $params[] = $gambar;
            }
            
            $query .= " WHERE id = ?";
            $params[] = $id;

            $stmt = $conn->prepare($query);
            if ($stmt->execute($params)) {
                echo json_encode(["status" => "success", "message" => "Room updated successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to update room"]);
            }
        }
        break;

    case 'delete_room':
        if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid room ID"]);
                break;
            }

            $stmt = $conn->prepare("DELETE FROM kamar WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(["status" => "success", "message" => "Room deleted successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to delete room"]);
            }
        }
        break;

    // ==================== BOOKING (TRANSACTIONS) ====================
    case 'create_booking':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            if (empty($data['user_id']) || empty($data['kamar_id']) || empty($data['tanggal_mulai']) || empty($data['durasi_bulan'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing booking details"]);
                break;
            }

            // Fetch room price to calculate total price
            $roomStmt = $conn->prepare("SELECT harga FROM kamar WHERE id = ?");
            $roomStmt->execute([$data['kamar_id']]);
            $room = $roomStmt->fetch();
            if (!$room) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Room not found"]);
                break;
            }

            $total_harga = intval($room['harga']) * intval($data['durasi_bulan']);
            
            $stmt = $conn->prepare("INSERT INTO booking (user_id, kamar_id, tanggal_mulai, durasi_bulan, total_harga, status) VALUES (?, ?, ?, ?, ?, 'Menunggu Pembayaran')");
            if ($stmt->execute([$data['user_id'], $data['kamar_id'], $data['tanggal_mulai'], $data['durasi_bulan'], $total_harga])) {
                echo json_encode([
                    "status" => "success", 
                    "message" => "Booking created successfully. Waiting for payment.",
                    "booking_id" => $conn->lastInsertId(),
                    "total_harga" => $total_harga
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to create booking"]);
            }
        }
        break;

    case 'pay_booking':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            
            if ($id <= 0 || empty($data['metode_pembayaran']) || empty($data['nomor_pembayaran'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing payment information"]);
                break;
            }

            // Simulated Payment Gateways sets status directly to 'Sudah Bayar'
            $stmt = $conn->prepare("UPDATE booking SET status = 'Sudah Bayar', metode_pembayaran = ?, nomor_pembayaran = ? WHERE id = ?");
            if ($stmt->execute([$data['metode_pembayaran'], $data['nomor_pembayaran'], $id])) {
                echo json_encode(["status" => "success", "message" => "Payment successful. Booking status updated to Sudah Bayar."]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to process payment"]);
            }
        }
        break;

    case 'extend_booking':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

            if ($id <= 0 || empty($data['durasi_bulan'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing extension duration"]);
                break;
            }

            // Fetch current booking & kamar details
            $bkStmt = $conn->prepare("SELECT b.durasi_bulan, b.tanggal_mulai, b.user_id, b.kamar_id, k.harga 
                                     FROM booking b 
                                     JOIN kamar k ON b.kamar_id = k.id 
                                     WHERE b.id = ?");
            $bkStmt->execute([$id]);
            $booking = $bkStmt->fetch(PDO::FETCH_ASSOC);
            if (!$booking) {
                http_response_code(404);
                echo json_encode(["status" => "error", "message" => "Booking not found"]);
                break;
            }

            // Calculate start date of extension (end date of original booking)
            $start_date = new DateTime($booking['tanggal_mulai']);
            $months_to_add = intval($booking['durasi_bulan']);
            $start_date->modify("+$months_to_add month");
            $extension_start_date = $start_date->format('Y-m-d');

            $durasi_tambahan = intval($data['durasi_bulan']);
            $total_harga_tambahan = $durasi_tambahan * intval($booking['harga']);

            // Insert new booking representing the extension
            $stmt = $conn->prepare("INSERT INTO booking (user_id, kamar_id, tanggal_mulai, durasi_bulan, total_harga, status) 
                                    VALUES (?, ?, ?, ?, ?, 'Menunggu Pembayaran')");
            if ($stmt->execute([$booking['user_id'], $booking['kamar_id'], $extension_start_date, $durasi_tambahan, $total_harga_tambahan])) {
                $new_id = $conn->lastInsertId();
                echo json_encode([
                    "status" => "success", 
                    "message" => "Lease extension invoice created successfully", 
                    "booking_id" => $new_id, 
                    "total_harga" => $total_harga_tambahan
                ]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to create lease extension invoice"]);
            }
        }
        break;

    case 'update_booking_status':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;

            if ($id <= 0 || empty($data['status'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing status or invalid booking ID"]);
                break;
            }

            $stmt = $conn->prepare("UPDATE booking SET status = ? WHERE id = ?");
            if ($stmt->execute([$data['status'], $id])) {
                echo json_encode(["status" => "success", "message" => "Booking status updated to " . $data['status']]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to update status"]);
            }
        }
        break;

    case 'get_booking_history':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
            if ($user_id <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid User ID"]);
                break;
            }

            $stmt = $conn->prepare("SELECT b.*, k.nama, k.kategori, k.harga, k.lokasi, k.gambar, k.fasilitas 
                                    FROM booking b 
                                    JOIN kamar k ON b.kamar_id = k.id 
                                    WHERE b.user_id = ? 
                                    ORDER BY b.id DESC");
            $stmt->execute([$user_id]);
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $bookings]);
        }
        break;

    case 'get_all_bookings':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $conn->prepare("SELECT b.*, k.nama as nama_kamar, k.kategori, k.harga as harga_kamar, u.username, u.email, u.phone 
                                    FROM booking b 
                                    JOIN kamar k ON b.kamar_id = k.id 
                                    JOIN users u ON b.user_id = u.id 
                                    ORDER BY b.id DESC");
            $stmt->execute();
            $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $bookings]);
        }
        break;

    // ==================== KELUHAN (COMPLAINTS) ====================
    case 'create_complaint':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            if (empty($data['user_id']) || empty($data['detail_keluhan'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing complaint details"]);
                break;
            }

            // Ensure columns exist
            try { $conn->exec("ALTER TABLE keluhan ADD COLUMN IF NOT EXISTS gambar VARCHAR(255) NULL"); } catch(Exception $e) {}
            try { $conn->exec("ALTER TABLE keluhan ADD COLUMN IF NOT EXISTS kategori VARCHAR(50) NULL"); } catch(Exception $e) {}
            try { $conn->exec("ALTER TABLE keluhan ADD COLUMN IF NOT EXISTS prioritas ENUM('Normal','Tinggi') NOT NULL DEFAULT 'Normal'"); } catch(Exception $e) {}
            try { $conn->exec("ALTER TABLE keluhan MODIFY COLUMN status ENUM('Pending','Diproses','Selesai') NOT NULL DEFAULT 'Pending'"); } catch(Exception $e) {}

            $booking_id = !empty($data['booking_id']) ? intval($data['booking_id']) : null;
            $gambar = isset($data['gambar']) ? $data['gambar'] : null;
            $kategori = isset($data['kategori']) ? $data['kategori'] : null;
            
            $stmt = $conn->prepare("INSERT INTO keluhan (user_id, booking_id, detail_keluhan, gambar, kategori, status) VALUES (?, ?, ?, ?, ?, 'Pending')");
            if ($stmt->execute([$data['user_id'], $booking_id, $data['detail_keluhan'], $gambar, $kategori])) {
                echo json_encode(["status" => "success", "message" => "Complaint submitted successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to submit complaint"]);
            }
        }
        break;

    case 'get_complaints':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
            
            // Ensure columns exist
            try { $conn->exec("ALTER TABLE keluhan ADD COLUMN IF NOT EXISTS gambar VARCHAR(255) NULL"); } catch(Exception $e) {}
            try { $conn->exec("ALTER TABLE keluhan ADD COLUMN IF NOT EXISTS kategori VARCHAR(50) NULL"); } catch(Exception $e) {}
            try { $conn->exec("ALTER TABLE keluhan ADD COLUMN IF NOT EXISTS prioritas ENUM('Normal','Tinggi') NOT NULL DEFAULT 'Normal'"); } catch(Exception $e) {}
            try { $conn->exec("ALTER TABLE keluhan MODIFY COLUMN status ENUM('Pending','Diproses','Selesai') NOT NULL DEFAULT 'Pending'"); } catch(Exception $e) {}

            if ($user_id > 0) {
                // Customer specific
                $stmt = $conn->prepare("SELECT k.*, u.username, b.kamar_id, km.nama as nama_kamar 
                                        FROM keluhan k 
                                        JOIN users u ON k.user_id = u.id 
                                        LEFT JOIN booking b ON k.booking_id = b.id
                                        LEFT JOIN kamar km ON b.kamar_id = km.id
                                        WHERE k.user_id = ? 
                                        ORDER BY k.id DESC");
                $stmt->execute([$user_id]);
            } else {
                // Admin (All)
                $stmt = $conn->prepare("SELECT k.*, u.username, u.email, u.phone, b.kamar_id, km.nama as nama_kamar 
                                        FROM keluhan k 
                                        JOIN users u ON k.user_id = u.id 
                                        LEFT JOIN booking b ON k.booking_id = b.id
                                        LEFT JOIN kamar km ON b.kamar_id = km.id
                                        ORDER BY k.id DESC");
                $stmt->execute();
            }
            $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $complaints]);
        }
        break;

    case 'resolve_complaint':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid complaint ID"]);
                break;
            }

            $stmt = $conn->prepare("UPDATE keluhan SET status = 'Selesai' WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(["status" => "success", "message" => "Complaint status updated to Selesai"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to resolve complaint"]);
            }
        }
        break;

    // ==================== ULASAN (REVIEWS) ====================
    case 'create_review':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            if (empty($data['user_id']) || empty($data['kamar_id']) || empty($data['rating']) || empty($data['komentar'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing review information"]);
                break;
            }

            $stmt = $conn->prepare("INSERT INTO ulasan (user_id, kamar_id, rating, komentar) VALUES (?, ?, ?, ?)");
            if ($stmt->execute([$data['user_id'], $data['kamar_id'], $data['rating'], $data['komentar']])) {
                echo json_encode(["status" => "success", "message" => "Review submitted successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to submit review"]);
            }
        }
        break;

    case 'get_reviews':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $kamar_id = isset($_GET['kamar_id']) ? intval($_GET['kamar_id']) : 0;
            if ($kamar_id <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid Room ID"]);
                break;
            }

            $stmt = $conn->prepare("SELECT u.*, us.username FROM ulasan u JOIN users us ON u.user_id = us.id WHERE u.kamar_id = ? ORDER BY u.id DESC");
            $stmt->execute([$kamar_id]);
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $reviews]);
        }
        break;

    // ==================== ADMIN: ULASAN (ALL REVIEWS) ====================
    case 'get_all_reviews':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $rating_filter = isset($_GET['rating']) ? intval($_GET['rating']) : 0;
            $query = "SELECT ul.*, us.username, k.nama as nama_kamar, k.kategori 
                      FROM ulasan ul 
                      JOIN users us ON ul.user_id = us.id 
                      JOIN kamar k ON ul.kamar_id = k.id";
            $params = [];
            if ($rating_filter > 0) {
                $query .= " WHERE ul.rating = ?";
                $params[] = $rating_filter;
            }
            $query .= " ORDER BY ul.id DESC";
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Stats
            $statsStmt = $conn->prepare("SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM ulasan");
            $statsStmt->execute();
            $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                "status" => "success",
                "data" => $reviews,
                "stats" => [
                    "total" => intval($stats['total']),
                    "avg_rating" => round((float)$stats['avg_rating'], 1)
                ]
            ]);
        }
        break;

    case 'reply_review':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0 || empty($data['balasan_admin'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing reply or invalid review ID"]);
                break;
            }
            // Add balasan_admin column if not exist (safe ALTER)
            $conn->exec("ALTER TABLE ulasan ADD COLUMN IF NOT EXISTS balasan_admin TEXT NULL, ADD COLUMN IF NOT EXISTS tanggal_balasan TIMESTAMP NULL");
            $stmt = $conn->prepare("UPDATE ulasan SET balasan_admin = ?, tanggal_balasan = NOW() WHERE id = ?");
            if ($stmt->execute([$data['balasan_admin'], $id])) {
                echo json_encode(["status" => "success", "message" => "Reply saved successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to save reply"]);
            }
        }
        break;

    case 'update_complaint_status':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0 || empty($data['status'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing status or invalid complaint ID"]);
                break;
            }
            $allowed = ['Pending', 'Diproses', 'Selesai'];
            if (!in_array($data['status'], $allowed)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid status value"]);
                break;
            }
            // Add prioritas & status columns if needed
            $conn->exec("ALTER TABLE keluhan MODIFY COLUMN status ENUM('Pending','Diproses','Selesai') NOT NULL DEFAULT 'Pending'");
            $conn->exec("ALTER TABLE keluhan ADD COLUMN IF NOT EXISTS prioritas ENUM('Normal','Tinggi') NOT NULL DEFAULT 'Normal'");
            $prioritas = isset($data['prioritas']) ? $data['prioritas'] : null;
            if ($prioritas && in_array($prioritas, ['Normal', 'Tinggi'])) {
                $stmt = $conn->prepare("UPDATE keluhan SET status = ?, prioritas = ? WHERE id = ?");
                $stmt->execute([$data['status'], $prioritas, $id]);
            } else {
                $stmt = $conn->prepare("UPDATE keluhan SET status = ? WHERE id = ?");
                $stmt->execute([$data['status'], $id]);
            }
            echo json_encode(["status" => "success", "message" => "Complaint updated"]);
        }
        break;

    case 'get_complaints_admin':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            // Ensure columns exist
            try { $conn->exec("ALTER TABLE keluhan ADD COLUMN IF NOT EXISTS prioritas ENUM('Normal','Tinggi') NOT NULL DEFAULT 'Normal'"); } catch(Exception $e) {}
            try { $conn->exec("ALTER TABLE keluhan MODIFY COLUMN status ENUM('Pending','Diproses','Selesai') NOT NULL DEFAULT 'Pending'"); } catch(Exception $e) {}
            try { $conn->exec("ALTER TABLE keluhan ADD COLUMN IF NOT EXISTS gambar VARCHAR(255) NULL"); } catch(Exception $e) {}
            try { $conn->exec("ALTER TABLE keluhan ADD COLUMN IF NOT EXISTS kategori VARCHAR(50) NULL"); } catch(Exception $e) {}
            
            $status_filter = isset($_GET['status']) ? $_GET['status'] : '';
            $query = "SELECT k.*, u.username, u.email, u.phone, b.kamar_id,
                             km.nama as nama_kamar
                      FROM keluhan k 
                      JOIN users u ON k.user_id = u.id 
                      LEFT JOIN booking b ON k.booking_id = b.id
                      LEFT JOIN kamar km ON b.kamar_id = km.id";
            $params = [];
            if (!empty($status_filter)) {
                $query .= " WHERE k.status = ?";
                $params[] = $status_filter;
            }
            $query .= " ORDER BY k.prioritas DESC, k.id DESC";
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $complaints = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Stats
            $total = count($complaints);
            $highPriority = count(array_filter($complaints, fn($c) => ($c['prioritas'] ?? 'Normal') === 'Tinggi'));
            $needAttention = count(array_filter($complaints, fn($c) => $c['status'] === 'Pending'));
            $unresolved = count(array_filter($complaints, fn($c) => $c['status'] !== 'Selesai'));

            echo json_encode([
                "status" => "success",
                "data" => $complaints,
                "stats" => [
                    "total" => $total,
                    "high_priority" => $highPriority,
                    "need_attention" => $needAttention,
                    "unresolved" => $unresolved
                ]
            ]);
        }
        break;

    // ==================== IMAGE UPLOAD ====================
    case 'upload_image':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!isset($_FILES['image'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "No file uploaded"]);
                break;
            }
            $file = $_FILES['image'];
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            $allowed = ['jpg', 'jpeg', 'png', 'webp'];
            if (!in_array(strtolower($ext), $allowed)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid file extension. Only JPG, PNG, and WEBP are allowed."]);
                break;
            }
            $targetDir = __DIR__ . "/uploads/";
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }
            $fileName = "img_" . uniqid() . "." . $ext;
            $targetFilePath = $targetDir . $fileName;
            if (move_uploaded_file($file['tmp_name'], $targetFilePath)) {
                $url = "http://localhost/koskuy_api/uploads/" . $fileName;
                echo json_encode(["status" => "success", "url" => $url]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Failed to save file"]);
            }
        }
        break;

    // ==================== FASILITAS (FACILITIES) ====================
    case 'get_facilities':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $stmt = $conn->prepare("SELECT * FROM fasilitas ORDER BY id DESC");
            $stmt->execute();
            $facilities = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $facilities]);
        }
        break;

    case 'add_facility':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            if (empty($data['nama']) || empty($data['deskripsi'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing required fields"]);
                break;
            }
            $gambar = isset($data['gambar']) ? $data['gambar'] : '';
            $stmt = $conn->prepare("INSERT INTO fasilitas (nama, deskripsi, gambar) VALUES (?, ?, ?)");
            if ($stmt->execute([$data['nama'], $data['deskripsi'], $gambar])) {
                echo json_encode(["status" => "success", "message" => "Facility added successfully", "id" => $conn->lastInsertId()]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to add facility"]);
            }
        }
        break;

    case 'edit_facility':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $data = getPostData();
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0 || empty($data['nama']) || empty($data['deskripsi'])) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Missing fields or invalid id"]);
                break;
            }
            $gambar = isset($data['gambar']) ? $data['gambar'] : '';
            if (!empty($gambar)) {
                $stmt = $conn->prepare("UPDATE fasilitas SET nama = ?, deskripsi = ?, gambar = ? WHERE id = ?");
                $success = $stmt->execute([$data['nama'], $data['deskripsi'], $gambar, $id]);
            } else {
                $stmt = $conn->prepare("UPDATE fasilitas SET nama = ?, deskripsi = ? WHERE id = ?");
                $success = $stmt->execute([$data['nama'], $data['deskripsi'], $id]);
            }
            if ($success) {
                echo json_encode(["status" => "success", "message" => "Facility updated successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to update facility"]);
            }
        }
        break;

    case 'delete_facility':
        if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Invalid facility ID"]);
                break;
            }
            $stmt = $conn->prepare("DELETE FROM fasilitas WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(["status" => "success", "message" => "Facility deleted successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to delete facility"]);
            }
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["status" => "error", "message" => "Endpoint not found"]);
        break;
}
?>
