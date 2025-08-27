CREATE DATABASE IF NOT EXISTS nutrisnap DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nutrisnap;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refeicoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  itens JSON NOT NULL,
  calorias_totais INT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS metas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  peso_atual FLOAT NOT NULL,
  peso_meta FLOAT NOT NULL,
  dias INT NOT NULL,
  calorias_diarias INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS treinos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  plano JSON NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_respostas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  idade INT,
  sexo VARCHAR(20),
  altura FLOAT,
  peso_atual FLOAT,
  peso_meta FLOAT,
  objetivo VARCHAR(50),
  nivel_atividade VARCHAR(50),
  frequencia_treino VARCHAR(50),
  acesso_academia VARCHAR(50),
  dieta_atual VARCHAR(50),
  preferencias JSON,
  habitos_alimentares JSON,
  restricoes_medicas JSON,
  historico_exercicios VARCHAR(50),
  tipo_treino_preferido JSON,
  horario_preferido VARCHAR(50),
  duracao_treino VARCHAR(50),
  metas_especificas JSON,
  motivacao VARCHAR(50),
  obstaculos JSON,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_usuario_quiz (id_usuario)
);