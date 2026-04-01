-- ============================================================
--  FlightSight v2 Database Setup
--  Run: mysql -u root -p < setup.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS flightsight;
USE flightsight;

DROP TABLE IF EXISTS recent_searches;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS trip_legs;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS flights;
DROP TABLE IF EXISTS airports;

-- ─── AIRPORTS ─────────────────────────────────────────────
CREATE TABLE airports (
  code          VARCHAR(4)   PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  city          VARCHAR(60)  NOT NULL,
  country       VARCHAR(60)  NOT NULL,
  lat           DECIMAL(9,6) NOT NULL,
  lon           DECIMAL(9,6) NOT NULL,
  traffic_level VARCHAR(20)  NOT NULL,
  weather       VARCHAR(40)  NOT NULL,
  terminal_count INT         DEFAULT 1
);

-- ─── FLIGHTS ──────────────────────────────────────────────
CREATE TABLE flights (
  id               INT          AUTO_INCREMENT PRIMARY KEY,
  flight_number    VARCHAR(10)  UNIQUE NOT NULL,
  airline          VARCHAR(80)  NOT NULL,
  airline_code     VARCHAR(4)   NOT NULL,
  origin           VARCHAR(4)   NOT NULL,
  destination      VARCHAR(4)   NOT NULL,
  departure_time   VARCHAR(6)   NOT NULL,
  arrival_time     VARCHAR(6)   NOT NULL,
  status           VARCHAR(20)  NOT NULL,
  latitude         DECIMAL(9,6),
  longitude        DECIMAL(9,6),
  altitude         INT,
  speed            INT,
  delay_minutes    INT          DEFAULT 0,
  terminal         VARCHAR(10),
  gate             VARCHAR(10),
  boarding_status  VARCHAR(20),
  baggage_belt     VARCHAR(20),
  delay_cause      VARCHAR(80),
  delay_confidence DECIMAL(4,2) DEFAULT 0.00,
  aircraft_type    VARCHAR(40),
  flight_duration  VARCHAR(12)
);

