import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FlagIcon from '@mui/icons-material/Flag';
import Alert from '@mui/material/Alert';
import { tokens } from '../theme';

/**
 * GoalCard — shows the user's single active fitness goal, or an inviting
 * empty state that prompts them to set one. Inline edit/create.
 */
export default function GoalCard({ goal, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState('');
  const [targetDays, setTargetDays] = useState(3);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (goal) {
      setText(goal.text || '');
      setTargetDays(goal.target_days ?? 3);
    }
  }, [goal]);

  function startEdit() {
    setText(goal?.text || '');
    setTargetDays(goal?.target_days ?? 3);
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    if (!text.trim()) {
      setError("Write a short goal so you know what you're working toward.");
      return;
    }
    if (targetDays < 1 || targetDays > 7) {
      setError('Pick a target between 1 and 7 days per week.');
      return;
    }
    setError(null);
    const result = await onSave({ text: text.trim(), targetDays, isActive: true });
    if (result && result.error) {
      setError(result.error.message || 'Could not save your goal. Please try again.');
      return;
    }
    setEditing(false);
  }

  // Editing state
  if (editing || !goal) {
    return (
      <Card id="goal-card" sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlagIcon sx={{ color: 'primary.light', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontSize: '0.8rem' }}>
              {goal ? 'Your Goal' : 'Set a Goal'}
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            {goal
              ? 'What are you working toward this pilot? Update it any time.'
              : 'Start with one goal. It can be small — the point is to have something to aim for.'}
          </Typography>

          <TextField
            label="Your fitness goal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Exercise 3 days a week for the pilot"
            fullWidth
            multiline
            maxRows={3}
            id="goal-text-input"
          />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Target days per week
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <Box
                  key={n}
                  component="button"
                  type="button"
                  onClick={() => setTargetDays(n)}
                  id={`goal-target-${n}`}
                  aria-label={`Target ${n} days per week`}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    border: `1px solid ${targetDays === n ? tokens.accentBorder40 : tokens.borderViolet}`,
                    backgroundColor: targetDays === n ? tokens.accentDim15 : 'transparent',
                    color: targetDays === n ? tokens.violetBright : 'text.secondary',
                    fontFamily: '"Space Grotesk", sans-serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: tokens.violet,
                      color: tokens.violetBright,
                    },
                  }}
                >
                  {n}
                </Box>
              ))}
            </Box>
          </Box>

          {error && <Alert severity="error" id="goal-error">{error}</Alert>}

          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
            <Button
              variant="contained"
              size="medium"
              startIcon={<CheckIcon />}
              onClick={handleSave}
              disabled={saving}
              id="goal-save-button"
            >
              {saving ? 'Saving…' : goal ? 'Save goal' : 'Set goal'}
            </Button>
            {goal && editing && (
              <Button
                variant="outlined"
                size="medium"
                startIcon={<CloseIcon />}
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

  // Display state
  return (
    <Card id="goal-card" sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlagIcon sx={{ color: 'primary.light', fontSize: 20 }} />
            <Typography variant="h6" sx={{ fontSize: '0.8rem' }}>
              Your Goal
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={startEdit}
            aria-label="Edit goal"
            id="goal-edit-button"
            sx={{
              color: 'text.secondary',
              border: `1px solid ${tokens.borderViolet}`,
              width: 30,
              height: 30,
              '&:hover': { color: 'primary.light', borderColor: 'primary.main' },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.5, mb: 2 }}>
          {goal.text}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography
            component="span"
            sx={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1,
            }}
          >
            {goal.target_days}
          </Typography>
          <Typography component="span" variant="body2" color="text.secondary">
            days / week target
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
