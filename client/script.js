// script.js
// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('.section');
const alertModal = document.getElementById('alert-modal');
const closeModal = document.querySelector('.close-modal');
const motivationalQuote = document.getElementById('motivational-quote'); // Added for motivational quote

// User Data
let userData = {
    name: '',
    age: 0,
    weight: 0,
    height: 0,
    goal: ''
};

// Daily Stats
let dailyStats = {
    steps: 0,
    caloriesBurned: 0,
    foodCalories: 0,
    waterGlasses: 0,
    workouts: [],
    meals: []
};

// Journal entries array
let journalData = [];

// Gamification data (initial placeholder if gamification.js is not present)
let gamificationData = {
    level: 1,
    xp: 0,
    badges: {
        steps: false,
        water: false,
        streak: false
    }
};

// Motivational Quotes (Example)
const quotes = [
    "The only bad workout is the one that didn't happen.",
    "Believe you can and you're halfway there.",
    "Strive for progress, not perfection.",
    "Your body can stand almost anything. It's your mind that you have to convince.",
    "The miracle isn't that I finished. The miracle is that I had the courage to start."
];

// Load data from localStorage
function loadData() {
    const savedUserData = localStorage.getItem('userData');
    const savedDailyStats = localStorage.getItem('dailyStats');
    const savedJournalEntries = localStorage.getItem('journalEntries');
    const savedGamificationData = localStorage.getItem('gamificationData'); // Load gamification data

    if (savedUserData) {
        userData = JSON.parse(savedUserData);
        updateProfileForm();
        calculateBMI();
    }

    if (savedDailyStats) {
        dailyStats = JSON.parse(savedDailyStats);
    }

    if (savedJournalEntries) {
        journalData = JSON.parse(savedJournalEntries);
    }

    if (savedGamificationData) {
        gamificationData = JSON.parse(savedGamificationData);
    }

    updateDashboard();
    updateSteps();
    updateWaterIntake();
    updateWorkoutHistory();
    updateMealHistory();
    updateJournalDisplay();
    updateGamificationDisplay(); // Update gamification display
    displayRandomQuote(); // Display motivational quote on load
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('dailyStats', JSON.stringify(dailyStats));
    localStorage.setItem('journalEntries', JSON.stringify(journalData));
    localStorage.setItem('gamificationData', JSON.stringify(gamificationData)); // Save gamification data
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);

        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Show target section
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });
    });
});

// Journal functionality
const journalForm = document.getElementById('journal-form');
const journalEntries = document.getElementById('journal-entries');
const searchJournal = document.getElementById('search-journal');
const filterTags = document.getElementById('filter-tags');

// Add new journal entry
journalForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('entry-title').value;
    const mood = document.getElementById('entry-mood').value;
    const content = document.getElementById('entry-content').value;
    const tags = Array.from(document.querySelectorAll('.tag input:checked'))
        .map(checkbox => checkbox.value);

    const newEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        title,
        mood,
        content,
        tags
    };

    journalData.unshift(newEntry);
    saveData();
    updateJournalDisplay();
    journalForm.reset();

    showAlert('Success', 'Journal entry saved!');
});

