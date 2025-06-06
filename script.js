document.addEventListener('DOMContentLoaded', function() {
    // Start the Complete Dynamicism of the webpage
    initApp();
});

function initApp() {
    // Check if user is logged in
    checkLoginStatus();
    
    // Initialize Current State
    updateCurrentDate();
    setInterval(updateCurrentDate, 60000);
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize charts
    initCharts();
    
    // Load data from localStorage Object
    loadInitialData();
    
    // Show dashboard by default
    showSection('dashboard');
}

// Checking Mock Log-in Status
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const loginScreen = document.getElementById('login-screen');
    const appContainer = document.getElementById('app-container');
    
    // If logged in, show app, else show login screen
    if (isLoggedIn) {
        loginScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        document.getElementById('logged-in-user').textContent = localStorage.getItem('username') || 'Admin';
    } else {
        loginScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}

// Setting up the Current Date
function updateCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
    
    // Set default date
    const dateString = now.toISOString().split('T')[0];
    document.getElementById('attendance-date').value = dateString;
    document.getElementById('leave-start').value = dateString;
    document.getElementById('leave-end').value = dateString;
    document.getElementById('report-start').value = getFirstDayOfMonth(dateString);
    document.getElementById('report-end').value = dateString;
}

// Get the first day of the month from a date string
function getFirstDayOfMonth(dateString) {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

// Setting up Event Listeners for all the elements
function setupEventListeners() {
    // Login form Submission Listener
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Logout button Click Listener
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Sidebar navigation Click Listener
    document.querySelectorAll('.app-sidebar nav li').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
            
            // Update active state
            document.querySelectorAll('.app-sidebar nav li').forEach(li => {
                li.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Employee management buttons listeners
    document.getElementById('add-employee-btn').addEventListener('click', showEmployeeForm);
    document.getElementById('cancel-employee-btn').addEventListener('click', hideEmployeeForm);
    document.getElementById('employee-form').addEventListener('submit', saveEmployee);
    document.getElementById('employee-search').addEventListener('input', filterEmployees);
    document.querySelectorAll('#employees-table th i.fa-sort').forEach(icon => {
        icon.addEventListener('click', function() {
            const sortBy = this.parentElement.getAttribute('data-sort');
            sortEmployees(sortBy);
        });
    });
    
    // Attendance change date listener
    document.getElementById('attendance-date').addEventListener('change', loadAttendanceData);
    document.getElementById('attendance-search').addEventListener('input', filterAttendanceRecords);
    
    // Leave management buttons listeners
    document.getElementById('request-leave-btn').addEventListener('click', showLeaveForm);
    document.getElementById('cancel-leave-btn').addEventListener('click', hideLeaveForm);
    document.getElementById('leave-form').addEventListener('submit', submitLeaveRequest);
    document.getElementById('leave-search').addEventListener('input', filterLeaveRequests);
    document.getElementById('leave-status-filter').addEventListener('change', filterLeaveRequests);
    
    // Reports Generation button listener
    document.getElementById('generate-report-btn').addEventListener('click', generateReport);
    
    // Modal listeners
    document.querySelector('.close-modal').addEventListener('click', hideModal);
    document.getElementById('modal-cancel').addEventListener('click', hideModal);
}

// Handle login and Show logged-in notification
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    // Mock validation
    if (!username || !password) {
        errorElement.textContent = 'Please enter both username and password';
        return;
    }
    
    // Mock authentication
    if (username === 'admin' && password === 'admin123') {
        // Save login state
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', 'Admin');
        
        // Hide login screen, show app
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        document.getElementById('logged-in-user').textContent = 'Admin';
        
        // Show success notification
        showNotification('Login successful', 'Welcome back!', 'success');
    } else {
        errorElement.textContent = 'Invalid username or password';
    }
}

// Handle logout and show login screen
function handleLogout() {
    // Clear login state
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    
    // Show login screen, hide app
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    
    // Reset login form
    document.getElementById('login-form').reset();
    document.getElementById('login-error').textContent = '';
}

// Function to show a hidden section when required
function showSection(sectionId) {
    // Hide all other sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section only
    document.getElementById(`${sectionId}-section`).classList.remove('hidden');
    
    // Load section data if based on requirement
    switch(sectionId) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'employees':
            loadEmployees();
            break;
        case 'attendance':
            loadAttendanceData();
            break;
        case 'leave':
            loadLeaveRequests();
            break;
        case 'reports':
            // Reports will load when generated
            break;
    }
}

// Employee Management Functions
function showEmployeeForm() {
    document.getElementById('employee-form-container').classList.remove('hidden');
    document.getElementById('employee-form').reset();
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.getElementById('add-employee-btn').classList.add('hidden');
}

function hideEmployeeForm() {
    document.getElementById('employee-form-container').classList.add('hidden');
    document.getElementById('add-employee-btn').classList.remove('hidden');
}

// Function to show a particular employee
function saveEmployee(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateEmployeeForm()) return;
    
    // Show loading spinner
    showLoading();
    
    // Simulate data call delay to show all the data together
    setTimeout(() => {
        const employee = {
            id: document.getElementById('emp-id').value,
            name: document.getElementById('emp-name').value,
            email: document.getElementById('emp-email').value,
            phone: document.getElementById('emp-phone').value,
            department: document.getElementById('emp-dept').value,
            position: document.getElementById('emp-position').value,
            joinDate: document.getElementById('emp-join-date').value,
            status: document.getElementById('emp-status').value
        };
        
        // Get existing employees from localStorage object
        let employees = JSON.parse(localStorage.getItem('employees')) || [];
        
        // Check if editing existing employee
        const existingIndex = employees.findIndex(emp => emp.id === employee.id);
        if (existingIndex >= 0) {
            employees[existingIndex] = employee;
            showNotification('Success', 'Employee updated successfully', 'success');
        } else {
            employees.push(employee);
            showNotification('Success', 'Employee added successfully', 'success');
        }
        
        // Save back to localStorage
        localStorage.setItem('employees', JSON.stringify(employees));
        
        // Hide form and reload table
        hideEmployeeForm();
        loadEmployees();
        updateDashboard();
        
        // Hide loading spinner
        hideLoading();
    }, 1000);
}

