-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: student_management
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documents` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `subject_id` bigint DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `bookmarked` tinyint(1) DEFAULT '0',
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
INSERT INTO `documents` VALUES (1,5,5,'MMT.pdf','C:\\Users\\hhoan\\Documents\\student-management-system\\backend\\backend\\uploads\\c1e451cb-f8a4-4626-b8e3-1f037fa8dea4.pdf','application/pdf',1812473,0,'2025-10-23 16:28:20');
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subject_id` bigint NOT NULL,
  `template_type` varchar(255) NOT NULL,
  `score1` decimal(5,2) DEFAULT NULL,
  `score2` decimal(5,2) DEFAULT NULL,
  `score3` decimal(5,2) DEFAULT NULL,
  `score4` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (1,1,'10-10-80',6.00,7.00,8.00,NULL,'2025-09-25 03:50:14'),(2,2,'10-10-10-70',6.00,7.00,8.00,9.00,'2025-09-25 03:50:56'),(3,3,'10-10-30-50',8.00,9.00,7.50,9.00,'2025-09-25 04:18:47'),(4,4,'10-20-20-50',7.00,8.00,9.00,9.00,'2025-09-25 05:41:53'),(5,5,'10-10-80',5.00,2.00,8.00,NULL,'2025-10-23 14:20:39'),(6,6,'10-10-80',4.00,2.00,8.00,NULL,'2025-10-23 14:21:46'),(7,8,'10-10-80',3.00,5.00,8.00,NULL,'2025-10-26 16:37:14');
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiry_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `token` (`token`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `semesters`
--

DROP TABLE IF EXISTS `semesters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semesters` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `semesters_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `semesters`
--

LOCK TABLES `semesters` WRITE;
/*!40000 ALTER TABLE `semesters` DISABLE KEYS */;
INSERT INTO `semesters` VALUES (3,1,'HK1 - SV001','1999-12-12','2005-12-12','2025-09-24 07:27:27'),(4,2,'HK1 - SV002','2011-09-24','2012-02-24','2025-09-24 07:28:08'),(5,1,'HK2 - SV001','2000-05-15','2002-06-22','2025-09-25 04:19:34'),(6,5,'HK1-2024','2005-01-30','2100-01-30','2025-10-23 14:13:32'),(7,5,'HK2-2025','2000-12-12','2023-12-12','2025-10-23 14:21:15'),(10,4,'HK2','1212-12-12','1212-12-12','2025-10-26 16:36:43'),(11,9,'kk','2313-03-12','1313-03-12','2025-10-28 02:17:59');
/*!40000 ALTER TABLE `semesters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `semester_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `credits` int NOT NULL,
  `subject_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `semester_id` (`semester_id`),
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,3,'Toán',3,'MATH001','2025-09-24 08:48:16'),(2,4,'Anh',3,'ENG001','2025-09-24 08:48:42'),(3,3,'Code',3,'C++','2025-09-25 04:18:20'),(4,5,'Toán',4,'MATH12','2025-09-25 05:41:26'),(5,6,'Toan',3,'INT123','2025-10-23 14:20:15'),(6,7,'Sinh',3,'Biology','2025-10-23 14:21:30'),(8,10,'á',3,'aaa','2025-10-26 16:36:59');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `student_id` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqh3otyipv2k9hqte4a1abcyhq` (`student_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2025-09-24 08:27:28.598798','Nguyen Van A','$2a$10$aADlpWDHTCczxn5IF.9RJOz1rZdPnICh3uVQE6HK7b2c.6ayPKuwO','SV001',NULL),(2,'2025-09-24 08:47:29.269745','Nguyen Van B','$2a$10$oFZTzEkuOJXDZVXx46pneOT/4p4tcrPGZAU6Q.lELCDW/ih5KWQ86','SV002',NULL),(3,'2025-09-24 08:49:02.503281','Tran Thi B','$2a$10$CkxsQDbpSuhP6BnQuWoyMuQMOZ1DONGaDqxYou1a1SS3W80FDZDLG','SV003',NULL),(4,'2025-10-23 12:49:02.714051','Hoang','$2a$10$feEo5AP8yA57IzDNSePqAuNnvYN8RBktKj7427ZtbwlCpoD1jAiju','B23DCCN345',NULL),(5,'2025-10-23 21:12:56.119140','Huy','$2a$10$4oUxpCQU1uz8Il8jEofV7.lKkzOH8DGWrQ4WZ3/EWtAvESMVR8zyO','B23DCCN123',NULL),(6,'2025-10-26 23:25:57.600573','Nguyen Van A','$2a$10$L915hl8QFvjABzrV6GLpc.6Yt2hv5nydeHIjXBKfgNVEsBBoxfZGu','S001',NULL),(7,'2025-10-27 10:02:46.451316','Khong Biet Dua','$2a$10$E4hlKbz7jDMpAZbnnkIn7eOf1yln.5o5j1hLMkNHJg7GVJY5iSYpK','B23DCCN000','hoanghuy9a52005@gmail.com'),(8,'2025-10-28 08:01:36.206654','Hai','$2a$10$MmZ5L9iFYhgj8z94QdUzh.o240hpEMtt.9qrrfPWezpILBO4tOHPW','B23DCCN699',NULL),(9,'2025-10-28 08:10:01.325541','Hải','$2a$10$/cDbg1xKDms1hLdEHQruROWJvPIQpOR8JjDFBcFZ80KQN8tbNYfn.','B23DCCN666','haixinhtraihxt@gmail.com');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28  9:24:52
