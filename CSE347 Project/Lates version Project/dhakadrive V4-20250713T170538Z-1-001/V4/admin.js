document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH GUARD ---
    const loggedInAdmin = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInAdmin || loggedInAdmin.role !== 'admin') {
        alert('Access Denied.');
        window.location.href = 'index.html';
        return;
    }

    // --- DOM ELEMENTS ---
    const enrollmentsTBody = document.querySelector('#enrollments-table tbody');
    const usersTBody = document.querySelector('#users-table tbody');
    const supportList = document.getElementById('support-messages-list');
    const userEditModal = document.getElementById('user-edit-modal');
    const userEditForm = document.getElementById('user-edit-form');
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- DATA FUNCTIONS ---
    const getEnrollments = () => JSON.parse(localStorage.getItem('dhakaDriveEnrollments')) || [];
    const saveEnrollments = (data) => localStorage.setItem('dhakaDriveEnrollments', JSON.stringify(data));
    const getUsers = () => JSON.parse(localStorage.getItem('dhakaDriveUsers')) || [];
    const saveUsers = (data) => localStorage.setItem('dhakaDriveUsers', JSON.stringify(data));
    const getSupportMessages = () => JSON.parse(localStorage.getItem('dhakaDriveSupportMessages')) || [];
    const addNotification = (userId, message) => {
        const notifications = JSON.parse(localStorage.getItem('dhakaDriveNotifications')) || [];
        notifications.push({ id: Date.now(), userId, message, read: false });
        localStorage.setItem('dhakaDriveNotifications', JSON.stringify(notifications));
    };

    // --- RENDER FUNCTIONS ---
    const renderEnrollmentsTable = () => {
        const enrollments = getEnrollments().reverse();
        enrollmentsTBody.innerHTML = enrollments.map(enroll => {
            let actionButtons = 'Processed';
             if (enroll.status === 'Requested') {
                actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll.id}" data-action="approve-payment">Approve</button><button class="btn btn-sm btn-reject" data-id="${enroll.id}" data-action="reject-request">Reject</button>`;
            } else if (enroll.status === 'Payment Submitted') {
                actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll.id}" data-action="confirm-payment">Confirm</button><button class="btn btn-sm btn-reject" data-id="${enroll.id}" data-action="reject-payment">Reject</button>`;
            } else if (enroll.status === 'Awaiting Cash Payment') {
                actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll.id}" data-action="confirm-payment">Confirm Cash</button>`;
            }
            return `<tr><td><strong>${enroll.userName}</strong><br><small>${enroll.userEmail}<br>${enroll.userMobile}</small></td><td>${enroll.courseName}</td><td>${enroll.paymentMethod || 'N/A'}</td><td>${enroll.trxId || 'N/A'}</td><td>${enroll.userPreferredLocation || 'N/A'}</td><td>${new Date(enroll.id).toLocaleDateString()}</td><td><span class="status ${enroll.status.toLowerCase().replace(/ /g, '-')}">${enroll.status}</span></td><td><div class="action-buttons">${actionButtons}</div></td></tr>`;
        }).join('') || `<tr><td colspan="8">No enrollments found.</td></tr>`;
    };

    const renderUsersTable = () => {
        const allUsers = getUsers().filter(u => u.role === 'user');
        usersTBody.innerHTML = allUsers.map(u => {
            let docInfo = 'Not Submitted';
            if (u.document) {
                docInfo = u.document.number || 'Number not provided';
                if (u.document.fileData) {
                    docInfo += ` <a href="${u.document.fileData}" target="_blank" class="view-file-link" download="${u.document.fileName || 'document'}">View File</a>`;
                }
            }
            return `<tr><td>${u.name}</td><td>${u.email}<br>${u.mobile}</td><td>${docInfo}</td><td><span class="status ${u.accountStatus}">${u.accountStatus}</span></td><td><button class="btn btn-sm" data-action="edit-user" data-id="${u.id}">Edit</button></td></tr>`;
        }).join('') || `<tr><td colspan="5">No users found.</td></tr>`;
    };
    
    const renderSupportMessages = () => {
        const messages = getSupportMessages().reverse();
        if(messages.length === 0) { supportList.innerHTML = '<p>No support messages found.</p>'; return; }
        supportList.innerHTML = messages.map(msg => `<div class="support-item"><div class="support-item-header"><strong>From: ${msg.userName} (${msg.userEmail})</strong><span>${msg.date}</span></div><p>${msg.message}</p></div>`).join('');
    };

    // --- EVENT LISTENERS ---
    tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    }));

    enrollmentsTBody.addEventListener('click', e => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const enrollmentId = button.dataset.id;
        const action = button.dataset.action;
        let enrollments = getEnrollments();
        const enrollmentIndex = enrollments.findIndex(en => en.id == enrollmentId);
        if (enrollmentIndex > -1) {
            const enrollment = enrollments[enrollmentIndex];
            let alertMessage = '';
            switch (action) {
                case 'approve-payment':
                    enrollments[enrollmentIndex].status = 'Awaiting Payment';
                    addNotification(enrollment.userId, `Good news! A slot for "${enrollment.courseName}" is available. Please complete the payment from your dashboard.`);
                    alertMessage = 'Request approved. User notified to make payment.';
                    break;
                case 'confirm-payment':
                    const assignedLocation = prompt("Payment confirmed. Enter the final class location:", enrollment.userPreferredLocation || "Dhanmondi Branch");
                    if (assignedLocation) {
                        enrollments[enrollmentIndex].status = 'Approved';
                        enrollments[enrollmentIndex].assignedLocation = assignedLocation;
                        addNotification(enrollment.userId, `Payment for "${enrollment.courseName}" confirmed! Your class is at: ${assignedLocation}.`);
                        addNotification(enrollment.userId, `Important: Please bring a photocopy of your submitted NID/Passport to all your classes for verification.`);
                        alertMessage = 'Payment confirmed and location set. User notified.';
                    }
                    break;
                case 'reject-request':
                case 'reject-payment':
                    enrollments[enrollmentIndex].status = action === 'reject-request' ? 'Not Available' : 'Payment Rejected';
                    addNotification(enrollment.userId, `We're sorry, there was an issue with your request for "${enrollment.courseName}". Please contact support if you have questions.`);
                    alertMessage = 'Request has been rejected.';
                    break;
            }
            if(alertMessage) alert(alertMessage);
            saveEnrollments(enrollments);
            renderEnrollmentsTable();
        }
    });

    // ** FIX: Correctly implemented user edit logic **
    usersTBody.addEventListener('click', e => {
        const button = e.target.closest('button[data-action="edit-user"]');
        if (!button) return;
        const userId = button.dataset.id;
        const userToEdit = getUsers().find(u => u.id == userId);
        if (userToEdit) {
            document.getElementById('edit-user-id').value = userToEdit.id;
            document.getElementById('edit-user-name').value = userToEdit.name;
            document.getElementById('edit-user-mobile').value = userToEdit.mobile;
            userEditModal.style.display = 'flex';
        }
    });

    userEditForm.addEventListener('submit', e => {
        e.preventDefault();
        const userId = document.getElementById('edit-user-id').value;
        const newName = document.getElementById('edit-user-name').value;
        const newMobile = document.getElementById('edit-user-mobile').value;
        let users = getUsers();
        const userIndex = users.findIndex(u => u.id == userId);
        if (userIndex > -1) {
            users[userIndex].name = newName;
            users[userIndex].mobile = newMobile;
            saveUsers(users);
            alert('User updated successfully!');
            userEditModal.style.display = 'none';
            renderUsersTable();
        } else {
            alert('Error: User not found.');
        }
    });

    document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', e => e.target.closest('.modal-overlay').style.display = 'none'));
    document.getElementById('logout-btn').addEventListener('click', e => { e.preventDefault(); sessionStorage.removeItem('loggedInUser'); window.location.href = 'index.html'; });

    // --- INITIALIZE ADMIN PANEL ---
    const renderAll = () => { renderEnrollmentsTable(); renderUsersTable(); renderSupportMessages(); };
    renderAll();
});