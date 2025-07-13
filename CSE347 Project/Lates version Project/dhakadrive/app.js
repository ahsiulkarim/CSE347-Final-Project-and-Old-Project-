document.addEventListener('DOMContentLoaded', async () => {

    const fetchData = async (action, data = {}) => {
        const formData = new FormData();
        formData.append('action', action);
        for (const key in data) {
            if (data[key] instanceof File) {
                formData.append(key, data[key], data[key].name);
            } else {
                formData.append(key, data[key]);
            }
        }

        try {
            const response = await fetch('api.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error fetching data:', error);
            return { success: false, message: 'Network error or server issue.' };
        }
    };

    let loggedInUser = null;

    const getLoggedInUser = async () => {
        if (sessionStorage.getItem('loggedInUser')) {
            loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
            return loggedInUser;
        }
        const result = await fetchData('getLoggedInUser');
        if (result.success && result.user) {
            sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
            loggedInUser = result.user;
            return loggedInUser;
        }
        loggedInUser = null;
        return null;
    };

    const updateNav = async () => {
        const mainNav = document.getElementById('main-nav');
        if (!mainNav) return;
        
        const user = await getLoggedInUser();
        let navLinks = `
            <a href="index.php#courses">Courses</a>
            <a href="index.php#faq">FAQ</a>
            <a href="index.php#contact">Contact</a>
        `;
        if (user) {
            navLinks += `<a href="dashboard.php">Dashboard</a><a href="#" id="logout-btn">Logout</a>`;
        } else {
            navLinks += `<a href="login.php">Login</a><a href="signup.php" class="btn btn-nav">Sign Up</a>`;
        }
        mainNav.innerHTML = navLinks;

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const result = await fetchData('logout');
                if (result.success) {
                    sessionStorage.removeItem('loggedInUser');
                    alert('You have been logged out.');
                    window.location.href = 'index.php';
                } else {
                    alert('Logout failed. Please try again.');
                }
            });
        }
    };

    if (document.getElementById('signup-form')) {
        document.getElementById('signup-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const mobile = document.getElementById('mobile').value;
            const password = document.getElementById('password').value;

            const result = await fetchData('signup', { name, email, mobile, password });
            if (result.success) {
                alert(result.message);
                window.location.href = 'login.php';
            } else {
                alert(result.message);
            }
        });
    }

    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const result = await fetchData('login', { email, password });
            if (result.success) {
                sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
                alert(`Welcome back, ${result.user.name}!`);
                window.location.href = result.user.role === 'admin' ? 'admin.php' : 'dashboard.php';
            } else {
                alert(result.message);
            }
        });
    }

    const coursePrices = { "Car Driving Course": 5000, "Motorcycle Riding Course": 3000, "Scooter Riding Lessons": 2500, "Bicycle Safety Program": 1000 };
    
    document.querySelectorAll('.request-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const user = await getLoggedInUser();
            if (!user) { 
                alert('Please log in to request enrollment.'); 
                window.location.href = 'login.php'; 
                return; 
            }
            
            const courseName = e.target.getAttribute('data-course');

            const enrollmentsResult = await fetchData('getUserEnrollments');
            if (enrollmentsResult.success) {
                const enrollments = enrollmentsResult.enrollments;
                const existingActiveRequest = enrollments.find(en => 
                    en.user_id === user.id && 
                    en.course_name === courseName && 
                    ['Requested', 'Awaiting Payment', 'Payment Submitted'].includes(en.status)
                );
                
                if (existingActiveRequest) { 
                    alert(`You already have an active request for "${courseName}". Check your dashboard for its status.`); 
                    return; 
                }
            } else {
                alert(enrollmentsResult.message || 'Failed to check existing enrollments.');
                return;
            }

            document.getElementById('modal-price-course-name').textContent = courseName;
            document.getElementById('modal-course-price').textContent = (coursePrices[courseName] || 0).toLocaleString();
            document.getElementById('price-confirm-modal').style.display = 'flex';
        });
    });

    if (document.getElementById('confirm-price-btn')) {
        document.getElementById('confirm-price-btn').addEventListener('click', () => {
            document.getElementById('price-confirm-modal').style.display = 'none';
            const courseName = document.getElementById('modal-price-course-name').textContent;
            document.getElementById('modal-request-course-name').textContent = courseName;
            document.getElementById('request-modal').style.display = 'flex';
        });
    }
    
    if (document.getElementById('request-form')) {
        document.getElementById('request-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = await getLoggedInUser();
            const userLocation = document.getElementById('user-location').value;
            const courseName = document.getElementById('modal-request-course-name').textContent;
            
            const result = await fetchData('requestEnrollment', { 
                userId: user.id, 
                courseName: courseName, 
                userPreferredLocation: userLocation 
            });

            if (result.success) {
                alert(result.message);
                document.getElementById('request-modal').style.display = 'none';
                window.location.href = 'dashboard.php';
            } else {
                alert(result.message);
            }
        });
    }

    if (document.getElementById('dashboard')) {
        let user = await getLoggedInUser();
        if (!user || user.accountStatus === 'inactive') {
            alert('You must be logged in to view this page or your account is inactive.');
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'login.php';
            return;
        }

        const welcomeMessage = document.getElementById('welcome-message');
        const profileNameInput = document.getElementById('profile-name');
        const profileMobileInput = document.getElementById('profile-mobile');
        const docNumberInput = document.getElementById('user-document-number');
        const docFileInput = document.getElementById('user-document-file');
        const fileInfo = document.getElementById('file-info');
        const myCoursesList = document.getElementById('my-courses-list');
        const notificationList = document.getElementById('notification-list');

        const populateProfileData = async () => {
            user = await getLoggedInUser();
            if (!user) return;
            welcomeMessage.textContent = `Welcome, ${user.name}!`;
            profileNameInput.value = user.name;
            profileMobileInput.value = user.mobile;
            if (user.document) {
                docNumberInput.value = user.document.number || '';
                fileInfo.textContent = user.document.fileName ? `Current file: ${user.document.fileName}` : '';
            } else {
                docNumberInput.value = '';
                fileInfo.textContent = '';
            }
        };
        populateProfileData();

        const renderMyCoursesTable = async () => {
            const result = await fetchData('getUserEnrollments');
            if (result.success) {
                const userEnrollments = result.enrollments;
                if (userEnrollments.length === 0) {
                    myCoursesList.innerHTML = '<p>You have not requested any courses yet. <a href="index.php#courses">Explore Courses</a></p>';
                    return;
                }

                myCoursesList.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Course</th>
                                <th>Preferred Loc.</th>
                                <th>Assigned Loc.</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userEnrollments.map(enroll => {
                                let actionButtons = '';
                                if (enroll.status === 'Awaiting Payment') {
                                    actionButtons = `<button class="btn btn-sm" data-action="submit-payment" data-id="${enroll.id}" data-course="${enroll.course_name}">Submit Payment</button>`;
                                } else if (enroll.status === 'Approved') {
                                    actionButtons = `<button class="btn btn-sm btn-danger" data-action="deactivate-enrollment" data-id="${enroll.id}" data-course="${enroll.course_name}">Cancel Enrollment</button>`;
                                }
                                return `
                                    <tr>
                                        <td>${enroll.course_name}</td>
                                        <td>${enroll.user_preferred_location || 'N/A'}</td>
                                        <td>${enroll.assigned_location || 'N/A'}</td>
                                        <td><span class="status ${enroll.status.toLowerCase().replace(/ /g, '-')}">${enroll.status}</span></td>
                                        <td><div class="action-buttons">${actionButtons}</div></td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
            } else {
                myCoursesList.innerHTML = `<p>${result.message || 'Failed to load enrollments.'}</p>`;
            }
        };
        renderMyCoursesTable();

        const renderNotifications = async () => {
            const result = await fetchData('getUserNotifications');
            if (result.success) {
                const userNotifications = result.notifications;
                if (userNotifications.length === 0) {
                    notificationList.innerHTML = '<p>No new notifications.</p>';
                    return;
                }
                notificationList.innerHTML = userNotifications.map(notif => `
                    <div class="notification-item ${notif.is_read ? 'read' : 'unread'}" data-id="${notif.id}">
                        <p>${notif.message}</p>
                        <small>${new Date(notif.created_at).toLocaleString()}</small>
                        ${!notif.is_read ? '<button class="btn btn-sm mark-read-btn">Mark as Read</button>' : ''}
                    </div>
                `).join('');
                
                document.querySelectorAll('.mark-read-btn').forEach(button => {
                    button.addEventListener('click', async (e) => {
                        const notifId = e.target.closest('.notification-item').dataset.id;
                        const markResult = await fetchData('markNotificationRead', { notificationId: notifId });
                        if (markResult.success) {
                            renderNotifications();
                        } else {
                            alert('Failed to mark notification as read.');
                        }
                    });
                });
            } else {
                notificationList.innerHTML = `<p>${result.message || 'Failed to load notifications.'}</p>`;
            }
        };
        renderNotifications();
        
        document.getElementById('profile-update-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const newName = profileNameInput.value;
            const newMobile = profileMobileInput.value;

            const result = await fetchData('updateProfile', { name: newName, mobile: newMobile });
            if (result.success) {
                sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
                alert(result.message);
                populateProfileData();
            } else {
                alert(result.message);
            }
        });

        document.getElementById('document-submit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const docNumber = docNumberInput.value.trim();
            const file = docFileInput.files[0];

            let fileData = user.document ? user.document.fileData : null;
            let fileName = user.document ? user.document.fileName : null;

            if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    fileData = event.target.result;
                    fileName = file.name;
                    const result = await fetchData('updateDocument', { docNumber, fileData, fileName });
                    if (result.success) {
                        sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
                        alert(result.message);
                        populateProfileData();
                    } else {
                        alert(result.message);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                if (!docFileInput.value && user.document && user.document.fileData) {
                    fileData = null;
                    fileName = null;
                }
                const result = await fetchData('updateDocument', { docNumber, fileData, fileName });
                if (result.success) {
                    sessionStorage.setItem('loggedInUser', JSON.stringify(result.user));
                    alert(result.message);
                    populateProfileData();
                } else {
                    alert(result.message);
                }
            }
        });


        document.getElementById('support-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = document.getElementById('support-message').value;

            const result = await fetchData('sendSupportMessage', { message });
            if (result.success) {
                alert(result.message);
                e.target.reset();
            } else {
                alert(result.message);
            }
        });

        document.getElementById('delete-account-btn').addEventListener('click', async () => {
            if (confirm('Are you absolutely sure you want to deactivate your account? This action cannot be undone.')) {
                const result = await fetchData('deactivateAccount');
                if (result.success) {
                    sessionStorage.removeItem('loggedInUser');
                    alert(result.message);
                    window.location.href = 'index.php';
                } else {
                    alert(result.message || 'Failed to deactivate account.');
                }
            }
        });

        myCoursesList.addEventListener('click', async (e) => {
            const button = e.target.closest('button');
            if (!button) return;

            const action = button.dataset.action;
            const enrollmentId = button.dataset.id;
            const courseName = button.dataset.course;

            if (action === 'submit-payment') {
                const paymentModal = document.getElementById('payment-modal');
                paymentModal.innerHTML = `
                    <div class="modal-content">
                        <span class="close-modal">×</span>
                        <h2 class="modal-title">Submit Payment for ${courseName}</h2>
                        <form id="payment-submit-form">
                            <input type="hidden" id="payment-enrollment-id" value="${enrollmentId}">
                            <div class="form-group">
                                <label for="payment-method">Payment Method</label>
                                <select id="payment-method" required>
                                    <option value="">Select Method</option>
                                    <option value="Bkash">Bkash</option>
                                    <option value="Nagad">Nagad</option>
                                    <option value="Rocket">Rocket</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="transaction-id">Transaction ID / Reference</label>
                                <input type="text" id="transaction-id" placeholder="Enter TrxID or reference" required>
                            </div>
                            <button type="submit" class="btn">Submit Payment</button>
                        </form>
                    </div>
                `;
                paymentModal.style.display = 'flex';

                document.getElementById('payment-submit-form').addEventListener('submit', async (paymentFormEvent) => {
                    paymentFormEvent.preventDefault();
                    const selectedEnrollmentId = document.getElementById('payment-enrollment-id').value;
                    const paymentMethod = document.getElementById('payment-method').value;
                    const trxId = document.getElementById('transaction-id').value;

                    const result = await fetchData('submitPayment', {
                        enrollmentId: selectedEnrollmentId,
                        paymentMethod: paymentMethod,
                        trxId: trxId
                    });

                    if (result.success) {
                        alert(result.message);
                        paymentModal.style.display = 'none';
                        renderMyCoursesTable();
                    } else {
                        alert(result.message);
                    }
                });

            } else if (action === 'deactivate-enrollment') {
                if (confirm(`Are you sure you want to cancel your enrollment for "${courseName}"?`)) {
                    const result = await fetchData('updateEnrollmentStatus', {
                        enrollmentId: enrollmentId,
                        newStatus: 'Deactivated',
                        userId: user.id,
                        courseName: courseName
                    });
                    if (result.success) {
                        alert('Enrollment cancelled successfully.');
                        renderMyCoursesTable();
                    } else {
                        alert(result.message || 'Failed to cancel enrollment.');
                    }
                }
            }
        });
    }
    
    document.addEventListener('click', e => {
        if (e.target.classList.contains('close-modal')) {
            e.target.closest('.modal-overlay').style.display = 'none';
        }
    });

    document.querySelectorAll('.toggle-password-icon').forEach(icon => {
        icon.textContent = 'SHOW';
        icon.addEventListener('click', function() {
            const wrapper = this.closest('.password-wrapper');
            const input = wrapper.querySelector('input');
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            this.textContent = isPassword ? 'HIDE' : 'SHOW';
        });
    });
    
    updateNav();
});