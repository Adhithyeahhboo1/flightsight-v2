-- Run this to add new tables to existing flightsight DB
USE flightsight;

CREATE TABLE IF NOT EXISTS alerts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  flight_number VARCHAR(10) NOT NULL,
  alert_type   VARCHAR(30) DEFAULT 'delay',
  active       TINYINT(1) DEFAULT 1,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_alert (user_id, flight_number, alert_type)
);

CREATE TABLE IF NOT EXISTS trips (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trip_legs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  trip_id       INT NOT NULL,
  flight_number VARCHAR(10) NOT NULL,
  leg_order     INT DEFAULT 1,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

SELECT 'New tables created successfully!' AS result;
