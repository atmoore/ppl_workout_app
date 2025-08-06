class PPLTracker {
    constructor() {
        this.currentTab = 'workouts';
        this.workoutData = null;
        this.measurements = this.loadMeasurements();
        this.logs = this.loadLogs();
        this.settings = this.loadSettings();
        
        this.init();
    }

    init() {
        this.updateTime();
        this.setupNavigation();
        this.setupEventListeners();
        this.loadWorkoutData();
        this.checkForSavedSession();
        setInterval(() => this.updateTime(), 1000);
    }

    checkForSavedSession() {
        const savedSession = localStorage.getItem('currentWorkoutSession');
        if (savedSession) {
            this.currentWorkoutSession = JSON.parse(savedSession);
            this.showResumeWorkoutOption();
        }
    }

    showResumeWorkoutOption() {
        const resumeMessage = `You have an unfinished workout:\n${this.currentWorkoutSession.workoutName}\n\nWould you like to resume it?`;
        
        if (confirm(resumeMessage)) {
            this.resumeWorkout();
        } else {
            // Clear the saved session if user doesn't want to resume
            localStorage.removeItem('currentWorkoutSession');
            this.currentWorkoutSession = null;
        }
    }

    resumeWorkout() {
        // Find the workout data
        const workoutType = this.currentWorkoutSession.workoutType;
        const workout = this.workoutData[workoutType];
        
        if (workout) {
            this.currentWorkout = workout;
            this.currentWorkoutType = workoutType;
            this.workoutStartTime = new Date(this.currentWorkoutSession.startTime);
            this.isWorkoutActive = true;
            
            // Switch to active workout
            this.switchTab('active-workout');
            document.getElementById('workout-title').textContent = workout.name;
            
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

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: false
        });
        
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = timeString;
        }
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

        this.currentTab = tabName;
    }

    setupEventListeners() {
        // Use event delegation for workout items
        document.addEventListener('click', (e) => {
            // Handle workout item clicks
            if (e.target.closest('.workout-item')) {
                const workoutItem = e.target.closest('.workout-item');
                const workoutType = workoutItem.dataset.workout;
                if (workoutType) {
                    console.log('Clicking workout:', workoutType);
                    this.startWorkout(workoutType);
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
            // Combine workouts from all phases
            this.workoutData = {
                ...WORKOUT_DATA.phase1.workouts,
                ...WORKOUT_DATA.phase3.week1.workouts,
                // Add phase 3 week 1 workouts with specific keys
                'push-p3w1': WORKOUT_DATA.phase3.week1.workouts.push,
                'pull-p3w1': WORKOUT_DATA.phase3.week1.workouts.pull,
                'legs-p3w1': WORKOUT_DATA.phase3.week1.workouts.legs,
                'upper-p3w1': WORKOUT_DATA.phase3.week1.workouts.upper,
                'lower-p3w1': WORKOUT_DATA.phase3.week1.workouts.lower,
                // Add phase 3 week 2 workouts with specific keys
                'push-p3w2': WORKOUT_DATA.phase3.week2.workouts.push,
                'pull-p3w2': WORKOUT_DATA.phase3.week2.workouts.pull,
                'legs-p3w2': WORKOUT_DATA.phase3.week2.workouts.legs,
                'upper-p3w2': WORKOUT_DATA.phase3.week2.workouts.upper,
                'lower-p3w2': WORKOUT_DATA.phase3.week2.workouts.lower
            };
        } else {
            console.error('WORKOUT_DATA not loaded');
            this.workoutData = {};
        }
    }

    startWorkout(workoutType) {
        const workout = this.workoutData[workoutType];
        if (workout) {
            this.currentWorkout = workout;
            this.currentWorkoutType = workoutType;
            
            // Switch to active workout tab
            this.switchTab('active-workout');
            
            // Update title
            document.getElementById('workout-title').textContent = workout.name;
            
            // Render exercises
            this.renderWorkoutExercises();
            
            // Set up start workout button
            const startBtn = document.getElementById('start-workout');
            startBtn.onclick = () => this.beginWorkout();
        }
    }

    renderWorkoutExercises() {
        const exerciseList = document.getElementById('exercise-list');
        exerciseList.innerHTML = '';
        
        this.currentWorkout.exercises.forEach((exercise, index) => {
            const exerciseDiv = document.createElement('div');
            exerciseDiv.className = 'exercise-card';
            exerciseDiv.innerHTML = `
                <div class="exercise-header">
                    <h3>${exercise.name}</h3>
                    <button class="info-btn" onclick="window.pplTracker.showExerciseInfo(${index})">i</button>
                </div>
                <div class="exercise-details">
                    <div class="detail-item">
                        <span class="label">Sets:</span>
                        <span class="value">${exercise.warmup_sets ? `${exercise.warmup_sets} warmup + ` : ''}${exercise.working_sets} working</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Reps:</span>
                        <span class="value">${exercise.reps}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">RPE:</span>
                        <span class="value">${exercise.rpe}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Rest:</span>
                        <span class="value">${exercise.rest}</span>
                    </div>
                </div>
                <div class="exercise-sets" id="exercise-${index}-sets">
                    <!-- Sets will be added here when workout starts -->
                </div>
            `;
            exerciseList.appendChild(exerciseDiv);
        });
    }

    beginWorkout() {
        this.workoutStartTime = new Date();
        this.isWorkoutActive = true;
        
        // Update UI
        const startBtn = document.getElementById('start-workout');
        startBtn.style.display = 'none';
        
        const timer = document.getElementById('workout-timer');
        timer.style.display = 'block';
        
        const endSessionBtn = document.getElementById('end-session-header-btn');
        endSessionBtn.style.display = 'block';
        
        // Start timer
        this.startWorkoutTimer();
        
        // Add sets for each exercise
        this.currentWorkout.exercises.forEach((exercise, exerciseIndex) => {
            this.addSetsForExercise(exercise, exerciseIndex);
        });
        
        // Save initial session state
        this.saveCurrentSession();
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
    }

    parseSetCount(setString) {
        if (!setString || setString === 0) return 0;
        const match = String(setString).match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    onSetComplete(exerciseIndex, setIndex, isComplete, setType) {
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
            
            // Start rest timer if it's a working set and has rest time
            if (setType === 'working') {
                const exercise = this.currentWorkout.exercises[exerciseIndex];
                if (exercise.rest && exercise.rest !== '0 min') {
                    this.startRestTimer(exercise.rest);
                }
            }
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
                document.getElementById('elapsed-time').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    showExerciseInfo(exerciseIndex) {
        const exercise = this.currentWorkout.exercises[exerciseIndex];
        let info = `${exercise.name}\n\n`;
        info += `${exercise.coaching_notes}\n\n`;
        info += `Substitutions:\n`;
        info += `1. ${exercise.substitution_option_1}\n`;
        info += `2. ${exercise.substitution_option_2}`;
        
        alert(info);
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
        this.drawChart(data, 'weight');
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
        ctx.strokeStyle = '#e8e8e8';
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
            ctx.strokeStyle = '#007AFF';
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
        ctx.fillStyle = '#007AFF';
        data.forEach((point, index) => {
            const x = padding + (chartWidth / Math.max(data.length - 1, 1)) * index;
            const y = padding + chartHeight - ((parseFloat(point[valueKey]) - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    showWorkoutHistory() {
        let content = 'Workout History\n\n';
        
        if (this.logs.length === 0) {
            content += 'No workout history yet. Complete your first workout!';
        } else {
            content += this.logs.slice(0, 10).map(log => 
                `${log.date}: ${log.workout} (${log.duration}min)`
            ).join('\n');
        }
        
        alert(content);
    }

    editMeasurement(item) {
        const measurementText = item.querySelector('.measurement-text').textContent;
        const currentValue = item.querySelector('.measurement-value').textContent;
        
        const newValue = prompt(`Enter ${measurementText}:`, currentValue === '-' ? '' : currentValue);
        
        if (newValue !== null && newValue.trim() !== '') {
            // Update current display
            item.querySelector('.measurement-value').textContent = newValue;
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
            case 'Units':
                this.toggleUnits(item);
                break;
            case 'Default Rest Timer':
                this.changeRestTimer(item);
                break;
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

    toggleUnits(item) {
        const currentUnit = item.querySelector('.setting-value').textContent;
        const newUnit = currentUnit === 'Imperial' ? 'Metric' : 'Imperial';
        item.querySelector('.setting-value').textContent = newUnit;
        this.settings.units = newUnit;
        this.saveSettings();
    }

    changeRestTimer(item) {
        const times = ['1:30', '2:00', '3:00', '4:00'];
        const current = item.querySelector('.setting-value').textContent;
        const currentIndex = times.indexOf(current);
        const newIndex = (currentIndex + 1) % times.length;
        const newTime = times[newIndex];
        
        item.querySelector('.setting-value').textContent = newTime;
        this.settings.restTimer = newTime;
        this.saveSettings();
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
            const value = this.measurements[text] || '-';
            item.querySelector('.measurement-value').textContent = value;
        });

        // Update settings values
        const unitsItem = document.querySelector('.setting-item .setting-text:contains("Units")');
        if (unitsItem) {
            unitsItem.parentElement.querySelector('.setting-value').textContent = this.settings.units || 'Imperial';
        }
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
            units: 'Imperial',
            restTimer: '2:00',
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
                exercises: {}
            };
        }
        
        localStorage.setItem('currentWorkoutSession', JSON.stringify(this.currentWorkoutSession));
    }


    endSession() {
        const confirmed = confirm('Are you sure you want to end this workout session? This will save your progress and complete the workout.');
        
        if (confirmed) {
            this.finishWorkout();
        }
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
            exerciseData: session.exercises
        });
        
        this.saveLogs();
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