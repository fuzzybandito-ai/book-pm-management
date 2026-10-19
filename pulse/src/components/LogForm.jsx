import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import GroupIcon from '@mui/icons-material/Group';
import { tokens } from '../theme';

const KINDS = [
  { value: 'solo', label: 'Solo workout', icon: <SelfImprovementIcon /> },
  { value: 'group', label: 'Group class', icon: <GroupIcon /> },
];

const INTENSITIES = ['easy', 'moderate', 'hard'];

const COMMON_ACTIVITIES = [
  'Treadmill run',
  'Weight training',
  'Yoga class',
  'Spin class',
  'Swimming',
  'Basketball',
  'Pilates',
  'Walking',
];

/**
 * Form to log a workout (add or edit).
 * Multiple workouts per day are allowed.
 */
export default function LogForm({ onSubmit, editEntry = null, onCancel }) {
  const [activity, setActivity] = useState('');
  const [kind, setKind] = useState('solo');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('');
  const [note, setNote] = useState('');
  const [datetime, setDatetime] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editEntry) {
      setActivity(editEntry.activity || '');
      setKind(editEntry.kind || 'solo');
      setDuration(editEntry.duration_min != null ? String(editEntry.duration_min) : '');
      setIntensity(editEntry.intensity || '');
      setNote(editEntry.note || '');
      const d = new Date(editEntry.completed_at);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDatetime(local);
    } else {
      resetForm();
    }
  }, [editEntry]);

  useEffect(() => {
    if (!editEntry) resetForm();
  }, []);

  function resetForm() {
    setActivity('');
    setKind('solo');
    setDuration('');
    setIntensity('');
    setNote('');
    setError(null);
    setSubmitted(false);
    setSuccess(false);
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDatetime(local);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedActivity = activity.trim();
    if (!trimmedActivity) {
      setError('Please name your workout activity.');
      return;
    }
    const dur = duration ? parseInt(duration, 10) : null;
    if (duration && (isNaN(dur) || dur <= 0)) {
      setError('Duration must be a positive number of minutes.');
      return;
    }

    setSubmitted(true);
    setError(null);

    const entry = {
      activity: trimmedActivity,
      kind,
      duration_min: dur,
      intensity: intensity || null,
      note: note.trim() || null,
      completed_at: new Date(datetime).toISOString(),
    };
    if (editEntry) entry.id = editEntry.id;

    const { error: submitError } = await onSubmit(entry);
    if (submitError) {
      setError(submitError.message || 'Could not save your workout.');
      setSubmitted(false);
      return;
    }

    // Immediate positive feedback after logging.
    setSuccess(true);
    setTimeout(() => {
      if (!editEntry) resetForm();
    }, 1600);
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', px: 2, py: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontSize: '1.2rem' }}>
        {editEntry ? 'Edit workout' : 'Log a workout'}
      </Typography>

      {success && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{ mb: 2 }}
          id="log-success-alert"
        >
          Nice work — your workout is logged and your dashboard is updated.
        </Alert>
      )}

      <Card>
        <CardContent component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Solo vs group class */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Type
            </Typography>
            <ToggleButtonGroup
              value={kind}
              exclusive
              onChange={(_, v) => v && setKind(v)}
              fullWidth
              size="small"
              aria-label="Workout type"
            >
              {KINDS.map((k) => (
                <ToggleButton
                  key={k.value}
                  value={k.value}
                  id={`log-kind-${k.value}`}
                  sx={{
                    gap: 0.5,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    fontFamily: '"Space Grotesk", sans-serif',
                    '&.Mui-selected': {
                      backgroundColor: tokens.accentDim15,
                      color: tokens.violetBright,
                      borderColor: tokens.accentBorder40,
                    },
                  }}
                >
                  {k.icon}
                  {k.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Activity name + quick chips */}
          <Box>
            <TextField
              label="Activity"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g. Treadmill run"
              required
              fullWidth
              id="log-activity-input"
            />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {COMMON_ACTIVITIES.map((a) => (
                <Box
                  key={a}
                  component="button"
                  type="button"
                  onClick={() => setActivity(a)}
                  sx={{
                    border: `1px solid ${tokens.borderViolet}`,
                    backgroundColor: 'transparent',
                    color: 'text.secondary',
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.72rem',
                    fontFamily: '"Space Grotesk", sans-serif',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: tokens.violet,
                      color: tokens.violetBright,
                      backgroundColor: tokens.accentDim08,
                    },
                  }}
                >
                  {a}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Duration + intensity */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Duration (min)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 30"
              sx={{ flex: '1 1 140px' }}
              inputProps={{ min: 1 }}
              id="log-duration-input"
            />
            <Box sx={{ flex: '1 1 180px' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                Intensity (optional)
              </Typography>
              <ToggleButtonGroup
                value={intensity}
                exclusive
                onChange={(_, v) => setIntensity(v ?? '')}
                size="small"
                aria-label="Intensity"
                fullWidth
              >
                {INTENSITIES.map((i) => (
                  <ToggleButton
                    key={i}
                    value={i}
                    id={`log-intensity-${i}`}
                    sx={{
                      fontSize: '0.7rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontFamily: '"Space Grotesk", sans-serif',
                      '&.Mui-selected': {
                        backgroundColor: tokens.accentDim15,
                        color: tokens.violetBright,
                      },
                    }}
                  >
                    {i}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Note */}
          <TextField
            label="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How did it feel?"
            fullWidth
            multiline
            minRows={2}
            id="log-note-input"
          />

          {/* Date/time */}
          <TextField
            label="Date & time"
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            fullWidth
            id="log-datetime-input"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          {error && (
            <Alert severity="error" sx={{ fontSize: '0.85rem' }} id="log-error">
              {error}
            </Alert>
          )}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitted || success}
              id="log-submit-button"
            >
              {success ? 'Logged!' : editEntry ? 'Save changes' : 'Log workout'}
            </Button>
            {editEntry && onCancel && (
              <Button
                variant="outlined"
                size="large"
                onClick={onCancel}
                id="log-cancel-button"
              >
                Cancel
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
