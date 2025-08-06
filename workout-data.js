// Ultimate PPL System - Workout Data
const WORKOUT_DATA = {
  "phase1": {
    "week": 1,
    "workouts": {
      "push": {
        "name": "Push #1 - Week 1",
        "exercises": [
          {
            "name": "Bench Press",
            "warmup_sets": "3-4",
            "working_sets": 1,
            "reps": "3-5",
            "load": "",
            "rpe": "8-9",
            "rest": "~3-4 min",
            "substitution_option_1": "DB Bench Press",
            "substitution_option_2": "Machine Chest Press",
            "coaching_notes": "Set up a comfortable arch, quick pause on the chest and explode up on each rep.",
            "youtube_link": null
          },
          {
            "name": "Larsen Press",
            "warmup_sets": 0,
            "working_sets": 2,
            "reps": 10,
            "load": "",
            "rpe": "8-9",
            "rest": "~3-4 min",
            "substitution_option_1": "DB Bench Press (No Leg Drive)",
            "substitution_option_2": "Machine Chest Press (No Leg Drive)",
            "coaching_notes": "Shoulder blades still retracted and depressed. Slight arch in upper back. Zero leg drive.",
            "youtube_link": null
          },
          {
            "name": "Standing Dumbbell Arnold Press",
            "warmup_sets": 2,
            "working_sets": 3,
            "reps": "8-10",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Seated DB Shoulder Press",
            "substitution_option_2": "Machine Shoulder Press",
            "coaching_notes": "Start with your elbows in front of you and palms facing in. Rotate the dumbbells so that your palms face forward as you press.",
            "youtube_link": null
          },
          {
            "name": "A1. Press-Around",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "12-15",
            "load": "",
            "rpe": "8-9",
            "rest": "Superset",
            "substitution_option_1": "Seated DB Press Around",
            "substitution_option_2": "Machine Press Around",
            "coaching_notes": "Press up and bring the weight around to the front of your body in a semi circle. Back to starting position and repeat.",
            "youtube_link": null
          },
          {
            "name": "A2. Rear Delt Fly",
            "warmup_sets": 0,
            "working_sets": 3,
            "reps": "12-15",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Cable Rear Delt Fly",
            "substitution_option_2": "Machine Rear Delt Fly",
            "coaching_notes": "Keep your chest up and pull your shoulder blades back. Squeeze your rear delts at the top.",
            "youtube_link": null
          },
          {
            "name": "Close Grip Bench Press",
            "warmup_sets": 2,
            "working_sets": 3,
            "reps": "8-10",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Close Grip DB Press",
            "substitution_option_2": "Dips",
            "coaching_notes": "Hands about shoulder width apart. Keep your elbows closer to your body than regular bench.",
            "youtube_link": null
          },
          {
            "name": "Tricep Rope Pushdown",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "12-15",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Overhead Tricep Extension",
            "substitution_option_2": "Tricep Dips",
            "coaching_notes": "Pull the rope apart at the bottom and squeeze your triceps. Don't let your elbows flare out.",
            "youtube_link": null
          }
        ]
      },
      "pull": {
        "name": "Pull #1 - Week 1",
        "exercises": [
          {
            "name": "Deadlift",
            "warmup_sets": "3-4",
            "working_sets": 1,
            "reps": "3-5",
            "load": "",
            "rpe": "8-9",
            "rest": "~3-4 min",
            "substitution_option_1": "Sumo Deadlift",
            "substitution_option_2": "Trap Bar Deadlift",
            "coaching_notes": "Keep the bar close to your body, push the floor away with your feet, drive your hips forward.",
            "youtube_link": null
          },
          {
            "name": "Barbell Row",
            "warmup_sets": 2,
            "working_sets": 3,
            "reps": "8-10",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Dumbbell Row",
            "substitution_option_2": "Cable Row",
            "coaching_notes": "Pull to your lower chest/upper stomach. Keep your chest up and squeeze your shoulder blades.",
            "youtube_link": null
          },
          {
            "name": "Pull-ups/Chin-ups",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "6-10",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Assisted Pull-ups",
            "substitution_option_2": "Lat Pulldown",
            "coaching_notes": "Pull your chest to the bar, don't just focus on getting your chin over. Control the negative.",
            "youtube_link": null
          },
          {
            "name": "Cable Row",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "10-12",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Machine Row",
            "substitution_option_2": "T-Bar Row",
            "coaching_notes": "Pull to your lower chest, squeeze your shoulder blades together at the back.",
            "youtube_link": null
          },
          {
            "name": "Face Pulls",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "15-20",
            "load": "",
            "rpe": "8-9",
            "rest": "~1-2 min",
            "substitution_option_1": "Band Face Pulls",
            "substitution_option_2": "Reverse Fly",
            "coaching_notes": "Pull the rope towards your face, separate your hands and squeeze your rear delts.",
            "youtube_link": null
          },
          {
            "name": "Barbell Curl",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "10-12",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Dumbbell Curl",
            "substitution_option_2": "Cable Curl",
            "coaching_notes": "Don't swing your body, keep your elbows in place and squeeze your biceps at the top.",
            "youtube_link": null
          },
          {
            "name": "Hammer Curl",
            "warmup_sets": 0,
            "working_sets": 3,
            "reps": "12-15",
            "load": "",
            "rpe": "8-9",
            "rest": "~1-2 min",
            "substitution_option_1": "Cable Hammer Curl",
            "substitution_option_2": "Rope Hammer Curl",
            "coaching_notes": "Keep your palms facing each other throughout the movement. Focus on your biceps and forearms.",
            "youtube_link": null
          }
        ]
      },
      "legs": {
        "name": "Legs #1 - Week 1",
        "exercises": [
          {
            "name": "Squat",
            "warmup_sets": "3-4",
            "working_sets": 1,
            "reps": "3-5",
            "load": "",
            "rpe": "8-9",
            "rest": "~3-4 min",
            "substitution_option_1": "Front Squat",
            "substitution_option_2": "Leg Press",
            "coaching_notes": "Descend until your hip crease is below your knee cap. Drive through your heels to stand up.",
            "youtube_link": null
          },
          {
            "name": "Romanian Deadlift",
            "warmup_sets": 2,
            "working_sets": 3,
            "reps": "8-10",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Dumbbell RDL",
            "substitution_option_2": "Good Morning",
            "coaching_notes": "Push your hips back and feel a stretch in your hamstrings. Keep the bar close to your legs.",
            "youtube_link": null
          },
          {
            "name": "Bulgarian Split Squat",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "10-12 each leg",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Reverse Lunge",
            "substitution_option_2": "Walking Lunge",
            "coaching_notes": "Most of your weight on your front leg. Descend straight down, don't lean forward.",
            "youtube_link": null
          },
          {
            "name": "Leg Curl",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "12-15",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Nordic Curl",
            "substitution_option_2": "Good Morning",
            "coaching_notes": "Squeeze your hamstrings and control the negative portion of the rep.",
            "youtube_link": null
          },
          {
            "name": "Calf Raise",
            "warmup_sets": 1,
            "working_sets": 4,
            "reps": "15-20",
            "load": "",
            "rpe": "8-9",
            "rest": "~1-2 min",
            "substitution_option_1": "Standing Calf Raise",
            "substitution_option_2": "Leg Press Toe Press",
            "coaching_notes": "Press all the way up to your toes, stretch your calves at the bottom, don't bounce",
            "youtube_link": null
          },
          {
            "name": "Corpse Crunch",
            "warmup_sets": 0,
            "working_sets": 3,
            "reps": 20,
            "load": "",
            "rpe": "10",
            "rest": "~1-2 min",
            "substitution_option_1": "Plate-Weighted Crunch",
            "substitution_option_2": "Cable Crunch",
            "coaching_notes": "Clear your upper back off the floor when you crunch, hold for 1-2 seconds and then go back down. Don't yank with your neck.",
            "youtube_link": null
          }
        ]
      },
      "upper": {
        "name": "Upper #1 - Week 1",
        "exercises": [
          {
            "name": "Incline Dumbbell Press",
            "warmup_sets": "2-3",
            "working_sets": 3,
            "reps": "8-10",
            "load": "",
            "rpe": "8-9",
            "rest": "~3-4 min",
            "substitution_option_1": "Incline Barbell Press",
            "substitution_option_2": "Machine Incline Press",
            "coaching_notes": "Set the bench to about 30-45 degrees. Press up and slightly back.",
            "youtube_link": null
          },
          {
            "name": "Cable Row",
            "warmup_sets": 2,
            "working_sets": 3,
            "reps": "8-10",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Barbell Row",
            "substitution_option_2": "T-Bar Row",
            "coaching_notes": "Pull to your lower chest, squeeze your shoulder blades together.",
            "youtube_link": null
          },
          {
            "name": "Dumbbell Shoulder Press",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "10-12",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Barbell Press",
            "substitution_option_2": "Machine Press",
            "coaching_notes": "Press straight up, don't let the dumbbells drift forward.",
            "youtube_link": null
          },
          {
            "name": "Lat Pulldown",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "10-12",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Pull-ups",
            "substitution_option_2": "Cable Pulldown",
            "coaching_notes": "Pull the bar to your upper chest, lean back slightly and squeeze your lats.",
            "youtube_link": null
          },
          {
            "name": "Dips",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "8-12",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Close Grip Bench Press",
            "substitution_option_2": "Tricep Pushdown",
            "coaching_notes": "Descend until you feel a stretch in your chest. Keep your body upright.",
            "youtube_link": null
          },
          {
            "name": "Barbell Curl",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "10-12",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Dumbbell Curl",
            "substitution_option_2": "Cable Curl",
            "coaching_notes": "Don't swing your body, squeeze your biceps at the top.",
            "youtube_link": null
          }
        ]
      },
      "lower": {
        "name": "Lower #1 - Week 1",
        "exercises": [
          {
            "name": "Front Squat",
            "warmup_sets": "3-4",
            "working_sets": 3,
            "reps": "6-8",
            "load": "",
            "rpe": "8-9",
            "rest": "~3-4 min",
            "substitution_option_1": "Goblet Squat",
            "substitution_option_2": "Back Squat",
            "coaching_notes": "Keep your chest up and elbows high. The bar rests on your front delts.",
            "youtube_link": null
          },
          {
            "name": "Stiff Leg Deadlift",
            "warmup_sets": 2,
            "working_sets": 3,
            "reps": "8-10",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Romanian Deadlift",
            "substitution_option_2": "Good Morning",
            "coaching_notes": "Keep your legs fairly straight and feel the stretch in your hamstrings.",
            "youtube_link": null
          },
          {
            "name": "Walking Lunge",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "12-15 each leg",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Reverse Lunge",
            "substitution_option_2": "Bulgarian Split Squat",
            "coaching_notes": "Take a big step forward, drop your back knee down. Push off your front foot to the next rep.",
            "youtube_link": null
          },
          {
            "name": "Leg Extension",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "12-15",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Goblet Squat",
            "substitution_option_2": "Jump Squat",
            "coaching_notes": "Squeeze your quads at the top and control the negative.",
            "youtube_link": null
          },
          {
            "name": "Leg Curl",
            "warmup_sets": 1,
            "working_sets": 3,
            "reps": "12-15",
            "load": "",
            "rpe": "8-9",
            "rest": "~2-3 min",
            "substitution_option_1": "Nordic Curl",
            "substitution_option_2": "Good Morning",
            "coaching_notes": "Squeeze your hamstrings and control the negative.",
            "youtube_link": null
          },
          {
            "name": "Calf Raise",
            "warmup_sets": 1,
            "working_sets": 4,
            "reps": "15-20",
            "load": "",
            "rpe": "8-9",
            "rest": "~1-2 min",
            "substitution_option_1": "Seated Calf Raise",
            "substitution_option_2": "Leg Press Calf Raise",
            "coaching_notes": "Full range of motion, pause at the top and stretch at the bottom.",
            "youtube_link": null
          }
        ]
      }
    }
  },
  "phase3": {
    "week1": {
      "workouts": {
        "push": {
          "name": "Push - Phase 3 Week 1 (Supercompensation)",
          "exercises": [
            {
              "name": "Bench Press",
              "warmup_sets": "3-4",
              "working_sets": 1,
              "reps": "3-5",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "DB Bench Press",
              "substitution_option_2": "Machine Chest Press",
              "coaching_notes": "Set up a comfortable arch, quick pause on the chest and explode up on each rep.",
              "youtube_link": null
            },
            {
              "name": "Incline Dumbbell Press",
              "warmup_sets": 2,
              "working_sets": 3,
              "reps": "6-8",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "Incline Barbell Press",
              "substitution_option_2": "Machine Incline Press",
              "coaching_notes": "Set the bench to about 30-45 degrees. Press up and slightly back towards your head.",
              "youtube_link": null
            },
            {
              "name": "Dumbbell Flyes",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "10-12",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Cable Flyes",
              "substitution_option_2": "Pec Dec",
              "coaching_notes": "Feel a deep stretch in your chest at the bottom, bring your hands together at the top.",
              "youtube_link": null
            },
            {
              "name": "Dumbbell Shoulder Press",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "8-10",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Barbell Press",
              "substitution_option_2": "Machine Press",
              "coaching_notes": "Press straight up, don't let the dumbbells drift forward or behind you.",
              "youtube_link": null
            },
            {
              "name": "Lateral Raises",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "12-15",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Cable Lateral Raise",
              "substitution_option_2": "Machine Lateral Raise",
              "coaching_notes": "Raise the weights out to your sides until your arms are parallel to the floor.",
              "youtube_link": null
            },
            {
              "name": "Rear Delt Flyes",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "15-20",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Cable Rear Delt Flyes",
              "substitution_option_2": "Machine Rear Delt Flyes",
              "coaching_notes": "Keep your chest up and pull your shoulder blades back. Squeeze your rear delts at the top.",
              "youtube_link": null
            },
            {
              "name": "Close Grip Bench Press",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "8-10",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Close Grip DB Press",
              "substitution_option_2": "Dips",
              "coaching_notes": "Hands about shoulder width apart. Keep your elbows closer to your body than regular bench.",
              "youtube_link": null
            },
            {
              "name": "Tricep Rope Pushdown",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "12-15",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Overhead Tricep Extension",
              "substitution_option_2": "Tricep Dips",
              "coaching_notes": "Pull the rope apart at the bottom and squeeze your triceps. Don't let your elbows flare out.",
              "youtube_link": null
            },
            {
              "name": "Overhead Tricep Extension",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "10-12",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Skull Crushers",
              "substitution_option_2": "Tricep Pushdown",
              "coaching_notes": "Keep your elbows pointing forward and only move your forearms.",
              "youtube_link": null
            }
          ]
        },
        "pull": {
          "name": "Pull - Phase 3 Week 1 (Supercompensation)",
          "exercises": [
            {
              "name": "Deadlift",
              "warmup_sets": "3-4",
              "working_sets": 1,
              "reps": "3-5",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "Sumo Deadlift",
              "substitution_option_2": "Trap Bar Deadlift",
              "coaching_notes": "Keep the bar close to your body, push the floor away with your feet, drive your hips forward.",
              "youtube_link": null
            },
            {
              "name": "Barbell Rows",
              "warmup_sets": 2,
              "working_sets": 4,
              "reps": "6-8",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "Dumbbell Rows",
              "substitution_option_2": "Cable Rows",
              "coaching_notes": "Pull to your lower chest/upper stomach. Keep your chest up and squeeze your shoulder blades.",
              "youtube_link": null
            },
            {
              "name": "Pull-ups/Chin-ups",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "6-10",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Assisted Pull-ups",
              "substitution_option_2": "Lat Pulldown",
              "coaching_notes": "Pull your chest to the bar, don't just focus on getting your chin over. Control the negative.",
              "youtube_link": null
            },
            {
              "name": "Cable Rows",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "8-10",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Machine Rows",
              "substitution_option_2": "T-Bar Rows",
              "coaching_notes": "Pull to your lower chest, squeeze your shoulder blades together at the back.",
              "youtube_link": null
            },
            {
              "name": "Lat Pulldown",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "10-12",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Wide Grip Pull-ups",
              "substitution_option_2": "Cable Pulldown",
              "coaching_notes": "Pull the bar to your upper chest, lean back slightly and squeeze your lats.",
              "youtube_link": null
            },
            {
              "name": "Face Pulls",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "15-20",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Band Face Pulls",
              "substitution_option_2": "Reverse Flyes",
              "coaching_notes": "Pull the rope towards your face, separate your hands and squeeze your rear delts.",
              "youtube_link": null
            },
            {
              "name": "Barbell Curls",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "8-10",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Dumbbell Curls",
              "substitution_option_2": "Cable Curls",
              "coaching_notes": "Don't swing your body, keep your elbows in place and squeeze your biceps at the top.",
              "youtube_link": null
            },
            {
              "name": "Hammer Curls",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "10-12",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Cable Hammer Curls",
              "substitution_option_2": "Rope Hammer Curls",
              "coaching_notes": "Keep your palms facing each other throughout the movement. Focus on your biceps and forearms.",
              "youtube_link": null
            },
            {
              "name": "Cable Curls",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "12-15",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Preacher Curls",
              "substitution_option_2": "Concentration Curls",
              "coaching_notes": "Keep constant tension on your biceps throughout the entire range of motion.",
              "youtube_link": null
            }
          ]
        },
        "legs": {
          "name": "Legs - Phase 3 Week 1 (Supercompensation)",
          "exercises": [
            {
              "name": "Squat",
              "warmup_sets": "3-4",
              "working_sets": 1,
              "reps": "3-5",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "Front Squat",
              "substitution_option_2": "Leg Press",
              "coaching_notes": "Descend until your hip crease is below your knee cap. Drive through your heels to stand up.",
              "youtube_link": null
            },
            {
              "name": "Romanian Deadlifts",
              "warmup_sets": 2,
              "working_sets": 4,
              "reps": "6-8",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "Dumbbell RDLs",
              "substitution_option_2": "Good Mornings",
              "coaching_notes": "Push your hips back and feel a stretch in your hamstrings. Keep the bar close to your legs.",
              "youtube_link": null
            },
            {
              "name": "Bulgarian Split Squats",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "8-10 each leg",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Reverse Lunges",
              "substitution_option_2": "Walking Lunges",
              "coaching_notes": "Most of your weight on your front leg. Descend straight down, don't lean forward.",
              "youtube_link": null
            },
            {
              "name": "Leg Press",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "12-15",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Goblet Squats",
              "substitution_option_2": "Hack Squats",
              "coaching_notes": "Lower the weight until your knees are at about 90 degrees, then press back up.",
              "youtube_link": null
            },
            {
              "name": "Leg Curls",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "10-12",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Nordic Curls",
              "substitution_option_2": "Good Mornings",
              "coaching_notes": "Squeeze your hamstrings and control the negative portion of the rep.",
              "youtube_link": null
            },
            {
              "name": "Leg Extensions",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "12-15",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Goblet Squats",
              "substitution_option_2": "Jump Squats",
              "coaching_notes": "Squeeze your quads at the top and control the negative.",
              "youtube_link": null
            },
            {
              "name": "Calf Raises",
              "warmup_sets": 1,
              "working_sets": 4,
              "reps": "15-20",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Standing Calf Raises",
              "substitution_option_2": "Leg Press Toe Press",
              "coaching_notes": "Press all the way up to your toes, stretch your calves at the bottom, don't bounce",
              "youtube_link": null
            },
            {
              "name": "Walking Lunges",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "10-12 each leg",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Reverse Lunges",
              "substitution_option_2": "Bulgarian Split Squats",
              "coaching_notes": "Take a big step forward, drop your back knee down. Push off your front foot to the next rep.",
              "youtube_link": null
            },
            {
              "name": "Abs Circuit",
              "warmup_sets": 0,
              "working_sets": 3,
              "reps": "15-20 each",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Plank Hold",
              "substitution_option_2": "Bicycle Crunches",
              "coaching_notes": "Perform crunches, leg raises, and planks in circuit format.",
              "youtube_link": null
            }
          ]
        }
      }
    },
    "week2": {
      "workouts": {
        "push": {
          "name": "Push - Phase 3 Week 2 (Supercompensation)",
          "exercises": [
            {
              "name": "Bench Press",
              "warmup_sets": "3-4",
              "working_sets": 1,
              "reps": "4-6",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "DB Bench Press",
              "substitution_option_2": "Machine Chest Press",
              "coaching_notes": "Set up a comfortable arch, quick pause on the chest and explode up on each rep.",
              "youtube_link": null
            },
            {
              "name": "Incline Dumbbell Press",
              "warmup_sets": 2,
              "working_sets": 3,
              "reps": "7-9",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "Incline Barbell Press",
              "substitution_option_2": "Machine Incline Press",
              "coaching_notes": "Set the bench to about 30-45 degrees. Press up and slightly back towards your head.",
              "youtube_link": null
            },
            {
              "name": "Dumbbell Flyes",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "11-13",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Cable Flyes",
              "substitution_option_2": "Pec Dec",
              "coaching_notes": "Feel a deep stretch in your chest at the bottom, bring your hands together at the top.",
              "youtube_link": null
            },
            {
              "name": "Dumbbell Shoulder Press",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "9-11",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Barbell Press",
              "substitution_option_2": "Machine Press",
              "coaching_notes": "Press straight up, don't let the dumbbells drift forward or behind you.",
              "youtube_link": null
            },
            {
              "name": "Lateral Raises",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "13-16",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Cable Lateral Raise",
              "substitution_option_2": "Machine Lateral Raise",
              "coaching_notes": "Raise the weights out to your sides until your arms are parallel to the floor.",
              "youtube_link": null
            },
            {
              "name": "Rear Delt Flyes",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "16-21",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Cable Rear Delt Flyes",
              "substitution_option_2": "Machine Rear Delt Flyes",
              "coaching_notes": "Keep your chest up and pull your shoulder blades back. Squeeze your rear delts at the top.",
              "youtube_link": null
            },
            {
              "name": "Close Grip Bench Press",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "9-11",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Close Grip DB Press",
              "substitution_option_2": "Dips",
              "coaching_notes": "Hands about shoulder width apart. Keep your elbows closer to your body than regular bench.",
              "youtube_link": null
            },
            {
              "name": "Tricep Rope Pushdown",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "13-16",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Overhead Tricep Extension",
              "substitution_option_2": "Tricep Dips",
              "coaching_notes": "Pull the rope apart at the bottom and squeeze your triceps. Don't let your elbows flare out.",
              "youtube_link": null
            },
            {
              "name": "Overhead Tricep Extension",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "11-13",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Skull Crushers",
              "substitution_option_2": "Tricep Pushdown",
              "coaching_notes": "Keep your elbows pointing forward and only move your forearms.",
              "youtube_link": null
            }
          ]
        },
        "pull": {
          "name": "Pull - Phase 3 Week 2 (Supercompensation)",
          "exercises": [
            {
              "name": "Deadlift",
              "warmup_sets": "3-4",
              "working_sets": 1,
              "reps": "4-6",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "Sumo Deadlift",
              "substitution_option_2": "Trap Bar Deadlift",
              "coaching_notes": "Keep the bar close to your body, push the floor away with your feet, drive your hips forward.",
              "youtube_link": null
            },
            {
              "name": "Barbell Rows",
              "warmup_sets": 2,
              "working_sets": 3,
              "reps": "7-9",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "Dumbbell Rows",
              "substitution_option_2": "Cable Rows",
              "coaching_notes": "Pull to your lower chest/upper stomach. Keep your chest up and squeeze your shoulder blades.",
              "youtube_link": null
            },
            {
              "name": "Pull-ups/Chin-ups",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "7-11",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Assisted Pull-ups",
              "substitution_option_2": "Lat Pulldown",
              "coaching_notes": "Pull your chest to the bar, don't just focus on getting your chin over. Control the negative.",
              "youtube_link": null
            },
            {
              "name": "Cable Rows",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "9-11",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Machine Rows",
              "substitution_option_2": "T-Bar Rows",
              "coaching_notes": "Pull to your lower chest, squeeze your shoulder blades together at the back.",
              "youtube_link": null
            },
            {
              "name": "Lat Pulldown",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "11-13",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Wide Grip Pull-ups",
              "substitution_option_2": "Cable Pulldown",
              "coaching_notes": "Pull the bar to your upper chest, lean back slightly and squeeze your lats.",
              "youtube_link": null
            },
            {
              "name": "Face Pulls",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "16-21",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Band Face Pulls",
              "substitution_option_2": "Reverse Flyes",
              "coaching_notes": "Pull the rope towards your face, separate your hands and squeeze your rear delts.",
              "youtube_link": null
            },
            {
              "name": "Barbell Curls",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "9-11",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Dumbbell Curls",
              "substitution_option_2": "Cable Curls",
              "coaching_notes": "Don't swing your body, keep your elbows in place and squeeze your biceps at the top.",
              "youtube_link": null
            },
            {
              "name": "Hammer Curls",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "11-13",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Cable Hammer Curls",
              "substitution_option_2": "Rope Hammer Curls",
              "coaching_notes": "Keep your palms facing each other throughout the movement. Focus on your biceps and forearms.",
              "youtube_link": null
            },
            {
              "name": "Cable Curls",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "13-16",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Preacher Curls",
              "substitution_option_2": "Concentration Curls",
              "coaching_notes": "Keep constant tension on your biceps throughout the entire range of motion.",
              "youtube_link": null
            }
          ]
        },
        "legs": {
          "name": "Legs - Phase 3 Week 2 (Supercompensation)",
          "exercises": [
            {
              "name": "Squat",
              "warmup_sets": "3-4",
              "working_sets": 1,
              "reps": "4-6",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "Front Squat",
              "substitution_option_2": "Leg Press",
              "coaching_notes": "Descend until your hip crease is below your knee cap. Drive through your heels to stand up.",
              "youtube_link": null
            },
            {
              "name": "Romanian Deadlifts",
              "warmup_sets": 2,
              "working_sets": 3,
              "reps": "7-9",
              "load": "",
              "rpe": "7-8",
              "rest": "~3-4 min",
              "substitution_option_1": "Dumbbell RDLs",
              "substitution_option_2": "Good Mornings",
              "coaching_notes": "Push your hips back and feel a stretch in your hamstrings. Keep the bar close to your legs.",
              "youtube_link": null
            },
            {
              "name": "Bulgarian Split Squats",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "9-11 each leg",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Reverse Lunges",
              "substitution_option_2": "Walking Lunges",
              "coaching_notes": "Most of your weight on your front leg. Descend straight down, don't lean forward.",
              "youtube_link": null
            },
            {
              "name": "Leg Press",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "13-16",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Goblet Squats",
              "substitution_option_2": "Hack Squats",
              "coaching_notes": "Lower the weight until your knees are at about 90 degrees, then press back up.",
              "youtube_link": null
            },
            {
              "name": "Leg Curls",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "11-13",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Nordic Curls",
              "substitution_option_2": "Good Mornings",
              "coaching_notes": "Squeeze your hamstrings and control the negative portion of the rep.",
              "youtube_link": null
            },
            {
              "name": "Leg Extensions",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "13-16",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Goblet Squats",
              "substitution_option_2": "Jump Squats",
              "coaching_notes": "Squeeze your quads at the top and control the negative.",
              "youtube_link": null
            },
            {
              "name": "Calf Raises",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "16-21",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Standing Calf Raises",
              "substitution_option_2": "Leg Press Toe Press",
              "coaching_notes": "Press all the way up to your toes, stretch your calves at the bottom, don't bounce",
              "youtube_link": null
            },
            {
              "name": "Walking Lunges",
              "warmup_sets": 1,
              "working_sets": 3,
              "reps": "11-13 each leg",
              "load": "",
              "rpe": "7-8",
              "rest": "~2-3 min",
              "substitution_option_1": "Reverse Lunges",
              "substitution_option_2": "Bulgarian Split Squats",
              "coaching_notes": "Take a big step forward, drop your back knee down. Push off your front foot to the next rep.",
              "youtube_link": null
            },
            {
              "name": "Abs Circuit",
              "warmup_sets": 0,
              "working_sets": 3,
              "reps": "16-21 each",
              "load": "",
              "rpe": "7-8",
              "rest": "~1-2 min",
              "substitution_option_1": "Plank Hold",
              "substitution_option_2": "Bicycle Crunches",
              "coaching_notes": "Perform crunches, leg raises, and planks in circuit format.",
              "youtube_link": null
            }
          ]
        }
      }
    }
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WORKOUT_DATA;
}