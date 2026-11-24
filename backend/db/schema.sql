-- Schéma de la base de données : suivi des appels
-- Exécuté par db/seed.js (npm run db:init). Efface et recrée toutes les tables.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS actions;
DROP TABLE IF EXISTS appels;
DROP TABLE IF EXISTS notes_rapides;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS utilisateurs;
SET FOREIGN_KEY_CHECKS = 1;

-- Les membres de l'équipe de la clinique
CREATE TABLE utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  courriel VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe_hash VARCHAR(255) NOT NULL,       -- jamais le mot de passe en clair
  role ENUM('admin', 'membre') NOT NULL DEFAULT 'membre',
  actif TINYINT(1) NOT NULL DEFAULT 1,
  cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Les services de la clinique (filtres et couleurs)
CREATE TABLE services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  couleur VARCHAR(7) NOT NULL DEFAULT '#3e8ed0'   -- code hexadécimal, ex. #3e8ed0
);

-- Les textes cliquables préprogrammés, modifiables par l'administratrice
CREATE TABLE notes_rapides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  texte VARCHAR(255) NOT NULL,
  statut_resultant ENUM('nouveau', 'en_cours', 'en_attente', 'regle') NULL, -- statut donné à l'appel
  ordre INT NOT NULL DEFAULT 0,
  actif TINYINT(1) NOT NULL DEFAULT 1
);

-- Un appel = un message vocal ou un appel pris par la réceptionniste
CREATE TABLE appels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source ENUM('boite_1', 'boite_2', 'boite_3', 'boite_4', 'reception') NOT NULL,
  nom_appelant VARCHAR(150) NULL,
  telephone VARCHAR(30) NOT NULL,
  telephone_chiffres VARCHAR(20) NOT NULL,         -- seulement les chiffres, pour la recherche
  courriel VARCHAR(150) NULL,
  motif TEXT NULL,
  langue ENUM('fr', 'en', 'es') NOT NULL DEFAULT 'fr',
  confidentiel TINYINT(1) NOT NULL DEFAULT 0,
  consigne_confidentialite VARCHAR(255) NULL,      -- ex. « Ne pas laisser de message »
  service_id INT NULL,
  statut ENUM('nouveau', 'en_cours', 'en_attente', 'regle') NOT NULL DEFAULT 'nouveau',
  archive TINYINT(1) NOT NULL DEFAULT 0,
  transcription TEXT NULL,
  recu_le DATETIME NOT NULL,                       -- date et heure de l'appel
  cree_par INT NOT NULL,
  pris_en_charge_par INT NULL,
  cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  maj_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_telephone (telephone_chiffres),
  INDEX idx_archive_recu (archive, recu_le),
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
  FOREIGN KEY (cree_par) REFERENCES utilisateurs(id),
  FOREIGN KEY (pris_en_charge_par) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- L'historique : qui a fait quoi, et quand. Une action n'est jamais modifiée.
CREATE TABLE actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appel_id INT NOT NULL,
  utilisateur_id INT NOT NULL,
  note_rapide_id INT NULL,                         -- vide si note libre ou action automatique
  texte TEXT NOT NULL,
  cree_le DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_appel (appel_id),
  FOREIGN KEY (appel_id) REFERENCES appels(id) ON DELETE CASCADE,
  FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id),
  FOREIGN KEY (note_rapide_id) REFERENCES notes_rapides(id) ON DELETE SET NULL
);
