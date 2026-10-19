import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import GroupIcon from '@mui/icons-material/Group';
import HistoryIcon from '@mui/icons-material/History';
import { tokens } from '../theme';

const KIND_ICONS = {
  solo: SelfImprovementIcon,
  group: GroupIcon,
};

const KIND_LABELS = {
  solo: 'Solo',
  group: 'Group class',
};

const INTENSITY_LABELS = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
};

/**
 * History screen: the signed-in user's own workouts (RLS-enforced server-side),
 * filterable by kind, with edit and delete.
 */
export default function History({ workouts, onEdit, onDelete }) {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    const list =
      filter === 'all' ? workouts : workouts.filter((w) => w.kind === filter);
    return [...list].sort(
      (a, b) => new Date(b.completed_at) - new Date(a.completed_at)
    );
  }, [workouts, filter]);

  function formatTime(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  if (workouts.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
        <HistoryIcon sx={{ fontSize: 64, color: 'primary.light', opacity: 0.4, mb: 2 }} />
        <Typography variant="h5" sx={{ mb: 1, fontSize: '1.1rem' }}>
          Your workout history will appear here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Once you log a workout, you&rsquo;ll see your full history and be able to edit or delete entries.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: 2, py: 3 }}>
      {/* Filter bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '0.85rem' }}>
          Your workouts
        </Typography>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => v && setFilter(v)}
          size="small"
          aria-label="Filter workouts by type"
        >
          <ToggleButton
            value="all"
            id="filter-all"
            sx={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontFamily: '"Space Grotesk", sans-serif',
              px: 1.5,
              '&.Mui-selected': { backgroundColor: tokens.accentDim15, color: tokens.violetBright },
            }}
          >
            All
          </ToggleButton>
          {Object.entries(KIND_LABELS).map(([key, label]) => (
            <ToggleButton
              key={key}
              value={key}
              id={`filter-${key}`}
              sx={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontFamily: '"Space Grotesk", sans-serif',
                px: 1.5,
                '&.Mui-selected': { backgroundColor: tokens.accentDim15, color: tokens.violetBright },
              }}
            >
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Card>
        <List disablePadding>
          {filtered.map((entry, idx) => {
            const Icon = KIND_ICONS[entry.kind] || SelfImprovementIcon;
            return (
              <React.Fragment key={entry.id}>
                {idx > 0 && <Divider sx={{ borderColor: tokens.accentDim12 }} />}
                <ListItem
                  id={`workout-${entry.id}`}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onEdit(entry)}
                        aria-label={`Edit ${entry.activity}`}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.light' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => onDelete(entry.id)}
                        aria-label={`Delete ${entry.activity}`}
                        sx={{ color: 'text.secondary', '&:hover': { color: '#ef4444' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  sx={{ py: 1.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Icon sx={{ color: 'primary.light', fontSize: 22 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {entry.activity}
                        </Typography>
                        <Chip
                          label={KIND_LABELS[entry.kind]}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 22, borderColor: tokens.borderViolet, color: 'text.secondary' }}
                        />
                        {entry.duration_min != null && (
                          <Chip
                            label={`${entry.duration_min} min`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 22, borderColor: tokens.borderViolet, color: 'text.secondary' }}
                          />
                        )}
                        {entry.intensity && (
                          <Chip
                            label={INTENSITY_LABELS[entry.intensity]}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 22, borderColor: tokens.borderViolet, color: 'text.secondary' }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box component="span" sx={{ display: 'block', mt: 0.25 }}>
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          {formatTime(entry.completed_at)}
                        </Typography>
                        {entry.note && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ display: 'block', fontSize: '0.78rem', mt: 0.25 }}>
                            {entry.note}
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
        {filtered.length} {filtered.length === 1 ? 'workout' : 'workouts'}
      </Typography>
    </Box>
  );
}
