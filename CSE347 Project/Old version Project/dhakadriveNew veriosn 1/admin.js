document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH GUARD ---
    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!user || user.role !== 'admin') {
        alert('Access Denied: You do not have permission to view this page.');
        window.location.href = 'index.html';
        return;
    }

    // --- DOM ELEMENTS ---
    const enrollmentsTableBody = document.querySelector('#enrollments-table tbody');
    const logoutBtn = document.getElementById('logout-btn');
    const msgForm = document.getElementById('send-notification-form');
    const userSelect = document.getElementById('user-select');

    // --- DATA FUNCTIONS ---
    const getEnrollments = () => JSON.parse(localStorage.getItem('dhakaDriveEnrollments'));
    const saveEnrollments = (enrollments) => localStorage.setItem('dhakaDriveEnrollments', JSON.stringify(enrollments));
    const getUsers = () => JSON.parse(localStorage.getItem('dhakaDriveUsers'));
    const addNotification = (userId, message) => {
        const notifications = JSON.parse(localStorage.getItem('dhakaDriveNotifications'));
        notifications.push({ id: Date.now(), userId, message, read: false });
        localStorage.setItem('dhakaDriveNotifications', JSON.stringify(notifications));
    };

    // --- RENDER TABLE ---
    const renderTable = () => {
        const enrollments = getEnrollments();
        enrollmentsTableBody.innerHTML = '';

        if (enrollments.length === 0) {
            enrollmentsTableBody.innerHTML = '<tr><td colspan="9">No enrollments found.</td></tr>';
            return;
        }

        enrollments.forEach(enroll => {
            let actionButtons = 'Processed';
            if (enroll.status === 'Requested') {
                actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll.id}" data-action="approve-payment">Approve for Payment</button><button class="btn btn-sm btn-reject" data-id="${enroll.id}" data-action="reject-request">Not Available</button>`;
            } else if (enroll.status === 'Payment Submitted') {
                actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll.id}" data-action="confirm-payment">Confirm Payment</button><button class="btn btn-sm btn-reject" data-id="${enroll.id}" data-action="reject-payment">Reject Payment</button>`;
            } else if (enroll.status === 'Awaiting Cash Payment') {
                actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll.id}" data-action="confirm-cash-payment">Confirm Cash Received</button>`;
            } else if (enroll.status === 'Awaiting Payment') {
                actionButtons = 'Waiting for user...';
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${enroll.userName}</td>
                <td>${enroll.courseName}</td>
                <td>${enroll.paymentMethod || 'N/A'}</td>
                <td>${enroll.trxId || 'N/A'}</td>
                <td>${enroll.userPreferredLocation || 'N/A'}</td>
                <td>${enroll.assignedLocation || 'Not Set'}</td>
                <td>${enroll.date}</td>
                <td><span class="status ${enroll.status.toLowerCase().replace(/ /g, '-')}">${enroll.status}</span></td>
                <td>${actionButtons}</td>
            `;
            enrollmentsTableBody.appendChild(row);
        });
    };

    // --- POPULATE USER DROPDOWN ---
    const populateUserSelect = () => {
        const allUsers = getUsers();
        allUsers.filter(u => u.role === 'user').forEach(u => {
            userSelect.innerHTML += `<option value="${u.id}">${u.name} (${u.email})</option>`;
        });
    };

    // --- EVENT LISTENERS ---
    enrollmentsTableBody.addEventListener('click', (e) => {
        const enrollmentId = e.target.getAttribute('data-id');
        const action = e.target.getAttribute('data-action');
        if (!enrollmentId || !action) return;
        
        let enrollments = getEnrollments();
        const enrollmentIndex = enrollments.findIndex(en => en.id == enrollmentId);
        
        if (enrollmentIndex > -1) {
            const enrollment = enrollments[enrollmentIndex];
            let assignedLocation = '';

            switch (action) {
                case 'approve-payment':
                    enrollments[enrollmentIndex].status = 'Awaiting Payment';
                    addNotification(enrollment.userId, `Good news! A slot is available for "${enrollment.courseName}" based on your preferred location. Go to your dashboard to complete the payment.`);
                    alert(`Request approved. User notified.`);
                    break;
                case 'reject-request':
                    enrollments[enrollmentIndex].status = 'Not Available';
                    addNotification(enrollment.userId, `We're sorry, no slots are available for "${enrollment.courseName}" near your preferred location right now. Please try again later.`);
                    alert(`Request marked as Not Available.`);
                    break;
                case 'confirm-payment':
                    assignedLocation = prompt("Payment confirmed. Enter the final class location:", enrollment.userPreferredLocation || "Dhanmondi Branch");
                    if (assignedLocation) {
                        enrollments[enrollmentIndex].status = 'Approved';
                        enrollments[enrollmentIndex].assignedLocation = assignedLocation;
                        addNotification(enrollment.userId, `Payment for "${enrollment.courseName}" confirmed! Your class is at: ${assignedLocation}.`);
                        alert(`Payment confirmed and location set.`);
                    }
                    break;
                case 'reject-payment':
                    enrollments[enrollmentIndex].status = 'Payment Rejected';
                    addNotification(enrollment.userId, `There was an issue with your payment for "${enrollment.courseName}". Please contact support.`);
                    alert(`Payment rejected.`);
                    break;
                case 'confirm-cash-payment':
                     assignedLocation = prompt("Cash received. Enter the final class location:", enrollment.userPreferredLocation || "Mirpur Branch");
                     if(assignedLocation) {
                        enrollments[enrollmentIndex].status = 'Approved';
                        enrollments[enrollmentIndex].assignedLocation = assignedLocation;
                        addNotification(enrollment.userId, `Cash payment for "${enrollment.courseName}" received! Your class is at: ${assignedLocation}.`);
                        alert(`Cash payment confirmed and location set.`);
                     }
                    break;
            }
            saveEnrollments(enrollments);
            renderTable();
        }
    });

    msgForm.addEventListener('submit', e => {
        e.preventDefault();
        const userId = userSelect.value;
        const message = document.getElementById('message-text').value;
        if (!userId || !message) { alert('Please select a user and enter a message.'); return; }
        addNotification(userId, `Message from Admin: "${message}"`);
        alert('Message sent successfully!');
        msgForm.reset();
    });
    
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.removeItem('loggedInUser');
        alert('You have been logged out.');
        window.location.href = 'index.html';
    });

    