function validateEmployeeForm() {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s\-()+]{10,}$/;
    
    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Validate ID
    const id = document.getElementById('emp-id').value;
    if (!id) {
        document.getElementById('emp-id-error').textContent = 'Employee ID is required';
        isValid = false;
    }
    
    // Validate Name
    const name = document.getElementById('emp-name').value;
    if (!name) {
        document.getElementById('emp-name-error').textContent = 'Name is required';
        isValid = false;
    }
    
    // Validate Email
    const email = document.getElementById('emp-email').value;
    if (!email) {
        document.getElementById('emp-email-error').textContent = 'Email is required';
        isValid = false;
    } else if (!emailRegex.test(email)) {
        document.getElementById('emp-email-error').textContent = 'Invalid email format';
        isValid = false;
    }
    
    // Validate Phone
    const phone = document.getElementById('emp-phone').value;
    if (!phone) {
        document.getElementById('emp-phone-error').textContent = 'Phone is required';
        isValid = false;
    } else if (!phoneRegex.test(phone)) {
        document.getElementById('emp-phone-error').textContent = 'Invalid phone number';
        isValid = false;
    }
    
    // Validate Department
    const dept = document.getElementById('emp-dept').value;
    if (!dept) {
        document.getElementById('emp-dept-error').textContent = 'Department is required';
        isValid = false;
    }
    
    // Validate Position
    const position = document.getElementById('emp-position').value;
    if (!position) {
        document.getElementById('emp-position-error').textContent = 'Position is required';
        isValid = false;
    }
    
    // Validate Join Date
    const joinDate = document.getElementById('emp-join-date').value;
    if (!joinDate) {
        document.getElementById('emp-join-date-error').textContent = 'Join date is required';
        isValid = false;
    }
    
    return isValid;
}

function loadEmployees() {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const tableBody = document.getElementById('employees-table-body');
    
    tableBody.innerHTML = '';
    
    if (employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No employees found</td></tr>';
        return;
    }
    
    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.department}</td>
            <td>${employee.position}</td>
            <td><span class="status-badge status-${employee.status.toLowerCase().replace(' ', '-')}">${employee.status}</span></td>
            <td class="table-actions">
                <button class="action-btn edit-btn" data-id="${employee.id}"><i class="fas fa-edit"></i></button>
                <button class="action-btn delete-btn" data-id="${employee.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editEmployee(this.getAttribute('data-id'));
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            confirmDelete('employee', this.getAttribute('data-id'));
        });
    });
}

function editEmployee(id) {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const employee = employees.find(emp => emp.id === id);
    
    if (employee) {
        document.getElementById('emp-id').value = employee.id;
        document.getElementById('emp-name').value = employee.name;
        document.getElementById('emp-email').value = employee.email;
        document.getElementById('emp-phone').value = employee.phone;
        document.getElementById('emp-dept').value = employee.department;
        document.getElementById('emp-position').value = employee.position;
        document.getElementById('emp-join-date').value = employee.joinDate;
        document.getElementById('emp-status').value = employee.status;
        
        showEmployeeForm();
    }
}

