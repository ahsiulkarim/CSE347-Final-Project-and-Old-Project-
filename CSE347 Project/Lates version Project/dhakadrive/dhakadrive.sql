CREATE DATABASE IF NOT EXISTS dhakadrive;
USE dhakadrive;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    account_status ENUM('active', 'inactive') DEFAULT 'active',
    document_number VARCHAR(255),
    document_file_data LONGTEXT,
    document_file_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_mobile VARCHAR(20) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    user_preferred_location VARCHAR(255),
    assigned_location VARCHAR(255),
    transaction_id VARCHAR(255),
    payment_method VARCHAR(255),
    status ENUM(
        'Requested',
        'Awaiting Payment',
        'Payment Submitted',
        'Approved',
        'Rejected',
        'Payment Rejected',
        'Not Available',
        'Deactivated'
    ) DEFAULT 'Requested',
    request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS support_messages (
    id BIGINT PRIMARY KEY,
    user_id INT NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT IGNORE INTO users (name, email, mobile, password, role, account_status) VALUES
('Admin', 'admin@dhakadrive.com', '01000000000', 'admin', 'admin', 'active');