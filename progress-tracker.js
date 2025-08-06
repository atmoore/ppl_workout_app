// Ultimate PPL System - Progress Tracking and Analytics

class ProgressTracker {
    constructor() {
        this.chartInstances = {};
    }

    // Calculate and track key performance indicators
    calculateProgressMetrics(workoutHistory) {
        const metrics = {
            volumeProgression: this.calculateVolumeProgression(workoutHistory),
            strengthProgression: this.calculateStrengthProgression(workoutHistory),
            frequencyMetrics: this.calculateFrequencyMetrics(workoutHistory),
            rpeAnalysis: this.calculateRPEAnalysis(workoutHistory),
            exerciseSpecificProgress: this.calculateExerciseProgress(workoutHistory),
            weeklyComparison: this.calculateWeeklyComparison(workoutHistory)
        };

        return metrics;
    }

    // Track volume progression (sets × reps × weight) over time
    calculateVolumeProgression(history) {
        const volumeByDate = {};
        const volumeByExercise = {};

        history.forEach(session => {
            const date = session.date;
            let sessionVolume = 0;

            Object.entries(session.exercises).forEach(([exerciseIndex, sets]) => {
                const exerciseName = this.getExerciseNameFromSession(session, exerciseIndex);
                let exerciseVolume = 0;

                Object.values(sets).forEach(set => {
                    const volume = (set.weight || 0) * (set.reps || 0);
                    exerciseVolume += volume;
                    sessionVolume += volume;
                });

                // Track by exercise
                if (!volumeByExercise[exerciseName]) {
                    volumeByExercise[exerciseName] = [];
                }
                volumeByExercise[exerciseName].push({
                    date: date,
                    volume: exerciseVolume
                });
            });

            volumeByDate[date] = (volumeByDate[date] || 0) + sessionVolume;
        });

        return {
            totalVolumeByDate: volumeByDate,
            exerciseVolumeProgression: volumeByExercise,
            weeklyAverageVolume: this.calculateWeeklyAverages(volumeByDate),
            volumeTrend: this.calculateTrend(Object.values(volumeByDate))
        };
    }

    // Track strength progression (max weight lifted per exercise)
    calculateStrengthProgression(history) {
        const strengthByExercise = {};
        const personalRecords = {};

        history.forEach(session => {
            Object.entries(session.exercises).forEach(([exerciseIndex, sets]) => {
                const exerciseName = this.getExerciseNameFromSession(session, exerciseIndex);
                
                Object.values(sets).forEach(set => {
                    const weight = set.weight || 0;
                    if (weight > 0) {
                        // Track progression
                        if (!strengthByExercise[exerciseName]) {
                            strengthByExercise[exerciseName] = [];
                        }
                        strengthByExercise[exerciseName].push({
                            date: session.date,
                            weight: weight,
                            reps: set.reps || 0,
                            estimatedOneRM: this.calculateOneRepMax(weight, set.reps || 1)
                        });

                        // Track personal records
                        if (!personalRecords[exerciseName] || weight > personalRecords[exerciseName].weight) {
                            personalRecords[exerciseName] = {
                                weight: weight,
                                reps: set.reps || 0,
                                date: session.date,
                                estimatedOneRM: this.calculateOneRepMax(weight, set.reps || 1)
                            };
                        }
                    }
                });
            });
        });

        return {
            strengthProgression: strengthByExercise,
            personalRecords: personalRecords,
            strengthTrends: this.calculateStrengthTrends(strengthByExercise)
        };
    }

    // Calculate estimated 1RM using Epley formula
    calculateOneRepMax(weight, reps) {
        if (reps === 1) return weight;
        return Math.round(weight * (1 + reps / 30));
    }

    // Track workout frequency and consistency
    calculateFrequencyMetrics(history) {
        const workoutsByWeek = {};
        const workoutsByType = {};
        const streaks = this.calculateStreaks(history);

        history.forEach(session => {
            const date = new Date(session.date);
            const weekKey = this.getWeekKey(date);
            const workoutType = this.getWorkoutTypeFromName(session.workoutName);

            // Count by week
            workoutsByWeek[weekKey] = (workoutsByWeek[weekKey] || 0) + 1;

            // Count by type
            workoutsByType[workoutType] = (workoutsByType[workoutType] || 0) + 1;
        });

        return {
            workoutsByWeek: workoutsByWeek,
            workoutsByType: workoutsByType,
            currentStreak: streaks.current,
            longestStreak: streaks.longest,
            averageWeeklyFrequency: this.calculateAverageWeeklyFrequency(workoutsByWeek),
            consistency: this.calculateConsistency(history)
        };
    }

