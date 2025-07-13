document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000';
    const getToken = () => sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));

    // Auth Guard
    if (!user || user.role !== 'admin') {
        alert('Access Denied. You are not an admin.');
        window.location.href = 'login.html';
        return;
    }
    
    // DOM Elements
    const enrollmentsTableBody = document.querySelector('#enrollments-table tbody');
    const usersTableBody = document.querySelector('#users-table tbody');
    const msgForm = document.getElementById('send-notification-form');
    const userSelect = document.getElementById('user-select');

    // --- RENDER FUNCTIONS ---
    const renderEnrollmentsTable = async () => {
        try {
            const res = await fetch(`${API_URL}/api/enrollments`, { headers: { 'x-auth-token': getToken() } });
            const enrollments = await res.json();
            enrollmentsTableBody.innerHTML = '';
            if(enrollments.length === 0) {
                 enrollmentsTableBody.innerHTML = '<tr><td colspan="9">No enrollments found.</td></tr>';
                 return;
            }
            enrollments.forEach(enroll => {
                let actionButtons = 'Processed';
                if (enroll.status === 'Requested') actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll._id}" data-action="approve-payment">Approve for Payment</button><button class="btn btn-sm btn-reject" data-id="${enroll._id}" data-action="reject-request">Not Available</button>`;
                else if (enroll.status === 'Payment Submitted') actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll._id}" data-action="confirm-payment">Confirm Payment</button><button class="btn btn-sm btn-reject" data-id="${enroll._id}" data-action="reject-payment">Reject Payment</button>`;
                else if (enroll.status === 'Awaiting Cash Payment') actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll._id}" data-action="confirm-cash-payment">Confirm Cash Received</button>`;
                
                const row = document.createElement('tr');
                row.innerHTML = `<td>${enroll.userName}</td><td>${enroll.courseName}</td><td>${enroll.paymentMethod||'N/A'}</td><td>${enroll.trxId||'N/A'}</td><td>${enroll.userPreferredLocation}</td><td>${enroll.assignedLocation||'Not Set'}</td><td>${new Date(enroll.date).toLocaleDateString()}</td><td><span class="status ${enroll.status.toLowerCase().replace(/ /g, '-')}">${enroll.status}</span></td><td>${actionButtons}</td>`;
                enrollmentsTableBody.appendChild(row);
            });
        } catch (err) { console.error(err); }
    };

    const renderUsersTable = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users`, { headers: { 'x-auth-token': getToken() } });
            const users = await res.json();
            usersTableBody.innerHTML = '';
            users.forEach(u => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${u.name}</td><td>${u.email}</td><td>${u.mobile}</td><td>${u.role}</td>`;
                usersTableBody.appendChild(row);
            });
        } catch (err) { console.error(err); }
    };
    
    const populateUserSelect = async () => {
         try {
            const res = await fetch(`${API_URL}/api/users`, { headers: { 'x-auth-token': getToken() } });
            const users = await res.json();
            users.filter(u => u.role === 'user').forEach(u => {
                userSelect.innerHTML += `<option value="${u._id}">${u.name} (${u.email})</option>`;
            });
        } catch (err) { console.error(err); }
    };

    // --- EVENT LISTENERS ---
    enrollmentsTableBody.addEventListener('click', async (e) => {
        if (!e.target.matches('button')) return;
        const enrollmentId = e.target.getAttribute('data-id');
        const action = e.target.getAttribute('data-action');
        let updateData = {};
        let notificationMessage = '';
        let targetUserId = ''; // We need to find the user ID for the notification

        try {
            // Find the enrollment to get the userId
            const enrollmentsRes = await fetch(`${API_URL}/api/enrollments`, { headers: { 'x-auth-token': getToken() } });
            const enrollments = await enrollmentsRes.json();
            const enrollment = enrollments.find(en => en._id === enrollmentId);
            if (!enrollment) return;
            targetUserId = enrollment.userId;

            switch (action) {
                case 'approve-payment':
                    updateData = { status: 'Awaiting Payment' };
                    notificationMessage = `Your request for "${enrollment.courseName}" is approved! Please go to your dashboard to complete the payment.`;
                    break;
                case 'reject-request':
                    updateData = { status: 'Not Available' };
                    notificationMessage = `We're sorry, no slots are available for "${enrollment.courseName}" near your preferred location right now.`;
                    break;
                case 'confirm-payment':
                case 'confirm-cash-payment':
                    const assignedLocation = prompt("Enter the final class location:", enrollment.userPreferredLocation || "Dhanmondi Branch");
                    if (!assignedLocation) return;
                    updateData = { status: 'Approved', assignedLocation };
                    notificationMessage = `Your enrollment for "${enrollment.courseName}" is confirmed! Your class is at: ${assignedLocation}.`;
                    break;
                case 'reject-payment':
                    updateData = { status: 'Payment Rejected' };
                    notificationMessage = `There was an issue with your payment for "${enrollment.courseName}". Please contact support.`;
                    break;
            }

            // Update enrollment status
            await fetch(`${API_URL}/api/enrollments/${enrollmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': getToken() },
                body: JSON.stringify(updateData)
            });
            // Send notification
            await fetch(`${API_URL}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': getToken() },
                body: JSON.stringify({ userId: targetUserId, message: notificationMessage })
            });
            
            alert('Action completed and user notified.');
            renderEnrollmentsTable(); // Refresh table
        } catch (err) {
            console.error(err);
            alert('An error occurred.');
        }
    });
    
    msgForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = userSelect.value;
        const message = document.getElementById('message-text').value;
        if (!userId || !message) return alert('Please select a user and enter a message.');
        try {
            await fetch(`${API_URL}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': getToken() },
                body: JSON.stringify({ userId, message: `A message from Admin: "${message}"` })
            });
            alert('Message sent successfully!');
            msgForm.reset();
        } catch (err) {
            alert('Failed to send message.');
        }
    });
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = 'index.html';
    });
    
    // --- INITIALIZE ADMIN PANEL ---
    renderEnrollmentsTable();
    renderUsersTable();
    populateUserSelect();
});