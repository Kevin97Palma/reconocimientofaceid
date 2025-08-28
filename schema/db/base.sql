CREATE DATABASE compare_face_control;
USE compare_face_control;

CREATE TABLE `api_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `solicitud_payload` JSON DEFAULT NULL,
  `respuesta_payload` JSON DEFAULT NULL,
  `mensaje_api` varchar(256) DEFAULT NULL,
  `fecha_registro` varchar(19) DEFAULT NULL,
  PRIMARY KEY (`id`)
);