    // Analyze RPE patterns and fatigue management
    calculateRPEAnalysis(history) {
        const rpeByExercise = {};
        const rpeByWorkoutType = {};
        const rpeOverTime = [];

        history.forEach(session => {
            const workoutType = this.getWorkoutTypeFromName(session.workoutName);
            let sessionAvgRPE = 0;
            let totalSets = 0;

            Object.entries(session.exercises).forEach(([exerciseIndex, sets]) => {
                const exerciseName = this.getExerciseNameFromSession(session, exerciseIndex);
                let exerciseRPEs = [];

                Object.values(sets).forEach(set => {
                    if (set.rpe && set.rpe > 0) {
                        exerciseRPEs.push(set.rpe);
                        sessionAvgRPE += set.rpe;
                        totalSets++;
                    }
                });

                if (exerciseRPEs.length > 0) {
                    if (!rpeByExercise[exerciseName]) {
                        rpeByExercise[exerciseName] = [];
                    }
                    rpeByExercise[exerciseName].push({
                        date: session.date,
                        avgRPE: exerciseRPEs.reduce((a, b) => a + b, 0) / exerciseRPEs.length,
                        rpes: exerciseRPEs
                    });
                }
            });

            if (totalSets > 0) {
                sessionAvgRPE /= totalSets;
                rpeOverTime.push({
                    date: session.date,
                    avgRPE: sessionAvgRPE,
                    workoutType: workoutType
                });

                if (!rpeByWorkoutType[workoutType]) {
                    rpeByWorkoutType[workoutType] = [];
                }
                rpeByWorkoutType[workoutType].push(sessionAvgRPE);
            }
        });

        return {
            rpeByExercise: rpeByExercise,
            rpeByWorkoutType: rpeByWorkoutType,
            rpeOverTime: rpeOverTime,
            averageRPE: this.calculateOverallAverageRPE(rpeOverTime),
            fatigueIndicators: this.analyzeFatiguePatterns(rpeOverTime)
        };
    }

    // Calculate exercise-specific progress metrics
    calculateExerciseProgress(history) {
        const exerciseMetrics = {};

        // Key exercises to track closely
        const keyExercises = [
            'Bench Press', 'Squat', 'Deadlift', 'Pull-Up', 
            'Lat Pulldown', 'Leg Press', 'Standing Dumbbell Arnold Press'
        ];

        keyExercises.forEach(exerciseName => {
            const exerciseData = this.getExerciseDataFromHistory(history, exerciseName);
            
            if (exerciseData.length > 0) {
                exerciseMetrics[exerciseName] = {
                    totalSessions: exerciseData.length,
                    volumeProgression: this.calculateExerciseVolumeProgression(exerciseData),
                    strengthProgression: this.calculateExerciseStrengthProgression(exerciseData),
                    consistencyScore: this.calculateExerciseConsistency(exerciseData),
                    improvementRate: this.calculateImprovementRate(exerciseData),
                    lastPerformed: exerciseData[exerciseData.length - 1].date,
                    personalBest: this.getPersonalBest(exerciseData)
                };
            }
        });

        return exerciseMetrics;
    }

    // Compare current week performance to previous weeks
    calculateWeeklyComparison(history) {
        const weeklyData = {};
        
        history.forEach(session => {
            const weekKey = this.getWeekKey(new Date(session.date));
            
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = {
                    workoutCount: 0,
                    totalVolume: 0,
                    totalSets: 0,
                    avgRPE: 0,
                    rpeCount: 0,
                    exercises: new Set()
                };
            }

            const week = weeklyData[weekKey];
            week.workoutCount++;

            Object.entries(session.exercises).forEach(([exerciseIndex, sets]) => {
                const exerciseName = this.getExerciseNameFromSession(session, exerciseIndex);
                week.exercises.add(exerciseName);

                Object.values(sets).forEach(set => {
                    week.totalSets++;
                    week.totalVolume += (set.weight || 0) * (set.reps || 0);
                    
                    if (set.rpe && set.rpe > 0) {
                        week.avgRPE += set.rpe;
                        week.rpeCount++;
                    }
                });
            });
        });

        // Calculate averages
        Object.values(weeklyData).forEach(week => {
            week.avgRPE = week.rpeCount > 0 ? week.avgRPE / week.rpeCount : 0;
            week.exerciseCount = week.exercises.size;
            delete week.exercises; // Remove Set object for JSON serialization
        });

