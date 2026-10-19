import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import { tokens } from '../theme';
import { KINDS, ACTIVITY_PRESETS, INTENSITY_OPTIONS } from '../data/fitness';

/**
 * LogForm — add or edit a workout. On submit the parent persists to Supabase;
 * a success state gives immediate visual feedback (PRD: "Receive immediate
 * feedback after logging a workout"). Multiple workouts per day are allowed —
 * no date is blocked.
 */
export default function LogForm({ onSubmit, editEntry, onCancel }) {
  const [kind, setKind] = useState('solo');
  const [activity, setActivity] = useState('');
  const [durationMin, setDurationMin] = useState('');
  const [intensity, setIntensity] = useState('');
  const [note, setNote] = useState('');
  const [datetime, setDatetime] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (editEntry) {
      setKind(editEntry.kind || 'solo');
      setActivity(editEntry.activity || '');
      setDurationMin(editEntry.duration_min != null ? String(editEntry.duration_min) : '');
      setIntensity(editEntry.intensity || '');
      setNote(editEntry.note || '');
      setDatetime(toLocalInput(editEntry.completed_at));
    } else {
      resetForm();
    }
  }, [editEntry]);

  useEffect(() => {
    if (!editEntry) resetForm();
  }, []);

  function resetForm() {
    setKind('solo');
    setActivity('');
    setDurationMin('');
    setIntensity('');
    setNote('');
    setSubmitted(false);
    setError(null);
    setDatetime(toLocalInput(new Date().toISOString()));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!activity.trim()) {
      setError('Tell us what you did — pick an activity or type your own.');
      return;
    }
    const parsedDuration = durationMin === '' ? null : parseInt(durationMin, 10);
    if (parsedDuration !== null && (isNaN(parsedDuration) || parsedDuration <= 0)) {
      setError('Duration must be a positive number of minutes.');
      return;
    }

    const payload = {
      kind,
      activity: activity.trim(),
      durationMin: parsedDuration,
      intensity: intensity || null,
      note: note.trim() || null,
      completedAt: new Date(datetime).toISOString(),
    };
    if (editEntry) payload.id = editEntry.id;

    setBusy(true);
    setError(null);
    const result = await onSubmit(payload);
    setBusy(false);
    if (result && result.error) {
      setError(result.error.message || 'Could not save the workout. Please try again.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      resetForm();
    }, 1200);
  }

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', px: 2, py: 3 }}>
      <Typography variant="h5" sx={{ mb: 0.5, fontSize: '1.2rem' }}>
        {editEntry ? 'Edit Workout' : 'Log a Workout'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Every workout counts. Log what you did and watch your streak grow.
      </Typography>

      <Card>
        <CardContent component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Kind: solo or group class */}
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

          {/* Activity presets */}
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Quick pick
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {ACTIVITY_PRESETS.filter((p) => p.kind === kind).map((p) => (
                <Chip
                  key={p.activity}
                  label={p.activity}
                  onClick={() => setActivity(p.activity)}
                  variant={activity === p.activity ? 'filled' : 'outlined'}
                  color="primary"
                  icon={p.icon}
                  sx={{
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                  }}
                  id={`log-preset-${p.activity.replace(/\s+/g, '-').toLowerCase()}`}
                />
              ))}
            </Box>
          </Box>

          {/* Activity text (preset or custom) */}
          <TextField
            label="Activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            placeholder="e.g. Treadmill run"
            required
            fullWidth
            id="log-activity-input"
          />

          {/* Duration + intensity row */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <TextField
              label="Duration (min)"
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder="e.g. 30"
              fullWidth
              inputProps={{ min: 0 }}
              id="log-duration-input"
            />
            <Box sx={{ flex: '1 1 160px' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Intensity
              </Typography>
              <ToggleButtonGroup
                value={intensity}
                exclusive
                onChange={(_, v) => v && setIntensity(v)}
                size="small"
                fullWidth
                aria-label="Intensity"
              >
                {INTENSITY_OPTIONS.map((o) => (
                  <ToggleButton
                    key={o.value}
                    value={o.value}
                    id={`log-intensity-${o.value}`}
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
                    {o.label}
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
            maxRows={3}
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

          {error && <Alert severity="error" id="log-error">{error}</Alert>}

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitted || busy}
              startIcon={submitted ? <CheckIcon /> : null}
              id="log-submit-button"
            >
              {submitted ? 'Logged!' : editEntry ? 'Save changes' : 'Log workout'}
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

function toLocalInput(iso) {
  const d = new Date(iso);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  return local;
}
