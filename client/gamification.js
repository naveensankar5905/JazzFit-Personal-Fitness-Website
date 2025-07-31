// Gamification Configuration and Utilities (streamlined version)

// Badge Requirements
const badgeRequirements = {
    steps: 10000, // Daily step goal
    water: 8,     // Glasses of water
    streak: 7     // Days in a row
};

// User Progress (optional if used outside script.js)
let userProgress = {
    currentStreak: 0,
    badges: {
        steps: false,
        water: false,
        streak: false
    }
};

// Load User Progress from localStorage
function loadUserProgress() {
    const saved = localStorage.getItem('userProgress');
    if (saved) {
        userProgress = JSON.parse(saved);
    }
}

// Save User Progress to localStorage
function saveUserProgress() {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
}

// Badge Checking (optional – can be managed via script.js if centralized)
function checkAndAwardBadges() {
    if (parseInt(document.getElementById('total-steps').textContent) >= badgeRequirements.steps) {
        userProgress.badges.steps = true;
    }

    if (parseInt(document.getElementById('total-water').textContent) >= badgeRequirements.water) {
        userProgress.badges.water = true;
    }

    if (userProgress.currentStreak >= badgeRequirements.streak) {
        userProgress.badges.streak = true;
    }

    saveUserProgress();
}

// Login Function (corrected)
function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Simple validation (replace with real authentication)
    if (username && password) {
        alert(`Welcome, ${username}!`);

        const passwordValid = password.length >= 12 && /[!@#$%^&*]/.test(password) && /\d/.test(password);
        
        // Check password length
        if (!passwordValid) {
            alert('Password must be at least 12 characters long, contain a number, and a special character.');
            return;
        }

        // Redirect to dashboard section
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById('dashboard').classList.add('active');

        // Highlight dashboard link
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
        document.querySelector('a[href="#dashboard"]').classList.add('active');
    } else {
        alert('Please enter valid credentials.');
    }
}
