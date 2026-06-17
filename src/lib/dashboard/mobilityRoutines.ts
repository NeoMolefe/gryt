import type { MobilityRoutine } from '@/types/dashboard.types'

export const MOBILITY_ROUTINES: MobilityRoutine[] = [
  {
    id: 'hip_glute',
    name: 'Hip & Glute Focus',
    triggerFocuses: ['lower', 'plyometric'],
    exercises: [
      { name: '90/90 Hip Switch', duration_minutes: 3 },
      { name: 'Couch Stretch', duration_minutes: 3 },
      { name: 'Glute Bridge Hold', duration_minutes: 2 },
      { name: 'Pigeon Pose', duration_minutes: 3 },
      { name: 'Lateral Lunge Reach', duration_minutes: 2 },
    ],
  },
  {
    id: 'thoracic_shoulder',
    name: 'Thoracic & Shoulder Focus',
    triggerFocuses: ['upper_push', 'upper_pull', 'loaded_carry'],
    exercises: [
      { name: 'Thread the Needle', duration_minutes: 3 },
      { name: 'Wall Slide', duration_minutes: 2 },
      { name: 'Doorway Pec Stretch', duration_minutes: 2 },
      { name: 'Cat-Cow', duration_minutes: 3 },
      { name: 'Band Shoulder Dislocate', duration_minutes: 2 },
    ],
  },
  {
    id: 'lower_back_hamstring',
    name: 'Lower Back & Hamstring Focus',
    triggerFocuses: ['conditioning', 'sprint'],
    exercises: [
      { name: "Child's Pose", duration_minutes: 3 },
      { name: 'Standing Hamstring Stretch', duration_minutes: 3 },
      { name: 'Cat-Cow', duration_minutes: 2 },
      { name: 'Supine Twist', duration_minutes: 3 },
      { name: 'Knee-to-Chest Stretch', duration_minutes: 2 },
    ],
  },
  {
    id: 'ankle_knee',
    name: 'Ankle & Knee Focus',
    triggerFocuses: ['plyometric', 'lateral', 'agility'],
    exercises: [
      { name: 'Ankle Rocks', duration_minutes: 2 },
      { name: 'Calf Wall Stretch', duration_minutes: 3 },
      { name: 'Quad Stretch', duration_minutes: 2 },
      { name: 'Deep Squat Hold', duration_minutes: 3 },
      { name: 'Lateral Ankle Mobilisation', duration_minutes: 2 },
    ],
  },
  {
    id: 'full_body_flow',
    name: 'Full Body Flow',
    triggerFocuses: ['conditioning', 'upper_push', 'upper_pull', 'lower', 'core'],
    exercises: [
      { name: "World's Greatest Stretch", duration_minutes: 4 },
      { name: 'Inchworm', duration_minutes: 3 },
      { name: 'Cat-Cow', duration_minutes: 2 },
      { name: 'Thoracic Rotation', duration_minutes: 3 },
      { name: 'Standing Forward Fold', duration_minutes: 3 },
    ],
  },
  {
    id: 'active_recovery',
    name: 'Active Recovery & Breathwork',
    triggerFocuses: ['mobility'],
    exercises: [
      { name: 'Easy 10min Walk', duration_minutes: 10 },
      { name: 'Box Breathing', duration_minutes: 4 },
      { name: 'Gentle Full Body Stretch', duration_minutes: 5 },
      { name: 'Diaphragmatic Breathing', duration_minutes: 4 },
    ],
  },
]