// Update journal display
function updateJournalDisplay() {
    const searchTerm = searchJournal.value.toLowerCase();
    const filterTag = filterTags.value;

    const filteredEntries = journalData.filter(entry => {
        const matchesSearch = entry.title.toLowerCase().includes(searchTerm) ||
                            entry.content.toLowerCase().includes(searchTerm);
        const matchesTag = !filterTag || entry.tags.includes(filterTag);
        return matchesSearch && matchesTag;
    });

    journalEntries.innerHTML = filteredEntries.map(entry => `
        <div class="journal-entry">
            <div class="entry-header">
                <span class="entry-title">${entry.title}</span>
                <span class="entry-date">${new Date(entry.date).toLocaleDateString()}</span>
            </div>
            <div>
                <span class="entry-mood">${getMoodEmoji(entry.mood)}</span>
            </div>
            <div class="entry-content">${entry.content}</div>
            <div class="entry-tags-list">
                ${entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Get mood emoji
function getMoodEmoji(mood) {
    const moodEmojis = {
        energetic: '🔋',
        good: '😊',
        tired: '😴',
        sore: '🤕',
        motivated: '💪'
    };
    return moodEmojis[mood] || '😊';
}

// Search and filter functionality
searchJournal.addEventListener('input', updateJournalDisplay);
filterTags.addEventListener('change', updateJournalDisplay);


// Profile Form
const profileForm = document.getElementById('profile-form');
profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    userData = {
        name: document.getElementById('user-name').value,
        age: parseInt(document.getElementById('user-age').value),
        weight: parseFloat(document.getElementById('user-weight').value),
        height: parseFloat(document.getElementById('user-height').value),
        goal: document.getElementById('user-goal').value
    };

    saveData();
    calculateBMI();
    showAlert('Profile Updated', 'Your profile has been successfully updated!');
});

function updateProfileForm() {
    if (userData.name) {
        document.getElementById('user-name').value = userData.name;
    }
    if (userData.age) {
        document.getElementById('user-age').value = userData.age;
    }
    if (userData.weight) {
        document.getElementById('user-weight').value = userData.weight;
    }
    if (userData.height) {
        document.getElementById('user-height').value = userData.height;
    }
    if (userData.goal) {
        document.getElementById('user-goal').value = userData.goal;
    }
}

// BMI Calculator
function calculateBMI() {
    const bmiResult = document.getElementById('bmi-result');
    if (userData.weight && userData.height) {
        const heightInMeters = userData.height / 100;
        const bmi = userData.weight / (heightInMeters * heightInMeters);
        bmiResult.textContent = `BMI: ${bmi.toFixed(1)}`;
    } else {
        bmiResult.textContent = 'BMI: N/A';
    }
}

// Step Counter
const incrementSteps = document.getElementById('increment-steps');
const decrementSteps = document.getElementById('decrement-steps');
const currentSteps = document.getElementById('current-steps');

incrementSteps.addEventListener('click', () => {
    dailyStats.steps += 1;
    updateSteps();
    checkStepGoal();
    addXP(10); // Add XP for steps
});

decrementSteps.addEventListener('click', () => {
    dailyStats.steps = Math.max(0, dailyStats.steps - 100);
    updateSteps();
});

function updateSteps() {
    currentSteps.textContent = dailyStats.steps;
    document.getElementById('total-steps').textContent = dailyStats.steps;
    document.getElementById('steps-progress').style.width = `${Math.min(100, (dailyStats.steps / 10000) * 100)}%`;
    saveData();
}

// Workout Form
const workoutForm = document.getElementById('workout-form');
workoutForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const workout = {
        type: document.getElementById('workout-type').value,
        duration: parseInt(document.getElementById('workout-duration').value),
        calories: parseInt(document.getElementById('workout-calories').value),
        timestamp: new Date().toLocaleTimeString()
    };

    dailyStats.workouts.push(workout);
    dailyStats.caloriesBurned += workout.calories;

    updateWorkoutHistory();
    updateDashboard();
    addXP(workout.calories / 10); // Add XP based on calories burned
    saveData();

    workoutForm.reset();
});

function updateWorkoutHistory() {
    const historyList = document.getElementById('workout-history');
    historyList.innerHTML = '';

    dailyStats.workouts.forEach(workout => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span>${workout.type} (${workout.duration} min)</span>
            <span>${workout.calories} cal</span>
        `;
        historyList.appendChild(item);
    });
}

// Meal Form
const mealForm = document.getElementById('meal-form');
mealForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const meal = {
        name: document.getElementById('meal-name').value,
        calories: parseInt(document.getElementById('meal-calories').value),
        timestamp: new Date().toLocaleTimeString()
    };

    dailyStats.meals.push(meal);
    dailyStats.foodCalories += meal.calories;

    updateMealHistory();
    updateDashboard();
    addXP(meal.calories / 20); // Add XP for meal logging
    saveData();

    mealForm.reset();
});

