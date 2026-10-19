import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import FlagIcon from '@mui/icons-material/Flag';
import { tokens } from '../theme';

/**
 * Goal card: shows the user's active fitness goal, or a form to set one.
 * Only one active goal is stored at a time.
 */
export default function GoalForm({ goal, onSetGoal, onClearGoal }) {
  const [editing, setEditing] = useState(!goal);
  const [text, setText] = useState(goal?.text || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Goal cannot be empty.');
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await onSetGoal(trimmed);
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Could not save your goal.');
    } else {
      setEditing(false);
    }
  }

  if (!editing && goal) {
    return (
      <Card id="goal-card" sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2.5 }}>
          <FlagIcon sx={{ color: 'primary.light', fontSize: 28 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Your goal
            </Typography>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.3, mt: 0.25 }}>
              {goal.text}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => { setText(goal.text); setEditing(true); }}
            aria-label="Edit goal"
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.light' } }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onClearGoal}
            aria-label="Clear goal"
            sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="goal-form-card" sx={{ mb: 3 }}>
      <CardContent component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlagIcon sx={{ color: 'primary.light', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
            {goal ? 'Edit your goal' : 'Set a fitness goal'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Pick something motivating and realistic — e.g. &ldquo;Work out 3 times a week.&rdquo;
        </Typography>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. Work out 3 times a week"
          required
          fullWidth
          id="goal-text-input"
          error={!!error}
          helperText={error}
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            id="goal-save-button"
          >
            {submitting ? 'Saving…' : goal ? 'Save goal' : 'Set goal'}
          </Button>
          {goal && (
            <Button
              variant="outlined"
              onClick={() => { setEditing(false); setError(null); }}
              id="goal-cancel-button"
            >
              Cancel
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
