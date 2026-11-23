import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aeropuerto_db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function migrar() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`usuarios\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`username\` VARCHAR(50) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('root', 'admind', 'user') NOT NULL DEFAULT 'user'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`aerolineas\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nombre\` VARCHAR(100) NOT NULL,
        \`codigo_iata\` VARCHAR(10) NOT NULL UNIQUE,
        \`pais\` VARCHAR(60) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`pistas\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`codigo_pista\` VARCHAR(20) NOT NULL UNIQUE,
        \`longitud_metros\` INT NOT NULL,
        \`estado\` ENUM('Operativa', 'Mantenimiento', 'Cerrada') NOT NULL DEFAULT 'Operativa'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`torres_control\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nombre_torre\` VARCHAR(100) NOT NULL,
        \`frecuencia_mhz\` VARCHAR(20) NOT NULL,
        \`jefe_turno\` VARCHAR(100) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`aviones\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`matricula\` VARCHAR(20) NOT NULL UNIQUE,
        \`modelo\` VARCHAR(80) NOT NULL,
        \`capacidad_pasajeros\` INT NOT NULL,
        \`id_aerolinea\` INT NOT NULL,
        FOREIGN KEY (\`id_aerolinea\`) REFERENCES \`aerolineas\`(\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`tripulaciones\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`nombre_completo\` VARCHAR(100) NOT NULL,
        \`rol_vuelo\` VARCHAR(50) NOT NULL,
        \`licencia\` VARCHAR(40) NOT NULL UNIQUE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`vuelos\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`codigo_vuelo\` VARCHAR(20) NOT NULL UNIQUE,
        \`origen\` VARCHAR(80) NOT NULL,
        \`destino\` VARCHAR(80) NOT NULL,
        \`hora_salida\` DATETIME NOT NULL,
        \`estado_vuelo\` ENUM('Programado', 'Embarque', 'En Aire', 'Aterrizado', 'Cancelado') NOT NULL DEFAULT 'Programado',
        \`id_avion\` INT NOT NULL,
        \`id_pista\` INT NOT NULL,
        \`id_torre\` INT NOT NULL,
        FOREIGN KEY (\`id_avion\`) REFERENCES \`aviones\`(\`id\`)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY (\`id_pista\`) REFERENCES \`pistas\`(\`id\`)
          ON DELETE RESTRICT ON UPDATE CASCADE,
        FOREIGN KEY (\`id_torre\`) REFERENCES \`torres_control\`(\`id\`)
          ON DELETE RESTRICT ON UPDATE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`asignaciones_vuelo\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`id_vuelo\` INT NOT NULL,
        \`id_tripulacion\` INT NOT NULL,
        \`funcion_asignada\` VARCHAR(60) NOT NULL,
        UNIQUE KEY \`uq_vuelo_tripulante\` (\`id_vuelo\`, \`id_tripulacion\`),
        FOREIGN KEY (\`id_vuelo\`) REFERENCES \`vuelos\`(\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (\`id_tripulacion\`) REFERENCES \`tripulaciones\`(\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log('Migración completada: 8 tablas listas (usuarios + 7 entidades de aeropuerto).');
  } catch (error) {
    console.error('Error en migración:', error);
  }
}