function updateMealHistory() {
    const historyList = document.getElementById('meal-history');
    historyList.innerHTML = '';

    dailyStats.meals.forEach(meal => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span>${meal.name}</span>
            <span>${meal.calories} cal</span>
        `;
        historyList.appendChild(item);
    });
}

// Water Tracker
const addWater = document.getElementById('add-water');
addWater.addEventListener('click', () => {
    dailyStats.waterGlasses++;
    updateWaterIntake();
    checkWaterGoal();
    addXP(5); // Add XP for water intake
});
const removeWater = document.getElementById('remove-water');
removeWater.addEventListener('click', () => {
    dailyStats.waterGlasses = Math.max(0, dailyStats.waterGlasses - 1);
    updateWaterIntake();
});


function updateWaterIntake() {
    document.getElementById('total-water').textContent = dailyStats.waterGlasses;
    document.getElementById('current-water-glasses').textContent = dailyStats.waterGlasses;
    document.getElementById('water-progress').style.width = `${Math.min(100, (dailyStats.waterGlasses / 8) * 100)}%`;
    document.getElementById('water-progress-dash').style.width = `${Math.min(100, (dailyStats.waterGlasses / 8) * 100)}%`;
    saveData();
}

// Dashboard Updates
function updateDashboard() {
    document.getElementById('total-calories').textContent = dailyStats.caloriesBurned;
    document.getElementById('total-food-calories').textContent = dailyStats.foodCalories;
    // Update dashboard progress bars
    document.getElementById('water-progress-dash').style.width = `${Math.min(100, (dailyStats.waterGlasses / 8) * 100)}%`;
    document.getElementById('calories-progress').style.width = `${Math.min(100, (dailyStats.foodCalories / 2000) * 100)}%`; // Assuming a 2000 calorie goal for progress bar
}

// Goal Alerts
function checkStepGoal() {
    if (dailyStats.steps >= 10000 && !gamificationData.badges.steps) {
        showAlert('Step Goal Achieved!', 'Congratulations! You have reached your daily step goal of 10,000 steps!');
        gamificationData.badges.steps = true;
        addXP(50); // Bonus XP for goal
        updateGamificationDisplay();
    }
}

function checkWaterGoal() {
    if (dailyStats.waterGlasses >= 8 && !gamificationData.badges.water) {
        showAlert('Water Goal Achieved!', 'Great job! You have reached your daily water intake goal of 8 glasses!');
        gamificationData.badges.water = true;
        addXP(30); // Bonus XP for goal
        updateGamificationDisplay();
    }
}

// Alert Modal
function showAlert(title, message) {
    document.getElementById('alert-title').textContent = title;
    document.getElementById('alert-message').textContent = message;
    alertModal.style.display = 'block';
}

closeModal.addEventListener('click', () => {
    alertModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === alertModal) {
        alertModal.style.display = 'none';
    }
});

// Gamification Functions (moved from a hypothetical gamification.js)
function addXP(amount) {
    gamificationData.xp += amount;
    const xpNeededForNextLevel = gamificationData.level * 100; // Example: 100 XP for Level 1, 200 for Level 2, etc.
    if (gamificationData.xp >= xpNeededForNextLevel) {
        levelUp();
    }
    updateGamificationDisplay();
    saveData();
}

function levelUp() {
    gamificationData.level++;
    gamificationData.xp = 0; // Reset XP for the new level
    showAlert('Level Up!', `Congratulations! You've reached Level ${gamificationData.level}!`);
}

function updateGamificationDisplay() {
    const userLevelElement = document.getElementById('user-level');
    const xpDisplayElement = document.getElementById('xp-display');
    const levelProgressBar = document.getElementById('level-progress');
    const stepsBadge = document.getElementById('steps-badge');
    const waterBadge = document.getElementById('water-badge');
    // const streakBadge = document.getElementById('streak-badge'); // Not yet implemented for streak

    if (userLevelElement) userLevelElement.textContent = gamificationData.level;
    const xpNeededForNextLevel = gamificationData.level * 100;
    if (xpDisplayElement) xpDisplayElement.textContent = `${gamificationData.xp}/${xpNeededForNextLevel} XP`;
    if (levelProgressBar) levelProgressBar.style.width = `${Math.min(100, (gamificationData.xp / xpNeededForNextLevel) * 100)}%`;

    if (stepsBadge) {
        if (gamificationData.badges.steps) {
            stepsBadge.classList.add('achieved');
            stepsBadge.title = "Achieved: Step Master!";
        } else {
            stepsBadge.classList.remove('achieved');
            stepsBadge.title = "Goal: 10,000 steps";
        }
    }
    if (waterBadge) {
        if (gamificationData.badges.water) {
            waterBadge.classList.add('achieved');
            waterBadge.title = "Achieved: Hydration Hero!";
        } else {
            waterBadge.classList.remove('achieved');
            waterBadge.title = "Goal: 8 glasses of water";
        }
    }
    // if (streakBadge) {
    //     if (gamificationData.badges.streak) {
    //         streakBadge.classList.add('achieved');
    //         streakBadge.title = "Achieved: 7-Day Streak!";
    //     } else {
    //         streakBadge.classList.remove('achieved');
    //         streakBadge.title = "Goal: 7 consecutive days of activity";
    //     }
    // }

    saveData(); // Save gamification data whenever it's updated
}

// Motivational Quote Display
function displayRandomQuote() {
    if (motivationalQuote) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        motivationalQuote.textContent = quotes[randomIndex];
    }
}


// Add event for Login redirect to section login
if (document.getElementById('login-here')) {
    document.getElementById('login-here').addEventListener('click', (e) => {
        e.preventDefault();
        const loginSection = document.getElementById('login');
        if (loginSection) {
            loginSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}
// Add event for Register button in the login section
if (document.getElementById('register-button')) {
    document.getElementById('register-button').addEventListener('click', (e)    => {
        e.preventDefault();
        const registerSection = document.getElementById('register');
        if (registerSection) {
            registerSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}
// Add event for Login button in the register section
if (document.getElementById('login-button')) {
    document.getElementById('login-button').addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default form submission
        const loginSection = document.getElementById('login');
        if (loginSection) {
            loginSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
}
  


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

