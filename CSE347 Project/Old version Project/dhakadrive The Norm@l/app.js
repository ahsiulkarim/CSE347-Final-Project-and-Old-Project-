document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000';

    // --- UTILITIES ---
    const getToken = () => sessionStorage.getItem('token');
    const getLoggedInUser = () => JSON.parse(sessionStorage.getItem('user'));
    
    // --- DYNAMIC NAVIGATION ---
    const updateNav = () => {
        const mainNav = document.getElementById('main-nav');
        if (!mainNav) return;
        const user = getLoggedInUser();
        let navLinks = `<a href="index.html#courses">Courses</a><a href="index.html#faq">FAQ</a><a href="index.html#contact">Contact</a>`;
        if (user) {
            navLinks += `<a href="dashboard.html">Dashboard</a><a href="#" id="logout-btn">Logout</a>`;
        } else {
            navLinks += `<a href="login.html">Login</a><a href="signup.html" class="btn btn-nav">Sign Up</a>`;
        }
        mainNav.innerHTML = navLinks;
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.clear();
                alert('You have been logged out.');
                window.location.href = 'index.html';
            });
        }
    };

    // --- AUTHENTICATION ---
    const handleAuthForms = () => {
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('name').value;
                const email = document.getElementById('email').value;
                const mobile = document.getElementById('mobile').value;
                const password = document.getElementById('password').value;
                try {
                    const res = await fetch(`${API_URL}/api/auth/signup`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, mobile, password })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.msg);
                    alert('Account created! Please log in.');
                    window.location.href = 'login.html';
                } catch (err) {
                    alert(`Error: ${err.message}`);
                }
            });
        }

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                try {
                    const res = await fetch(`${API_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.msg);

                    sessionStorage.setItem('token', data.token);
                    sessionStorage.setItem('user', JSON.stringify(data.user));

                    alert(`Welcome back, ${data.user.name}!`);
                    window.location.href = data.user.role === 'admin' ? 'admin.html' : 'dashboard.html';
                } catch (err) {
                    alert(`Error: ${err.message}`);
                }
            });
        }
    };
    
    // --- ENROLLMENT REQUESTS ---
    const handleEnrollmentRequests = () => {
        let courseToRequest = '';
        const requestModal = document.getElementById('request-modal');
        const requestForm = document.getElementById('request-form');

        document.querySelectorAll('.request-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (!getLoggedInUser()) {
                    alert('Please log in to request enrollment.');
                    window.location.href = 'login.html';
                    return;
                }
                courseToRequest = e.target.getAttribute('data-course');
                document.getElementById('modal-request-course-name').textContent = courseToRequest;
                if(requestModal) requestModal.style.display = 'flex';
            });
        });

        if (requestForm) {
            requestForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const userLocation = document.getElementById('user-location').value;
                try {
                    const res = await fetch(`${API_URL}/api/enrollments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'x-auth-token': getToken() },
                        body: JSON.stringify({ courseName: courseToRequest, userPreferredLocation: userLocation })
                    });
                    if (!res.ok) throw new Error('Failed to submit request.');
                    alert('Request sent! Check your dashboard for updates.');
                    window.location.href = 'dashboard.html';
                } catch (err) {
                    alert(`Error: ${err.message}`);
                }
            });
        }
    };

    // --- USER DASHBOARD ---
    const handleDashboard = async () => {
        if (!document.getElementById('dashboard')) return;
        const user = getLoggedInUser();
        if (!user) {
            alert('Please log in to view this page.');
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('welcome-message').textContent = `Welcome, ${user.name}!`;

        try {
            // Fetch enrollments
            const enrollRes = await fetch(`${API_URL}/api/enrollments/my-enrollments`, { headers: { 'x-auth-token': getToken() } });
            const myEnrollments = await enrollRes.json();
            const myCoursesList = document.getElementById('my-courses-list');
            myCoursesList.innerHTML = '';
            if (myEnrollments.length > 0) {
                 myEnrollments.forEach(enroll => {
                    let actionsHtml = '';
                    if (enroll.status === 'Awaiting Payment') {
                        actionsHtml = `<div class="item-actions"><button class="btn pay-now-btn" data-enroll-id="${enroll._id}" data-course-name="${enroll.courseName}">Pay Now</button></div>`;
                    }
                    let locationInfo = `<p><strong>Preferred Location:</strong> ${enroll.userPreferredLocation}</p>`;
                    if (enroll.status === 'Approved' && enroll.assignedLocation) {
                        locationInfo += `<p><strong>Assigned Class Location:</strong> ${enroll.assignedLocation}</p>`;
                    }
                    myCoursesList.innerHTML += `<div class="item"><p><strong>${enroll.courseName}</strong></p>${locationInfo}<p>Status: <span class="status ${enroll.status.toLowerCase().replace(/ /g, '-')}">${enroll.status}</span></p>${actionsHtml}</div>`;
                });
            } else {
                myCoursesList.innerHTML = `<p>You have not requested any courses yet. <a href="index.html#courses">Explore Courses</a></p>`;
            }

            // Fetch notifications
            const notifRes = await fetch(`${API_URL}/api/notifications/my-notifications`, { headers: { 'x-auth-token': getToken() } });
            const myNotifications = await notifRes.json();
            const notificationsList = document.getElementById('notifications-list');
            notificationsList.innerHTML = '';
            if(myNotifications.length > 0) {
                 myNotifications.forEach(notif => { notificationsList.innerHTML += `<div class="item"><p>${notif.message}</p></div>`; });
            } else {
                notificationsList.innerHTML = `<p>No new notifications.</p>`;
            }

        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        }
    };
    
    // --- MODAL HANDLING ---
    const handleModals = () => {
        let currentEnrollmentId = null;
        const paymentModal = document.getElementById('payment-modal');
        document.body.addEventListener('click', (e) => {
            if (e.target.classList.contains('pay-now-btn')) {
                currentEnrollmentId = e.target.getAttribute('data-enroll-id');
                document.getElementById('modal-course-name').textContent = e.target.getAttribute('data-course-name');
                if (paymentModal) paymentModal.style.display = 'flex';
            }
            if (e.target.classList.contains('close-modal')) {
                e.target.closest('.modal-overlay').style.display = 'none';
            }
        });
        
        const paymentForm = document.getElementById('payment-form');
        if(paymentForm) {
            // Logic for showing/hiding payment details based on radio button choice
            const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
            paymentOptions.forEach(option => {
                option.addEventListener('change', function() {
                    document.getElementById('bkash-details').classList.add('hidden');
                    document.getElementById('card-details').classList.add('hidden');
                    document.getElementById('cash-details').classList.add('hidden');
                    document.getElementById(`${this.value}-details`).classList.remove('hidden');
                });
            });

            paymentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
                let updateData = { paymentMethod: selectedMethod };

                if (selectedMethod === 'bkash') {
                    const trxId = document.getElementById('trxId').value;
                    if (!trxId) return alert('Please enter Transaction ID.');
                    updateData.trxId = trxId;
                    updateData.status = 'Payment Submitted';
                } else if (selectedMethod === 'card') {
                    const cardNumber = document.getElementById('cardNumber').value;
                    if (!cardNumber) return alert('Please enter Card Number.');
                    updateData.trxId = `CARD-${cardNumber.slice(-4)}`;
                    updateData.status = 'Payment Submitted';
                } else if (selectedMethod === 'cash') {
                    updateData.status = 'Awaiting Cash Payment';
                }

                try {
                    const res = await fetch(`${API_URL}/api/enrollments/${currentEnrollmentId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'x-auth-token': getToken() },
                        body: JSON.stringify(updateData)
                    });
                    if (!res.ok) throw new Error('Payment submission failed.');
                    alert('Payment details submitted successfully!');
                    window.location.reload();
                } catch (err) {
                    alert(`Error: ${err.message}`);
                }
            });
        }
    };
    
    // --- PASSWORD TOGGLE ---
    const handlePasswordToggle = () => {
        const passwordInput = document.getElementById('password');
        const togglePasswordIcon = document.querySelector('.toggle-password-icon');
        if (passwordInput && togglePasswordIcon) {
            togglePasswordIcon.textContent = 'SHOW';
            togglePasswordIcon.addEventListener('click', function () {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.textContent = type === 'password' ? 'SHOW' : 'HIDE';
            });
        }
    };

    // --- INITIALIZE PAGE ---
    updateNav();
    handleAuthForms();
    handleEnrollmentRequests();
    handleDashboard();
    handleModals();
    handlePasswordToggle();
});