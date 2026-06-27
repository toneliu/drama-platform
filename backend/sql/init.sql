-- 短剧平台数据库初始化脚本

CREATE DATABASE IF NOT EXISTS drama_platform DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE drama_platform;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tt_open_id VARCHAR(128) DEFAULT NULL,
  h5_token VARCHAR(128) DEFAULT NULL,
  nickname VARCHAR(64) DEFAULT NULL,
  avatar VARCHAR(512) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  coins INT DEFAULT 0,
  balance DECIMAL(10,2) DEFAULT 0,
  vip_status ENUM('none','active','expired') DEFAULT 'none',
  vip_expire_time DATETIME DEFAULT NULL,
  checkin_days INT DEFAULT 0,
  total_checkin_days INT DEFAULT 0,
  last_checkin_date VARCHAR(10) DEFAULT NULL,
  invite_code VARCHAR(16) DEFAULT NULL,
  invited_by BIGINT DEFAULT NULL,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tt_open_id (tt_open_id),
  INDEX idx_h5_token (h5_token),
  INDEX idx_invite_code (invite_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 剧目表
CREATE TABLE IF NOT EXISTS dramas (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_url VARCHAR(512),
  trailer_url VARCHAR(512),
  category VARCHAR(128),
  tags VARCHAR(255),
  view_count INT DEFAULT 0,
  like_count INT DEFAULT 0,
  episode_count INT DEFAULT 0,
  free_episodes INT DEFAULT 0,
  episode_price INT DEFAULT 150,
  target_audience ENUM('male','female','all') DEFAULT 'all',
  sort_order INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_status_sort (status, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 剧集表
CREATE TABLE IF NOT EXISTS episodes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  drama_id BIGINT NOT NULL,
  episode_number INT NOT NULL,
  title VARCHAR(255),
  video_url VARCHAR(512),
  master_m3u8 VARCHAR(512),
  cover_url VARCHAR(512),
  duration INT DEFAULT 0,
  is_free TINYINT DEFAULT 0,
  price INT DEFAULT 150,
  view_count INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_drama_id (drama_id),
  INDEX idx_drama_episode (drama_id, episode_number),
  FOREIGN KEY (drama_id) REFERENCES dramas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订阅档位表
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tier_id VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  duration_days INT NOT NULL,
  trial_days INT DEFAULT 0,
  tt_product_id VARCHAR(128),
  google_product_id VARCHAR(128),
  apple_product_id VARCHAR(128),
  status TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订阅订单表
CREATE TABLE IF NOT EXISTS subscription_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  order_id VARCHAR(64) UNIQUE NOT NULL,
  tt_order_id VARCHAR(64),
  product_id VARCHAR(64),
  tier_id VARCHAR(64),
  status ENUM('pending','active','expired','refunded','cancelled') DEFAULT 'pending',
  trial_start_time DATETIME,
  trial_end_time DATETIME,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  subscribe_time DATETIME,
  expire_time DATETIME,
  auto_renew TINYINT DEFAULT 1,
  tt_open_id VARCHAR(128),
  platform VARCHAR(20),
  callback_data TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id),
  INDEX idx_status_expire (status, expire_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 订阅回调日志表
CREATE TABLE IF NOT EXISTS subscription_callbacks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id VARCHAR(64) NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  callback_data TEXT,
  processed TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 支付订单表
CREATE TABLE IF NOT EXISTS payment_orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  order_id VARCHAR(64) UNIQUE NOT NULL,
  tt_order_id VARCHAR(64),
  order_type ENUM('coins','vip','episode') DEFAULT 'coins',
  product_id VARCHAR(64),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  pay_method VARCHAR(20),
  coins_amount INT DEFAULT 0,
  bonus_coins INT DEFAULT 0,
  paid_at DATETIME,
  callback_data TEXT,
  platform VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 金币变动日志表
CREATE TABLE IF NOT EXISTS coin_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  amount INT NOT NULL,
  balance_after INT NOT NULL,
  type ENUM('recharge','purchase','checkin','invite','system','refund') NOT NULL,
  description VARCHAR(255),
  related_id BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 兑换码表
CREATE TABLE IF NOT EXISTS redeem_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(32) UNIQUE NOT NULL,
  batch_id VARCHAR(32) NOT NULL,
  coins INT DEFAULT 0,
  vip_days INT DEFAULT 0,
  used TINYINT DEFAULT 0,
  used_by BIGINT,
  used_at DATETIME,
  expire_time DATETIME,
  status TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 剧集解锁记录表
CREATE TABLE IF NOT EXISTS unlock_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  episode_id BIGINT NOT NULL,
  drama_id BIGINT NOT NULL,
  unlock_type ENUM('coins','vip','ad','redeem') NOT NULL,
  coins_spent INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_episode (user_id, episode_id),
  INDEX idx_user_id (user_id),
  INDEX idx_drama_id (drama_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始数据: 订阅档位
INSERT INTO subscription_tiers (tier_id, name, price, currency, duration_days, trial_days, sort_order) VALUES
  ('weekly', '周会员', 2.99, 'USD', 7, 0, 1),
  ('monthly', '月会员', 7.99, 'USD', 30, 3, 2),
  ('yearly', '年会员', 49.99, 'USD', 365, 7, 3);