        return {
            weeklyData: weeklyData,
            currentWeekComparison: this.getCurrentWeekComparison(weeklyData),
            weeklyTrends: this.calculateWeeklyTrends(weeklyData)
        };
    }

    // Helper methods
    getExerciseNameFromSession(session, exerciseIndex) {
        // In a real implementation, you'd map exerciseIndex to exercise name
        // For now, return a placeholder
        return `Exercise ${exerciseIndex}`;
    }

    getWorkoutTypeFromName(workoutName) {
        if (workoutName.toLowerCase().includes('push')) return 'push';
        if (workoutName.toLowerCase().includes('pull')) return 'pull';
        if (workoutName.toLowerCase().includes('upper')) return 'upper';
        if (workoutName.toLowerCase().includes('lower')) return 'lower';
        if (workoutName.toLowerCase().includes('legs')) return 'legs';
        return 'unknown';
    }

    getWeekKey(date) {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${week}`;
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const n = values.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += values[i];
            sumXY += i * values[i];
            sumXX += i * i;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }

    calculateWeeklyAverages(dataByDate) {
        const weeklyData = {};
        
        Object.entries(dataByDate).forEach(([date, value]) => {
            const weekKey = this.getWeekKey(new Date(date));
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { total: 0, count: 0 };
            }
            weeklyData[weekKey].total += value;
            weeklyData[weekKey].count++;
        });

        const averages = {};
        Object.entries(weeklyData).forEach(([week, data]) => {
            averages[week] = data.total / data.count;
        });

        return averages;
    }

    calculateStreaks(history) {
        if (history.length === 0) return { current: 0, longest: 0 };

        const sortedDates = history
            .map(session => session.date)
            .sort()
            .filter((date, index, array) => array.indexOf(date) === index); // Remove duplicates

        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const daysDiff = (currDate - prevDate) / (1000 * 60 * 60 * 24);

            if (daysDiff <= 2) { // Allow for rest days
                tempStreak++;
            } else {
                longestStreak = Math.max(longestStreak, tempStreak);
                tempStreak = 1;
            }
        }

        longestStreak = Math.max(longestStreak, tempStreak);

        // Calculate current streak
        const today = new Date().toISOString().split('T')[0];
        const lastWorkoutDate = sortedDates[sortedDates.length - 1];
        const daysSinceLastWorkout = (new Date(today) - new Date(lastWorkoutDate)) / (1000 * 60 * 60 * 24);

        if (daysSinceLastWorkout <= 2) {
            currentStreak = tempStreak;
        }

        return { current: currentStreak, longest: longestStreak };
    }

    // Generate charts and visualizations
    createProgressChart(canvasId, data, chartType) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        // Clear existing chart
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
        }

        // Simple chart implementation (in a real app, you'd use Chart.js or similar)
        this.chartInstances[canvasId] = this.drawSimpleChart(ctx, data, chartType);
    }

    drawSimpleChart(ctx, data, chartType) {
        const { width, height } = ctx.canvas;
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        if (!data || data.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', width / 2, height / 2);
            return;
        }

        // Find min/max values
        const values = data.map(point => point.y);
        const minY = Math.min(...values);
        const maxY = Math.max(...values);
        const rangeY = maxY - minY || 1;

        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Draw data points and lines
        ctx.strokeStyle = '#667eea';
        ctx.fillStyle = '#667eea';
        ctx.lineWidth = 2;

        if (chartType === 'line') {
            ctx.beginPath();
            data.forEach((point, index) => {
                const x = padding + (index / (data.length - 1)) * chartWidth;
                const y = height - padding - ((point.y - minY) / rangeY) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();

            // Draw points
            data.forEach((point, index) => {
                const x = padding + (index / (data.length - 1)) * chartWidth;
                const y = height - padding - ((point.y - minY) / rangeY) * chartHeight;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
            });
        }

        return { destroy: () => ctx.clearRect(0, 0, width, height) };
    }

    // Export progress data
    exportProgressData(workoutHistory) {
        const progressMetrics = this.calculateProgressMetrics(workoutHistory);
        
        const exportData = {
            exportDate: new Date().toISOString(),
            totalWorkouts: workoutHistory.length,
            dateRange: {
                start: workoutHistory.length > 0 ? workoutHistory[workoutHistory.length - 1].date : null,
                end: workoutHistory.length > 0 ? workoutHistory[0].date : null
            },
            metrics: progressMetrics,
            summary: this.generateProgressSummary(progressMetrics)
        };

        return exportData;
    }

    generateProgressSummary(metrics) {
        return {
            volumeTrend: metrics.volumeProgression.volumeTrend > 0 ? 'Increasing' : 'Decreasing',
            mostImprovedExercise: this.findMostImprovedExercise(metrics.exerciseSpecificProgress),
            avgWeeklyWorkouts: Object.values(metrics.frequencyMetrics.workoutsByWeek).reduce((a, b) => a + b, 0) / Object.keys(metrics.frequencyMetrics.workoutsByWeek).length || 0,
            currentStreak: metrics.frequencyMetrics.currentStreak,
            personalRecords: Object.keys(metrics.strengthProgression.personalRecords).length
        };
    }

    findMostImprovedExercise(exerciseProgress) {
        let maxImprovement = 0;
        let mostImproved = null;

        Object.entries(exerciseProgress).forEach(([exercise, data]) => {
            if (data.improvementRate > maxImprovement) {
                maxImprovement = data.improvementRate;
                mostImproved = exercise;
            }
        });

        return mostImproved;
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTracker;
}