function filterEmployees() {
    const searchTerm = document.getElementById('employee-search').value.toLowerCase();
    const rows = document.querySelectorAll('#employees-table-body tr');
    
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const dept = row.cells[2].textContent.toLowerCase();
        const position = row.cells[3].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || dept.includes(searchTerm) || position.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function sortEmployees(sortBy) {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const tableBody = document.getElementById('employees-table-body');
    const sortIcons = document.querySelectorAll('#employees-table th i.fa-sort');
    
    // Reset all sort icons
    sortIcons.forEach(icon => {
        icon.classList.remove('fa-sort-up', 'fa-sort-down');
        icon.classList.add('fa-sort');
    });
    
    // Get the clicked icon
    const clickedIcon = document.querySelector(`#employees-table th[data-sort="${sortBy}"] i`);
    
    // Determine sort direction
    let sortDirection = 'asc';
    if (clickedIcon.classList.contains('fa-sort-up')) {
        sortDirection = 'desc';
        clickedIcon.classList.remove('fa-sort-up');
        clickedIcon.classList.add('fa-sort-down');
    } else {
        sortDirection = 'asc';
        clickedIcon.classList.remove('fa-sort', 'fa-sort-down');
        clickedIcon.classList.add('fa-sort-up');
    }
    
    // Sort employees
    employees.sort((a, b) => {
        const aValue = a[sortBy] || '';
        const bValue = b[sortBy] || '';
        
        if (sortDirection === 'asc') {
            return aValue.toString().localeCompare(bValue.toString());
        } else {
            return bValue.toString().localeCompare(aValue.toString());
        }
    });
    
    // Save sorted array
    localStorage.setItem('employees', JSON.stringify(employees));
    
    // Reload table
    loadEmployees();
}

// Attendance Functions
function loadAttendanceData() {
    const date = document.getElementById('attendance-date').value;
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance')) || [];
    const tableBody = document.getElementById('attendance-table-body');
    
    tableBody.innerHTML = '';
    
    if (employees.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No employees found</td></tr>';
        return;
    }
    
    employees.forEach(employee => {
        // Find attendance record for this employee on the selected date
        const record = attendanceRecords.find(rec => 
            rec.employeeId === employee.id && rec.date === date
        );
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.name}</td>
            <td>${employee.department}</td>
            <td>${record ? record.status : 'Absent'}</td>
            <td>${record ? record.checkIn || '--:--' : '--:--'}</td>
            <td>${record ? record.checkOut || '--:--' : '--:--'}</td>
            <td class="table-actions">
                <button class="action-btn edit-btn" data-id="${employee.id}" data-date="${date}"><i class="fas fa-edit"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editAttendance(this.getAttribute('data-id'), this.getAttribute('data-date'));
        });
    });
}

