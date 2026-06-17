// Condensed copy of src/lib/planGeneration/exerciseLibrary.ts for use inside the Deno edge function runtime.
// Keep in sync if the main exercise library changes.

export interface LibraryExercise {
  name: string
  category: string
  equipment: string[]
  archetypes: string[]
  phases: string[]
  is_compound: boolean
  home_alternative: string | null
  default_sets: number
  default_reps: number | string
  default_rest_seconds: number
  default_rpe: number
  coaching_cues: string[]
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  {
    "name": "Barbell Back Squat",
    "category": "lower",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Strength Athlete",
      "Bodybuilder",
      "Hybrid Performer",
      "Athletic Performance",
      "General Health"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 6,
    "default_rest_seconds": 150,
    "default_rpe": 7,
    "coaching_cues": [
      "Brace your core before unracking",
      "Drive knees out over toes",
      "Keep chest tall through the descent"
    ]
  },
  {
    "name": "Romanian Deadlift",
    "category": "lower",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 8,
    "default_rest_seconds": 120,
    "default_rpe": 7,
    "coaching_cues": [
      "Hinge at the hips, soft knees",
      "Keep the bar close to your legs",
      "Feel the stretch in your hamstrings"
    ]
  },
  {
    "name": "Conventional Deadlift",
    "category": "lower",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Strength Athlete",
      "Hybrid Performer",
      "Athletic Performance",
      "General Health"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 5,
    "default_rest_seconds": 180,
    "default_rpe": 8,
    "coaching_cues": [
      "Set your lats before the pull",
      "Push the floor away",
      "Keep the bar path vertical"
    ]
  },
  {
    "name": "Trap Bar Deadlift",
    "category": "lower",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Strength Athlete",
      "Hybrid Performer",
      "Athletic Performance",
      "General Health"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 6,
    "default_rest_seconds": 150,
    "default_rpe": 7,
    "coaching_cues": [
      "Drive through mid-foot",
      "Stand tall at the top, no lean back",
      "Control the descent"
    ]
  },
  {
    "name": "Bench Press",
    "category": "upper_push",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Bodybuilder",
      "Strength Athlete",
      "Hybrid Performer",
      "Athletic Performance",
      "General Health"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 6,
    "default_rest_seconds": 120,
    "default_rpe": 7,
    "coaching_cues": [
      "Pull shoulder blades together and down",
      "Lower the bar with control to your chest",
      "Drive feet into the floor"
    ]
  },
  {
    "name": "Overhead Press",
    "category": "upper_push",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 8,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Brace your core, ribs down",
      "Press in a straight line overhead",
      "Squeeze glutes to protect the lower back"
    ]
  },
  {
    "name": "Barbell Row",
    "category": "upper_pull",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 8,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Hinge to roughly 45 degrees",
      "Pull the bar to your lower ribs",
      "Avoid jerking the weight up"
    ]
  },
  {
    "name": "Pull-Up",
    "category": "upper_pull",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": "Band-assisted pull-up or inverted row",
    "default_sets": 4,
    "default_reps": 6,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Start from a full hang",
      "Drive elbows down and back",
      "Avoid kipping unless trained"
    ]
  },
  {
    "name": "Chin-Up",
    "category": "upper_pull",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": "Band-assisted chin-up or inverted row",
    "default_sets": 4,
    "default_reps": 6,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Underhand grip, shoulder width",
      "Drive elbows to your hips",
      "Control the lowering phase"
    ]
  },
  {
    "name": "Dumbbell Lunge",
    "category": "lower",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": "Bodyweight lunge",
    "default_sets": 3,
    "default_reps": 10,
    "default_rest_seconds": 60,
    "default_rpe": 6,
    "coaching_cues": [
      "Step out to a comfortable distance",
      "Lower the back knee under control",
      "Drive through the front heel to stand"
    ]
  },
  {
    "name": "Bulgarian Split Squat",
    "category": "lower",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": "Bodyweight split squat",
    "default_sets": 3,
    "default_reps": 8,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Rear foot elevated on a bench",
      "Keep most of the weight on the front leg",
      "Descend until the rear knee nears the floor"
    ]
  },
  {
    "name": "Hip Thrust",
    "category": "lower",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": "Single-leg glute bridge",
    "default_sets": 3,
    "default_reps": 10,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Shoulder blades on the bench",
      "Drive hips up, squeeze glutes hard at the top",
      "Keep ribs down, avoid over-arching"
    ]
  },
  {
    "name": "Goblet Squat",
    "category": "lower",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": "Bodyweight squat",
    "default_sets": 3,
    "default_reps": 12,
    "default_rest_seconds": 60,
    "default_rpe": 6,
    "coaching_cues": [
      "Hold the weight close to your chest",
      "Sit between your knees, elbows inside",
      "Keep heels planted"
    ]
  },
  {
    "name": "Reverse Lunge",
    "category": "lower",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 10,
    "default_rest_seconds": 60,
    "default_rpe": 6,
    "coaching_cues": [
      "Step back under control",
      "Keep front shin near vertical",
      "Push through the front foot to return"
    ]
  },
  {
    "name": "Push-Up",
    "category": "upper_push",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 15,
    "default_rest_seconds": 60,
    "default_rpe": 6,
    "coaching_cues": [
      "Keep a straight line from head to heels",
      "Lower chest close to the floor",
      "Press through the full hand"
    ]
  },
  {
    "name": "Dip",
    "category": "upper_push",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": true,
    "home_alternative": "Close-grip push-up",
    "default_sets": 3,
    "default_reps": 10,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Lean slightly forward",
      "Lower until shoulders feel a stretch",
      "Press back up to lockout"
    ]
  },
  {
    "name": "Box Jump",
    "category": "plyometric",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer",
      "Strength Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 5,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Stand tall before each rep",
      "Land softly with bent knees",
      "Step down, don’t jump down"
    ]
  },
  {
    "name": "Broad Jump",
    "category": "plyometric",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer",
      "Strength Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 5,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Swing arms back then explosively forward",
      "Land with soft knees, stick the landing",
      "Reset fully between reps"
    ]
  },
  {
    "name": "Lateral Bound",
    "category": "lateral",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 6,
    "default_rest_seconds": 60,
    "default_rpe": 6,
    "coaching_cues": [
      "Push off the outside leg",
      "Stick the landing before bounding back",
      "Stay low and athletic"
    ]
  },
  {
    "name": "Depth Drop",
    "category": "plyometric",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Athletic Performance",
      "Strength Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 5,
    "default_rest_seconds": 120,
    "default_rpe": 8,
    "coaching_cues": [
      "Step off, don’t jump off the box",
      "Absorb the landing through the hips",
      "Reset fully before each rep"
    ]
  },
  {
    "name": "Tuck Jump",
    "category": "plyometric",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 8,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Drive knees up toward your chest",
      "Land softly and reset",
      "Keep reps explosive, not rushed"
    ]
  },
  {
    "name": "Single Leg Broad Jump",
    "category": "plyometric",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 5,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Drive off one leg, land on the same leg",
      "Stick the landing for 2 seconds",
      "Match reps on both sides"
    ]
  },
  {
    "name": "Reactive Box Jump",
    "category": "plyometric",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 5,
    "default_rest_seconds": 120,
    "default_rpe": 8,
    "coaching_cues": [
      "Minimise ground contact time",
      "Land and rebound immediately",
      "Reset technique if quality drops"
    ]
  },
  {
    "name": "Medicine Ball Overhead Slam",
    "category": "power",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 8,
    "default_rest_seconds": 60,
    "default_rpe": 7,
    "coaching_cues": [
      "Reach tall before the slam",
      "Drive through the hips and core",
      "Slam with full intent"
    ]
  },
  {
    "name": "Rotational Med Ball Throw",
    "category": "power",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 8,
    "default_rest_seconds": 60,
    "default_rpe": 7,
    "coaching_cues": [
      "Rotate from the hips, not just the arms",
      "Throw explosively against the wall",
      "Match reps each side"
    ]
  },
  {
    "name": "Med Ball Slam",
    "category": "power",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer",
      "General Health"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 10,
    "default_rest_seconds": 60,
    "default_rpe": 7,
    "coaching_cues": [
      "Full extension on the reach",
      "Slam with maximum effort",
      "Reset your stance every rep"
    ]
  },
  {
    "name": "Farmers Walk",
    "category": "loaded_carry",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": "40m",
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Stand tall, brace your core",
      "Keep shoulders down and back",
      "Take controlled steps"
    ]
  },
  {
    "name": "Trap Bar Farmers Walk",
    "category": "loaded_carry",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": "40m",
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Brace before lifting the bar",
      "Walk with short, quick steps",
      "Keep grip tight throughout"
    ]
  },
  {
    "name": "Suitcase Carry",
    "category": "loaded_carry",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": "30m each side",
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Resist leaning toward the loaded side",
      "Keep shoulders level",
      "Brace your obliques hard"
    ]
  },
  {
    "name": "Overhead Carry",
    "category": "loaded_carry",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": "20m",
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Stack the weight directly overhead",
      "Brace your ribs down",
      "Walk with control"
    ]
  },
  {
    "name": "Sled Push",
    "category": "loaded_carry",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": "Load a bag, push for 10m",
    "default_sets": 4,
    "default_reps": "20m",
    "default_rest_seconds": 90,
    "default_rpe": 8,
    "coaching_cues": [
      "Drive with low, powerful steps",
      "Keep a flat back, push through arms",
      "Maintain consistent pace"
    ]
  },
  {
    "name": "Sled Pull",
    "category": "loaded_carry",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": "Resistance band sprint: anchor band, drive forward 10m",
    "default_sets": 4,
    "default_reps": "20m",
    "default_rest_seconds": 90,
    "default_rpe": 8,
    "coaching_cues": [
      "Sit back into the harness",
      "Drive the legs, pull with control",
      "Keep tension throughout"
    ]
  },
  {
    "name": "Sandbag Clean & Press",
    "category": "loaded_carry",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 6,
    "default_rest_seconds": 90,
    "default_rpe": 7,
    "coaching_cues": [
      "Keep the sandbag close to your body",
      "Use your legs to drive it up",
      "Press to full lockout overhead"
    ]
  },
  {
    "name": "Sprint Intervals 8×40m",
    "category": "sprint",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "8×40m",
    "default_rest_seconds": 60,
    "default_rpe": 8,
    "coaching_cues": [
      "Full recovery between reps",
      "Drive arms and knees aggressively",
      "Maintain top-end form, don’t over-stride"
    ]
  },
  {
    "name": "Sprint Intervals 6×60m",
    "category": "sprint",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "6×60m",
    "default_rest_seconds": 90,
    "default_rpe": 8,
    "coaching_cues": [
      "Build into top speed over the first 20m",
      "Stay relaxed through the shoulders",
      "Full recovery between reps"
    ]
  },
  {
    "name": "VO2 Max Intervals 4×4min",
    "category": "vo2max",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "4×4min",
    "default_rest_seconds": 180,
    "default_rpe": 8,
    "coaching_cues": [
      "Hold a hard but sustainable effort",
      "Use the rest to fully recover your breathing",
      "Pace evenly across intervals"
    ]
  },
  {
    "name": "VO2 Max Intervals 5×3min",
    "category": "vo2max",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "5×3min",
    "default_rest_seconds": 120,
    "default_rpe": 8,
    "coaching_cues": [
      "Settle into rhythm by 30 seconds",
      "Keep effort consistent across reps",
      "Breathe through the recovery"
    ]
  },
  {
    "name": "Hill Sprint Repeats 8×15s",
    "category": "sprint",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "8×15s",
    "default_rest_seconds": 90,
    "default_rpe": 8,
    "coaching_cues": [
      "Drive knees high up the hill",
      "Walk back down for full recovery",
      "Keep effort maximal but controlled"
    ]
  },
  {
    "name": "Assault Bike Tabata 8×20s",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": "Burpee Tabata 8×20s",
    "default_sets": 1,
    "default_reps": "8×20s",
    "default_rest_seconds": 10,
    "default_rpe": 9,
    "coaching_cues": [
      "All-out effort for the full 20 seconds",
      "Use the 10 second rest to reset posture",
      "Pace to maintain output across all rounds"
    ]
  },
  {
    "name": "Run Zone 2 30min",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "30min",
    "default_rest_seconds": 0,
    "default_rpe": 5,
    "coaching_cues": [
      "Conversational pace throughout",
      "Nasal breathing if possible",
      "Resist the urge to speed up"
    ]
  },
  {
    "name": "Run Zone 2 40min",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "40min",
    "default_rest_seconds": 0,
    "default_rpe": 5,
    "coaching_cues": [
      "Hold an easy, sustainable pace",
      "Stay relaxed through the shoulders and jaw",
      "Fuel before if over 60 minutes"
    ]
  },
  {
    "name": "Tempo Run 20min",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "20min",
    "default_rest_seconds": 0,
    "default_rpe": 7,
    "coaching_cues": [
      "Comfortably hard, sustainable effort",
      "Settle in gradually over the first 5 minutes",
      "Hold form as fatigue builds"
    ]
  },
  {
    "name": "Tempo Run 25min",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "25min",
    "default_rest_seconds": 0,
    "default_rpe": 7,
    "coaching_cues": [
      "Lock into a rhythm you can repeat",
      "Effort should feel hard but controlled",
      "Negative split if you feel strong"
    ]
  },
  {
    "name": "Interval Run 6×800m",
    "category": "vo2max",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "6×800m",
    "default_rest_seconds": 120,
    "default_rpe": 8,
    "coaching_cues": [
      "Even pacing across all reps",
      "Use the recovery jog to reset form",
      "Last rep should feel as strong as the first"
    ]
  },
  {
    "name": "Interval Run 8×400m",
    "category": "vo2max",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "8×400m",
    "default_rest_seconds": 90,
    "default_rpe": 8,
    "coaching_cues": [
      "Hit your target split each rep",
      "Recover with an easy jog or walk",
      "Stay relaxed at speed"
    ]
  },
  {
    "name": "Long Run 45min",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "45min",
    "default_rest_seconds": 0,
    "default_rpe": 6,
    "coaching_cues": [
      "Start conservatively",
      "Practice race-day fuelling",
      "Slow down rather than skip the distance"
    ]
  },
  {
    "name": "Long Run 60min+",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "60min",
    "default_rest_seconds": 0,
    "default_rpe": 6,
    "coaching_cues": [
      "Build distance gradually week to week",
      "Fuel and hydrate on schedule",
      "Finish feeling like you had more in reserve"
    ]
  },
  {
    "name": "Lateral Shuffle 4×10m",
    "category": "lateral",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "4×10m",
    "default_rest_seconds": 45,
    "default_rpe": 6,
    "coaching_cues": [
      "Stay low with bent knees",
      "Quick, light feet",
      "Lead with the hips, not the head"
    ]
  },
  {
    "name": "5-10-5 Agility Drill",
    "category": "agility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "5x",
    "default_rest_seconds": 60,
    "default_rpe": 7,
    "coaching_cues": [
      "Plant and drive out of each cut",
      "Stay low through direction changes",
      "Full recovery between reps"
    ]
  },
  {
    "name": "T-Drill",
    "category": "agility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "5x",
    "default_rest_seconds": 60,
    "default_rpe": 7,
    "coaching_cues": [
      "Sprint forward, shuffle laterally, backpedal",
      "Keep hips low on the shuffles",
      "Quality over speed early on"
    ]
  },
  {
    "name": "Cone Drill",
    "category": "agility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "5x",
    "default_rest_seconds": 60,
    "default_rpe": 6,
    "coaching_cues": [
      "Sharp, controlled cuts around each cone",
      "Keep your centre of gravity low",
      "Accelerate out of every turn"
    ]
  },
  {
    "name": "Agility Ladder High Knees",
    "category": "agility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "4x",
    "default_rest_seconds": 45,
    "default_rpe": 6,
    "coaching_cues": [
      "One foot in each box",
      "Drive knees up quickly",
      "Stay light on your feet"
    ]
  },
  {
    "name": "Reactive Drop Step",
    "category": "agility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Athletic Performance",
      "Hybrid Performer"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "4x",
    "default_rest_seconds": 45,
    "default_rpe": 6,
    "coaching_cues": [
      "React to the cue as fast as possible",
      "Drop step and accelerate explosively",
      "Reset athletic stance between reps"
    ]
  },
  {
    "name": "Cable Pallof Press",
    "category": "core",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": "Band Pallof Press",
    "default_sets": 3,
    "default_reps": 12,
    "default_rest_seconds": 45,
    "default_rpe": 6,
    "coaching_cues": [
      "Resist rotation toward the cable",
      "Press out slowly and with control",
      "Keep ribs stacked over hips"
    ]
  },
  {
    "name": "Dead Bug",
    "category": "core",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 10,
    "default_rest_seconds": 30,
    "default_rpe": 5,
    "coaching_cues": [
      "Press lower back into the floor",
      "Move opposite arm and leg slowly",
      "Exhale fully on each rep"
    ]
  },
  {
    "name": "Copenhagen Plank",
    "category": "core",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": "30s",
    "default_rest_seconds": 45,
    "default_rpe": 6,
    "coaching_cues": [
      "Top leg on the bench, bottom leg lifted",
      "Keep hips square and lifted",
      "Build time gradually"
    ]
  },
  {
    "name": "Plank",
    "category": "core",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": "45s",
    "default_rest_seconds": 30,
    "default_rpe": 5,
    "coaching_cues": [
      "Squeeze glutes and brace your core",
      "Keep a straight line head to heels",
      "Breathe steadily throughout"
    ]
  },
  {
    "name": "Side Plank",
    "category": "core",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": "30s each side",
    "default_rest_seconds": 30,
    "default_rpe": 5,
    "coaching_cues": [
      "Stack hips and shoulders",
      "Lift hips as high as comfortable",
      "Keep neck neutral"
    ]
  },
  {
    "name": "Ab Wheel Rollout",
    "category": "core",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 8,
    "default_rest_seconds": 60,
    "default_rpe": 6,
    "coaching_cues": [
      "Brace before you roll out",
      "Roll only as far as you can control",
      "Pull back using your abs, not your hips"
    ]
  },
  {
    "name": "Bicep Curl",
    "category": "upper_pull",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Bodybuilder",
      "General Health",
      "Strength Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 12,
    "default_rest_seconds": 45,
    "default_rpe": 6,
    "coaching_cues": [
      "Keep elbows pinned to your sides",
      "Control the lowering phase",
      "Avoid swinging the weight"
    ]
  },
  {
    "name": "Tricep Pushdown",
    "category": "upper_push",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Bodybuilder",
      "General Health",
      "Strength Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 12,
    "default_rest_seconds": 45,
    "default_rpe": 6,
    "coaching_cues": [
      "Keep elbows fixed at your sides",
      "Extend fully without locking out hard",
      "Control the return"
    ]
  },
  {
    "name": "Lateral Raise",
    "category": "upper_push",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Bodybuilder",
      "General Health",
      "Strength Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 15,
    "default_rest_seconds": 45,
    "default_rpe": 6,
    "coaching_cues": [
      "Lead with the elbows",
      "Raise to shoulder height",
      "Avoid using momentum"
    ]
  },
  {
    "name": "Face Pull",
    "category": "upper_pull",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 15,
    "default_rest_seconds": 45,
    "default_rpe": 5,
    "coaching_cues": [
      "Pull to your forehead",
      "Rotate shoulders externally at the end",
      "Keep elbows high"
    ]
  },
  {
    "name": "Leg Curl",
    "category": "lower",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Bodybuilder",
      "General Health",
      "Strength Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 12,
    "default_rest_seconds": 60,
    "default_rpe": 6,
    "coaching_cues": [
      "Control the eccentric",
      "Squeeze hamstrings at the top",
      "Avoid hips lifting off the pad"
    ]
  },
  {
    "name": "Leg Extension",
    "category": "lower",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Bodybuilder",
      "General Health",
      "Strength Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 12,
    "default_rest_seconds": 60,
    "default_rpe": 6,
    "coaching_cues": [
      "Control the weight on the way down",
      "Squeeze quads at the top",
      "Avoid locking out aggressively"
    ]
  },
  {
    "name": "Calf Raise",
    "category": "lower",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 15,
    "default_rest_seconds": 45,
    "default_rpe": 6,
    "coaching_cues": [
      "Full stretch at the bottom",
      "Pause at the top of each rep",
      "Control the tempo"
    ]
  },
  {
    "name": "Glute Kickback",
    "category": "lower",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 15,
    "default_rest_seconds": 45,
    "default_rpe": 6,
    "coaching_cues": [
      "Squeeze the glute at the top",
      "Avoid arching your lower back",
      "Move through a controlled range"
    ]
  },
  {
    "name": "World's Greatest Stretch",
    "category": "mobility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "5 each side",
    "default_rest_seconds": 0,
    "default_rpe": 4,
    "coaching_cues": [
      "Move through the full range slowly",
      "Breathe into each position",
      "Sink deeper each rep"
    ]
  },
  {
    "name": "Hip 90/90",
    "category": "mobility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "8 each side",
    "default_rest_seconds": 0,
    "default_rpe": 4,
    "coaching_cues": [
      "Keep both sit bones on the floor",
      "Rotate from the hip, not the back",
      "Move slowly and with control"
    ]
  },
  {
    "name": "Thoracic Rotation",
    "category": "mobility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": 10,
    "default_rest_seconds": 0,
    "default_rpe": 4,
    "coaching_cues": [
      "Keep hips stacked and still",
      "Rotate through the upper back",
      "Follow your hand with your eyes"
    ]
  },
  {
    "name": "Band Pull-Apart",
    "category": "mobility",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": "Arm circles",
    "default_sets": 2,
    "default_reps": 15,
    "default_rest_seconds": 0,
    "default_rpe": 4,
    "coaching_cues": [
      "Squeeze shoulder blades together",
      "Keep arms straight",
      "Control the return"
    ]
  },
  {
    "name": "Leg Swing",
    "category": "mobility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "10 each leg",
    "default_rest_seconds": 0,
    "default_rpe": 4,
    "coaching_cues": [
      "Hold something stable for balance",
      "Swing through a comfortable range",
      "Increase range gradually"
    ]
  },
  {
    "name": "Arm Circle",
    "category": "mobility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": 10,
    "default_rest_seconds": 0,
    "default_rpe": 3,
    "coaching_cues": [
      "Start small and increase the size",
      "Keep arms long",
      "Both directions"
    ]
  },
  {
    "name": "Inchworm",
    "category": "mobility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": 8,
    "default_rest_seconds": 0,
    "default_rpe": 5,
    "coaching_cues": [
      "Walk hands out to a plank",
      "Keep legs as straight as comfortable",
      "Walk feet up to meet hands"
    ]
  },
  {
    "name": "Cat-Cow",
    "category": "mobility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": 10,
    "default_rest_seconds": 0,
    "default_rpe": 3,
    "coaching_cues": [
      "Move slowly between each position",
      "Match breath to movement",
      "Feel the stretch through your spine"
    ]
  },
  {
    "name": "Hip Circle",
    "category": "mobility",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Endurance Athlete",
      "Strength Athlete",
      "Hybrid Performer",
      "Bodybuilder",
      "General Health",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "8 each direction",
    "default_rest_seconds": 0,
    "default_rpe": 4,
    "coaching_cues": [
      "Keep your standing leg stable",
      "Move through the largest comfortable circle",
      "Both directions, both legs"
    ]
  },
  {
    "name": "Bike Zone 2 45min",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "45min",
    "default_rest_seconds": 0,
    "default_rpe": 5,
    "coaching_cues": [
      "Hold a conversational effort",
      "Maintain a smooth, even cadence",
      "Resist the urge to push the pace"
    ]
  },
  {
    "name": "Bike Intervals 6×3min",
    "category": "vo2max",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "6×3min",
    "default_rest_seconds": 120,
    "default_rpe": 8,
    "coaching_cues": [
      "Build effort over the first 30 seconds",
      "Hold cadence consistent across reps",
      "Recover fully between intervals"
    ]
  },
  {
    "name": "Recovery Ride 30min",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "30min",
    "default_rest_seconds": 0,
    "default_rpe": 4,
    "coaching_cues": [
      "Very light effort, easy gear",
      "Focus on smooth pedalling",
      "This is active recovery, not training"
    ]
  },
  {
    "name": "Long Ride 60min",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "60min",
    "default_rest_seconds": 0,
    "default_rpe": 6,
    "coaching_cues": [
      "Settle into a sustainable rhythm",
      "Practice your nutrition strategy",
      "Build duration gradually week to week"
    ]
  },
  {
    "name": "Brick Session Bike 20min + Run 15min",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Endurance Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "20min+15min",
    "default_rest_seconds": 0,
    "default_rpe": 7,
    "coaching_cues": [
      "Transition quickly from bike to run",
      "Expect heavy legs in the first few minutes of the run",
      "Hold an even effort across both"
    ]
  },
  {
    "name": "Ski Erg Intervals 6×250m",
    "category": "conditioning",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Hybrid Performer",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "6×250m",
    "default_rest_seconds": 60,
    "default_rpe": 8,
    "coaching_cues": [
      "Drive through your legs first",
      "Maintain a strong hip hinge",
      "Pace evenly across all reps"
    ]
  },
  {
    "name": "Wall Ball 4×25 reps",
    "category": "conditioning",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Hybrid Performer",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": 25,
    "default_rest_seconds": 60,
    "default_rpe": 7,
    "coaching_cues": [
      "Squat to full depth each rep",
      "Use leg drive to throw the ball",
      "Catch and absorb into the next squat"
    ]
  },
  {
    "name": "Farmers Carry 4×50m",
    "category": "loaded_carry",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Hybrid Performer",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 4,
    "default_reps": "50m",
    "default_rest_seconds": 60,
    "default_rpe": 7,
    "coaching_cues": [
      "Grip the handles tight",
      "Stand tall, controlled stride",
      "Set down with control between attempts"
    ]
  },
  {
    "name": "Burpee Broad Jump 3×10",
    "category": "power",
    "equipment": [
      "full_gym",
      "home_gym",
      "bodyweight"
    ],
    "archetypes": [
      "Hybrid Performer",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": 10,
    "default_rest_seconds": 60,
    "default_rpe": 8,
    "coaching_cues": [
      "Chest to the floor on the burpee",
      "Explode forward into the broad jump",
      "Reset stance before the next rep"
    ]
  },
  {
    "name": "Sandbag Lunges 3×20m",
    "category": "lower",
    "equipment": [
      "full_gym",
      "home_gym"
    ],
    "archetypes": [
      "Hybrid Performer",
      "Athletic Performance"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 3,
    "default_reps": "20m",
    "default_rest_seconds": 60,
    "default_rpe": 7,
    "coaching_cues": [
      "Keep the sandbag tight to your body",
      "Drive through the front heel",
      "Maintain an upright torso"
    ]
  },
  {
    "name": "Rowing 1000m Repeats ×4",
    "category": "conditioning",
    "equipment": [
      "full_gym"
    ],
    "archetypes": [
      "Hybrid Performer",
      "Athletic Performance",
      "Endurance Athlete"
    ],
    "phases": [
      "foundation",
      "build",
      "peak",
      "deload"
    ],
    "is_compound": false,
    "home_alternative": null,
    "default_sets": 1,
    "default_reps": "4×1000m",
    "default_rest_seconds": 120,
    "default_rpe": 8,
    "coaching_cues": [
      "Drive with the legs before the arms",
      "Keep the stroke rate consistent",
      "Even pacing across all reps"
    ]
  }
]
