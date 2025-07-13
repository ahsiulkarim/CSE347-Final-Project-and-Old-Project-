document.addEventListener('DOMContentLoaded', () => {
    // --- DATABASE SIMULATION (using localStorage) ---
    if (!localStorage.getItem('dhakaDriveUsers')) {
        const adminUser = { id: 1, name: 'Admin', email: 'admin@dhakadrive.com', password: 'admin', role: 'admin' };
        localStorage.setItem('dhakaDriveUsers', JSON.stringify([adminUser]));
    }
    if (!localStorage.getItem('dhakaDriveEnrollments')) localStorage.setItem('dhakaDriveEnrollments', JSON.stringify([]));
    if (!localStorage.getItem('dhakaDriveNotifications')) localStorage.setItem('dhakaDriveNotifications', JSON.stringify([]));

    // --- GLOBAL VARIABLES & DOM ELEMENTS ---
    let currentEnrollmentId = null;
    let courseToRequest = ''; 
    const mainNav = document.getElementById('main-nav');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const requestModal = document.getElementById('request-modal');
    const requestForm = document.getElementById('request-form');
    const paymentModal = document.getElementById('payment-modal');
    const paymentForm = document.getElementById('payment-form');

    // --- UTILITY FUNCTIONS ---
    const getEnrollments = () => JSON.parse(localStorage.getItem('dhakaDriveEnrollments'));
    const saveEnrollments = (data) => localStorage.setItem('dhakaDriveEnrollments', JSON.stringify(data));
    const getLoggedInUser = () => JSON.parse(sessionStorage.getItem('loggedInUser'));

    // --- DYNAMIC NAVIGATION ---
    const updateNav = () => {
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
                sessionStorage.removeItem('loggedInUser');
                alert('You have been logged out.');
                window.location.href = 'index.html';
            });
        }
    };

    // --- AUTHENTICATION ---
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const users = JSON.parse(localStorage.getItem('dhakaDriveUsers'));
            if (users.find(user => user.email === email)) {
                alert('An account with this email already exists.'); return;
            }
            const newUser = { id: Date.now(), name, email, password, role: 'user' };
            users.push(newUser);
            localStorage.setItem('dhakaDriveUsers', JSON.stringify(users));
            alert('Account created successfully! Please log in.');
            window.location.href = 'login.html';
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const users = JSON.parse(localStorage.getItem('dhakaDriveUsers'));
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                sessionStorage.setItem('loggedInUser', JSON.stringify(user));
                alert(`Welcome back, ${user.name}!`);
                if (user.role === 'admin') { window.location.href = 'admin.html'; }
                else { window.location.href = 'dashboard.html'; }
            } else {
                alert('Invalid email or password.');
            }
        });
    }

    // --- ENROLLMENT REQUEST ---
    document.querySelectorAll('.request-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const user = getLoggedInUser();
            if (!user) {
                alert('Please log in to request enrollment.');
                window.location.href = 'login.html';
                return;
            }
            const courseName = e.target.getAttribute('data-course');
            const enrollments = getEnrollments();
            const existingRequest = enrollments.find(en => en.userId === user.id && en.courseName === courseName && en.status !== 'Payment Rejected');
            if (existingRequest) {
                alert(`You already have a request for ${courseName}. Check your dashboard.`);
                return;
            }
            courseToRequest = courseName;
            document.getElementById('modal-request-course-name').textContent = courseToRequest;
            if(requestModal) requestModal.style.display = 'flex';
        });
    });

    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = getLoggedInUser();
            const userLocation = document.getElementById('user-location').value;
            
            const newRequest = {
                id: Date.now(),
                userId: user.id,
                userName: user.name,
                courseName: courseToRequest,
                userPreferredLocation: userLocation,
                assignedLocation: null,
                trxId: null,
                paymentMethod: null,
                status: 'Requested',
                date: new Date().toLocaleDateString()
            };
            const enrollments = getEnrollments();
            enrollments.push(newRequest);
            saveEnrollments(enrollments);
            
            requestForm.reset();
            requestModal.style.display = 'none';
            alert('Your request has been sent! Check your dashboard for updates.');
            window.location.href = 'dashboard.html';
        });
    }

    // --- USER DASHBOARD ---
    if (document.getElementById('dashboard')) {
        const user = getLoggedInUser();
        if (!user) {
            alert('You must be logged in to view this page.');
            window.location.href = 'login.html';
            return;
        }

        document.getElementById('welcome-message').textContent = `Welcome, ${user.name}!`;

        const myCoursesList = document.getElementById('my-courses-list');
        const allEnrollments = getEnrollments();
        const myEnrollments = allEnrollments.filter(enroll => enroll.userId === user.id);

        if (myEnrollments.length > 0) {
            myCoursesList.innerHTML = '';
            myEnrollments.forEach(enroll => {
                let actionsHtml = '';
                if (enroll.status === 'Awaiting Payment') {
                    actionsHtml = `<div class="item-actions"><button class="btn pay-now-btn" data-enroll-id="${enroll.id}" data-course-name="${enroll.courseName}">Pay Now</button></div>`;
                }
                let locationInfo = `<p><strong>Preferred Location:</strong> ${enroll.userPreferredLocation}</p>`;
                if (enroll.status === 'Approved' && enroll.assignedLocation) {
                    locationInfo += `<p><strong>Assigned Class Location:</strong> ${enroll.assignedLocation}</p>`;
                }
                myCoursesList.innerHTML += `
                    <div class="item">
                        <p><strong>${enroll.courseName}</strong> - Submitted on ${enroll.date}</p>
                        ${locationInfo}
                        <p>Status: <span class="status ${enroll.status.toLowerCase().replace(/ /g, '-')}">${enroll.status}</span></p>
                        ${actionsHtml}
                    </div>
                `;
            });
        }
        
        document.querySelectorAll('.pay-now-btn').forEach(button => {
            button.addEventListener('click', e => {
                currentEnrollmentId = e.target.getAttribute('data-enroll-id');
                if(paymentModal) {
                    document.getElementById('modal-course-name').textContent = e.target.getAttribute('data-course-name');
                    paymentModal.style.display = 'flex';
                }
            });
        });
        
        const notificationsList = document.getElementById('notifications-list');
        const allNotifications = JSON.parse(localStorage.getItem('dhakaDriveNotifications'));
        const myNotifications = allNotifications.filter(notif => notif.userId == user.id);
        if (myNotifications.length > 0) {
            notificationsList.innerHTML = '';
            myNotifications.reverse().forEach(notif => {
                notificationsList.innerHTML += `<div class="item"><p>${notif.message}</p></div>`;
            });
        }
    }

    // --- MODAL LOGIC ---
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').style.display = 'none';
        });
    });

    if (paymentForm) {
        const paymentOptions = document.querySelectorAll('input[name="payment-method"]');
        const bkashDetails = document.getElementById('bkash-details');
        const cardDetails = document.getElementById('card-details');
        const cashDetails = document.getElementById('cash-details');

        paymentOptions.forEach(option => {
            option.addEventListener('change', function() {
                bkashDetails.classList.add('hidden');
                cardDetails.classList.add('hidden');
                cashDetails.classList.add('hidden');
                if (this.value === 'bkash') bkashDetails.classList.remove('hidden');
                else if (this.value === 'card') cardDetails.classList.remove('hidden');
                else if (this.value === 'cash') cashDetails.classList.remove('hidden');
            });
        });
        
        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;
            const enrollments = getEnrollments();
            const enrollmentIndex = enrollments.findIndex(en => en.id == currentEnrollmentId);

            if (enrollmentIndex > -1) {
                let userMessage = '';
                enrollments[enrollmentIndex].paymentMethod = selectedMethod;
                if (selectedMethod === 'bkash') {
                    const trxId = document.getElementById('trxId').value;
                    if (!trxId) { alert('Please enter your Transaction ID.'); return; }
                    enrollments[enrollmentIndex].trxId = trxId;
                    enrollments[enrollmentIndex].status = 'Payment Submitted';
                    userMessage = 'bKash payment submitted for verification!';
                } else if (selectedMethod === 'card') {
                    const cardNumber = document.getElementById('cardNumber').value;
                    if (!cardNumber) { alert('Please enter your Card Number.'); return; }
                    enrollments[enrollmentIndex].trxId = `CARD-${cardNumber.slice(-4)}`;
                    enrollments[enrollmentIndex].status = 'Payment Submitted';
                    userMessage = 'Card payment submitted for verification!';
                } else if (selectedMethod === 'cash') {
                    enrollments[enrollmentIndex].trxId = 'N/A';
                    enrollments[enrollmentIndex].status = 'Awaiting Cash Payment';
                    userMessage = 'Your spot is confirmed! Please pay in cash at your first class.';
                }
                saveEnrollments(enrollments);
                alert(userMessage);
                paymentModal.style.display = 'none';
                window.location.reload();
            }
        });
    }

    // --- SHOW/HIDE PASSWORD TOGGLE ---
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

    // --- INITIALIZE PAGE ---
    updateNav();
});