function filterAttendanceRecords() {
    const searchTerm = document.getElementById('attendance-search').value.toLowerCase();
    const rows = document.querySelectorAll('#attendance-table-body tr');
    rows.forEach(row => {
        const name = row.cells[1].textContent.toLowerCase();
        const dept = row.cells[2].textContent.toLowerCase();
        
        if (name.includes(searchTerm) || dept.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function editAttendance(employeeId, date) {
    showModal(
        'Edit Attendance',
        `Update attendance record for employee ${employeeId} on ${date}`,
        'editAttendance',
        { employeeId, date }
    );
}

// Leave Management Functions
function showLeaveForm() {
    // Populate employee dropdown
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const employeeSelect = document.getElementById('leave-employee');
    
    employeeSelect.innerHTML = '';
    employees.forEach(employee => {
        if (employee.status === 'Active') {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${employee.name} (${employee.id})`;
            employeeSelect.appendChild(option);
        }
    });
    
    document.getElementById('leave-form-container').classList.remove('hidden');
    document.getElementById('leave-form').reset();
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.getElementById('request-leave-btn').classList.add('hidden');
}

function hideLeaveForm() {
    document.getElementById('leave-form-container').classList.add('hidden');
    document.getElementById('request-leave-btn').classList.remove('hidden');
}

function submitLeaveRequest(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateLeaveForm()) return;
    
    // Show loading spinner
    showLoading();
    
    // Simulate API call delay
    setTimeout(() => {
        const leaveRequest = {
            id: `LV-${Date.now()}`,
            employeeId: document.getElementById('leave-employee').value,
            employeeName: document.getElementById('leave-employee').options[document.getElementById('leave-employee').selectedIndex].text,
            leaveType: document.getElementById('leave-type').value,
            startDate: document.getElementById('leave-start').value,
            endDate: document.getElementById('leave-end').value,
            reason: document.getElementById('leave-reason').value,
            status: 'Pending',
            submittedDate: new Date().toISOString().split('T')[0]
        };
        
        // Calculate number of days
        const start = new Date(leaveRequest.startDate);
        const end = new Date(leaveRequest.endDate);
        leaveRequest.days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        // Get existing leave requests from localStorage
        let leaveRequests = JSON.parse(localStorage.getItem('leaveRequests')) || [];
        
        // Add new request
        leaveRequests.push(leaveRequest);
        
        // Save back to localStorage
        localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
        
        // Hide form and reload table
        hideLeaveForm();
        loadLeaveRequests();
        updateDashboard();
        
        // Show success notification
        showNotification('Success', 'Leave request submitted successfully', 'success');
        
        // Hide loading spinner
        hideLoading();
    }, 1000);
}

function validateLeaveForm() {
    let isValid = true;
    const startDate = document.getElementById('leave-start').value;
    const endDate = document.getElementById('leave-end').value;
    const reason = document.getElementById('leave-reason').value;
    
    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    
    // Validate dates
    if (!startDate) {
        document.getElementById('leave-start-error').textContent = 'Start date is required';
        isValid = false;
    }
    
    if (!endDate) {
        document.getElementById('leave-end-error').textContent = 'End date is required';
        isValid = false;
    } else if (startDate && endDate < startDate) {
        document.getElementById('leave-end-error').textContent = 'End date must be after start date';
        isValid = false;
    }
    
    // Validate reason
    if (!reason) {
        document.getElementById('leave-reason-error').textContent = 'Reason is required';
        isValid = false;
    } else if (reason.length < 10) {
        document.getElementById('leave-reason-error').textContent = 'Reason must be at least 10 characters';
        isValid = false;
    }
    
    return isValid;
}

function loadLeaveRequests() {
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests')) || [];
    const statusFilter = document.getElementById('leave-status-filter').value;
    const searchTerm = document.getElementById('leave-search').value.toLowerCase();
    const tableBody = document.getElementById('leave-table-body');
    
    tableBody.innerHTML = '';
    
    // Filter requests
    let filteredRequests = leaveRequests;
    
    if (statusFilter !== 'all') {
        filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
    }
    
    if (searchTerm) {
        filteredRequests = filteredRequests.filter(req => 
            req.employeeName.toLowerCase().includes(searchTerm) || 
            req.leaveType.toLowerCase().includes(searchTerm) ||
            req.reason.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredRequests.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No leave requests found</td></tr>';
        return;
    }
    
    // Sort by most recent first
    filteredRequests.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    
    filteredRequests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${request.employeeName}</td>
            <td>${request.leaveType}</td>
            <td>${formatDateRange(request.startDate, request.endDate)}</td>
            <td>${request.days}</td>
            <td><span class="status-badge status-${request.status.toLowerCase()}">${request.status}</span></td>
            <td class="table-actions">
                ${request.status === 'Pending' ? `
                    <button class="action-btn edit-btn" data-id="${request.id}"><i class="fas fa-check"></i></button>
                    <button class="action-btn delete-btn" data-id="${request.id}"><i class="fas fa-times"></i></button>
                ` : ''}
                <button class="action-btn view-btn" data-id="${request.id}"><i class="fas fa-eye"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateLeaveStatus(this.getAttribute('data-id'), 'Approved');
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateLeaveStatus(this.getAttribute('data-id'), 'Rejected');
        });
    });
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            viewLeaveRequest(this.getAttribute('data-id'));
        });
    });
}

function filterLeaveRequests() {
    loadLeaveRequests();
}

function formatDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
        return start.toLocaleDateString();
    }
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}

function updateLeaveStatus(requestId, status) {
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests')) || [];
    const requestIndex = leaveRequests.findIndex(req => req.id === requestId);
    
    if (requestIndex >= 0) {
        leaveRequests[requestIndex].status = status;
        localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
        
        // Update employee status if needed
        if (status === 'Approved') {
            const employees = JSON.parse(localStorage.getItem('employees')) || [];
            const employeeIndex = employees.findIndex(emp => emp.id === leaveRequests[requestIndex].employeeId);
            
            if (employeeIndex >= 0) {
                employees[employeeIndex].status = 'On Leave';
                localStorage.setItem('employees', JSON.stringify(employees));
            }
        }
        
        showNotification('Success', `Leave request ${status.toLowerCase()}`, 'success');
        loadLeaveRequests();
        updateDashboard();
    }
}

function viewLeaveRequest(requestId) {
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests')) || [];
    const request = leaveRequests.find(req => req.id === requestId);
    
    if (request) {
        showModal(
            'Leave Request Details',
            `
            <div class="leave-details">
                <div class="detail-row">
                    <span class="detail-label">Employee:</span>
                    <span class="detail-value">${request.employeeName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Leave Type:</span>
                    <span class="detail-value">${request.leaveType}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Dates:</span>
                    <span class="detail-value">${formatDateRange(request.startDate, request.endDate)} (${request.days} days)</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value status-badge status-${request.status.toLowerCase()}">${request.status}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Submitted On:</span>
                    <span class="detail-value">${new Date(request.submittedDate).toLocaleDateString()}</span>
                </div>
                <div class="detail-row full-width">
                    <span class="detail-label">Reason:</span>
                    <p class="detail-value">${request.reason}</p>
                </div>
            </div>
            `,
            'viewLeave'
        );
    }
}

// Dashboard Functions
function updateDashboard() {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance')) || [];
    const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests')) || [];
    const today = new Date().toISOString().split('T')[0];
    
    // Update stats
    document.getElementById('total-employees').textContent = employees.length;
    
    // Calculate present today
    const presentToday = attendanceRecords.filter(rec => 
        rec.date === today && rec.status === 'Present'
    ).length;
    document.getElementById('present-today').textContent = presentToday;
    
    // Calculate on leave
    const onLeave = employees.filter(emp => emp.status === 'On Leave').length;
    document.getElementById('on-leave').textContent = onLeave;
    
    // Calculate absent today
    const absentToday = employees.length - presentToday - onLeave;
    document.getElementById('absent-today').textContent = absentToday > 0 ? absentToday : 0;
    
    // Update recent leave requests
    updateRecentLeaves(leaveRequests);
    
    // Update charts
    updateCharts(employees, attendanceRecords, leaveRequests);
}

function updateRecentLeaves(leaveRequests) {
    const recentLeavesContainer = document.getElementById('recent-leaves');
    recentLeavesContainer.innerHTML = '';
    
    // Sort by most recent and take first 5
    const recentLeaves = [...leaveRequests]
        .sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate))
        .slice(0, 5);
    
    if (recentLeaves.length === 0) {
        recentLeavesContainer.innerHTML = '<p class="text-muted">No recent leave requests</p>';
        return;
    }
    
    recentLeaves.forEach(request => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon" style="background-color: ${getStatusColor(request.status)};">
                <i class="fas ${getStatusIcon(request.status)}"></i>
            </div>
            <div class="activity-info">
                <p class="activity-title">${request.employeeName}</p>
                <p class="activity-desc">${request.leaveType} - ${request.days} days</p>
            </div>
            <div class="activity-time">${new Date(request.submittedDate).toLocaleDateString()}</div>
        `;
        recentLeavesContainer.appendChild(activityItem);
    });
}

function getStatusColor(status) {
    switch(status) {
        case 'Approved': return '#1cc88a';
        case 'Rejected': return '#e74a3b';
        default: return '#f6c23e';
    }
}

function getStatusIcon(status) {
    switch(status) {
        case 'Approved': return 'fa-check';
        case 'Rejected': return 'fa-times';
        default: return 'fa-clock';
    }
}

// Chart Functions
function initCharts() {
    // Initialize chart contexts
    window.attendanceChart = new Chart(
        document.getElementById('attendance-chart').getContext('2d'),
        { type: 'bar', data: { labels: [], datasets: [] }, options: getChartOptions('Attendance') }
    );
    
    window.leaveChart = new Chart(
        document.getElementById('leave-chart').getContext('2d'),
        { type: 'pie', data: { labels: [], datasets: [] }, options: getChartOptions('Leave Types') }
    );
    
    window.reportChart = new Chart(
        document.getElementById('report-chart').getContext('2d'),
        { type: 'bar', data: { labels: [], datasets: [] }, options: getChartOptions('Report') }
    );
}

function getChartOptions(title) {
    return {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: title,
                font: {
                    size: 16
                }
            }
        }
    };
}

function updateCharts(employees, attendanceRecords, leaveRequests) {
    // Update attendance chart (weekly attendance)
    updateAttendanceChart(attendanceRecords);
    
    // Update leave chart (leave type distribution)
    updateLeaveChart(leaveRequests);
}

function updateAttendanceChart(attendanceRecords) {
    // Get dates for the past 7 days
    const dates = [];
    const presentData = [];
    const absentData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        dates.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayRecords = attendanceRecords.filter(rec => rec.date === dateString);
        presentData.push(dayRecords.filter(rec => rec.status === 'Present').length);
        absentData.push(dayRecords.filter(rec => rec.status === 'Absent').length);
    }
    
    window.attendanceChart.data.labels = dates;
    window.attendanceChart.data.datasets = [
        {
            label: 'Present',
            data: presentData,
            backgroundColor: '#1cc88a',
            borderColor: '#1cc88a',
            borderWidth: 1
        },
        {
            label: 'Absent',
            data: absentData,
            backgroundColor: '#e74a3b',
            borderColor: '#e74a3b',
            borderWidth: 1
        }
    ];
    window.attendanceChart.update();
}

function updateLeaveChart(leaveRequests) {
    const leaveTypes = ['Sick Leave', 'Vacation', 'Personal', 'Maternity/Paternity', 'Bereavement'];
    const typeCounts = leaveTypes.map(type => 
        leaveRequests.filter(req => req.leaveType === type).length
    );
    
    const backgroundColors = [
        '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'
    ];
    
    window.leaveChart.data.labels = leaveTypes;
    window.leaveChart.data.datasets = [{
        data: typeCounts,
        backgroundColor: backgroundColors,
        borderWidth: 1
    }];
    window.leaveChart.update();
}

// Report Functions
function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const startDate = document.getElementById('report-start').value;
    const endDate = document.getElementById('report-end').value;
    
    if (!startDate || !endDate) {
        showNotification('Error', 'Please select date range', 'error');
        return;
    }
    
    // Show loading spinner
    showLoading();
    
    // Simulate processing delay
    setTimeout(() => {
        const employees = JSON.parse(localStorage.getItem('employees')) || [];
        const attendanceRecords = JSON.parse(localStorage.getItem('attendance')) || [];
        const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests')) || [];
        
        // Update report title
        document.getElementById('report-title').textContent = `${reportType.replace(/([A-Z])/g, ' $1')} Report`.trim();
        document.getElementById('report-period').textContent = `Period: ${formatDateRange(startDate, endDate)}`;
        
        // Generate report based on type
        switch(reportType) {
            case 'attendance':
                generateAttendanceReport(employees, attendanceRecords, startDate, endDate);
                break;
            case 'leave':
                generateLeaveReport(employees, leaveRequests, startDate, endDate);
                break;
            case 'employee':
                generateEmployeeReport(employees);
                break;
        }
        
        // Hide loading spinner
        hideLoading();
    }, 1500);
}

function generateAttendanceReport(employees, attendanceRecords, startDate, endDate) {
    // Filter records for the date range
    const filteredRecords = attendanceRecords.filter(rec => {
        return rec.date >= startDate && rec.date <= endDate;
    });
    
    // Group by employee
    const employeeAttendance = {};
    employees.forEach(emp => {
        employeeAttendance[emp.id] = {
            name: emp.name,
            department: emp.department,
            present: 0,
            absent: 0,
            records: []
        };
    });
    
    filteredRecords.forEach(rec => {
        if (employeeAttendance[rec.employeeId]) {
            if (rec.status === 'Present') {
                employeeAttendance[rec.employeeId].present++;
            } else {
                employeeAttendance[rec.employeeId].absent++;
            }
            employeeAttendance[rec.employeeId].records.push(rec);
        }
    });
    
    // Prepare data for chart
    const labels = [];
    const presentData = [];
    const absentData = [];
    
    // Get all dates in range
    const dateArray = getDatesInRange(startDate, endDate);
    
    dateArray.forEach(date => {
        const dateStr = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(dateStr);
        
        const dayRecords = filteredRecords.filter(rec => rec.date === date);
        presentData.push(dayRecords.filter(rec => rec.status === 'Present').length);
        absentData.push(dayRecords.filter(rec => rec.status === 'Absent').length);
    });
    
    // Update chart
    window.reportChart.data.labels = labels;
    window.reportChart.data.datasets = [
        {
            label: 'Present',
            data: presentData,
            backgroundColor: '#1cc88a',
            borderColor: '#1cc88a',
            borderWidth: 1
        },
        {
            label: 'Absent',
            data: absentData,
            backgroundColor: '#e74a3b',
            borderColor: '#e74a3b',
            borderWidth: 1
        }
    ];
    window.reportChart.update();
    
    // Update table
    const tableHead = document.querySelector('#report-data-table thead');
    const tableBody = document.querySelector('#report-data-table tbody');
    
    tableHead.innerHTML = `
        <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Present Days</th>
            <th>Absent Days</th>
            <th>Attendance %</th>
        </tr>
    `;
    
    tableBody.innerHTML = '';
    
    Object.keys(employeeAttendance).forEach(empId => {
        const emp = employeeAttendance[empId];
        const totalDays = emp.present + emp.absent;
        const attendancePercent = totalDays > 0 ? Math.round((emp.present / totalDays) * 100) : 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${empId}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.present}</td>
            <td>${emp.absent}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${attendancePercent}%;" 
                        aria-valuenow="${attendancePercent}" aria-valuemin="0" aria-valuemax="100">
                        ${attendancePercent}%
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function generateLeaveReport(employees, leaveRequests, startDate, endDate) {
    // Filter requests for the date range (based on start date of leave)
    const filteredRequests = leaveRequests.filter(req => {
        return req.startDate >= startDate && req.startDate <= endDate;
    });
    
    // Group by employee
    const employeeLeaves = {};
    employees.forEach(emp => {
        employeeLeaves[emp.id] = {
            name: emp.name,
            department: emp.department,
            totalDays: 0,
            requests: []
        };
    });
    
    filteredRequests.forEach(req => {
        if (employeeLeaves[req.employeeId]) {
            employeeLeaves[req.employeeId].totalDays += req.days;
            employeeLeaves[req.employeeId].requests.push(req);
        }
    });
    
    // Prepare data for chart (leave type distribution)
    const leaveTypes = ['Sick Leave', 'Vacation', 'Personal', 'Maternity/Paternity', 'Bereavement'];
    const typeCounts = leaveTypes.map(type => 
        filteredRequests.filter(req => req.leaveType === type).length
    );
    
    const backgroundColors = [
        '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'
    ];
    
    // Update chart
    window.reportChart.data.labels = leaveTypes;
    window.reportChart.data.datasets = [{
        data: typeCounts,
        backgroundColor: backgroundColors,
        borderWidth: 1
    }];
    window.reportChart.type = 'pie';
    window.reportChart.update();
    
    // Update table
    const tableHead = document.querySelector('#report-data-table thead');
    const tableBody = document.querySelector('#report-data-table tbody');
    
    tableHead.innerHTML = `
        <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Total Leave Days</th>
            <th>Requests</th>
            <th>Status</th>
        </tr>
    `;
    
    tableBody.innerHTML = '';
    
    Object.keys(employeeLeaves).forEach(empId => {
        const emp = employeeLeaves[empId];
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${empId}</td>
            <td>${emp.name}</td>
            <td>${emp.department}</td>
            <td>${emp.totalDays}</td>
            <td>${emp.requests.length}</td>
            <td>
                ${emp.requests.some(req => req.status === 'Pending') ? 
                    '<span class="status-badge status-pending">Pending</span>' : 
                    '<span class="status-badge status-approved">All Processed</span>'}
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function generateEmployeeReport(employees) {
    // Group by department
    const departmentStats = {};
    employees.forEach(emp => {
        if (!departmentStats[emp.department]) {
            departmentStats[emp.department] = {
                total: 0,
                active: 0,
                onLeave: 0,
                inactive: 0
            };
        }
        
        departmentStats[emp.department].total++;
        if (emp.status === 'Active') departmentStats[emp.department].active++;
        if (emp.status === 'On Leave') departmentStats[emp.department].onLeave++;
        if (emp.status === 'Inactive') departmentStats[emp.department].inactive++;
    });
    
    // Prepare data for chart
    const labels = Object.keys(departmentStats);
    const activeData = [];
    const onLeaveData = [];
    const inactiveData = [];
    
    labels.forEach(dept => {
        activeData.push(departmentStats[dept].active);
        onLeaveData.push(departmentStats[dept].onLeave);
        inactiveData.push(departmentStats[dept].inactive);
    });
    
    // Update chart
    window.reportChart.data.labels = labels;
    window.reportChart.data.datasets = [
        {
            label: 'Active',
            data: activeData,
            backgroundColor: '#1cc88a',
            borderColor: '#1cc88a',
            borderWidth: 1
        },
        {
            label: 'On Leave',
            data: onLeaveData,
            backgroundColor: '#f6c23e',
            borderColor: '#f6c23e',
            borderWidth: 1
        },
        {
            label: 'Inactive',
            data: inactiveData,
            backgroundColor: '#e74a3b',
            borderColor: '#e74a3b',
            borderWidth: 1
        }
    ];
    window.reportChart.type = 'bar';
    window.reportChart.update();
    
    // Update table
    const tableHead = document.querySelector('#report-data-table thead');
    const tableBody = document.querySelector('#report-data-table tbody');
    
    tableHead.innerHTML = `
        <tr>
            <th>Department</th>
            <th>Total Employees</th>
            <th>Active</th>
            <th>On Leave</th>
            <th>Inactive</th>
            <th>Active %</th>
        </tr>
    `;
    
    tableBody.innerHTML = '';
    
    labels.forEach(dept => {
        const stats = departmentStats[dept];
        const activePercent = Math.round((stats.active / stats.total) * 100);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dept}</td>
            <td>${stats.total}</td>
            <td>${stats.active}</td>
            <td>${stats.onLeave}</td>
            <td>${stats.inactive}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${activePercent}%;" 
                        aria-valuenow="${activePercent}" aria-valuemin="0" aria-valuemax="100">
                        ${activePercent}%
                    </div>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function getDatesInRange(startDate, endDate) {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

// Modal Functions
let currentModalAction = null;
let currentModalData = null;

function showModal(title, message, action, data = null) {
    currentModalAction = action;
    currentModalData = data;
    
    document.getElementById('modal-title').textContent = title;

    // Always treat message as HTML
    document.getElementById('modal-message').innerHTML = message;
    
    document.getElementById('confirmation-modal').classList.remove('hidden');
}


function hideModal() {
    document.getElementById('confirmation-modal').classList.add('hidden');
    currentModalAction = null;
    currentModalData = null;
}

document.getElementById('modal-confirm').addEventListener('click', function() {
    if (currentModalAction) {
        switch(currentModalAction) {
            case 'editAttendance':
                editAttendanceConfirm(currentModalData);
                break;
            case 'deleteEmployee':
                deleteEmployee(currentModalData);
                break;
            // Add more cases as needed
        }
    }
    hideModal();
});

function editAttendanceConfirm(data) {
    // In a real app, this would update the attendance record
    showNotification('Success', 'Attendance record updated', 'success');
    loadAttendanceData();
    updateDashboard();
}

function confirmDelete(type, id) {
    let title, message;
    
    switch(type) {
        case 'employee':
            title = 'Delete Employee';
            message = 'Are you sure you want to delete this employee? This action cannot be undone.';
            break;
        // Add more cases as needed
    }
    
    showModal(title, message, `delete${type.charAt(0).toUpperCase() + type.slice(1)}`, id);
}

function deleteEmployee(id) {
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const updatedEmployees = employees.filter(emp => emp.id !== id);
    
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    showNotification('Success', 'Employee deleted successfully', 'success');
    loadEmployees();
    updateDashboard();
}

// Notification Functions
function showNotification(title, message, type) {
    const toast = document.getElementById('notification-toast');
    const toastIcon = document.getElementById('toast-icon');
    const toastTitle = document.getElementById('toast-title');
    const toastText = document.getElementById('toast-text');
    
    // Set content and style based on type
    toastTitle.textContent = title;
    toastText.textContent = message;
    
    // Reset classes
    toast.className = 'toast hidden';
    toastIcon.className = 'fas';
    
    // Add type-specific classes
    switch(type) {
        case 'success':
            toast.classList.add('toast-success');
            toastIcon.classList.add('fa-check-circle');
            break;
        case 'error':
            toast.classList.add('toast-error');
            toastIcon.classList.add('fa-exclamation-circle');
            break;
        case 'warning':
            toast.classList.add('toast-warning');
            toastIcon.classList.add('fa-exclamation-triangle');
            break;
        case 'info':
            toast.classList.add('toast-info');
            toastIcon.classList.add('fa-info-circle');
            break;
    }
    
    // Show toast
    toast.classList.remove('hidden');
    toast.classList.add('show');
    
    // Hide after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 5000);
}

// Loading Spinner Functions
function showLoading() {
    document.getElementById('loading-spinner').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-spinner').classList.add('hidden');
}

// Initialize with sample data if empty
function loadInitialData() {
    if (localStorage.getItem('hasData')) return;
    
    // Sample employees
    const sampleEmployees = [
        {
            id: 'EMP001',
            name: 'M Hamza',
            email: 'bsse23001@itu.edu.pk',
            phone: '1234567890',
            department: 'IT',
            position: 'Software Developer',
            joinDate: '2020-01-15',
            status: 'Active'
        },
        {
            id: 'EMP002',
            name: 'M Tayyab',
            email: 'bsse23018@itu.edu.pk',
            phone: '9876543210',
            department: 'HR',
            position: 'HR Manager',
            joinDate: '2019-05-20',
            status: 'Active'
        },
        {
            id: 'EMP003',
            name: 'M Sarmad',
            email: 'bsse23013@itu.edu.pk',
            phone: '5551234567',
            department: 'Finance',
            position: 'Accountant',
            joinDate: '2021-03-10',
            status: 'Active'
        },
        {
            id: 'EMP004',
            name: 'H Azfar Umer',
            email: 'bsse23064@itu.edu.pk',
            phone: '4445556666',
            department: 'Marketing',
            position: 'Marketing Specialist',
            joinDate: '2022-02-01',
            status: 'Active'
        },
        {
            id: 'EMP005',
            name: 'Irteza Ahmed',
            email: 'bsse23068@itu.edu.pk',
            phone: '7778889999',
            department: 'Operations',
            position: 'Operations Manager',
            joinDate: '2018-11-15',
            status: 'Active'
        }
    ];
    
    // Sample attendance
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const sampleAttendance = [
        { employeeId: 'EMP001', date: today, status: 'Present', checkIn: '08:45', checkOut: '17:30' },
        { employeeId: 'EMP002', date: today, status: 'Present', checkIn: '09:00', checkOut: '17:15' },
        { employeeId: 'EMP003', date: today, status: 'Present', checkIn: '08:30', checkOut: '17:45' },
        { employeeId: 'EMP004', date: today, status: 'Absent' },
        { employeeId: 'EMP005', date: today, status: 'Present', checkIn: '09:15', checkOut: '18:00' },
        { employeeId: 'EMP001', date: yesterdayStr, status: 'Present', checkIn: '08:50', checkOut: '17:20' },
        { employeeId: 'EMP002', date: yesterdayStr, status: 'Present', checkIn: '09:05', checkOut: '17:10' },
        { employeeId: 'EMP003', date: yesterdayStr, status: 'Absent' },
        { employeeId: 'EMP004', date: yesterdayStr, status: 'Present', checkIn: '08:40', checkOut: '17:50' },
        { employeeId: 'EMP005', date: yesterdayStr, status: 'Present', checkIn: '09:20', checkOut: '18:10' }
    ];
    
    // Sample leave requests
    const sampleLeaves = [
        {
            id: 'LV-001',
            employeeId: 'EMP003',
            employeeName: 'M Sarmad (EMP003)',
            leaveType: 'Sick Leave',
            startDate: today,
            endDate: today,
            reason: 'Not feeling well, doctor appointment',
            status: 'Approved',
            submittedDate: yesterdayStr,
            days: 1
        },
        {
            id: 'LV-002',
            employeeId: 'EMP004',
            employeeName: 'H Azfar Umer (EMP004)',
            leaveType: 'Vacation',
            startDate: getNextWeekDate(),
            endDate: getNextWeekDate(3),
            reason: 'Not Interested in work',
            status: 'Pending',
            submittedDate: today,
            days: 3
        }
    ];
    
    // Save to localStorage
    localStorage.setItem('employees', JSON.stringify(sampleEmployees));
    localStorage.setItem('attendance', JSON.stringify(sampleAttendance));
    localStorage.setItem('leaveRequests', JSON.stringify(sampleLeaves));
    localStorage.setItem('hasData', 'true');
}

function getNextWeekDate(daysToAdd = 7) {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
}

// Initialize the application
initApp();