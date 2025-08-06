# Ultimate PPL Tracker

A Progressive Web App (PWA) for tracking Push/Pull/Legs workouts, measurements, and fitness progress.

## Features

- ✅ **Workout Tracking**: Complete PPL workout routines with exercise details
- ✅ **Progress Charts**: Visual progress tracking for exercises and measurements  
- ✅ **Session Management**: Save and resume workout sessions
- ✅ **Workout Sharing**: Share workouts via text message
- ✅ **Offline Support**: Works without internet connection
- ✅ **Installable**: Add to home screen as native app

## Installation as PWA

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to install

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (3 dots)
3. Tap "Add to Home screen"
4. Tap "Add" to install

## Hosting Options

### Option 1: GitHub Pages (Free)
1. Create GitHub repository
2. Upload all files
3. Enable GitHub Pages in repository settings
4. Access via: https://yourusername.github.io/repository-name

### Option 2: Netlify (Free)
1. Go to netlify.com
2. Drag & drop the entire folder
3. Get instant URL

### Option 3: Local Network
```bash
cd /Users/austinmoore/Desktop/ultimate-ppl-tracker
python -m http.server 8000
# Then access from phone using your computer's IP:8000
```

## Files Structure

- index.html - Main app interface
- styles.css - App styling (dark theme with blue accents)
- app.js - Core app functionality
- workout-data.js - PPL workout exercise data
- manifest.json - PWA configuration
- sw.js - Service worker for offline support
- icon-*.png - App icons for installation

## Workout Data

Includes complete Ultimate PPL System Week 1:
- **Push #1**: Chest, Shoulders, Triceps (8 exercises)
- **Pull #1**: Back, Biceps (8 exercises)  
- **Legs #1**: Squats, RDLs, Accessories (7 exercises)
- **Upper #1**: Full Upper Body (6 exercises)
- **Lower #1**: Legs, Glutes, Posterior Chain (7 exercises)

Each exercise includes sets, reps, RPE, rest periods, and coaching notes.