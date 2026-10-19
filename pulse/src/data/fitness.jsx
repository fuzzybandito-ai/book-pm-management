import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import GroupIcon from '@mui/icons-material/Group';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import SportsIcon from '@mui/icons-material/Sports';

/**
 * Workout activity presets shown as quick picks in the log form.
 * `kind` is either 'solo' or 'group' — the two categories the PRD calls out
 * (solo workouts and group fitness classes). Each preset maps to an activity
 * label and icon. Users can also type a custom activity.
 */
export const KINDS = [
  { value: 'solo', label: 'Solo', icon: <DirectionsRunIcon /> },
  { value: 'group', label: 'Group class', icon: <GroupIcon /> },
];

export const ACTIVITY_PRESETS = [
  { activity: 'Treadmill run', kind: 'solo', icon: <DirectionsRunIcon /> },
  { activity: 'Weight training', kind: 'solo', icon: <FitnessCenterIcon /> },
  { activity: 'Swimming laps', kind: 'solo', icon: <SelfImprovementIcon /> },
  { activity: 'Stretching & mobility', kind: 'solo', icon: <AccessibilityNewIcon /> },
  { activity: 'York Lions group fitness', kind: 'group', icon: <GroupIcon /> },
  { activity: 'Intramural game', kind: 'group', icon: <SportsIcon /> },
];

export const INTENSITY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hard', label: 'Hard' },
];

export const KIND_LABELS = {
  solo: 'Solo workout',
  group: 'Group class',
};
