document.addEventListener('DOMContentLoaded', () => {
    // --- DATABASE SIMULATION ---
    const initDB = () => {
        if (!localStorage.getItem('dhakaDriveUsers')) {
            const adminUser = { id: 1, name: 'Admin', email: 'admin@dhakadrive.com', mobile: '01000000000', password: 'admin', role: 'admin', accountStatus: 'active', document: null };
            localStorage.setItem('dhakaDriveUsers', JSON.stringify([adminUser]));
        }
        const requiredKeys = ['dhakaDriveEnrollments', 'dhakaDriveNotifications', 'dhakaDriveSupportMessages'];
        requiredKeys.forEach(key => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([])); });
    };
    initDB();

    // --- DATA HELPER FUNCTIONS ---
    const getEnrollments = () => JSON.parse(localStorage.getItem('dhakaDriveEnrollments')) || [];
    const saveEnrollments = (data) => localStorage.setItem('dhakaDriveEnrollments', JSON.stringify(data));
    const getUsers = () => JSON.parse(localStorage.getItem('dhakaDriveUsers')) || [];
    const saveUsers = (data) => localStorage.setItem('dhakaDriveUsers', JSON.stringify(data));
    const getLoggedInUser = () => JSON.parse(sessionStorage.getItem('loggedInUser'));

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
                sessionStorage.removeItem('loggedInUser');
                alert('You have been logged out.');
                window.location.href = 'index.html';
            });
        }
    };

    // --- AUTHENTICATION ---
    if (document.getElementById('signup-form')) {
        document.getElementById('signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const mobile = document.getElementById('mobile').value;
            const password = document.getElementById('password').value;
            const users = getUsers();
            if (users.find(user => user.email === email)) { alert('An account with this email already exists.'); return; }
            const newUser = { id: Date.now(), name, email, mobile, password, role: 'user', accountStatus: 'active', document: null };
            users.push(newUser);
            saveUsers(users);
            alert('Account created successfully! Please log in.');
            window.location.href = 'login.html';
        });
    }
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                if (user.accountStatus === 'inactive') { alert('Your account has been deactivated. Please contact support.'); return; }
                sessionStorage.setItem('loggedInUser', JSON.stringify(user));
                alert(`Welcome back, ${user.name}!`);
                window.location.href = user.role === 'admin' ? 'admin.html' : 'dashboard.html';
            } else {
                alert('Invalid email or password.');
            }
        });
    }

    // --- ENROLLMENT REQUEST FLOW ---
    const coursePrices = { "Car Driving Course": 5000, "Motorcycle Riding Course": 3000, "Scooter Riding Lessons": 2500, "Bicycle Safety Program": 1000 };
    document.querySelectorAll('.request-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const user = getLoggedInUser();
            if (!user) { alert('Please log in to request enrollment.'); window.location.href = 'login.html'; return; }
            const courseName = e.target.getAttribute('data-course');
            
            // ** FIX: Allow re-enrollment if no PENDING request exists **
            const enrollments = getEnrollments();
            const pendingStatuses = ['Requested', 'Awaiting Payment', 'Payment Submitted', 'Awaiting Cash Payment'];
            const existingPendingRequest = enrollments.find(en => 
                en.userId === user.id && 
                en.courseName === courseName && 
                pendingStatuses.includes(en.status)
            );

            if (existingPendingRequest) { 
                alert(`You already have a pending request for ${courseName}. Check your dashboard for its status.`); 
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
        document.getElementById('request-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const user = getLoggedInUser();
            const userLocation = document.getElementById('user-location').value;
            const courseName = document.getElementById('modal-request-course-name').textContent;
            const newRequest = { id: Date.now(), userId: user.id, userName: user.name, userEmail: user.email, userMobile: user.mobile, courseName: courseName, userPreferredLocation: userLocation, assignedLocation: null, trxId: null, paymentMethod: null, status: 'Requested' };
            const enrollments = getEnrollments();
            enrollments.push(newRequest);
            saveEnrollments(enrollments);
            document.getElementById('request-modal').style.display = 'none';
            alert('Your request has been sent! Check your dashboard for updates.');
            window.location.href = 'dashboard.html';
        });
    }

    // --- USER DASHBOARD LOGIC ---
    if (document.getElementById('dashboard')) {
        let user = getLoggedInUser();
        if (!user || user.accountStatus === 'inactive') {
            alert('You must be logged in to view this page or your account is inactive.');
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
            return;
        }

        const welcomeMessage = document.getElementById('welcome-message');
        const profileNameInput = document.getElementById('profile-name');
        const profileMobileInput = document.getElementById('profile-mobile');
        const docNumberInput = document.getElementById('user-document-number');
        const docFileInput = document.getElementById('user-document-file');
        const fileInfo = document.getElementById('file-info');

        const populateProfileData = () => {
            user = getLoggedInUser();
            welcomeMessage.textContent = `Welcome, ${user.name}!`;
            profileNameInput.value = user.name;
            profileMobileInput.value = user.mobile;
            if (user.document) {
                docNumberInput.value = user.document.number || '';
                fileInfo.textContent = user.document.fileName ? `Current file: ${user.document.fileName}` : '';
            }
        };
        populateProfileData();
        
        document.getElementById('profile-update-form').addEventListener('submit', e => {
            e.preventDefault();
            const users = getUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            if (userIndex > -1) {
                users[userIndex].name = profileNameInput.value;
                users[userIndex].mobile = profileMobileInput.value;
                saveUsers(users);
                sessionStorage.setItem('loggedInUser', JSON.stringify(users[userIndex]));
                alert('Profile updated successfully!');
                populateProfileData();
            }
        });

        document.getElementById('document-submit-form').addEventListener('submit', e => {
            e.preventDefault();
            const docNumber = docNumberInput.value.trim();
            const file = docFileInput.files[0];
            const updateUserDocument = (fileData = null, fileName = null) => {
                const users = getUsers();
                const userIndex = users.findIndex(u => u.id === user.id);
                if (userIndex > -1) {
                    if (!users[userIndex].document) users[userIndex].document = {};
                    users[userIndex].document.number = docNumber;
                    if (fileData && fileName) {
                       users[userIndex].document.fileData = fileData;
                       users[userIndex].document.fileName = fileName;
                    }
                    saveUsers(users);
                    sessionStorage.setItem('loggedInUser', JSON.stringify(users[userIndex]));
                    alert('Document information updated successfully!');
                    populateProfileData();
                }
            };
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => updateUserDocument(event.target.result, file.name);
                reader.readAsDataURL(file);
            } else {
                 updateUserDocument();
            }
        });

        document.getElementById('support-form').addEventListener('submit', e => {
            e.preventDefault();
            const message = document.getElementById('support-message').value;
            let supportMessages = JSON.parse(localStorage.getItem('dhakaDriveSupportMessages'));
            supportMessages.push({ id: Date.now(), userId: user.id, userName: user.name, userEmail: user.email, message: message, date: new Date().toLocaleString() });
            localStorage.setItem('dhakaDriveSupportMessages', JSON.stringify(supportMessages));
            alert('Your message has been sent to the admin.');
            e.target.reset();
        });

        document.getElementById('delete-account-btn').addEventListener('click', () => {
            if (confirm('Are you absolutely sure you want to deactivate your account? This action cannot be undone.')) {
                const users = getUsers();
                const userIndex = users.findIndex(u => u.id === user.id);
                if (userIndex > -1) {
                    users[userIndex].accountStatus = 'inactive';
                    saveUsers(users);
                    sessionStorage.removeItem('loggedInUser');
                    alert('Your account has been deactivated.');
                    window.location.href = 'index.html';
                }
            }
        });
    }
    
    // --- MODAL & MISC UI LOGIC ---
    document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', e => e.target.closest('.modal-overlay').style.display = 'none'));
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
    
    // --- INITIALIZE PAGE ---
    updateNav();
});