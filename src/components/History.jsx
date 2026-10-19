import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import GroupIcon from '@mui/icons-material/Group';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import AccessibilityNewIcon from '@mui/icons-material/AccessibilityNew';
import SportsIcon from '@mui/icons-material/Sports';
import HistoryIcon from '@mui/icons-material/History';
import { tokens } from '../theme';
import { KIND_LABELS } from '../data/fitness';
import { dayKey } from '../lib/dates';

const KIND_ICONS = {
  solo: DirectionsRunIcon,
  group: GroupIcon,
};

const ACTIVITY_ICON_HINT = {
  'Treadmill run': DirectionsRunIcon,
  'Weight training': FitnessCenterIcon,
  'Swimming laps': SelfImprovementIcon,
  'Stretching & mobility': AccessibilityNewIcon,
  'York Lions group fitness': GroupIcon,
  'Intramural game': SportsIcon,
};

const INTENSITY_COLORS = {
  easy: '#4ADE80',
  moderate: '#FBBF24',
  hard: '#FF3B54',
};

/**
 * History — chronological list of the user's own workouts with edit/delete.
 * Multiple workouts on the same day are shown as separate entries (never
 * hidden). Empty state included.
 */
export default function History({ workouts, onEdit, onDelete }) {
  const sorted = useMemo(
    () => [...workouts].sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at)),
    [workouts]
  );

  if (workouts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
        <HistoryIcon sx={{ fontSize: 64, color: 'primary.light', opacity: 0.4, mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 1, fontSize: '1.1rem' }}>
          No workouts yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, mx: 'auto', lineHeight: 1.6 }}>
          Your logged workouts will appear here. Log your first one from the dashboard or the Log tab.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: 2, py: 3 }}>
      <Typography variant="h5" sx={{ mb: 0.5, fontSize: '1.2rem' }}>
        Workout History
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Every workout you've logged, newest first.
      </Typography>

      <Card>
        <List disablePadding>
          {sorted.map((w, idx) => {
            const KindIcon = KIND_ICONS[w.kind] || FitnessCenterIcon;
            const HintIcon = ACTIVITY_ICON_HINT[w.activity];
            const Icon = HintIcon || KindIcon;
            const intensityColor = w.intensity ? INTENSITY_COLORS[w.intensity] : null;
            return (
              <React.Fragment key={w.id}>
                {idx > 0 && <Divider sx={{ borderColor: tokens.accentDim12 }} />}
                <ListItem
                  id={`workout-${w.id}`}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onEdit(w)}
                        aria-label={`Edit ${w.activity} workout`}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.light' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onDelete(w.id)}
                        aria-label={`Delete ${w.activity} workout`}
                        sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  sx={{ py: 1.5, pr: 11 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon sx={{ color: 'primary.light', fontSize: 22 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {w.activity}
                        </Typography>
                        <Chip
                          label={KIND_LABELS[w.kind] || w.kind}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.65rem',
                            height: 20,
                            borderColor: tokens.borderViolet,
                            color: 'text.secondary',
                          }}
                        />
                        {intensityColor && (
                          <Chip
                            label={w.intensity}
                            size="small"
                            sx={{
                              fontSize: '0.65rem',
                              height: 20,
                              backgroundColor: `${intensityColor}22`,
                              color: intensityColor,
                              border: `1px solid ${intensityColor}55`,
                              textTransform: 'capitalize',
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.25 }}>
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {formatTime(w.completed_at)}
                        </Typography>
                        {w.duration_min != null && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            {w.duration_min} min
                          </Typography>
                        )}
                        {w.note && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                            {w.note}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>
      </Card>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
        {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'} logged
      </Typography>
    </Box>
  );
}

function formatTime(iso) {
  const d = new Date(iso);
  const today = dayKey(new Date());
  const that = dayKey(d);
  if (today === that) {
    return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