-- ─── USERS ────────────────────────────────────────────────
CREATE TABLE users (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(80)  NOT NULL,
  email        VARCHAR(120) UNIQUE NOT NULL,
  password     VARCHAR(255) NOT NULL,
  theme        VARCHAR(20)  DEFAULT 'dark',
  notifications TINYINT(1)  DEFAULT 1,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─── FAVORITES ────────────────────────────────────────────
CREATE TABLE favorites (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  flight_number VARCHAR(10) NOT NULL,
  added_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_fav (user_id, flight_number)
);

-- ─── RECENT SEARCHES ──────────────────────────────────────
CREATE TABLE recent_searches (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  flight_number VARCHAR(10) NOT NULL,
  searched_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE alerts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  flight_number VARCHAR(10) NOT NULL,
  alert_type    VARCHAR(30) DEFAULT 'delay',
  active        TINYINT(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_alert (user_id, flight_number, alert_type)
);

CREATE TABLE trips (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  name       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE trip_legs (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  trip_id       INT NOT NULL,
  flight_number VARCHAR(10) NOT NULL,
  leg_order     INT DEFAULT 1,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- ─── SEED AIRPORTS ────────────────────────────────────────
INSERT INTO airports VALUES
('DEL','Indira Gandhi International Airport','New Delhi','India',28.566500,77.103100,'Very High','Clear',3),
('BOM','Chhatrapati Shivaji Maharaj Intl Airport','Mumbai','India',19.089600,72.865600,'Very High','Humid',2),
('MAA','Chennai International Airport','Chennai','India',12.994100,80.170900,'High','Partly Cloudy',2),
('BLR','Kempegowda International Airport','Bengaluru','India',13.197900,77.706300,'High','Clear',2),
('HYD','Rajiv Gandhi International Airport','Hyderabad','India',17.240300,78.429400,'Medium','Clear',1),
('DXB','Dubai International Airport','Dubai','UAE',25.253200,55.365700,'Very High','Sunny',3),
('AUH','Abu Dhabi International Airport','Abu Dhabi','UAE',24.433000,54.651100,'High','Sunny',3),
('DOH','Hamad International Airport','Doha','Qatar',25.273100,51.608200,'Very High','Sunny',1),
('LHR','London Heathrow Airport','London','United Kingdom',51.470000,-0.454300,'Very High','Overcast',5),
('JFK','John F. Kennedy International Airport','New York','USA',40.641300,-73.778100,'Very High','Partly Cloudy',6),
('LAX','Los Angeles International Airport','Los Angeles','USA',33.941600,-118.408500,'High','Sunny',9),
('SIN','Singapore Changi Airport','Singapore','Singapore',1.364400,103.991500,'Very High','Thunderstorm',4),
('HKG','Hong Kong International Airport','Hong Kong','China',22.308000,113.918500,'High','Foggy',2),
('FRA','Frankfurt Airport','Frankfurt','Germany',50.037900,8.562200,'Very High','Cloudy',2),
('CDG','Charles de Gaulle Airport','Paris','France',49.009700,2.547900,'Very High','Light Rain',3),
('AMS','Amsterdam Airport Schiphol','Amsterdam','Netherlands',52.308600,4.763900,'High','Foggy',1),
('NRT','Narita International Airport','Tokyo','Japan',35.772000,140.392900,'High','Clear',2),
('ICN','Incheon International Airport','Seoul','South Korea',37.460200,126.440700,'High','Clear',2),
('SYD','Sydney Kingsford Smith Airport','Sydney','Australia',-33.939900,151.175300,'High','Sunny',3),
('ORD',"O'Hare International Airport",'Chicago','USA',41.974200,-87.907300,'Very High','Snow',4),
('IST','Istanbul Airport','Istanbul','Turkey',41.260800,28.741800,'High','Partly Cloudy',1),
('KUL','Kuala Lumpur International Airport','Kuala Lumpur','Malaysia',2.745600,101.709900,'High','Thunderstorm',2),
('ATL','Hartsfield-Jackson Atlanta Intl Airport','Atlanta','USA',33.640700,-84.427700,'Very High','Clear',2);

-- ─── SEED FLIGHTS ─────────────────────────────────────────
INSERT INTO flights (flight_number,airline,airline_code,origin,destination,departure_time,arrival_time,status,latitude,longitude,altitude,speed,delay_minutes,terminal,gate,boarding_status,baggage_belt,delay_cause,delay_confidence,aircraft_type,flight_duration) VALUES
('AI101','Air India','AI','DEL','LHR','01:45','06:30','En Route',43.200000,35.800000,37000,892,0,'T3','G28','In Flight','-',NULL,0.00,'Boeing 787-8','8h 45m'),
('AI203','Air India','AI','BOM','DXB','09:15','11:00','On Time',22.100000,63.400000,35000,845,0,'T2','B12','In Flight','-',NULL,0.00,'Airbus A320','2h 45m'),
('AI302','Air India','AI','DEL','JFK','14:20','19:05','Delayed',52.400000,10.300000,38000,920,75,'T3','G41','In Flight','-','ATC Congestion',0.87,'Boeing 777-300ER','15h 45m'),
('AI450','Air India','AI','MAA','SIN','22:30','05:55','Boarding',12.994100,80.170900,0,0,0,'T4','A7','Boarding','-',NULL,0.00,'Airbus A320neo','4h 25m'),
('AI505','Air India','AI','DEL','CDG','03:10','07:55','En Route',46.800000,22.100000,39000,905,15,'T3','G14','In Flight','-','Late Departure',0.71,'Boeing 787-8','7h 45m'),
('AI407','Air India','AI','BLR','LHR','22:10','04:30','Delayed',20.400000,65.100000,36000,870,90,'T2','C19','In Flight','-','Technical Inspection',0.92,'Boeing 787-8','9h 20m'),
('AI992','Air India','AI','DEL','SYD','06:00','23:40','En Route',8.200000,118.500000,38000,930,0,'T3','G55','In Flight','-',NULL,0.00,'Boeing 787-9','13h 40m'),
('AI665','Air India','AI','DEL','BLR','19:00','21:30','On Time',22.800000,77.100000,32000,830,0,'T3','G9','In Flight','-',NULL,0.00,'Airbus A321','2h 30m'),
('6E101','IndiGo','6E','DEL','BOM','07:00','09:10','On Time',24.500000,74.800000,31000,820,0,'T2','D3','In Flight','-',NULL,0.00,'Airbus A320neo','2h 10m'),
('6E202','IndiGo','6E','BLR','HYD','11:30','12:30','Arrived',17.240300,78.429400,0,0,0,'T1','-','Arrived','Belt 3',NULL,0.00,'Airbus A320','1h 00m'),
('6E512','IndiGo','6E','DEL','MAA','15:45','18:05','Delayed',21.300000,79.600000,33000,810,40,'T2','E11','In Flight','-','Air Traffic Congestion',0.79,'Airbus A320neo','2h 20m'),
('6E724','IndiGo','6E','BOM','SIN','02:30','11:15','En Route',8.400000,91.200000,37000,880,0,'T2','B7','In Flight','-',NULL,0.00,'Airbus A321neo','5h 45m'),
('6E831','IndiGo','6E','HYD','DEL','13:00','15:20','On Time',22.100000,77.900000,34000,825,0,'T1','F8','In Flight','-',NULL,0.00,'Airbus A320','2h 20m'),
('6E445','IndiGo','6E','BOM','DEL','08:20','10:30','Arrived',28.566500,77.103100,0,0,10,'T2','-','Arrived','Belt 7',NULL,0.00,'Airbus A320neo','2h 10m'),
('6E144','IndiGo','6E','BOM','BLR','14:10','15:30','En Route',16.200000,74.800000,28000,800,0,'T2','C22','In Flight','-',NULL,0.00,'Airbus A320neo','1h 20m'),
('6E911','IndiGo','6E','MAA','DEL','06:15','08:45','On Time',20.400000,79.200000,33000,820,0,'T4','A3','In Flight','-',NULL,0.00,'Airbus A320','2h 30m'),
('EK226','Emirates','EK','DXB','DEL','10:35','15:10','On Time',24.800000,67.200000,36000,875,0,'T1','A15','In Flight','-',NULL,0.00,'Boeing 777-300ER','3h 35m'),
('EK501','Emirates','EK','DXB','LHR','08:20','12:50','En Route',36.400000,28.900000,39000,918,0,'T1','A42','In Flight','-',NULL,0.00,'Airbus A380-800','7h 30m'),
('EK505','Emirates','EK','LHR','DXB','14:30','23:55','En Route',44.100000,22.700000,38000,905,20,'T3','G15','In Flight','-','Crew Scheduling',0.68,'Airbus A380-800','6h 25m'),
('EK586','Emirates','EK','BOM','DXB','16:50','18:30','Delayed',21.400000,64.100000,34000,850,55,'T2','C5','In Flight','-','Weather Diversion',0.84,'Boeing 777-200LR','2h 40m'),
('QR572','Qatar Airways','QR','DOH','DEL','11:20','17:05','On Time',24.100000,66.800000,37000,895,0,'T3','H22','In Flight','-',NULL,0.00,'Airbus A350-900','3h 45m'),
('QR401','Qatar Airways','QR','DOH','LHR','07:45','12:20','Delayed',38.200000,21.500000,38000,910,35,'T3','H8','In Flight','-','Airport Congestion',0.82,'Boeing 777-300ER','6h 35m'),
('QR526','Qatar Airways','QR','DEL','DOH','19:50','22:15','On Time',26.800000,61.400000,36000,875,0,'T3','G30','In Flight','-',NULL,0.00,'Airbus A350-900','3h 25m'),
('BA117','British Airways','BA','LHR','DEL','21:25','09:55','En Route',42.700000,32.100000,39000,920,0,'T5','B32','In Flight','-',NULL,0.00,'Boeing 787-9','8h 30m'),
('BA178','British Airways','BA','LHR','JFK','11:00','13:55','On Time',53.800000,-26.400000,38000,915,0,'T5','A18','In Flight','-',NULL,0.00,'Boeing 777-200ER','7h 55m'),
('BA256','British Airways','BA','LHR','BOM','22:50','11:05','En Route',32.600000,47.800000,37000,895,0,'T5','B44','In Flight','-',NULL,0.00,'Boeing 787-9','9h 15m'),
('AA292','American Airlines','AA','JFK','LHR','22:30','10:25','En Route',57.400000,-22.800000,38000,912,0,'B','22','In Flight','-',NULL,0.00,'Boeing 777-200ER','6h 55m'),
('AA291','American Airlines','AA','LHR','JFK','13:45','16:40','On Time',55.100000,-35.200000,37000,900,0,'3','D7','In Flight','-',NULL,0.00,'Boeing 777-200ER','7h 55m'),
('UA908','United Airlines','UA','ORD','LHR','18:15','08:30','En Route',58.900000,-15.400000,39000,925,0,'1','F12','In Flight','-',NULL,0.00,'Boeing 767-300ER','8h 15m'),
('UA836','United Airlines','UA','LHR','ORD','10:30','13:20','En Route',55.400000,-42.100000,38000,918,25,'2','B9','In Flight','-','Slot Allocation Delay',0.74,'Boeing 767-300ER','8h 50m'),
('LH754','Lufthansa','LH','FRA','DEL','12:40','00:35','En Route',38.500000,48.900000,38000,900,0,'1','A12','In Flight','-',NULL,0.00,'Airbus A340-300','7h 55m'),
('LH755','Lufthansa','LH','DEL','FRA','02:05','07:45','Boarding',28.566500,77.103100,0,0,0,'T3','G22','Boarding','-',NULL,0.00,'Airbus A340-300','7h 40m'),
('AF218','Air France','AF','CDG','DEL','13:55','01:40','On Time',41.200000,38.600000,37000,895,0,'2','E14','In Flight','-',NULL,0.00,'Boeing 777-200ER','7h 45m'),
('KL871','KLM Royal Dutch Airlines','KL','AMS','DEL','11:50','00:15','Delayed',40.800000,35.200000,37000,890,45,'1','D22','In Flight','-','Runway Congestion',0.76,'Boeing 787-9','8h 25m'),
('SQ401','Singapore Airlines','SQ','SIN','LHR','23:55','06:00','En Route',24.400000,63.700000,39000,930,0,'3','C5','In Flight','-',NULL,0.00,'Airbus A380-800','13h 05m'),
('SQ518','Singapore Airlines','SQ','SIN','DEL','08:30','11:30','On Time',10.200000,86.400000,36000,870,0,'3','B19','In Flight','-',NULL,0.00,'Airbus A350-900','5h 00m'),
('CX699','Cathay Pacific','CX','HKG','LHR','00:25','06:10','En Route',35.600000,58.200000,38000,910,0,'1','G26','In Flight','-',NULL,0.00,'Airbus A350-1000','13h 45m'),
('NH803','All Nippon Airways','NH','NRT','LHR','11:30','16:20','En Route',52.100000,68.400000,39000,925,0,'2','A44','In Flight','-',NULL,0.00,'Boeing 787-9','12h 50m'),
('KE907','Korean Air','KE','ICN','LHR','13:40','18:20','En Route',56.400000,42.800000,38000,915,0,'2','C38','In Flight','-',NULL,0.00,'Boeing 777-200ER','11h 40m'),
('QF2','Qantas','QF','SYD','LHR','16:00','05:00','En Route',14.800000,84.200000,39000,940,0,'1','B5','In Flight','-',NULL,0.00,'Airbus A380-800','21h 00m'),
('SG101','SpiceJet','SG','DEL','BOM','06:30','08:40','On Time',23.800000,75.100000,30000,815,0,'T2','D15','In Flight','-',NULL,0.00,'Boeing 737-800','2h 10m'),
('SG202','SpiceJet','SG','DEL','MAA','10:00','12:25','Boarding',28.566500,77.103100,0,0,0,'T2','E6','Boarding','-',NULL,0.00,'Boeing 737-MAX 8','2h 25m'),
('IX202','Air India Express','IX','DEL','DXB','03:40','05:30','On Time',26.100000,62.800000,35000,855,0,'T2','B4','In Flight','-',NULL,0.00,'Boeing 737-800','3h 50m'),
('G8201','Go First','G8','DEL','BOM','17:30','19:40','Cancelled',NULL,NULL,NULL,NULL,0,'T2','-','Cancelled','-','Operational Issues',1.00,'Airbus A320','2h 10m'),
('TK198','Turkish Airlines','TK','DEL','IST','04:30','09:00','En Route',35.800000,58.400000,37000,895,0,'T3','H5','In Flight','-',NULL,0.00,'Boeing 777-300ER','6h 30m'),
('EY241','Etihad Airways','EY','AUH','DEL','12:15','16:50','On Time',23.900000,64.500000,36000,870,0,'T3','G17','In Flight','-',NULL,0.00,'Boeing 787-9','3h 35m'),
('VS401','Virgin Atlantic','VS','LHR','JFK','09:30','12:25','On Time',52.100000,-31.800000,38000,905,0,'T3','C14','In Flight','-',NULL,0.00,'Airbus A330-300','7h 55m'),
('MH192','Malaysia Airlines','MH','KUL','DEL','00:35','04:05','En Route',8.700000,89.400000,36000,865,30,'T3','H11','In Flight','-','Weather Delay',0.77,'Airbus A330-300','4h 30m');

SELECT CONCAT('✅ Setup complete! ', COUNT(*), ' flights loaded.') AS result FROM flights;
