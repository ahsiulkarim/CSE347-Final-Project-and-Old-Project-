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

    const getLoggedInAdmin = async () => {
        let admin = JSON.parse(sessionStorage.getItem('loggedInUser'));
        if (admin && admin.role === 'admin') {
            const result = await fetchData('getLoggedInUser');
            if (result.success && result.user && result.user.role === 'admin') {
                return result.user;
            }
        }
        return null;
    };

    const loggedInAdmin = await getLoggedInAdmin();
    if (!loggedInAdmin) {
        alert('Access Denied.');
        window.location.href = 'index.php';
        return;
    }

    const enrollmentsTBody = document.querySelector('#enrollments-table tbody');
    const usersTBody = document.querySelector('#users-table tbody');
    const supportList = document.getElementById('support-messages-list');
    const userEditModal = document.getElementById('user-edit-modal');
    const userEditForm = document.getElementById('user-edit-form');
    const editUserIdInput = document.getElementById('edit-user-id');
    const editUserNameInput = document.getElementById('edit-user-name');
    const editUserMobileInput = document.getElementById('edit-user-mobile');
    const editUserAccountStatusSelect = document.getElementById('edit-user-account-status');
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    const renderEnrollmentsTable = async () => {
        const result = await fetchData('getAllEnrollments');
        if (result.success) {
            const enrollments = result.enrollments;
            enrollmentsTBody.innerHTML = enrollments.map(enroll => {
                let actionButtons = 'Processed';
                if (enroll.status === 'Requested') {
                    actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll.id}" data-user-id="${enroll.user_id}" data-course="${enroll.course_name}" data-action="approve-payment-request">Approve</button><button class="btn btn-sm btn-reject" data-id="${enroll.id}" data-user-id="${enroll.user_id}" data-course="${enroll.course_name}" data-action="reject-request">Reject</button><button class="btn btn-sm btn-reject" data-id="${enroll.id}" data-user-id="${enroll.user_id}" data-course="${enroll.course_name}" data-action="not-available">Not Available</button>`;
                } else if (enroll.status === 'Awaiting Payment') {
                     actionButtons = `<button class="btn btn-sm btn-reject" data-id="${enroll.id}" data-user-id="${enroll.user_id}" data-course="${enroll.course_name}" data-action="reject-request">Cancel Awaiting</button>`;
                } else if (enroll.status === 'Payment Submitted') {
                    actionButtons = `<button class="btn btn-sm btn-approve" data-id="${enroll.id}" data-user-id="${enroll.user_id}" data-course="${enroll.course_name}" data-action="confirm-payment">Confirm</button><button class="btn btn-sm btn-reject" data-id="${enroll.id}" data-user-id="${enroll.user_id}" data-course="${enroll.course_name}" data-action="reject-payment">Reject</button>`;
                } else if (enroll.status === 'Approved') {
                    actionButtons = `Approved - ${enroll.assigned_location || 'N/A'}`;
                } else if (enroll.status === 'Deactivated') {
                    actionButtons = `User Cancelled`;
                }
                return `
                    <tr>
                        <td><strong>${enroll.user_name}</strong><br><small>${enroll.user_email}<br>${enroll.user_mobile}</small></td>
                        <td>${enroll.course_name}</td>
                        <td>${enroll.payment_method || 'N/A'}</td>
                        <td>${enroll.transaction_id || 'N/A'}</td>
                        <td>${enroll.user_preferred_location || 'N/A'}</td>
                        <td>${new Date(enroll.request_date).toLocaleDateString()}</td>
                        <td><span class="status ${enroll.status.toLowerCase().replace(/ /g, '-')}">${enroll.status}</span></td>
                        <td><div class="action-buttons">${actionButtons}</div></td>
                    </tr>
                `;
            }).join('');
        } else {
            enrollmentsTBody.innerHTML = `<tr><td colspan="8">${result.message || 'Failed to load enrollments.'}</td></tr>`;
        }
    };

    const renderUsersTable = async () => {
        const result = await fetchData('getAllUsers');
        if (result.success) {
            const allUsers = result.users;
            usersTBody.innerHTML = allUsers.map(u => {
                let docInfo = 'Not Submitted';
                if (u.document && u.document.number) {
                    docInfo = u.document.number;
                    if (u.document.fileData) {
                        docInfo += ` <a href="${u.document.fileData}" target="_blank" class="view-file-link">View File</a>`;
                    }
                }
                return `
                    <tr>
                        <td>${u.name}</td>
                        <td>${u.email}<br>${u.mobile}</td>
                        <td>${docInfo}</td>
                        <td><span class="status ${u.accountStatus}">${u.accountStatus}</span></td>
                        <td><button class="btn btn-sm" data-action="edit-user" data-id="${u.id}">Edit</button></td>
                    </tr>
                `;
            }).join('');
        } else {
            usersTBody.innerHTML = `<tr><td colspan="5">${result.message || 'Failed to load users.'}</td></tr>`;
        }
    };

    const renderSupportMessages = async () => {
        const result = await fetchData('getSupportMessages');
        if (result.success) {
            const messages = result.messages;
            if (messages.length === 0) {
                supportList.innerHTML = '<p>No support messages found.</p>';
                return;
            }
            supportList.innerHTML = messages.map(msg => `
                <div class="support-item">
                    <div class="support-item-header">
                        <strong>From: ${msg.user_name} (${msg.user_email})</strong>
                        <span>${new Date(msg.sent_at).toLocaleString()}</span>
                    </div>
                    <p>${msg.message}</p>
                </div>
            `).join('');
        } else {
            supportList.innerHTML = `<p>${result.message || 'Failed to load support messages.'}</p>`;
        }
    };

    tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    }));

    enrollmentsTBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const enrollmentId = button.dataset.id;
        const userId = button.dataset.userId;
        const courseName = button.dataset.course;
        const action = button.dataset.action;

        let newStatus = '';
        let assignedLoc = null;
        let message = '';

        switch (action) {
            case 'approve-payment-request':
                newStatus = 'Awaiting Payment';
                message = 'Request approved. User notified to make payment.';
                break;
            case 'reject-request':
                newStatus = 'Rejected';
                message = 'Request rejected. User notified.';
                break;
            case 'not-available':
                newStatus = 'Not Available';
                message = 'Course marked as Not Available. User notified.';
                break;
            case 'confirm-payment':
                const enteredLocation = prompt("Payment confirmed. Enter the final class location:", "");
                if (enteredLocation) {
                    newStatus = 'Approved';
                    assignedLoc = enteredLocation;
                    message = 'Payment confirmed and location set. User notified.';
                } else {
                    alert('Location is required to confirm payment.');
                    return;
                }
                break;
            case 'reject-payment':
                newStatus = 'Payment Rejected';
                message = 'Payment rejected. User notified.';
                break;
            default:
                return;
        }

        const result = await fetchData('updateEnrollmentStatus', {
            enrollmentId,
            newStatus,
            assignedLocation,
            userId,
            courseName
        });

        if (result.success) {
            alert(message);
            renderEnrollmentsTable();
        } else {
            alert(result.message || 'Failed to update enrollment status.');
        }
    });

    usersTBody.addEventListener('click', async (e) => {
        if (e.target.dataset.action === 'edit-user') {
            const userId = e.target.dataset.id;
            const result = await fetchData('getAllUsers');
            if (result.success) {
                const users = result.users;
                const userToEdit = users.find(u => u.id == userId);

                if (userToEdit) {
                    editUserIdInput.value = userToEdit.id;
                    editUserNameInput.value = userToEdit.name;
                    editUserMobileInput.value = userToEdit.mobile;
                    editUserAccountStatusSelect.value = userToEdit.accountStatus;

                    userEditModal.style.display = 'flex';
                } else {
                    alert('User not found.');
                }
            } else {
                alert(result.message || 'Failed to fetch user data for editing.');
            }
        }
    });

    userEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = editUserIdInput.value;
        const newName = editUserNameInput.value;
        const newMobile = editUserMobileInput.value;
        const newAccountStatus = editUserAccountStatusSelect.value;

        const result = await fetchData('adminUpdateUser', {
            userId,
            name: newName,
            mobile: newMobile,
            accountStatus: newAccountStatus
        });

        if (result.success) {
            alert(result.message);
            if (loggedInAdmin.id == userId) {
                const updatedAdminResult = await fetchData('getLoggedInUser');
                if (updatedAdminResult.success) {
                    sessionStorage.setItem('loggedInUser', JSON.stringify(updatedAdminResult.user));
                }
            }
            userEditModal.style.display = 'none';
            renderUsersTable();
        } else {
            alert(result.message || 'Failed to update user information.');
        }
    });

    document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', e => e.target.closest('.modal-overlay').style.display = 'none'));
    document.getElementById('logout-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        const result = await fetchData('logout');
        if (result.success) {
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'index.php';
        } else {
            alert('Logout failed. Please try again.');
        }
    });

    const renderAll = async () => {
        await renderEnrollmentsTable();
        await renderUsersTable();
        await renderSupportMessages();
    };
    renderAll();
});