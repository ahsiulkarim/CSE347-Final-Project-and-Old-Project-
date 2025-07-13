<?php
session_start();
require_once 'config.php';
header('Content-Type: application/json');

$response = ['success' => false, 'message' => 'Invalid action or request method.'];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode($response);
    exit();
}

function addNotification($conn, $userId, $message) {
    $notificationId = round(microtime(true) * 1000);
    $sql = "INSERT INTO notifications (id, user_id, message) VALUES (?, ?, ?)";
    if ($stmt = mysqli_prepare($conn, $sql)) {
        mysqli_stmt_bind_param($stmt, "iis", $notificationId, $userId, $message);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
    }
}

function isAuthenticated($role = null) {
    if (!isset($_SESSION['loggedInUser']) || !$_SESSION['loggedInUser']['id']) {
        return false;
    }
    if ($role && $_SESSION['loggedInUser']['role'] !== $role) {
        return false;
    }
    return true;
}

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'signup':
        $name = trim($_POST['name'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $mobile = trim($_POST['mobile'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($name) || empty($email) || empty($mobile) || empty($password)) {
            $response = ['success' => false, 'message' => 'All fields are required.'];
            break;
        }

        $sql = "SELECT id FROM users WHERE email = ?";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "s", $email);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_store_result($stmt);
            if (mysqli_stmt_num_rows($stmt) > 0) {
                $response = ['success' => false, 'message' => 'An account with this email already exists.'];
            } else {
                $sql_insert = "INSERT INTO users (name, email, mobile, password, role) VALUES (?, ?, ?, ?, 'user')";
                if ($stmt_insert = mysqli_prepare($link, $sql_insert)) {
                    mysqli_stmt_bind_param($stmt_insert, "ssss", $name, $email, $mobile, $password);
                    if (mysqli_stmt_execute($stmt_insert)) {
                        $response = ['success' => true, 'message' => 'Account created successfully! Please log in.'];
                    } else {
                        $response = ['success' => false, 'message' => 'Error creating account.'];
                    }
                    mysqli_stmt_close($stmt_insert);
                }
            }
            mysqli_stmt_close($stmt);
        }
        break;

    case 'login':
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        if (empty($email) || empty($password)) {
            $response = ['success' => false, 'message' => 'Email and password are required.'];
            break;
        }

        $sql = "SELECT id, name, email, mobile, role, account_status, document_number, document_file_data, document_file_name FROM users WHERE email = ? AND password = ?";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "ss", $email, $password);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_store_result($stmt);

            if (mysqli_stmt_num_rows($stmt) == 1) {
                mysqli_stmt_bind_result($stmt, $id, $name, $email_res, $mobile_res, $role, $accountStatus, $docNum, $docFileData, $docFileName);
                mysqli_stmt_fetch($stmt);

                if ($accountStatus === 'inactive') {
                    $response = ['success' => false, 'message' => 'Your account has been deactivated. Please contact support.'];
                } else {
                    $loggedInUser = [
                        'id' => $id,
                        'name' => $name,
                        'email' => $email_res,
                        'mobile' => $mobile_res,
                        'role' => $role,
                        'accountStatus' => $accountStatus,
                        'document' => [
                            'number' => $docNum,
                            'fileData' => $docFileData,
                            'fileName' => $docFileName
                        ]
                    ];
                    $_SESSION['loggedInUser'] = $loggedInUser;
                    $response = ['success' => true, 'message' => 'Login successful!', 'user' => $loggedInUser];
                }
            } else {
                $response = ['success' => false, 'message' => 'Invalid email or password.'];
            }
            mysqli_stmt_close($stmt);
        }
        break;

    case 'logout':
        session_unset();
        session_destroy();
        $response = ['success' => true, 'message' => 'Logged out successfully.'];
        break;
    
    case 'getLoggedInUser':
        if (isset($_SESSION['loggedInUser'])) {
            $response = ['success' => true, 'user' => $_SESSION['loggedInUser']];
        } else {
            $response = ['success' => false, 'message' => 'No user logged in.'];
        }
        break;

    case 'updateProfile':
        if (!isAuthenticated('user')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $userId = $_SESSION['loggedInUser']['id'];
        $name = trim($_POST['name'] ?? '');
        $mobile = trim($_POST['mobile'] ?? '');

        if (empty($name) || empty($mobile)) {
            $response = ['success' => false, 'message' => 'Name and mobile are required.'];
            break;
        }

        $sql = "UPDATE users SET name = ?, mobile = ? WHERE id = ?";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "ssi", $name, $mobile, $userId);
            if (mysqli_stmt_execute($stmt)) {
                $_SESSION['loggedInUser']['name'] = $name;
                $_SESSION['loggedInUser']['mobile'] = $mobile;
                $response = ['success' => true, 'message' => 'Profile updated successfully!', 'user' => $_SESSION['loggedInUser']];
            } else {
                $response = ['success' => false, 'message' => 'Error updating profile.'];
            }
            mysqli_stmt_close($stmt);
        }
        break;

    case 'updateDocument':
        if (!isAuthenticated('user')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $userId = $_SESSION['loggedInUser']['id'];
        $docNumber = trim($_POST['docNumber'] ?? '');
        $fileData = $_POST['fileData'] ?? null;
        $fileName = $_POST['fileName'] ?? null;

        $sql = "UPDATE users SET document_number = ?, document_file_data = ?, document_file_name = ? WHERE id = ?";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "sssi", $docNumber, $fileData, $fileName, $userId);
            if (mysqli_stmt_execute($stmt)) {
                $_SESSION['loggedInUser']['document']['number'] = $docNumber;
                $_SESSION['loggedInUser']['document']['fileData'] = $fileData;
                $_SESSION['loggedInUser']['document']['fileName'] = $fileName;
                $response = ['success' => true, 'message' => 'Document information updated successfully!', 'user' => $_SESSION['loggedInUser']];
            } else {
                $response = ['success' => false, 'message' => 'Error updating document.'];
            }
            mysqli_stmt_close($stmt);
        }
        break;

    case 'deactivateAccount':
        if (!isAuthenticated('user')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $userId = $_SESSION['loggedInUser']['id'];

        $sql = "UPDATE users SET account_status = 'inactive' WHERE id = ?";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "i", $userId);
            if (mysqli_stmt_execute($stmt)) {
                session_unset();
                session_destroy();
                $response = ['success' => true, 'message' => 'Your account has been deactivated.'];
            } else {
                $response = ['success' => false, 'message' => 'Error deactivating account.'];
            }
            mysqli_stmt_close($stmt);
        }
        break;
    
    case 'requestEnrollment':
        if (!isAuthenticated('user')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $userId = $_SESSION['loggedInUser']['id'];
        $userName = $_SESSION['loggedInUser']['name'];
        $userEmail = $_SESSION['loggedInUser']['email'];
        $userMobile = $_SESSION['loggedInUser']['mobile'];
        $courseName = trim($_POST['courseName'] ?? '');
        $userPreferredLocation = trim($_POST['userPreferredLocation'] ?? '');
        $enrollmentId = round(microtime(true) * 1000);

        if (empty($courseName) || empty($userPreferredLocation)) {
            $response = ['success' => false, 'message' => 'Course name and preferred location are required.'];
            break;
        }

        $sql_check = "SELECT id FROM enrollments WHERE user_id = ? AND course_name = ? AND status IN ('Requested', 'Awaiting Payment', 'Payment Submitted')";
        if ($stmt_check = mysqli_prepare($link, $sql_check)) {
            mysqli_stmt_bind_param($stmt_check, "is", $userId, $courseName);
            mysqli_stmt_execute($stmt_check);
            mysqli_stmt_store_result($stmt_check);
            if (mysqli_stmt_num_rows($stmt_check) > 0) {
                $response = ['success' => false, 'message' => "You already have an active request for '$courseName'. Check your dashboard for its status."];
                mysqli_stmt_close($stmt_check);
                break;
            }
            mysqli_stmt_close($stmt_check);
        }

        $sql = "INSERT INTO enrollments (id, user_id, user_name, user_email, user_mobile, course_name, user_preferred_location, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'Requested')";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "iisssss", $enrollmentId, $userId, $userName, $userEmail, $userMobile, $courseName, $userPreferredLocation);
            if (mysqli_stmt_execute($stmt)) {
                $response = ['success' => true, 'message' => 'Your request has been sent! Check your dashboard for updates.'];
            } else {
                $response = ['success' => false, 'message' => 'Error sending enrollment request.'];
            }
            mysqli_stmt_close($stmt);
        }
        break;

    case 'getUserEnrollments':
        if (!isAuthenticated('user')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $userId = $_SESSION['loggedInUser']['id'];

        $sql = "SELECT id, course_name, payment_method, transaction_id, user_preferred_location, assigned_location, status, request_date FROM enrollments WHERE user_id = ? ORDER BY request_date DESC";
        $result = mysqli_query($link, $sql);
        $enrollments = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $enrollments[] = $row;
        }
        $response = ['success' => true, 'enrollments' => $enrollments];
        break;

    case 'submitPayment':
        if (!isAuthenticated('user')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $enrollmentId = $_POST['enrollmentId'] ?? '';
        $paymentMethod = $_POST['paymentMethod'] ?? '';
        $trxId = $_POST['trxId'] ?? '';
        $userId = $_SESSION['loggedInUser']['id'];

        if (empty($enrollmentId) || empty($paymentMethod) || empty($trxId)) {
            $response = ['success' => false, 'message' => 'All payment fields are required.'];
            break;
        }

        $sql = "UPDATE enrollments SET payment_method = ?, transaction_id = ?, status = 'Payment Submitted' WHERE id = ? AND user_id = ?";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "ssii", $paymentMethod, $trxId, $enrollmentId, $userId);
            if (mysqli_stmt_execute($stmt)) {
                $response = ['success' => true, 'message' => 'Payment details submitted successfully. Admin will review it shortly.'];
            } else {
                $response = ['success' => false, 'message' => 'Error submitting payment.'];
            }
            mysqli_stmt_close($stmt);
        }
        break;
    
    case 'sendSupportMessage':
        if (!isAuthenticated('user')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $userId = $_SESSION['loggedInUser']['id'];
        $userName = $_SESSION['loggedInUser']['name'];
        $userEmail = $_SESSION['loggedInUser']['email'];
        $message = trim($_POST['message'] ?? '');
        $msgId = round(microtime(true) * 1000);

        if (empty($message)) {
            $response = ['success' => false, 'message' => 'Message cannot be empty.'];
            break;
        }

        $sql = "INSERT INTO support_messages (id, user_id, user_name, user_email, message) VALUES (?, ?, ?, ?, ?)";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "iisss", $msgId, $userId, $userName, $userEmail, $message);
            if (mysqli_stmt_execute($stmt)) {
                $response = ['success' => true, 'message' => 'Your message has been sent to the admin.'];
            } else {
                $response = ['success' => false, 'message' => 'Error sending message.'];
            }
            mysqli_stmt_close($stmt);
        }
        break;

    case 'getUserNotifications':
        if (!isAuthenticated('user')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $userId = $_SESSION['loggedInUser']['id'];

        $sql = "SELECT id, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC";
        $result = mysqli_query($link, $sql);
        $notifications = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $notifications[] = $row;
        }
        $response = ['success' => true, 'notifications' => $notifications];
        break;

    case 'markNotificationRead':
        if (!isAuthenticated('user')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $notificationId = $_POST['notificationId'] ?? '';
        $userId = $_SESSION['loggedInUser']['id'];

        if (empty($notificationId)) {
            $response = ['success' => false, 'message' => 'Notification ID is required.'];
            break;
        }

        $sql = "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?";
        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, "ii", $notificationId, $userId);
            if (mysqli_stmt_execute($stmt)) {
                $response = ['success' => true];
            } else {
                $response = ['success' => false, 'message' => 'Error marking as read.'];
            }
            mysqli_stmt_close($stmt);
        }
        break;

    case 'getAllEnrollments':
        if (!isAuthenticated('admin')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $sql = "SELECT id, user_id, user_name, user_email, user_mobile, course_name, payment_method, transaction_id, user_preferred_location, assigned_location, status, request_date FROM enrollments ORDER BY request_date DESC";
        $result = mysqli_query($link, $sql);
        $enrollments = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $enrollments[] = $row;
        }
        $response = ['success' => true, 'enrollments' => $enrollments];
        break;

    case 'updateEnrollmentStatus':
        if (!isAuthenticated('admin')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $enrollmentId = $_POST['enrollmentId'] ?? '';
        $newStatus = $_POST['newStatus'] ?? '';
        $assignedLocation = $_POST['assignedLocation'] ?? null;
        $userId = $_POST['userId'] ?? '';
        $courseName = $_POST['courseName'] ?? '';

        if (empty($enrollmentId) || empty($newStatus) || empty($userId) || empty($courseName)) {
            $response = ['success' => false, 'message' => 'Missing required data for enrollment status update.'];
            break;
        }

        $sql = "UPDATE enrollments SET status = ?";
        $params = "s";
        $param_values = [&$newStatus];

        if ($assignedLocation !== null) {
            $sql .= ", assigned_location = ?";
            $params .= "s";
            $param_values[] = &$assignedLocation;
        }
        $sql .= " WHERE id = ?";
        $params .= "i";
        $param_values[] = &$enrollmentId;

        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, $params, ...$param_values);
            if (mysqli_stmt_execute($stmt)) {
                $message_for_user = '';
                switch ($newStatus) {
                    case 'Awaiting Payment':
                        $message_for_user = "Good news! A slot for \"$courseName\" is available. Please complete the payment from your dashboard.";
                        break;
                    case 'Approved':
                        $message_for_user = "Payment for \"$courseName\" confirmed! Your class is at: $assignedLocation.";
                        addNotification($link, $userId, "Important: Please bring a photocopy of your submitted NID/Passport to all your classes for verification.");
                        break;
                    case 'Rejected':
                        $message_for_user = "Sorry, your request for \"$courseName\" has been rejected. Please contact support for details.";
                        break;
                    case 'Payment Rejected':
                        $message_for_user = "Your payment for \"$courseName\" has been rejected. Please contact support for details.";
                        break;
                    case 'Not Available':
                        $message_for_user = "The course \"$courseName\" is currently not available for enrollment. We apologize for the inconvenience.";
                        break;
                    case 'Deactivated':
                        $message_for_user = "Your enrollment for \"$courseName\" has been deactivated.";
                        break;
                }
                if ($message_for_user) {
                    addNotification($link, $userId, $message_for_user);
                }
                $response = ['success' => true, 'message' => 'Enrollment status updated.'];
            } else {
                $response = ['success' => false, 'message' => 'Error updating enrollment status.'];
            }
            mysqli_stmt_close($stmt);
        }
        break;

    case 'getAllUsers':
        if (!isAuthenticated('admin')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $sql = "SELECT id, name, email, mobile, role, account_status, document_number, document_file_data, document_file_name FROM users WHERE role = 'user' ORDER BY id DESC";
        $result = mysqli_query($link, $sql);
        $users = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $row['document'] = [
                'number' => $row['document_number'],
                'fileData' => $row['document_file_data'],
                'fileName' => $row['document_file_name']
            ];
            unset($row['document_number'], $row['document_file_data'], $row['document_file_name']);
            $users[] = $row;
        }
        $response = ['success' => true, 'users' => $users];
        break;

    case 'adminUpdateUser':
        if (!isAuthenticated('admin')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $userId = $_POST['userId'] ?? '';
        $name = trim($_POST['name'] ?? '');
        $mobile = trim($_POST['mobile'] ?? '');
        $accountStatus = $_POST['accountStatus'] ?? null;

        if (empty($userId) || empty($name) || empty($mobile)) {
            $response = ['success' => false, 'message' => 'Missing required user data for update.'];
            break;
        }

        $sql = "UPDATE users SET name = ?, mobile = ?";
        $params = "ss";
        $param_values = [&$name, &$mobile];

        if ($accountStatus !== null) {
            $sql .= ", account_status = ?";
            $params .= "s";
            $param_values[] = &$accountStatus;
        }
        $sql .= " WHERE id = ?";
        $params .= "i";
        $param_values[] = &$userId;

        if ($stmt = mysqli_prepare($link, $sql)) {
            mysqli_stmt_bind_param($stmt, $params, ...$param_values);
            if (mysqli_stmt_execute($stmt)) {
                if (isset($_SESSION['loggedInUser']) && $_SESSION['loggedInUser']['id'] == $userId) {
                    $_SESSION['loggedInUser']['name'] = $name;
                    $_SESSION['loggedInUser']['mobile'] = $mobile;
                    if ($accountStatus !== null) {
                        $_SESSION['loggedInUser']['accountStatus'] = $accountStatus;
                    }
                }
                $response = ['success' => true, 'message' => 'User updated successfully!'];
            } else {
                $response = ['success' => false, 'message' => 'Error updating user.'];
            }
            mysqli_stmt_close($stmt);
        }
        break;

    case 'getSupportMessages':
        if (!isAuthenticated('admin')) { $response = ['success' => false, 'message' => 'Unauthorized']; break; }
        $sql = "SELECT id, user_id, user_name, user_email, message, sent_at FROM support_messages ORDER BY sent_at DESC";
        $result = mysqli_query($link, $sql);
        $messages = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $messages[] = $row;
        }
        $response = ['success' => true, 'messages' => $messages];
        break;

    default:
        $response = ['success' => false, 'message' => 'Action not recognized.'];
        break;
}

echo json_encode($response);
mysqli_close($link);
?>