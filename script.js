// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const currentDateEl = document.getElementById('current-date');
const taskInput = document.getElementById('task-input');
const todoList = document.getElementById('todo-list');
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const timerSelect = document.getElementById('timer-select');
const noteContent = document.getElementById('note-content');
const notesList = document.getElementById('notes-list');
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

// minimal UI elements
const taskAddBtn = document.getElementById('task-add-btn');
const taskAddForm = document.getElementById('task-add-form');
const taskCancelBtn = document.getElementById('task-cancel');
const taskSaveBtn = document.getElementById('task-save');
const noteAddBtn = document.getElementById('note-add-btn');
const noteAddForm = document.getElementById('note-add-form');
const noteCancelBtn = document.getElementById('note-cancel');
const noteSaveBtn = document.getElementById('note-save');

// Storage keys
const TASKS_KEY = 'productivity-tasks';
const NOTES_KEY = 'productivity-notes';
const THEME_KEY = 'productivity-theme';

// App state
let tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || {};
let notes = JSON.parse(localStorage.getItem(NOTES_KEY)) || {};
let timerInterval;
let timerRunning = false;
let timerMinutes = 25;
let timerSeconds = 0;
let currentDate = new Date().toISOString().split('T')[0];

// Initialize app
function init() {
    // Set current date
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
    
    // Load theme preference
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }

    // Ensure data structure is initialized
    if (!tasks[currentDate]) tasks[currentDate] = [];
    if (!notes[currentDate]) notes[currentDate] = [];

    // Initialize data
    renderTasks();
    renderNotes();

    // Set up event listeners
    setupEventListeners();
}

// Event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Minimal UI form toggles
    taskAddBtn.addEventListener('click', () => {
        taskAddForm.classList.toggle('active');
        taskInput.focus();
    });
    
    taskCancelBtn.addEventListener('click', () => {
        taskAddForm.classList.remove('active');
        taskInput.value = '';
    });
    
    taskSaveBtn.addEventListener('click', () => {
        if (taskInput.value.trim()) {
            addTask(taskInput.value.trim());
            taskInput.value = '';
            taskAddForm.classList.remove('active');
        }
    });
    
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && taskInput.value.trim()) {
            addTask(taskInput.value.trim());
            taskInput.value = '';
            taskAddForm.classList.remove('active');
        }
    });
    
    noteAddBtn.addEventListener('click', () => {
        noteAddForm.classList.toggle('active');
        noteContent.focus();
    });
    
    noteCancelBtn.addEventListener('click', () => {
        noteAddForm.classList.remove('active');
        noteContent.value = '';
    });
    
    noteSaveBtn.addEventListener('click', () => {
        if (noteContent.value.trim()) {
            saveNote();
            noteAddForm.classList.remove('active');
        }
    });
    
    // Timer
    startTimerBtn.addEventListener('click', toggleTimer);
    resetTimerBtn.addEventListener('click', resetTimer);
    timerSelect.addEventListener('change', changeTimerType);
    
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pageId = this.getAttribute('data-page');
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show the selected page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === `${pageId}-page`) {
                    page.classList.add('active');
                }
            });
        });
    });
}

// Theme functions
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
}

// Task functions
function addTask(text) {
    if (!tasks[currentDate]) {
        tasks[currentDate] = [];
    }
    
    const newTask = {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks[currentDate].unshift(newTask);
    saveTasks();
    renderTasks();
}

function toggleTaskCompleted(id) {
    tasks[currentDate] = tasks[currentDate].map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks();
    renderTasks();
}

function deleteTask(id) {
    tasks[currentDate] = tasks[currentDate].filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

function saveTasks() {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

function renderTasks() {
    todoList.innerHTML = '';
    
    if (!tasks[currentDate] || tasks[currentDate].length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'No tasks yet';
        emptyItem.style.color = 'var(--light-text)';
        emptyItem.style.textAlign = 'center';
        emptyItem.style.padding = '0.5rem';
        todoList.appendChild(emptyItem);
        return;
    }
    
    tasks[currentDate].forEach(task => {
        const li = document.createElement('li');
        li.className = `todo-item ${task.completed ? 'completed' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTaskCompleted(task.id));
        
        const textSpan = document.createElement('span');
        textSpan.className = 'todo-text';
        textSpan.textContent = task.text;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(deleteBtn);
        
        todoList.appendChild(li);
    });
}

// Timer functions
function toggleTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        startTimerBtn.textContent = 'Start';
    } else {
        timerRunning = true;
        startTimerBtn.textContent = 'Pause';
        
        timerInterval = setInterval(() => {
            if (timerSeconds === 0) {
                if (timerMinutes === 0) {
                    clearInterval(timerInterval);
                    timerRunning = false;
                    startTimerBtn.textContent = 'Start';
                    alert('Timer complete!');
                    return;
                }
                timerMinutes--;
                timerSeconds = 59;
            } else {
                timerSeconds--;
            }
            updateTimerDisplay();
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    startTimerBtn.textContent = 'Start';
    timerMinutes = parseInt(timerSelect.value);
    timerSeconds = 0;
    updateTimerDisplay();
}

function changeTimerType() {
    resetTimer();
}

function updateTimerDisplay() {
    timerDisplay.textContent = `${timerMinutes.toString().padStart(2, '0')}:${timerSeconds.toString().padStart(2, '0')}`;
}

// Note functions
function saveNote() {
    const content = noteContent.value.trim();
    
    if (!content) return;
    
    if (!notes[currentDate]) {
        notes[currentDate] = [];
    }
    
    const newNote = {
        id: Date.now(),
        content,
        createdAt: new Date().toISOString()
    };
    
    notes[currentDate].unshift(newNote);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    renderNotes();
    
    // Clear input
    noteContent.value = '';
}

function deleteNote(id) {
    notes[currentDate] = notes[currentDate].filter(note => note.id !== id);
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    renderNotes();
}

function renderNotes() {
    notesList.innerHTML = '';
    
    if (!notes[currentDate] || notes[currentDate].length === 0) {
        const emptyNotes = document.createElement('li');
        emptyNotes.textContent = 'No notes yet';
        emptyNotes.style.color = 'var(--light-text)';
        emptyNotes.style.textAlign = 'center';
        emptyNotes.style.padding = '0.5rem';
        notesList.appendChild(emptyNotes);
        return;
    }
    
    notes[currentDate].forEach(note => {
        const li = document.createElement('li');
        
        const contentSpan = document.createElement('span');
        contentSpan.textContent = note.content;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => deleteNote(note.id));
        
        li.appendChild(contentSpan);
        li.appendChild(deleteBtn);
        
        notesList.appendChild(li);
    });
}

// Initialize the app
init();
