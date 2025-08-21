class PPLTracker {
    constructor() {
        this.currentTab = 'workouts';
        this.workoutData = null;
        this.measurements = this.loadMeasurements();
        this.logs = this.loadLogs();
        this.settings = this.loadSettings();
        this.exerciseMaxes = this.loadExerciseMaxes(); // Store 1RM data
        this.sessionProgress = {}; // Track current session progress
        
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.loadWorkoutData();
        this.checkForSavedSession();
        this.setupSwipeGestures();
        this.updateCurrentPhaseDisplay();
        
        // Show resume indicator after DOM is ready
        setTimeout(() => {
            if (this.currentWorkoutSession) {
                this.addResumeIndicator();
                this.showContinueWorkoutBanner();
            }
        }, 100);
    }

    checkForSavedSession() {
        const savedSession = localStorage.getItem('currentWorkoutSession');
        if (savedSession) {
            this.currentWorkoutSession = JSON.parse(savedSession);
            this.showResumeWorkoutOption();
        }
    }

    showResumeWorkoutOption() {
        // Show resume badge on the paused workout
        this.addResumeIndicator();
        
        const resumeMessage = `You have an unfinished workout:\n${this.currentWorkoutSession.workoutName}\n\nWould you like to resume it?`;
        
        if (confirm(resumeMessage)) {
            this.resumeWorkout();
        } else {
            // Clear the saved session if user doesn't want to resume
            localStorage.removeItem('currentWorkoutSession');
            this.currentWorkoutSession = null;
            this.removeResumeIndicator();
        }
    }
    
    addResumeIndicator() {
        // Remove any existing resume indicators first
        this.removeResumeIndicator();
        
        // Find the workout that needs resume badge
        const workoutType = this.currentWorkoutSession?.workoutType;
        if (workoutType) {
            const workoutItem = document.querySelector(`[data-workout="${workoutType}"]`);
            if (workoutItem) {
                // Add resume badge to workout info - try multiple selectors
                let workoutInfo = workoutItem.querySelector('.workout-info');
                if (!workoutInfo) {
                    workoutInfo = workoutItem.querySelector('.workout-card-content');
                }
                
                if (workoutInfo) {
                    const resumeBadge = document.createElement('span');
                    resumeBadge.className = 'resume-badge';
                    resumeBadge.textContent = 'Resume';
                    resumeBadge.onclick = (e) => {
                        e.stopPropagation();
                        this.resumeWorkout();
                    };
                    
                    workoutInfo.appendChild(resumeBadge);
                    workoutItem.classList.add('has-resume');
                }
            }
        }
    }
    
    removeResumeIndicator() {
        document.querySelectorAll('.resume-badge').forEach(badge => badge.remove());
        document.querySelectorAll('.workout-item.has-resume').forEach(item => {
            item.classList.remove('has-resume');
        });
    }

    resumeWorkout() {
        // Find the workout data
        const workoutType = this.currentWorkoutSession.workoutType;
        const workout = this.workoutData[workoutType];
        
        if (workout) {
            this.currentWorkout = workout;
            this.currentWorkoutType = workoutType;
            this.workoutStartTime = new Date(this.currentWorkoutSession.startTime);
            this.currentWeek = this.currentWorkoutSession.week || 1; // Restore week context
            this.isWorkoutActive = true;
            
            // Switch to active workout
            this.switchTab('active-workout');
            
            // Update title with new two-line format
            const workoutMainTitle = document.getElementById('workout-main-title');
            const workoutSubtitle = document.getElementById('workout-subtitle');
            
            if (workoutMainTitle && workoutSubtitle) {
                workoutMainTitle.textContent = this.cleanWorkoutName(workout.name);
                
                const weekText = this.currentWeek ? `Week ${this.currentWeek}` : '';
                const phaseText = this.getPhaseTextFromWeek(this.currentWeek);
                workoutSubtitle.textContent = phaseText ? `${weekText} (${phaseText})` : weekText;
            }
            
            // Render exercises
            this.renderWorkoutExercises();
            
            // Update UI to show active state
            document.getElementById('start-workout').style.display = 'none';
            document.getElementById('workout-timer').style.display = 'block';
            document.getElementById('end-session-header-btn').style.display = 'block';
            
            // Restore sets
            this.currentWorkout.exercises.forEach((exercise, exerciseIndex) => {
                this.addSetsForExercise(exercise, exerciseIndex);
            });
            
            // Restore saved set data
            this.restoreSetData();
            
            // Start timer
            this.startWorkoutTimer();
        }
    }

    restoreSetData() {
        if (!this.currentWorkoutSession || !this.currentWorkoutSession.exercises) return;
        
        Object.entries(this.currentWorkoutSession.exercises).forEach(([exerciseIndex, sets]) => {
            Object.entries(sets).forEach(([setIndex, setData]) => {
                const weightInput = document.getElementById(`weight-${exerciseIndex}-${setIndex}`);
                const repsInput = document.getElementById(`reps-${exerciseIndex}-${setIndex}`);
                const checkbox = document.getElementById(`completed-${exerciseIndex}-${setIndex}`);
                
                if (weightInput) weightInput.value = setData.weight;
                if (repsInput) repsInput.value = setData.reps;
                if (checkbox) {
                    checkbox.checked = setData.completed;
                    if (setData.completed) {
                        checkbox.closest('.set-row').classList.add('completed');
                    }
                }
            });
        });
    }


    setupNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Only update nav buttons for main tabs (not active-workout)
        const mainTabs = ['workouts', 'logs', 'measurements', 'settings'];
        
        if (mainTabs.includes(tabName)) {
            // Update nav buttons
            document.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const navButton = document.querySelector(`[data-tab="${tabName}"]`);
            if (navButton) {
                navButton.classList.add('active');
            }
        }

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const tabContent = document.getElementById(tabName);
        if (tabContent) {
            tabContent.classList.add('active');
        } else {
            console.error('Tab content not found for tab:', tabName);
        }
        
        // Show/hide slim timer based on active tab
        if (tabName === 'active-workout' && this.isWorkoutActive) {
            this.showSlimTimer();
        } else {
            this.hideSlimTimer();
        }
        
        // Auto-save progress when switching tabs
        if (this.isWorkoutActive) {
            this.saveCurrentSession();
        }

        // Update workout completion status when switching to workouts tab
        if (tabName === 'workouts') {
            setTimeout(() => {
                this.updateWorkoutCompletionStatus();
            }, 100);
        }

        this.currentTab = tabName;
    }

    setupEventListeners() {
        // Use event delegation for workout items and workout cards
        document.addEventListener('click', (e) => {
            // Handle workout card clicks - make entire card tappable
            if (e.target.closest('.workout-card-content')) {
                const workoutCard = e.target.closest('.workout-card');
                const workoutType = workoutCard.dataset.workout;
                if (workoutType && !e.target.closest('.action-btn')) {
                    this.showWeekSelectionModal(workoutType);
                }
                return;
            }
            
            // Handle workout item clicks (legacy support)
            if (e.target.closest('.workout-item')) {
                const workoutItem = e.target.closest('.workout-item');
                const workoutType = workoutItem.dataset.workout;
                if (workoutType) {
                    this.showWeekSelectionModal(workoutType);
                }
            }
            
            // Handle progress item clicks
            if (e.target.closest('.progress-item-nav')) {
                const progressItem = e.target.closest('.progress-item-nav');
                const filter = progressItem.dataset.filter;
                if (filter) {
                    this.showLogFilter(filter);
                }
            }
            
            // Handle measurement item clicks
            if (e.target.closest('.measurement-item')) {
                const measurementItem = e.target.closest('.measurement-item');
                this.editMeasurement(measurementItem);
            }
            
            // Handle setting item clicks
            if (e.target.closest('.setting-item')) {
                const settingItem = e.target.closest('.setting-item');
                this.handleSetting(settingItem);
            }
            
        });

    }

    loadWorkoutData() {
        // Use the workout data from workout-data.js
        if (typeof WORKOUT_DATA !== 'undefined') {
            this.workoutData = {};
            
            // Add all workout variants with proper keys
            const allWorkouts = this.getAllWorkoutVariants();
            allWorkouts.forEach(workoutInfo => {
                this.workoutData[workoutInfo.key] = {
                    ...workoutInfo.workout,
                    phase: workoutInfo.phase,
                    phaseNumber: workoutInfo.phaseNumber,
                    description: workoutInfo.description
                };
            });
            
            // Also maintain backward compatibility with original keys
            Object.keys(WORKOUT_DATA.phase1.workouts).forEach(workoutType => {
                this.workoutData[workoutType] = WORKOUT_DATA.phase1.workouts[workoutType];
            });
            
            // Generate workout cards after data is loaded
            this.generateWorkoutCards();
            
        } else {
            console.error('WORKOUT_DATA not loaded');
            this.workoutData = {};
        }
        
    }

    generateWorkoutCards() {
        const container = document.querySelector('.workout-cards-container');
        if (!container) return;

        // Clear existing cards
        container.innerHTML = '';

        // Collect all workout variants
        const allWorkouts = this.getAllWorkoutVariants();

        // Group workouts by phase
        const phases = this.groupWorkoutsByPhase(allWorkouts);

        // Generate phase sections with headers
        ['Phase 1', 'Phase 2', 'Phase 3'].forEach(phaseName => {
            if (phases[phaseName] && phases[phaseName].length > 0) {
                // Add phase header
                const phaseHeader = this.createPhaseHeader(phaseName);
                container.appendChild(phaseHeader);

                // Add workout cards for this phase
                phases[phaseName].forEach(workoutInfo => {
                    const card = this.createWorkoutCard(workoutInfo.key, workoutInfo.workout, workoutInfo);
                    container.appendChild(card);
                });
            }
        });

        // Setup swipe gestures for newly created cards
        setTimeout(() => {
            this.setupSwipeGestures();
        }, 100);
    }

    groupWorkoutsByPhase(workouts) {
        const phases = {
            'Phase 1': [],
            'Phase 2': [],
            'Phase 3': []
        };

        workouts.forEach(workout => {
            if (phases[workout.phase]) {
                phases[workout.phase].push(workout);
            }
        });

        return phases;
    }

    createPhaseHeader(phaseName) {
        const header = document.createElement('div');
        header.className = 'phase-header';
        
        const phaseInfo = {
            'Phase 1': {
                title: 'Phase 1 (Week 1-6)',
                description: 'Base Hypertrophy (Moderate Volume, Moderate Intensity)'
            },
            'Phase 2': {
                title: 'Phase 2 (Week 7-10)',
                description: 'Maximum Effort (Low Volume, High Intensity)'
            },
            'Phase 3': {
                title: 'Phase 3 (Week 11-12)',
                description: 'Supercompensation (High Volume, Moderate Intensity)'
            }
        };

        const info = phaseInfo[phaseName];

        header.innerHTML = `
            <h2 class="phase-title">${info.title}</h2>
            <p class="phase-description">${info.description}</p>
        `;

        return header;
    }

    getAllWorkoutVariants() {
        const allWorkouts = [];

        // Phase 1 - Week 1 only (removing redundant Week 2)
        Object.keys(WORKOUT_DATA.phase1.workouts).forEach(workoutType => {
            const workout = WORKOUT_DATA.phase1.workouts[workoutType];
            allWorkouts.push({
                key: `phase1_${workoutType}`,
                workoutType,
                workout,
                phase: 'Phase 1',
                phaseNumber: 1,
                week: null,
                description: 'Base Hypertrophy'
            });
        });

        // Phase 2
        if (WORKOUT_DATA.phase2) {
            Object.keys(WORKOUT_DATA.phase2.workouts).forEach(workoutType => {
                const workout = WORKOUT_DATA.phase2.workouts[workoutType];
                allWorkouts.push({
                    key: `phase2_${workoutType}`,
                    workoutType,
                    workout,
                    phase: 'Phase 2',
                    phaseNumber: 2,
                    week: null,
                    description: 'Maximum Effort'
                });
            });
        }

        // Phase 3
        if (WORKOUT_DATA.phase3 && WORKOUT_DATA.phase3.week1) {
            Object.keys(WORKOUT_DATA.phase3.week1.workouts).forEach(workoutType => {
                const workout = WORKOUT_DATA.phase3.week1.workouts[workoutType];
                allWorkouts.push({
                    key: `phase3_${workoutType}`,
                    workoutType,
                    workout,
                    phase: 'Phase 3',
                    phaseNumber: 3,
                    week: 1,
                    description: 'Supercompensation'
                });
            });
        }

        return allWorkouts;
    }

    createWorkoutCard(workoutKey, workoutData, phaseInfo) {
        const card = document.createElement('div');
        card.className = 'workout-card';
        card.setAttribute('data-workout', workoutKey);

        const targetMuscles = this.getTargetMuscles(phaseInfo.workoutType);
        const exerciseCount = workoutData.exercises.length;
        const estimatedTime = this.estimateWorkoutDuration(workoutData);
        const phaseDescription = this.formatPhaseDescription(phaseInfo);

        card.innerHTML = `
            <div class="workout-card-content">
                <div class="workout-header">
                    <h3 class="workout-title">${this.formatWorkoutName(workoutData.name)}</h3>
                    <p class="target-muscles">${targetMuscles}</p>
                </div>
                <div class="workout-details">
                    <span class="exercise-count">${exerciseCount} exercises</span>
                    <span class="duration">${estimatedTime}</span>
                </div>
                <p class="workout-phase">${phaseDescription}</p>
                <div class="last-completed" style="display: none;">
                    <p class="completion-text">Last completed: 2 days ago</p>
                </div>
            </div>
            <!-- Swipe Actions (hidden by default) -->
            <div class="swipe-actions right-actions">
                <button class="action-btn start-btn" onclick="window.pplTracker.startWorkout('${workoutKey}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Start
                </button>
            </div>
            <div class="swipe-actions left-actions">
                <button class="action-btn share-btn" onclick="window.pplTracker.shareWorkout('${workoutKey}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 16c-.8 0-1.5.3-2 .8L8.8 13.4c.1-.3.1-.6.1-.9s0-.6-.1-.9L14.2 8.2c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .3 0 .6.1.9L8.8 10.2C8.3 9.7 7.6 9.4 6.8 9.4c-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2-.8l5.4 3.4c-.1.3-.1.6-.1.9 0 1.7 1.3 3 3 3s3-1.3 3-3-1.3-3-3-3z"/></svg>
                    Share
                </button>
                <button class="action-btn edit-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    Edit
                </button>
            </div>
        `;

        return card;
    }

    getTargetMuscles(workoutType) {
        const muscleMap = {
            'push': 'Chest, Shoulders, Triceps',
            'pull': 'Back, Biceps, Rear Delts',
            'legs': 'Quadriceps, Hamstrings, Glutes, Calves',
            'upper': 'Chest, Back, Shoulders, Arms',
            'lower': 'Legs, Glutes, Posterior Chain'
        };
        return muscleMap[workoutType] || 'Full Body';
    }

    estimateWorkoutDuration(workoutData) {
        if (!workoutData.exercises) return '45-60 min';
        
        const exerciseCount = workoutData.exercises.length;
        let totalSets = 0;
        
        workoutData.exercises.forEach(exercise => {
            const warmupSets = this.parseSetCount(exercise.warmup_sets);
            const workingSets = exercise.working_sets || 0;
            totalSets += warmupSets + workingSets;
        });

        // Estimate 2-3 minutes per set plus transitions
        const minMinutes = Math.floor(totalSets * 2 + exerciseCount * 2);
        const maxMinutes = Math.floor(totalSets * 3 + exerciseCount * 3);
        
        return `${minMinutes}-${maxMinutes} min`;
    }

    formatWorkoutName(name) {
        // Extract just the workout name without week information
        return name.split(' - ')[0] || name;
    }

    getCurrentPhaseDescription() {
        const currentWeek = this.getCurrentWeek();
        const phaseInfo = this.getPhaseInfo(currentWeek);
        return `${phaseInfo.name} - ${phaseInfo.description}`;
    }

    formatPhaseDescription(phaseInfo) {
        const weekText = phaseInfo.week ? ` Week ${phaseInfo.week}` : '';
        return `${phaseInfo.phase}${weekText} - ${phaseInfo.description}`;
    }

    startWorkout(workoutType) {
        console.log('Clicking workout:', workoutType);
        console.log('Available workout keys:', Object.keys(this.workoutData));
        const workout = this.workoutData[workoutType];
        console.log('Found workout:', workout);
        if (workout && workout.exercises) {
            this.currentWorkout = workout;
            this.currentWorkoutType = workoutType;
            
            // Switch to active workout tab
            this.switchTab('active-workout');
            
            // Update title with new two-line format
            const workoutMainTitle = document.getElementById('workout-main-title');
            const workoutSubtitle = document.getElementById('workout-subtitle');
            
            if (workoutMainTitle && workoutSubtitle) {
                workoutMainTitle.textContent = this.cleanWorkoutName(workout.name);
                
                const weekText = this.currentWeek ? `Week ${this.currentWeek}` : '';
                const phaseText = this.getPhaseTextFromWeek(this.currentWeek);
                workoutSubtitle.textContent = phaseText ? `${weekText} (${phaseText})` : weekText;
            }
            
            // Render exercises
            this.renderWorkoutExercises();
            
            // Directly setup workout (no start button needed)
            this.setupWorkout();
        } else {
            alert(`Workout "${workoutType}" is not available yet.`);
        }
    }

    simplifyExerciseName(fullName) {
        // Common simplifications for verbose exercise names
        const simplifications = {
            "Squeeze-Only Triceps Pressdown + Stretch-Only Overhead Triceps Extension": "Triceps Pressdown + Overhead Extension",
            "N1-Style Cross-Body Triceps Extension": "Cross-Body Triceps Extension",
            "A1: Lean-In Constant Tension DB Lateral Raise": "Lean-In DB Lateral Raise",
            "A2: Side Delt Static STRETCH (30s)": "Side Delt Stretch",
            "A1: EZ-Bar Modified Bicep 21's": "EZ-Bar Bicep 21's",
            "A2: Bicep Static STRETCH (30s)": "Bicep Stretch",
            "SLOW Seated Leg Curl (3 up, 3 down)": "Slow Seated Leg Curl",
            "1-Arm Half Kneeling Lat Pulldown": "Half Kneeling Lat Pulldown",
            "Standing Dumbbell Arnold Press": "DB Arnold Press",
            "High-Incline Smith Machine Press": "High-Incline Press",
            "Egyptian Cable Lateral Raise": "Cable Lateral Raise"
        };
        
        // Check for exact matches first
        if (simplifications[fullName]) {
            return simplifications[fullName];
        }
        
        // General simplifications
        let simplified = fullName
            .replace(/Standing Dumbbell/g, 'DB')
            .replace(/Dumbbell/g, 'DB')
            .replace(/Barbell/g, 'BB')
            .replace(/Machine/g, '')
            .replace(/\s+/g, ' ')
            .trim();
            
        // Remove A1:/A2: prefixes but keep the exercise name
        simplified = simplified.replace(/^A[12]:\s*/, '');
        
        return simplified;
    }

    renderWorkoutExercises() {
        const exerciseList = document.getElementById('exercise-list');
        exerciseList.innerHTML = '';
        
        this.currentWorkout.exercises.forEach((exercise, index) => {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.className = 'exercise-card';
            const simplifiedName = this.simplifyExerciseName(exercise.name);
            
            const lastMaxText = this.getLastMaxDisplayText(exercise.name);
            const lastMaxDisplay = lastMaxText ? `<span class="last-max">${lastMaxText}</span>` : '';
            
            exerciseDiv.innerHTML = `
                <div class="exercise-header">
                    <div class="exercise-title-container">
                        <h3 class="exercise-title">${simplifiedName}</h3>
                        <button class="info-btn" onclick="window.pplTracker.showExerciseInfo(${index})" title="Exercise details">i</button>
                    </div>
                    <div class="exercise-meta">
                        <span class="sets-info">${exercise.warmup_sets ? `${exercise.warmup_sets} warmup + ` : ''}${exercise.working_sets} working sets</span>
                        <span class="reps-rpe">${exercise.reps} reps • RPE ${exercise.rpe}</span>
                        ${lastMaxDisplay}
                    </div>
                </div>
                <div class="exercise-sets" id="exercise-${index}-sets">
                    <!-- Sets will be added here when workout starts -->
                </div>
            `;
            exerciseList.appendChild(exerciseDiv);
        });
    }

    setupWorkout() {
        // Setup workout without starting timer (timer starts on first interaction)
        this.isWorkoutActive = false; // Will become true on first set interaction
        
        // Hide start button and show end session button
        document.getElementById('start-workout').style.display = 'none';
        document.getElementById('end-session-header-btn').style.display = 'block';
        
        // Add sets for all exercises
        this.currentWorkout.exercises.forEach((exercise, exerciseIndex) => {
            this.addSetsForExercise(exercise, exerciseIndex);
        });
        
        // Auto-focus on first weight input and highlight first exercise
        setTimeout(() => this.focusFirstInput(), 100);
    }
    
    beginWorkout() {
        if (!this.isWorkoutActive) {
            this.workoutStartTime = new Date();
            this.isWorkoutActive = true;
            
            // Show timers
            document.getElementById('workout-timer').style.display = 'block';
            this.showSlimTimer();
            this.startWorkoutTimer();
            
            // Update active workout indicator
            this.updateActiveWorkoutIndicator();
            
            // Save initial session state
            this.saveCurrentSession();
        }
    }

    addSetsForExercise(exercise, exerciseIndex) {
        const setsContainer = document.getElementById(`exercise-${exerciseIndex}-sets`);
        
        // Parse warmup sets
        const warmupSets = this.parseSetCount(exercise.warmup_sets);
        const workingSets = exercise.working_sets;
        
        let setHTML = '<div class="sets-header"><span>Set</span><span>Weight</span><span>Reps</span><span>Done</span></div>';
        
        // Add warmup sets
        for (let i = 0; i < warmupSets; i++) {
            setHTML += `
                <div class="set-row warmup">
                    <span class="set-label">W${i + 1}</span>
                    <input type="number" class="weight-input" placeholder="0" step="2.5">
                    <input type="number" class="reps-input" placeholder="${exercise.reps}" step="1">
                    <input type="checkbox" class="set-complete" onchange="window.pplTracker.onSetComplete(${exerciseIndex}, ${i}, this.checked, 'warmup')">
                </div>
            `;
        }
        
        // Add working sets
        for (let i = 0; i < workingSets; i++) {
            setHTML += `
                <div class="set-row working">
                    <span class="set-label">${i + 1}</span>
                    <input type="number" class="weight-input" placeholder="0" step="2.5">
                    <input type="number" class="reps-input" placeholder="${exercise.reps}" step="1">
                    <input type="checkbox" class="set-complete" onchange="window.pplTracker.onSetComplete(${exerciseIndex}, ${warmupSets + i}, this.checked, 'working')">
                </div>
            `;
        }
        
        setsContainer.innerHTML = setHTML;
        
        // Add event listeners to inputs for auto-timer start
        const weightInputs = setsContainer.querySelectorAll('.weight-input');
        const repsInputs = setsContainer.querySelectorAll('.reps-input');
        
        weightInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.beginWorkout(); // Auto-start timer on first interaction
            });
        });
        
        repsInputs.forEach(input => {
            input.addEventListener('input', () => {
                this.beginWorkout(); // Auto-start timer on first interaction
            });
        });
    }

    parseSetCount(setString) {
        if (!setString || setString === 0) return 0;
        const match = String(setString).match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    onSetComplete(exerciseIndex, setIndex, isComplete, setType) {
        this.beginWorkout(); // Auto-start timer on first interaction
        
        if (isComplete) {
            const setRow = event.target.closest('.set-row');
            const weight = setRow.querySelector('.weight-input').value;
            const reps = setRow.querySelector('.reps-input').value;
            
            // Save set data
            if (!this.currentWorkoutSession) {
                this.currentWorkoutSession = {
                    workout: this.currentWorkoutType,
                    startTime: this.workoutStartTime,
                    exercises: {}
                };
            }
            
            if (!this.currentWorkoutSession.exercises[exerciseIndex]) {
                this.currentWorkoutSession.exercises[exerciseIndex] = [];
            }
            
            this.currentWorkoutSession.exercises[exerciseIndex][setIndex] = {
                weight: parseFloat(weight) || 0,
                reps: parseInt(reps) || 0,
                type: setType,
                completed: true
            };
            
            // Visual feedback
            setRow.classList.add('completed');
            
            // Track session progress and update maxes
            if (weight && reps) {
                const exercise = this.currentWorkout.exercises[exerciseIndex];
                this.trackSessionProgress(exercise.name, weight, reps, exerciseIndex);
            }
            
            // Start rest timer if it's a working set and has rest time
            if (setType === 'working') {
                const exercise = this.currentWorkout.exercises[exerciseIndex];
                if (exercise.rest && exercise.rest !== '0 min') {
                    this.startRestTimer(exercise.rest);
                }
            }
        }
    }

    trackSessionProgress(exerciseName, weight, reps, exerciseIndex) {
        if (!this.sessionProgress[exerciseName]) {
            this.sessionProgress[exerciseName] = {
                sets: [],
                bestSet: { weight: 0, reps: 0, oneRM: 0 },
                totalVolume: 0
            };
        }
        
        const currentOneRM = this.calculateOneRM(weight, reps);
        const setData = { weight: parseFloat(weight), reps: parseInt(reps), oneRM: currentOneRM };
        
        this.sessionProgress[exerciseName].sets.push(setData);
        
        // Update best set if this is better
        if (currentOneRM > this.sessionProgress[exerciseName].bestSet.oneRM) {
            this.sessionProgress[exerciseName].bestSet = setData;
        }
        
        // Recalculate total volume
        this.sessionProgress[exerciseName].totalVolume = this.sessionProgress[exerciseName].sets.reduce(
            (total, set) => total + (set.weight * set.reps), 0
        );
        
        // Check for new max and update records (include set number for tracking)
        const setNumber = this.sessionProgress[exerciseName].sets.length;
        const maxUpdate = this.updateExerciseMax(exerciseName, weight, reps, setNumber);
        if (maxUpdate) {
            this.sessionProgress[exerciseName].newMax = maxUpdate;
        }
    }

    startRestTimer(restTime) {
        const minutes = this.parseRestTime(restTime);
        if (minutes > 0) {
            alert(`Rest for ${minutes} minutes`);
        }
    }

    parseRestTime(restString) {
        if (!restString) return 0;
        const match = restString.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    startWorkoutTimer() {
        this.workoutTimerInterval = setInterval(() => {
            if (this.workoutStartTime) {
                const elapsed = new Date() - this.workoutStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                document.getElementById('elapsed-time').textContent = timeStr;
                
                // Also update slim timer bar if visible
                const slimTimer = document.getElementById('slim-timer');
                if (slimTimer) {
                    slimTimer.textContent = timeStr;
                }
            }
        }, 1000);
    }
    
    focusFirstInput() {
        const firstWeightInput = document.querySelector('.weight-input');
        if (firstWeightInput) {
            firstWeightInput.focus();
            // Add pulse animation to first exercise
            const firstExercise = document.querySelector('.exercise-card');
            if (firstExercise) {
                firstExercise.classList.add('pulse-highlight');
                setTimeout(() => firstExercise.classList.remove('pulse-highlight'), 3000);
            }
        }
    }
    
    quickStartWorkout(workoutType) {
        // Start workout with pre-filled defaults
        this.startWorkout(workoutType);
        
        // Auto-fill with last used weights or program defaults
        setTimeout(() => {
            this.fillDefaultWeights();
        }, 200);
    }
    
    fillDefaultWeights() {
        const weightInputs = document.querySelectorAll('.weight-input');
        weightInputs.forEach(input => {
            if (!input.value) {
                // Use last used weight for this exercise or default starting weight
                input.value = this.getLastUsedWeight(input) || '135';
            }
        });
    }
    
    getLastUsedWeight(input) {
        // For now, return null - could be enhanced to use localStorage history
        return null;
    }
    
    updateActiveWorkoutIndicator() {
        // Remove all in-progress indicators
        document.querySelectorAll('.workout-item.in-progress').forEach(item => {
            item.classList.remove('in-progress');
        });
        
        // Add indicator to current active workout
        if (this.isWorkoutActive && this.currentWorkoutType) {
            const activeWorkoutItem = document.querySelector(`[data-workout="${this.currentWorkoutType}"]`);
            if (activeWorkoutItem) {
                activeWorkoutItem.classList.add('in-progress');
            }
        }
    }
    
    showSlimTimer() {
        const slimTimerContainer = document.getElementById('slim-timer-container');
        if (slimTimerContainer) {
            slimTimerContainer.style.display = 'block';
        }
    }
    
    hideSlimTimer() {
        const slimTimerContainer = document.getElementById('slim-timer-container');
        if (slimTimerContainer) {
            slimTimerContainer.style.display = 'none';
        }
    }
    
    loadExerciseMaxes() {
        const saved = localStorage.getItem('ppl-exercise-maxes');
        if (!saved) return {};
        
        const data = JSON.parse(saved);
        
        // Migrate old format (simple numbers) to new format (detailed objects)
        Object.keys(data).forEach(exerciseName => {
            if (typeof data[exerciseName] === 'number') {
                // Convert old simple number to new detailed format
                data[exerciseName] = {
                    oneRM: data[exerciseName],
                    weight: data[exerciseName], // Approximate - actual weight was unknown in old format
                    reps: 1, // Approximate - assume 1RM was achieved with 1 rep
                    setNumber: null,
                    date: null,
                    workoutType: 'unknown'
                };
            }
        });
        
        // Save migrated data
        localStorage.setItem('ppl-exercise-maxes', JSON.stringify(data));
        
        return data;
    }
    
    saveExerciseMaxes() {
        localStorage.setItem('ppl-exercise-maxes', JSON.stringify(this.exerciseMaxes));
    }
    
    // Calculate 1RM using Epley formula: 1RM = Weight × (1 + Reps/30)
    calculateOneRM(weight, reps) {
        if (!weight || !reps || reps < 1) return 0;
        const numWeight = parseFloat(weight);
        const numReps = parseInt(reps);
        return Math.round(numWeight * (1 + numReps / 30));
    }
    
    // Update exercise max if current performance exceeds previous
    updateExerciseMax(exerciseName, weight, reps, setNumber = null) {
        const currentOneRM = this.calculateOneRM(weight, reps);
        if (currentOneRM === 0) return false;
        
        const previousMaxData = this.exerciseMaxes[exerciseName];
        const previousMax = previousMaxData ? previousMaxData.oneRM : 0;
        
        if (currentOneRM > previousMax) {
            // Store detailed max data including actual weight, reps, and set number
            this.exerciseMaxes[exerciseName] = {
                oneRM: currentOneRM,
                weight: parseFloat(weight),
                reps: parseInt(reps),
                setNumber: setNumber,
                date: new Date().toISOString(),
                workoutType: this.currentWorkoutType
            };
            this.saveExerciseMaxes();
            
            // Update display in real-time
            this.refreshExerciseMaxDisplay(exerciseName);
            
            return { 
                newMax: currentOneRM, 
                previousMax: previousMax, 
                increase: currentOneRM - previousMax,
                details: this.exerciseMaxes[exerciseName]
            };
        }
        return false;
    }
    
    // Get formatted last max display text
    getLastMaxDisplayText(exerciseName) {
        const maxData = this.exerciseMaxes[exerciseName];
        if (!maxData) return null;
        
        return `Last Max: ${maxData.oneRM} lbs (${maxData.weight} lbs × ${maxData.reps} reps, Set ${maxData.setNumber || 'N/A'})`;
    }
    
    // Refresh the last max display for a specific exercise during workout
    refreshExerciseMaxDisplay(exerciseName) {
        if (!this.currentWorkout) return;
        
        // Find the exercise in current workout and update its display
        this.currentWorkout.exercises.forEach((exercise, index) => {
            if (exercise.name === exerciseName) {
                const exerciseElement = document.querySelector(`#exercise-list .exercise-card:nth-child(${index + 1}) .last-max`);
                if (exerciseElement) {
                    const newText = this.getLastMaxDisplayText(exerciseName);
                    if (newText) {
                        exerciseElement.textContent = newText;
                        // Add animation to highlight the update
                        exerciseElement.style.background = 'rgba(46, 125, 50, 0.2)';
                        exerciseElement.style.transition = 'background 0.5s ease';
                        setTimeout(() => {
                            exerciseElement.style.background = 'rgba(176, 176, 176, 0.1)';
                        }, 2000);
                    }
                }
            }
        });
    }
    
    // Calculate total session volume for an exercise
    calculateSessionVolume(exerciseSets) {
        let totalVolume = 0;
        exerciseSets.forEach(set => {
            if (set.weight && set.reps && set.completed) {
                totalVolume += parseFloat(set.weight) * parseInt(set.reps);
            }
        });
        return totalVolume;
    }
    
    // Calculate average RPE for current session
    calculateSessionRPE() {
        const allRPEs = [];
        if (this.currentWorkout && this.currentWorkout.exercises) {
            this.currentWorkout.exercises.forEach(exercise => {
                if (exercise.rpe) {
                    allRPEs.push(parseFloat(exercise.rpe));
                }
            });
        }
        if (allRPEs.length === 0) return 0;
        return Math.round((allRPEs.reduce((sum, rpe) => sum + rpe, 0) / allRPEs.length) * 10) / 10;
    }

    showExerciseInfo(exerciseIndex) {
        const exercise = this.currentWorkout.exercises[exerciseIndex];
        
        // Create modal if it doesn't exist
        let modal = document.getElementById('exercise-info-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'exercise-info-modal';
            modal.className = 'modal';
            modal.style.display = 'none';
            modal.innerHTML = `
                <div class="modal-content exercise-info">
                    <div class="modal-header">
                        <h1 id="exercise-info-title">Exercise Details</h1>
                    </div>
                    <div class="modal-body">
                        <div id="exercise-info-content"></div>
                    </div>
                    <div class="modal-footer">
                        <button id="close-exercise-info" class="modal-close-btn">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Add event listeners
            modal.querySelector('#close-exercise-info').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Update modal content
        const title = modal.querySelector('#exercise-info-title');
        const content = modal.querySelector('#exercise-info-content');
        
        title.textContent = exercise.name;
        
        let infoHTML = `
            <div class="exercise-info-section">
                <h3>Coaching Notes</h3>
                <p>${exercise.coaching_notes}</p>
            </div>
            
            <div class="exercise-info-section">
                <h3>Substitution Options</h3>
                <ol>
                    <li>${exercise.substitution_option_1}</li>
                    <li>${exercise.substitution_option_2}</li>
                </ol>
            </div>
        `;
        
        content.innerHTML = infoHTML;
        
        // Show modal
        modal.style.display = 'flex';
    }

    shareWorkout(workoutType) {
        const workout = this.workoutData[workoutType];
        if (!workout) return;

        let shareText = `🏋️ ${workout.name}\n`;
        shareText += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        workout.exercises.forEach((exercise, index) => {
            shareText += `${index + 1}. ${exercise.name}\n`;
            
            // Format sets info
            let setsInfo = '';
            if (exercise.warmup_sets && exercise.warmup_sets !== '0') {
                setsInfo += `${exercise.warmup_sets} warmup + `;
            }
            setsInfo += `${exercise.working_sets} working sets`;
            
            shareText += `   Sets: ${setsInfo}\n`;
            shareText += `   Reps: ${exercise.reps}\n`;
            shareText += `   RPE: ${exercise.rpe}\n`;
            shareText += `   Rest: ${exercise.rest}\n`;
            
            if (index < workout.exercises.length - 1) {
                shareText += `\n`;
            }
        });

        shareText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        shareText += `📱 Created with Ultimate PPL Tracker`;

        // Use the Web Share API if available, otherwise copy to clipboard
        if (navigator.share) {
            navigator.share({
                title: workout.name,
                text: shareText
            }).catch(err => {
                console.log('Error sharing:', err);
                this.copyToClipboard(shareText);
            });
        } else {
            this.copyToClipboard(shareText);
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Workout copied to clipboard! You can now paste it in any messaging app.');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                this.fallbackCopyTextToClipboard(text);
            });
        } else {
            this.fallbackCopyTextToClipboard(text);
        }
    }

    fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                alert('Workout copied to clipboard! You can now paste it in any messaging app.');
            } else {
                alert('Unable to copy to clipboard. Please copy the workout details manually.');
            }
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alert('Unable to copy to clipboard. Please copy the workout details manually.');
        }
        
        document.body.removeChild(textArea);
    }


    showLogFilter(filter) {
        if (filter === 'exercise') {
            this.switchTab('exercise-progress');
            this.loadExerciseProgress();
        } else if (filter === 'measurement') {
            this.switchTab('measurement-progress');
            this.loadMeasurementProgress();
        } else if (filter === 'workout') {
            this.showWorkoutHistory();
        }
    }

    loadExerciseProgress() {
        const container = document.querySelector('.exercise-list-progress');
        container.innerHTML = '';
        
        // Get unique exercises from workout sessions
        const exerciseData = this.getExerciseProgressData();
        
        if (exerciseData.length === 0) {
            container.innerHTML = '<div class="no-data"><p>Complete some workouts to see exercise progress</p></div>';
            return;
        }
        
        exerciseData.forEach(exercise => {
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            progressItem.onclick = () => this.showExerciseChart(exercise.name, exercise.data);
            
            progressItem.innerHTML = `
                <div class="progress-item-info">
                    <div class="progress-item-name">${exercise.name}</div>
                    <div class="progress-item-stats">${exercise.sessions} sessions • Max: ${exercise.maxWeight}lbs</div>
                </div>
                <span class="arrow">›</span>
            `;
            
            container.appendChild(progressItem);
        });
    }

    loadMeasurementProgress() {
        const container = document.querySelector('.measurement-list-progress');
        container.innerHTML = '';
        
        // Get measurements with data
        const measurementData = this.getMeasurementProgressData();
        
        if (measurementData.length === 0) {
            container.innerHTML = '<div class="no-data"><p>Add some measurements to see trends</p></div>';
            return;
        }
        
        measurementData.forEach(measurement => {
            const progressItem = document.createElement('div');
            progressItem.className = 'progress-item';
            progressItem.onclick = () => this.showMeasurementChart(measurement.name, measurement.data);
            
            progressItem.innerHTML = `
                <div class="progress-item-info">
                    <div class="progress-item-name">${measurement.name}</div>
                    <div class="progress-item-stats">${measurement.entries} entries • Latest: ${measurement.latest}</div>
                </div>
                <span class="arrow">›</span>
            `;
            
            container.appendChild(progressItem);
        });
    }

    getExerciseProgressData() {
        const exerciseMap = new Map();
        
        // Process workout session data
        this.logs.forEach(log => {
            if (log.exerciseData) {
                Object.entries(log.exerciseData).forEach(([exerciseIndex, sets]) => {
                    const workoutExercises = this.workoutData[log.workoutType]?.exercises;
                    if (workoutExercises && workoutExercises[exerciseIndex]) {
                        const exerciseName = workoutExercises[exerciseIndex].name;
                        
                        if (!exerciseMap.has(exerciseName)) {
                            exerciseMap.set(exerciseName, []);
                        }
                        
                        // Find max weight for this session
                        let maxWeight = 0;
                        Object.values(sets).forEach(set => {
                            if (set.weight && set.weight > maxWeight) {
                                maxWeight = set.weight;
                            }
                        });
                        
                        if (maxWeight > 0) {
                            exerciseMap.get(exerciseName).push({
                                date: log.date,
                                weight: maxWeight,
                                sets: Object.keys(sets).length,
                                timestamp: log.timestamp
                            });
                        }
                    }
                });
            }
        });
        
        // Convert to array format
        return Array.from(exerciseMap.entries()).map(([name, data]) => ({
            name: name,
            data: data.sort((a, b) => new Date(a.date) - new Date(b.date)),
            sessions: data.length,
            maxWeight: Math.max(...data.map(d => d.weight))
        }));
    }

    getMeasurementProgressData() {
        const measurementHistory = JSON.parse(localStorage.getItem('ppl-measurement-history') || '{}');
        
        return Object.entries(measurementHistory)
            .filter(([name, data]) => data.length > 0)
            .map(([name, data]) => ({
                name: name,
                data: data.sort((a, b) => new Date(a.date) - new Date(b.date)),
                entries: data.length,
                latest: data[data.length - 1].value
            }));
    }

    showExerciseChart(exerciseName, data) {
        this.switchTab('exercise-chart');
        document.getElementById('exercise-chart-title').textContent = exerciseName;
        this.updateChartTimeline();
        this.drawChartWithReference(data, 'weight', exerciseName);
    }
    
    drawChartWithReference(data, valueKey, exerciseName) {
        // First draw the normal chart
        this.drawChart(data, valueKey);
        
        // Then add reference line overlay if exercise has a max
        const lastMaxData = exerciseName ? this.exerciseMaxes[exerciseName] : null;
        const lastMax = lastMaxData ? lastMaxData.oneRM : 0;
        if (lastMax > 0) {
            const canvas = document.getElementById('progress-chart');
            const ctx = canvas.getContext('2d');
            
            const padding = 40;
            const chartHeight = canvas.height / 2 - padding * 2;
            const values = data.map(d => parseFloat(d[valueKey]) || 0);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const valueRange = maxValue - minValue || 1;
            
            // Draw reference line (dashed)
            const refY = padding + chartHeight - ((lastMax - minValue) / valueRange) * chartHeight;
            ctx.strokeStyle = '#4A4A4A';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 4]);
            ctx.beginPath();
            ctx.moveTo(padding, refY);
            ctx.lineTo(padding + (canvas.width / 2 - padding * 2), refY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    showMeasurementChart(measurementName, data) {
        this.switchTab('exercise-chart');
        document.getElementById('exercise-chart-title').textContent = measurementName;
        this.updateChartTimeline();
        this.drawChart(data, 'value');
    }

    updateChartTimeline() {
        const timelineElement = document.querySelector('.chart-timeline');
        if (timelineElement) {
            const labels = this.getCurrentDateLabels();
            timelineElement.innerHTML = labels.map(label => `<span>${label}</span>`).join('');
        }
    }

    drawChart(data, valueKey) {
        const canvas = document.getElementById('progress-chart');
        const ctx = canvas.getContext('2d');
        const noDataMessage = document.getElementById('no-data-message');
        
        if (!data || data.length === 0) {
            canvas.style.display = 'none';
            noDataMessage.style.display = 'block';
            return;
        }
        
        canvas.style.display = 'block';
        noDataMessage.style.display = 'none';
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set canvas size
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = 300 * 2;
        ctx.scale(2, 2);
        
        const padding = 40;
        const chartWidth = canvas.width / 2 - padding * 2;
        const chartHeight = canvas.height / 2 - padding * 2;
        
        // Get value range
        const values = data.map(d => parseFloat(d[valueKey]) || 0);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        const valueRange = maxValue - minValue || 1;
        
        // Draw grid lines
        ctx.strokeStyle = '#4A4A4A';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        
        // Draw line
        if (data.length > 1) {
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            data.forEach((point, index) => {
                const x = padding + (chartWidth / (data.length - 1)) * index;
                const y = padding + chartHeight - ((parseFloat(point[valueKey]) - minValue) / valueRange) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Draw points
        ctx.fillStyle = '#E0E0E0';
        data.forEach((point, index) => {
            const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * index;
            const y = padding + chartHeight - ((parseFloat(point[valueKey]) - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    showWorkoutHistory() {
        const modal = document.getElementById('workout-history-modal');
        modal.style.display = 'flex';
        
        this.currentHistorySort = 'date';
        this.filteredHistory = [...this.logs];
        this.renderWorkoutHistoryCards();
        
        // Only setup handlers once
        if (!this.historyModalHandlersSetup) {
            this.setupHistoryModalHandlers();
            this.historyModalHandlersSetup = true;
        }
    }

    renderWorkoutHistoryCards(searchTerm = '') {
        const container = document.getElementById('workout-history-cards');
        
        if (this.logs.length === 0) {
            container.innerHTML = `
                <div class="history-empty-state">
                    <h3>No Workout History</h3>
                    <p>Complete your first workout to see your history here!</p>
                </div>
            `;
            return;
        }

        // Filter logs based on search term
        let filteredLogs = this.logs.filter(log => 
            log.workout.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.workoutType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.date.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Sort logs based on current sort option
        filteredLogs = this.sortWorkoutHistory(filteredLogs);

        container.innerHTML = filteredLogs.map(log => this.createWorkoutHistoryCard(log)).join('');
        
        // Add click handlers for cards
        container.querySelectorAll('.workout-history-card').forEach((card, index) => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('view-progress-link')) {
                    return; // Don't expand when clicking the link
                }
                this.toggleCardDetails(card, filteredLogs[index]);
            });
        });
    }

    createWorkoutHistoryCard(log) {
        const date = new Date(log.timestamp || log.date);
        const dateStr = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        });
        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        
        // Determine completion status
        const isCompleted = log.duration && log.duration > 0;
        const statusClass = isCompleted ? 'completed' : 'incomplete';
        
        // Get key metric (last max or total volume)
        const keyMetric = this.getKeyMetricForLog(log);
        
        // Generate mini trend
        const trendBars = this.generateMiniTrend(log);
        
        // Add week information to workout name
        const weekInfo = log.week ? ` – Week ${log.week}` : '';
        const workoutDisplayName = `${log.workout}${weekInfo}`;

        return `
            <div class="workout-history-card" data-log-id="${log.id}">
                <div class="history-card-header">
                    <div class="history-date-time">${dateStr}, ${timeStr}</div>
                    <div class="history-expand-arrow">➔</div>
                </div>
                
                <div class="history-workout-name">${workoutDisplayName}</div>
                
                <div class="history-status-row">
                    <div class="history-duration">${log.duration || 0}min</div>
                    <div class="history-status-dot ${statusClass}"></div>
                </div>
                
                <div class="history-key-metric">${keyMetric}</div>
                
                <div class="history-mini-trend">
                    ${trendBars}
                </div>
                
                <div class="history-card-details">
                    ${this.renderCardDetails(log)}
                </div>
            </div>
        `;
    }

    getKeyMetricForLog(log) {
        if (!log.exerciseData) return 'No exercise data';
        
        const exercises = Object.values(log.exerciseData);
        if (exercises.length === 0) return 'No exercises completed';
        
        // Try to find a significant lift (Bench Press, Squat, Deadlift, etc.)
        const mainLifts = ['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Row'];
        const mainLift = exercises.find(ex => 
            mainLifts.some(lift => ex.name?.toLowerCase().includes(lift.toLowerCase()))
        );
        
        if (mainLift && mainLift.sets && mainLift.sets.length > 0) {
            const heaviestSet = mainLift.sets.reduce((heaviest, set) => 
                (set.weight || 0) > (heaviest.weight || 0) ? set : heaviest
            );
            if (heaviestSet.weight) {
                return `Last Max: ${heaviestSet.weight} lbs (${mainLift.name})`;
            }
        }
        
        // Fallback to total volume
        let totalVolume = 0;
        exercises.forEach(exercise => {
            if (exercise.sets) {
                exercise.sets.forEach(set => {
                    if (set.weight && set.reps) {
                        totalVolume += (set.weight * set.reps);
                    }
                });
            }
        });
        
        return totalVolume > 0 ? `Total Volume: ${Math.round(totalVolume)} kg` : 'Workout completed';
    }

    generateMiniTrend(currentLog) {
        // Get last 5 workouts of the same type for trend
        const sameWorkouts = this.logs
            .filter(log => log.workoutType === currentLog.workoutType && log.duration)
            .slice(0, 5)
            .reverse(); // Reverse to show oldest to newest
        
        if (sameWorkouts.length < 2) {
            return '<div style="font-size: 12px; color: var(--text-secondary);">Not enough data</div>';
        }
        
        const maxDuration = Math.max(...sameWorkouts.map(log => log.duration));
        
        return sameWorkouts.map(log => {
            const height = Math.max(4, Math.round((log.duration / maxDuration) * 16));
            return `<div class="trend-bar" style="height: ${height}px;"></div>`;
        }).join('');
    }

    renderCardDetails(log) {
        if (!log.exerciseData) {
            return '<p style="color: var(--text-secondary); font-size: 14px;">No exercise details available</p>';
        }
        
        const exercises = Object.values(log.exerciseData);
        const exerciseBreakdowns = exercises.map(exercise => {
            const completedSets = exercise.sets ? exercise.sets.filter(set => set.weight && set.reps).length : 0;
            const totalSets = exercise.sets ? exercise.sets.length : 0;
            
            return `
                <div class="exercise-breakdown">
                    <h4>${exercise.name || 'Unknown Exercise'}</h4>
                    <div class="exercise-sets">
                        ${completedSets}/${totalSets} sets completed
                        ${exercise.sets && exercise.sets.length > 0 ? 
                            `<br>Best set: ${this.getBestSetForExercise(exercise.sets)}` : ''
                        }
                    </div>
                </div>
            `;
        }).join('');
        
        return `
            ${exerciseBreakdowns}
            <a href="#" class="view-progress-link" onclick="window.pplTracker.viewExerciseProgress(); return false;">
                View in Progress Tab
            </a>
        `;
    }

    getBestSetForExercise(sets) {
        if (!sets || sets.length === 0) return 'No sets';
        
        const validSets = sets.filter(set => set.weight && set.reps);
        if (validSets.length === 0) return 'No completed sets';
        
        const bestSet = validSets.reduce((best, set) => {
            const currentVolume = set.weight * set.reps;
            const bestVolume = best.weight * best.reps;
            return currentVolume > bestVolume ? set : best;
        });
        
        return `${bestSet.weight} lbs × ${bestSet.reps} reps`;
    }

    toggleCardDetails(card, log) {
        const details = card.querySelector('.history-card-details');
        const arrow = card.querySelector('.history-expand-arrow');
        
        if (details.classList.contains('expanded')) {
            details.classList.remove('expanded');
            arrow.textContent = '➔';
        } else {
            // Close all other expanded cards
            document.querySelectorAll('.history-card-details.expanded').forEach(otherDetails => {
                otherDetails.classList.remove('expanded');
                otherDetails.parentElement.querySelector('.history-expand-arrow').textContent = '➔';
            });
            
            details.classList.add('expanded');
            arrow.textContent = '▼';
        }
    }

    sortWorkoutHistory(logs) {
        switch (this.currentHistorySort) {
            case 'date':
                return logs.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
            case 'duration':
                return logs.sort((a, b) => (b.duration || 0) - (a.duration || 0));
            case 'workout':
                return logs.sort((a, b) => a.workout.localeCompare(b.workout));
            default:
                return logs;
        }
    }

    setupHistoryModalHandlers() {
        const modal = document.getElementById('workout-history-modal');
        const closeBtn = document.getElementById('close-history-modal');
        const searchInput = document.getElementById('history-search');
        const sortBtns = document.querySelectorAll('.sort-btn');
        
        // Close modal handlers
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Search handler
        searchInput.addEventListener('input', (e) => {
            this.renderWorkoutHistoryCards(e.target.value);
        });
        
        // Sort handlers
        sortBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active sort button
                sortBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update sort and re-render
                this.currentHistorySort = btn.dataset.sort;
                this.renderWorkoutHistoryCards(searchInput.value);
            });
        });
    }

    viewExerciseProgress() {
        // Close the history modal
        document.getElementById('workout-history-modal').style.display = 'none';
        // Switch to exercise progress tab
        this.switchTab('logs');
        setTimeout(() => this.switchTab('exercise-progress'), 100);
    }

    showWeekSelectionModal(workoutType) {
        this.selectedWorkoutType = workoutType;
        const workout = this.workoutData[workoutType];
        
        if (!workout) {
            console.error('Workout not found:', workoutType);
            return;
        }

        const modal = document.getElementById('week-selection-modal');
        const workoutTitle = document.getElementById('selected-workout-title');
        const phaseInfo = document.getElementById('selected-phase-info');
        const weekSelector = document.getElementById('week-selector');
        
        // Set workout information
        workoutTitle.textContent = this.cleanWorkoutName(workout.name || workout.title || workoutType);
        phaseInfo.textContent = `${workout.phase} - ${workout.description}` || 'Phase 1 - Base Hypertrophy';
        
        // Populate week selector based on workout phase
        this.populateWeekSelector(workout.phaseNumber || 1);
        
        // Get smart default week
        const smartWeek = this.getSmartDefaultWeek(workoutType);
        weekSelector.value = smartWeek.toString();
        
        // Show last week info if available
        this.updateLastWeekDisplay(workoutType, smartWeek);
        
        // Show modal
        modal.style.display = 'flex';
        
        // Setup modal handlers if not already done
        if (!this.weekModalHandlersSetup) {
            this.setupWeekModalHandlers();
            this.weekModalHandlersSetup = true;
        }
        
        // Validate initial selection
        this.validateWeekSelection(smartWeek, workoutType);
    }

    getSmartDefaultWeek(workoutType) {
        // Get workout history for this workout type
        const workoutHistory = this.logs.filter(log => 
            log.workoutType === workoutType || log.workout.includes(workoutType)
        );
        
        if (workoutHistory.length === 0) {
            return 1; // Default to Week 1 if no history
        }
        
        // Find the most recent workout
        const mostRecent = workoutHistory[0]; // logs are already sorted by date desc
        const lastWeek = mostRecent.week || 1;
        
        // Check if it was completed recently (within last 7 days)
        const lastWorkoutDate = new Date(mostRecent.timestamp || mostRecent.date);
        const daysSinceLastWorkout = Math.floor((Date.now() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastWorkout <= 7) {
            // If completed recently, suggest next week (max 6)
            return Math.min(lastWeek + 1, 6);
        } else {
            // If it's been a while, suggest same week
            return lastWeek;
        }
    }

    updateLastWeekDisplay(workoutType, currentWeek) {
        const lastWeekInfo = document.getElementById('last-week-info');
        const lastWeekValue = document.getElementById('last-week-value');
        
        // Find last completed workout of this type
        const lastWorkout = this.logs.find(log => 
            (log.workoutType === workoutType || log.workout.includes(workoutType)) && 
            log.duration > 0
        );
        
        if (lastWorkout) {
            const date = new Date(lastWorkout.timestamp || lastWorkout.date);
            const dateStr = date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            const week = lastWorkout.week || 1;
            
            lastWeekValue.textContent = `Week ${week} on ${dateStr}`;
            lastWeekInfo.style.display = 'block';
        } else {
            lastWeekInfo.style.display = 'none';
        }
    }

    validateWeekSelection(selectedWeek, workoutType) {
        const warning = document.getElementById('week-validation-warning');
        const adjustBtn = document.getElementById('adjust-week-btn');
        const proceedBtn = document.getElementById('proceed-anyway-btn');
        
        // Get expected next week
        const smartWeek = this.getSmartDefaultWeek(workoutType);
        const weekDifference = Math.abs(selectedWeek - smartWeek);
        
        if (weekDifference > 1 && smartWeek > 1) {
            // Show warning for significant week jumps
            warning.style.display = 'flex';
            
            adjustBtn.onclick = () => {
                document.getElementById('week-selector').value = smartWeek.toString();
                warning.style.display = 'none';
            };
            
            proceedBtn.onclick = () => {
                warning.style.display = 'none';
            };
        } else {
            warning.style.display = 'none';
        }
    }

    setupWeekModalHandlers() {
        const modal = document.getElementById('week-selection-modal');
        const startBtn = document.getElementById('start-selected-workout');
        const weekSelector = document.getElementById('week-selector');
        
        // Week selector change handler
        weekSelector.addEventListener('change', (e) => {
            const selectedWeek = parseInt(e.target.value);
            this.validateWeekSelection(selectedWeek, this.selectedWorkoutType);
        });
        
        // Start workout button
        startBtn.addEventListener('click', () => {
            const selectedWeek = parseInt(weekSelector.value);
            this.startWorkoutWithWeek(this.selectedWorkoutType, selectedWeek);
            modal.style.display = 'none';
        });
        
        // Close modal on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    startWorkoutWithWeek(workoutType, week) {
        console.log('Starting workout:', workoutType, 'Week:', week);
        
        // Store the selected week for this session
        this.currentWeek = week;
        this.currentWorkoutWeek = week;
        
        // Start the workout normally but with week context
        this.startWorkout(workoutType);
    }

    getPhaseInfoFromWeek(week) {
        if (!week) return '';
        
        if (week >= 1 && week <= 6) {
            return ' (Phase 1)';
        } else if (week >= 7 && week <= 10) {
            return ' (Phase 2)';
        } else if (week >= 11 && week <= 12) {
            return ' (Phase 3)';
        }
        return '';
    }

    getPhaseTextFromWeek(week) {
        if (!week) return '';
        
        if (week >= 1 && week <= 6) {
            return 'Phase 1: Base Hypertrophy';
        } else if (week >= 7 && week <= 10) {
            return 'Phase 2: Maximum Effort';
        } else if (week >= 11 && week <= 12) {
            return 'Phase 3: Supercompensation';
        }
        return '';
    }

    cleanWorkoutName(workoutName) {
        if (!workoutName) return '';
        
        // Remove redundant week/phase information from workout names
        return workoutName
            .replace(/\s*-\s*Week\s+\d+-\d+/i, '')                    // Remove "- Week 1-6"
            .replace(/\s*-\s*Phase\s+\d+\s*\([^)]+\)/i, '')           // Remove "- Phase 2 (Maximum Effort)"
            .replace(/\s*-\s*Phase\s+\d+\s+Week\s+\d+\s*\([^)]+\)/i, '') // Remove "- Phase 3 Week 1 (Supercompensation)"
            .trim();
    }

    populateWeekSelector(phaseNumber) {
        const weekSelector = document.getElementById('week-selector');
        if (!weekSelector) return;

        // Clear existing options
        weekSelector.innerHTML = '';

        // Define week ranges for each phase
        let startWeek, endWeek;
        switch (phaseNumber) {
            case 1:
                startWeek = 1;
                endWeek = 6;
                break;
            case 2:
                startWeek = 7;
                endWeek = 10;
                break;
            case 3:
                startWeek = 11;
                endWeek = 12;
                break;
            default:
                startWeek = 1;
                endWeek = 6;
        }

        // Populate with appropriate week options
        for (let week = startWeek; week <= endWeek; week++) {
            const option = document.createElement('option');
            option.value = week.toString();
            option.textContent = `Week ${week}`;
            weekSelector.appendChild(option);
        }
    }

    editMeasurement(item) {
        const measurementText = item.querySelector('.measurement-text').textContent;
        const currentValue = this.measurements[measurementText] || '';
        
        const newValue = prompt(`Enter ${measurementText}:`, currentValue);
        
        if (newValue !== null && newValue.trim() !== '') {
            // Update current display with new value
            const valueElement = item.querySelector('.measurement-value');
            valueElement.innerHTML = `<span class="measurement-display-value">${newValue}</span>
                <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>`;
            
            this.measurements[measurementText] = newValue;
            this.saveMeasurements();
            
            // Save to history for graphing
            this.saveMeasurementHistory(measurementText, newValue);
        }
    }

    saveMeasurementHistory(measurementName, value) {
        const history = JSON.parse(localStorage.getItem('ppl-measurement-history') || '{}');
        
        if (!history[measurementName]) {
            history[measurementName] = [];
        }
        
        const now = new Date();
        const todayDate = this.formatDateForStorage(now);
        
        history[measurementName].push({
            date: todayDate,
            value: value,
            timestamp: now.toISOString()
        });
        
        // Keep last 50 entries per measurement
        if (history[measurementName].length > 50) {
            history[measurementName] = history[measurementName].slice(-50);
        }
        
        localStorage.setItem('ppl-measurement-history', JSON.stringify(history));
    }

    handleSetting(item) {
        const settingText = item.querySelector('.setting-text').textContent;
        
        switch (settingText) {
            case 'Export Data':
                this.exportData();
                break;
            case 'Import Data':
                this.importData();
                break;
            case 'Clear All Data':
                this.clearAllData();
                break;
        }
    }


    logWorkout(workout) {
        const now = new Date();
        const log = {
            id: Date.now(),
            date: this.formatDateForStorage(now),
            workout: workout.name,
            workoutType: this.currentWorkoutType,
            exercises: workout.exercises.length,
            duration: Math.floor(Math.random() * 30) + 30, // Random duration 30-60 min
            timestamp: now.toISOString(),
            exerciseData: this.currentWorkoutSession?.exercises || {}
        };
        
        this.logs.unshift(log);
        this.saveLogs();
    }

    exportData() {
        const data = {
            measurements: this.measurements,
            logs: this.logs,
            settings: this.settings
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ppl-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('Data exported successfully!');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (data.measurements) this.measurements = data.measurements;
                    if (data.logs) this.logs = data.logs;
                    if (data.settings) this.settings = data.settings;
                    
                    this.saveAllData();
                    this.updateUI();
                    
                    alert('Data imported successfully!');
                } catch (error) {
                    alert('Error importing data. Please check file format.');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            this.measurements = {};
            this.logs = [];
            this.settings = this.getDefaultSettings();
            
            this.saveAllData();
            this.updateUI();
            
            alert('All data cleared successfully.');
        }
    }

    updateUI() {
        // Update measurement values
        document.querySelectorAll('.measurement-item').forEach(item => {
            const text = item.querySelector('.measurement-text').textContent;
            const value = this.measurements[text];
            const valueElement = item.querySelector('.measurement-value');
            
            if (value) {
                valueElement.innerHTML = `<span class="measurement-display-value">${value}</span>
                    <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>`;
            }
        });
    }

    // Data persistence
    loadMeasurements() {
        const saved = localStorage.getItem('ppl-measurements');
        return saved ? JSON.parse(saved) : {};
    }

    saveMeasurements() {
        localStorage.setItem('ppl-measurements', JSON.stringify(this.measurements));
    }

    loadLogs() {
        const saved = localStorage.getItem('ppl-logs');
        return saved ? JSON.parse(saved) : [];
    }

    saveLogs() {
        localStorage.setItem('ppl-logs', JSON.stringify(this.logs));
    }

    loadSettings() {
        const saved = localStorage.getItem('ppl-settings');
        return saved ? JSON.parse(saved) : this.getDefaultSettings();
    }

    saveSettings() {
        localStorage.setItem('ppl-settings', JSON.stringify(this.settings));
    }

    saveAllData() {
        this.saveMeasurements();
        this.saveLogs();
        this.saveSettings();
    }

    getDefaultSettings() {
        return {
            theme: 'light'
        };
    }

    formatDateForStorage(date) {
        // Use local date in YYYY-MM-DD format
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateForDisplay(date) {
        // Format for display in charts (M/D/YY format)
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = String(date.getFullYear()).slice(-2);
        return `${month}/${day}/${year}`;
    }

    getCurrentDateLabels() {
        const now = new Date();
        const dates = [];
        
        // Generate 4 date labels: 3 months ago, 2 months ago, 1 month ago, today
        for (let i = 3; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            
            if (i === 0) {
                dates.push('Today');
            } else {
                dates.push(this.formatDateForDisplay(date));
            }
        }
        
        return dates;
    }

    saveCurrentSession() {
        if (!this.currentWorkoutSession) {
            this.currentWorkoutSession = {
                workoutName: this.currentWorkout.name,
                workoutType: this.currentWorkoutType,
                startTime: this.workoutStartTime.toISOString(),
                week: this.currentWeek || 1,
                exercises: {}
            };
        }
        
        localStorage.setItem('currentWorkoutSession', JSON.stringify(this.currentWorkoutSession));
    }


    endSession() {
        const confirmed = confirm('Are you sure you want to end this workout session? This will save your progress and complete the workout.');
        
        if (confirmed) {
            this.showPostWorkoutSummary();
        }
    }
    
    showPostWorkoutSummary() {
        // Generate summary data
        const summaryData = this.generateWorkoutSummary();
        
        // Switch to post-workout summary screen
        this.switchTab('workout-summary');
        
        // Render the summary
        this.renderWorkoutSummary(summaryData);
    }
    
    generateWorkoutSummary() {
        const endTime = new Date();
        const duration = Math.round((endTime - this.workoutStartTime) / 60000); // minutes
        const avgRPE = this.calculateSessionRPE();
        
        const exerciseSummaries = [];
        
        // Process each exercise in session progress
        Object.entries(this.sessionProgress).forEach(([exerciseName, data]) => {
            const lastMaxData = this.exerciseMaxes[exerciseName];
            const lastMax = lastMaxData ? lastMaxData.oneRM : 0;
            const currentBest = data.bestSet.oneRM;
            
            const summary = {
                name: exerciseName,
                currentVolume: Math.round(data.totalVolume),
                lastMax: lastMax,
                lastMaxDetails: lastMaxData,
                currentBest: currentBest,
                comparison: currentBest - lastMax,
                percentChange: lastMax > 0 ? Math.round(((currentBest - lastMax) / lastMax) * 100) : 0,
                newMax: data.newMax || null
            };
            
            exerciseSummaries.push(summary);
        });
        
        return {
            workoutName: this.currentWorkout.name,
            date: endTime.toLocaleString(),
            duration: duration,
            avgRPE: avgRPE,
            exercises: exerciseSummaries,
            insights: this.generateInsights(exerciseSummaries)
        };
    }
    
    generateInsights(exerciseSummaries) {
        const insights = [];
        
        exerciseSummaries.forEach(exercise => {
            if (exercise.newMax) {
                if (exercise.comparison > 0) {
                    insights.push({
                        type: 'success',
                        message: `Impressive! Your ${exercise.name} max increased by ${exercise.comparison} lbs.`,
                        exercise: exercise.name
                    });
                }
            } else if (exercise.comparison > 0) {
                insights.push({
                    type: 'positive',
                    message: `Great performance on ${exercise.name} - approaching new max territory!`,
                    exercise: exercise.name
                });
            }
        });
        
        // Add general insights
        const newMaxes = exerciseSummaries.filter(e => e.newMax).length;
        if (newMaxes > 1) {
            insights.unshift({
                type: 'celebration',
                message: `Outstanding session! You set ${newMaxes} new personal records.`,
                exercise: null
            });
        }
        
        return insights;
    }
    
    renderWorkoutSummary(summaryData) {
        const summaryContainer = document.getElementById('workout-summary-content');
        if (!summaryContainer) return;
        
        const headerDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        
        let summaryHTML = `
            <div class="summary-header">
                <h1>Progress - ${summaryData.workoutName}</h1>
                <p class="summary-date">Completed ${headerDate}</p>
                <div class="red-line"></div>
            </div>
            
            <div class="session-metrics">
                <div class="metric-item">
                    <span class="metric-label">Duration</span>
                    <span class="metric-value">${Math.floor(summaryData.duration / 60)}:${(summaryData.duration % 60).toString().padStart(2, '0')}</span>
                </div>
                <div class="metric-item">
                    <span class="metric-label">Avg RPE</span>
                    <span class="metric-value">${summaryData.avgRPE || 'N/A'}</span>
                </div>
            </div>
            
            <div class="exercise-summaries">
                <h2>Exercise Performance</h2>
        `;
        
        summaryData.exercises.forEach(exercise => {
            const comparisonClass = exercise.comparison > 0 ? 'positive' : exercise.comparison < 0 ? 'negative' : 'neutral';
            const comparisonText = exercise.comparison > 0 ? `+${exercise.comparison} lbs` : 
                                   exercise.comparison < 0 ? `${exercise.comparison} lbs` : 'No Change';
            
            summaryHTML += `
                <div class="summary-card">
                    <div class="exercise-summary">
                        <h3>${exercise.name}</h3>
                        <div class="summary-stats">
                            <div class="stat-item">
                                <span class="stat-label">Current Volume</span>
                                <span class="stat-value">${exercise.currentVolume} lbs</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Last Max</span>
                                <span class="stat-value">${exercise.lastMax || 'N/A'} lbs</span>
                                ${exercise.lastMaxDetails ? `<span class="stat-details">(${exercise.lastMaxDetails.weight}×${exercise.lastMaxDetails.reps}, Set ${exercise.lastMaxDetails.setNumber || 'N/A'})</span>` : ''}
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Comparison</span>
                                <span class="stat-value ${comparisonClass}">${comparisonText}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        summaryHTML += `</div>`;
        
        // Add insights section
        if (summaryData.insights.length > 0) {
            summaryHTML += `
                <div class="insights-section">
                    <h2>Insights</h2>
            `;
            
            summaryData.insights.forEach(insight => {
                summaryHTML += `
                    <div class="insight-card ${insight.type}">
                        <p>${insight.message}</p>
                    </div>
                `;
            });
            
            summaryHTML += `</div>`;
        }
        
        // Add action buttons
        summaryHTML += `
            <div class="summary-actions">
                <button class="primary-btn" onclick="window.pplTracker.completeSummaryAndReturn()">Continue</button>
            </div>
        `;
        
        summaryContainer.innerHTML = summaryHTML;
    }
    
    completeSummaryAndReturn() {
        // Finish the workout processing
        this.finishWorkout();
        
        // Reset session progress for next workout
        this.sessionProgress = {};
        
        // Return to workouts tab
        this.switchTab('workouts');
    }

    finishWorkout() {
        if (!this.currentWorkoutSession) return;

        // Stop timer
        if (this.workoutTimerInterval) {
            clearInterval(this.workoutTimerInterval);
        }
        
        const endTime = new Date();
        const duration = Math.floor((endTime - this.workoutStartTime) / 60000);
        
        const workoutSession = {
            ...this.currentWorkoutSession,
            endTime: endTime.toISOString(),
            duration: duration,
            date: this.formatDateForStorage(endTime),
            completed: true
        };

        // Save to workout history
        this.saveWorkoutToHistory(workoutSession);
        
        // Clear current session
        this.currentWorkoutSession = null;
        this.isWorkoutActive = false;
        localStorage.removeItem('currentWorkoutSession');
        
        // Reset UI
        document.getElementById('start-workout').style.display = 'inline-block';
        document.getElementById('workout-timer').style.display = 'none';
        document.getElementById('end-session-header-btn').style.display = 'none';
        
        // Show completion message
        alert(`Workout completed!\n\nDuration: ${duration} minutes\nExercises completed: ${Object.keys(workoutSession.exercises).length}`);
        
        // Switch to logs tab
        this.switchTab('workouts');
    }

    saveWorkoutToHistory(session) {
        // Add week information to session
        session.week = this.currentWeek || 1;
        
        const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
        history.unshift(session);
        
        // Keep last 100 workouts
        if (history.length > 100) {
            history.splice(100);
        }
        
        localStorage.setItem('workoutHistory', JSON.stringify(history));
        
        // Also update logs array
        this.logs.unshift({
            id: session.startTime,
            date: session.date,
            workout: session.workoutName,
            workoutType: session.workoutType,
            exercises: Object.keys(session.exercises).length,
            duration: session.duration,
            timestamp: session.endTime,
            exerciseData: session.exercises,
            week: session.week
        });
        
        this.saveLogs();
    }

    // ===== NEW UX METHODS =====
    
    setupSwipeGestures() {
        const workoutCards = document.querySelectorAll('.workout-card');
        workoutCards.forEach(card => {
            let startX = 0;
            let currentX = 0;
            let isDragging = false;
            let hasHapticFeedback = false;

            // Touch events
            card.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                hasHapticFeedback = false;
                card.classList.add('touch-feedback');
            });

            card.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                
                currentX = e.touches[0].clientX;
                const diffX = currentX - startX;
                const threshold = 50;

                if (Math.abs(diffX) > threshold) {
                    e.preventDefault(); // Prevent scrolling
                    
                    if (diffX > threshold) {
                        // Swiping right - Start workout
                        card.classList.add('swiping-right');
                        card.classList.remove('swiping-left');
                        
                        if (!hasHapticFeedback) {
                            this.triggerHapticFeedback('light');
                            hasHapticFeedback = true;
                        }
                    } else if (diffX < -threshold) {
                        // Swiping left - Show actions
                        card.classList.add('swiping-left');
                        card.classList.remove('swiping-right');
                        
                        if (!hasHapticFeedback) {
                            this.triggerHapticFeedback('light');
                            hasHapticFeedback = true;
                        }
                    }
                }
            });

            card.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                
                const diffX = currentX - startX;
                const threshold = 100;
                
                card.classList.remove('touch-feedback');
                
                if (diffX > threshold) {
                    // Complete swipe right - Start workout
                    this.triggerHapticFeedback('medium');
                    const workoutType = card.dataset.workout;
                    this.showWeekSelectionModal(workoutType);
                } else if (diffX < -threshold) {
                    // Complete swipe left - Keep actions visible temporarily
                    this.triggerHapticFeedback('medium');
                    setTimeout(() => {
                        card.classList.remove('swiping-left');
                    }, 2000);
                } else {
                    // Not enough swipe distance - reset
                    card.classList.remove('swiping-right', 'swiping-left');
                }
                
                isDragging = false;
                startX = 0;
                currentX = 0;
            });

            // Mouse events for desktop testing
            card.addEventListener('mousedown', (e) => {
                startX = e.clientX;
                isDragging = true;
                hasHapticFeedback = false;
                card.classList.add('touch-feedback');
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                currentX = e.clientX;
                const diffX = currentX - startX;
                const threshold = 50;

                if (Math.abs(diffX) > threshold) {
                    if (diffX > threshold) {
                        card.classList.add('swiping-right');
                        card.classList.remove('swiping-left');
                    } else if (diffX < -threshold) {
                        card.classList.add('swiping-left');
                        card.classList.remove('swiping-right');
                    }
                }
            });

            document.addEventListener('mouseup', (e) => {
                if (!isDragging) return;
                
                const diffX = currentX - startX;
                const threshold = 100;
                
                card.classList.remove('touch-feedback');
                
                if (diffX > threshold) {
                    const workoutType = card.dataset.workout;
                    this.showWeekSelectionModal(workoutType);
                } else if (diffX < -threshold) {
                    setTimeout(() => {
                        card.classList.remove('swiping-left');
                    }, 2000);
                } else {
                    card.classList.remove('swiping-right', 'swiping-left');
                }
                
                isDragging = false;
                startX = 0;
                currentX = 0;
            });

            // Click event for tapping the card
            card.addEventListener('click', (e) => {
                // Only trigger if not swiping and clicking on the main content area
                if (!card.classList.contains('swiping-right') && 
                    !card.classList.contains('swiping-left') &&
                    !e.target.closest('.action-btn')) {
                    const workoutType = card.dataset.workout;
                    this.showWorkoutDetails(workoutType);
                }
            });
        });
    }

    triggerHapticFeedback(intensity = 'light') {
        if ('vibrate' in navigator) {
            switch (intensity) {
                case 'light':
                    navigator.vibrate(10);
                    break;
                case 'medium':
                    navigator.vibrate(25);
                    break;
                case 'heavy':
                    navigator.vibrate([25, 10, 25]);
                    break;
            }
        }
    }

    showWorkoutDetails(workoutType) {
        // Show workout details modal or navigate to workout detail screen
        console.log('Showing workout details for:', workoutType);
        
        // For now, just show the week selection modal
        this.showWeekSelectionModal(workoutType);
    }

    updateCurrentPhaseDisplay() {
        const currentPhaseTitle = document.getElementById('current-phase-title');
        const currentPhaseSubtitle = document.getElementById('current-phase-subtitle');
        const weekProgressText = document.getElementById('week-progress-text');
        const progressFill = document.querySelector('.progress-fill');

        if (currentPhaseTitle && currentPhaseSubtitle) {
            // Get current phase and week (this would be dynamic based on user progress)
            const currentWeek = this.getCurrentWeek();
            const phaseInfo = this.getPhaseInfo(currentWeek);
            
            currentPhaseTitle.textContent = 'Workout Plan';
            currentPhaseSubtitle.textContent = '';
            
            if (weekProgressText && progressFill) {
                const weekProgress = ((currentWeek - phaseInfo.startWeek) / (phaseInfo.endWeek - phaseInfo.startWeek)) * 100;
                weekProgressText.textContent = '';
                progressFill.style.width = '0%';
            }
        }
    }

    getCurrentWeek() {
        // This would normally be based on user's actual progress
        // For demo purposes, return week 3
        return 3;
    }

    getPhaseInfo(week) {
        if (week >= 1 && week <= 6) {
            return {
                name: 'Phase 1',
                description: 'Base Hypertrophy',
                intensity: 'Moderate Volume',
                startWeek: 1,
                endWeek: 6
            };
        } else if (week >= 7 && week <= 10) {
            return {
                name: 'Phase 2',
                description: 'Maximum Effort',
                intensity: 'Low Volume, High Intensity',
                startWeek: 7,
                endWeek: 10
            };
        } else if (week >= 11 && week <= 12) {
            return {
                name: 'Phase 3',
                description: 'Supercompensation',
                intensity: 'High Volume',
                startWeek: 11,
                endWeek: 12
            };
        }
        return {
            name: 'Phase 1',
            description: 'Base Hypertrophy',
            intensity: 'Moderate Volume',
            startWeek: 1,
            endWeek: 6
        };
    }

    showContinueWorkoutBanner() {
        const banner = document.getElementById('continue-workout-banner');
        const workoutName = document.getElementById('continue-workout-name');
        const workoutDetails = document.getElementById('continue-workout-details');
        
        if (this.currentWorkoutSession && banner) {
            const timeElapsed = Date.now() - new Date(this.currentWorkoutSession.startTime).getTime();
            const minutes = Math.floor(timeElapsed / (1000 * 60));
            
            workoutName.textContent = this.currentWorkoutSession.workoutName || 'Workout';
            workoutDetails.textContent = `Paused ${minutes} minutes ago`;
            banner.style.display = 'block';
        }
    }

    hideContinueWorkoutBanner() {
        const banner = document.getElementById('continue-workout-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    updateWorkoutCompletionStatus() {
        // Update last completed status for each workout card
        const workoutCards = document.querySelectorAll('.workout-card');
        workoutCards.forEach(card => {
            const workoutType = card.dataset.workout;
            const lastCompleted = card.querySelector('.last-completed');
            const completionText = card.querySelector('.completion-text');
            
            if (lastCompleted && completionText) {
                const lastSession = this.getLastCompletedSession(workoutType);
                if (lastSession) {
                    const date = new Date(lastSession.timestamp || lastSession.date);
                    const timeAgo = this.getTimeAgo(date);
                    completionText.textContent = `Last completed: ${timeAgo}`;
                    lastCompleted.style.display = 'block';
                } else {
                    lastCompleted.style.display = 'none';
                }
            }
        });
    }

    getLastCompletedSession(workoutType) {
        return this.logs.find(log => 
            (log.workoutType === workoutType || log.workout.toLowerCase().includes(workoutType)) && 
            log.duration > 0
        );
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        } else {
            const months = Math.floor(diffDays / 30);
            return months === 1 ? '1 month ago' : `${months} months ago`;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pplTracker = new PPLTracker();
    
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('SW registered');
            })
            .catch(function(error) {
                console.log('SW registration failed');
            });
    }
});