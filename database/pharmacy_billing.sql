-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2026 at 07:36 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pharmacy_billing`
--

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expiration_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_name`, `price`, `created_at`, `updated_at`, `expiration_date`) VALUES
(21, 'Immunpro 500mg / 10mg Tablet', 8.25, '2026-05-03 00:46:08', '2026-05-03 00:46:08', NULL),
(22, 'Supracid 650mg Table', 3.25, '2026-05-03 00:46:32', '2026-05-03 00:46:32', NULL),
(23, 'Conzace Soft Gel Capsule', 15.25, '2026-05-03 00:46:47', '2026-05-06 12:38:53', '2026-06-30'),
(25, 'Ritemed Ascorbic', 2.50, '2026-05-03 00:47:01', '2026-05-03 00:47:01', NULL),
(26, 'Ritemed Vitamin B Complex Tablet', 5.00, '2026-05-03 00:47:37', '2026-05-03 00:47:37', NULL),
(27, 'RiteMed Metformin 500mg Tablet', 4.50, '2026-05-03 00:47:54', '2026-05-03 00:47:54', NULL),
(28, 'Poten-Cee Forte 1g', 12.75, '2026-05-03 00:48:17', '2026-05-03 00:48:17', NULL),
(29, 'Bioflu Tablet', 8.75, '2026-05-03 00:49:06', '2026-05-05 05:45:24', '2026-05-07'),
(30, 'Solmux 500mg Capsule', 11.75, '2026-05-03 00:49:22', '2026-05-03 00:49:22', NULL),
(31, 'Allerta 10Mg Tablet', 23.50, '2026-05-03 00:49:46', '2026-05-05 05:43:23', '2026-05-05'),
(32, 'Diatabs Capsule 2 mg', 9.00, '2026-05-03 00:50:16', '2026-05-03 00:50:16', NULL),
(33, 'Dulcolax 5 mg Tablet', 29.50, '2026-05-03 00:50:38', '2026-05-03 00:50:38', NULL),
(34, 'Betadine Solution 120Ml', 291.25, '2026-05-03 00:51:00', '2026-05-05 05:43:29', '2026-05-04'),
(35, 'Betadine Solution 15Ml', 71.75, '2026-05-03 00:51:10', '2026-05-05 05:45:18', '2026-05-01'),
(36, 'Roz Agua Oxigenada 10Vol 60ml', 11.50, '2026-05-03 00:51:28', '2026-05-03 00:51:28', NULL),
(37, 'Paracetamol 500 mg', 2.75, '2026-05-03 00:51:52', '2026-05-03 00:51:52', NULL),
(38, 'Alaxan FR Capsule', 10.00, '2026-05-03 00:52:06', '2026-05-05 05:43:17', '2026-05-06'),
(39, 'Tempra Forte 500Mg Tablet', 4.75, '2026-05-03 00:52:31', '2026-05-03 00:52:31', NULL),
(40, 'Biogesic 500mg Tablet', 4.77, '2026-05-03 00:53:07', '2026-05-06 12:38:47', '2026-06-30'),
(41, 'Strepsils Chesty Cough 24', 88.75, '2026-05-03 00:54:22', '2026-05-03 00:54:22', NULL),
(43, 'Efficascent Oil Extreme Lavender', 142.00, '2026-05-03 00:54:48', '2026-05-03 00:54:48', NULL),
(44, 'Katinko Oil Liniment Roll On', 54.00, '2026-05-03 00:55:06', '2026-05-03 00:55:06', NULL),
(45, 'Vicks Vaporub 5G', 39.50, '2026-05-03 00:55:23', '2026-05-03 00:55:23', NULL),
(46, 'White Flower No. 3 5Ml', 96.75, '2026-05-03 00:55:37', '2026-05-03 00:55:37', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `receipts`
--

CREATE TABLE `receipts` (
  `receipt_id` int(11) NOT NULL,
  `transaction_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `receipts`
--

INSERT INTO `receipts` (`receipt_id`, `transaction_id`, `product_id`, `product_name`, `quantity`, `price`, `subtotal`) VALUES
(1, 1, 37, 'Paracetamol 500 mg', 6, 2.75, 16.50),
(2, 2, 34, 'Betadine Solution 120Ml', 1, 291.25, 291.25),
(3, 3, 21, 'Immunpro 500mg / 10mg Tablet', 2, 8.25, 16.50),
(4, 4, 38, 'Alaxan FR Capsule', 4, 10.00, 40.00),
(5, 5, 34, 'Betadine Solution 120Ml', 2, 291.25, 582.50),
(6, 5, 31, 'Allerta 10Mg Tablet', 3, 23.50, 70.50),
(7, 5, 29, 'Bioflu Tablet', 1, 8.75, 8.75),
(8, 5, 23, 'Conzace Soft Gel Capsule', 1, 15.25, 15.25),
(9, 5, 43, 'Efficascent Oil Extreme Lavender', 1, 142.00, 142.00),
(10, 5, 22, 'Supracid 650mg Table', 1, 3.25, 3.25),
(11, 5, 46, 'White Flower No. 3 5Ml', 1, 96.75, 96.75),
(12, 6, 38, 'Alaxan FR Capsule', 1, 10.00, 10.00),
(13, 7, 35, 'Betadine Solution 15Ml', 1, 71.75, 71.75),
(14, 8, 35, 'Betadine Solution 15Ml', 6, 71.75, 430.50),
(15, 9, 37, 'Paracetamol 500 mg', 1, 2.75, 2.75),
(16, 10, 37, 'Paracetamol 500 mg', 1, 2.75, 2.75);

-- --------------------------------------------------------

--
-- Table structure for table `sales_transactions`
--

CREATE TABLE `sales_transactions` (
  `transaction_id` int(11) NOT NULL,
  `transaction_date` datetime NOT NULL,
  `subtotal_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(10,2) NOT NULL,
  `cash_tendered` decimal(10,2) NOT NULL DEFAULT 0.00,
  `change_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales_transactions`
--

INSERT INTO `sales_transactions` (`transaction_id`, `transaction_date`, `subtotal_amount`, `total_amount`, `cash_tendered`, `change_amount`, `created_at`) VALUES
(1, '2026-05-03 21:29:35', 16.50, 16.50, 20.00, 3.50, '2026-05-03 13:29:35'),
(2, '2026-05-03 21:30:37', 291.25, 291.25, 500.00, 208.75, '2026-05-03 13:30:37'),
(3, '2026-05-04 06:57:12', 16.50, 16.50, 20.00, 3.50, '2026-05-03 22:57:12'),
(4, '2026-05-04 08:25:04', 40.00, 40.00, 100.00, 60.00, '2026-05-04 00:25:04'),
(5, '2026-05-04 09:17:45', 919.00, 919.00, 1000.00, 81.00, '2026-05-04 01:17:45'),
(6, '2026-05-05 13:42:25', 10.00, 10.00, 11.00, 1.00, '2026-05-05 05:42:25'),
(7, '2026-05-05 13:44:16', 71.75, 71.75, 100.00, 28.25, '2026-05-05 05:44:16'),
(8, '2026-05-05 13:45:05', 430.50, 430.50, 500.00, 69.50, '2026-05-05 05:45:05'),
(9, '2026-05-09 08:40:44', 2.75, 2.75, 5.00, 2.25, '2026-05-09 00:40:44'),
(10, '2026-05-09 08:43:29', 2.75, 2.75, 5.00, 2.25, '2026-05-09 00:43:29');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `created_at`) VALUES
(1, 'admin1', '$2y$10$HD/tF5Jkm3MjGgDfH5HYNOXSnOIko9jpCa8I7vSLVcONbuvj.IrMy', '2026-04-09 19:24:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`product_id`);

--
-- Indexes for table `receipts`
--
ALTER TABLE `receipts`
  ADD PRIMARY KEY (`receipt_id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `sales_transactions`
--
ALTER TABLE `sales_transactions`
  ADD PRIMARY KEY (`transaction_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `receipts`
--
ALTER TABLE `receipts`
  MODIFY `receipt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `sales_transactions`
--
ALTER TABLE `sales_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `receipts`
--
ALTER TABLE `receipts`
  ADD CONSTRAINT `receipts_ibfk_1` FOREIGN KEY (`transaction_id`) REFERENCES `sales_transactions` (`transaction_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