// In admin.js

document.addEventListener('DOMContentLoaded', () => {
    // ... (existing auth guard and DOM elements setup) ...
    const usersTableBody = document.querySelector('#users-table tbody'); // <-- NEW

    // ... (existing data functions) ...

    // --- RENDER TABLES ---
    
    // ** NEW FUNCTION TO RENDER THE USERS TABLE **
    const renderUsersTable = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users');
            if (!response.ok) throw new Error('Failed to fetch users');
            
            const users = await response.json();
            usersTableBody.innerHTML = ''; // Clear previous data

            if (users.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="4">No users found.</td></tr>';
                return;
            }

            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.mobile}</td>
                    <td>${user.role}</td>
                `;
                usersTableBody.appendChild(row);
            });

        } catch (error) {
            console.error('Error rendering users table:', error);
            usersTableBody.innerHTML = '<tr><td colspan="4">Error loading user data.</td></tr>';
        }
    };

    const renderEnrollmentsTable = async () => { /* ... existing logic ... */ };

    // ... (existing event listeners) ...

    // --- INITIALIZE ADMIN PANEL ---
    const initializeAdminPanel = async () => {
        await renderEnrollmentsTable(); // Await because it's now async
        await renderUsersTable();      // Await the new function
        populateUserSelect();
    };

    initializeAdminPanel(); // Call the main initialization function
});
    // --- INITIALIZE ADMIN PANEL ---
    renderTable();
    populateUserSelect();
});