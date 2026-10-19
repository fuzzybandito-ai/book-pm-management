import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import GoalForm from './GoalForm';
import StatCard from './StatCard';
import {
  currentStreak,
  totalWorkouts,
  weeklyWorkouts,
  weeklyTrend,
} from '../lib/fitness';

/**
 * Dashboard screen: the user's goal, stat cards (streak, weekly, total), and a
 * weekly trend chart. Includes a clear empty state when no workouts exist yet.
 */
export default function Dashboard({
  workouts,
  goal,
  onSetGoal,
  onClearGoal,
  onLogClick,
}) {
  const stats = useMemo(() => {
    return {
      streak: currentStreak(workouts),
      weekly: weeklyWorkouts(workouts),
      total: totalWorkouts(workouts),
      trend: weeklyTrend(workouts),
    };
  }, [workouts]);

  const hasWorkouts = workouts.length > 0;

  return (
    <Box sx={{ maxWidth: 920, mx: 'auto', px: 2, py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontSize: '1.2rem' }}>
          Your progress
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onLogClick}
          id="dashboard-log-button"
        >
          Log workout
        </Button>
      </Box>

      {/* Goal — set or displayed */}
      <GoalForm goal={goal} onSetGoal={onSetGoal} onClearGoal={onClearGoal} />

      {/* Empty state */}
      {!hasWorkouts && (
        <Box
          id="dashboard-empty-state"
          sx={{
            textAlign: 'center',
            py: 6,
            px: 3,
            border: `1px dashed ${tokens.borderViolet}`,
            borderRadius: 3,
            mb: 3,
          }}
        >
          <SelfImprovementIcon sx={{ fontSize: 56, color: 'primary.light', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>
            No workouts logged yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Log your first workout — solo or a campus group class — and your streak, weekly progress, and totals will appear here.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onLogClick}
            id="empty-log-button"
          >
            Log your first workout
          </Button>
        </Box>
      )}

      {/* Stat cards */}
      {hasWorkouts && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 4 }}>
            <StatCard
              id="stat-streak"
              icon={LocalFireDepartmentIcon}
              value={`${stats.streak} day${stats.streak === 1 ? '' : 's'}`}
              label="Current streak"
              sub={stats.streak === 0 ? 'Log today to start one' : 'Keep it going'}
              accent="#FBBF24"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <StatCard
              id="stat-weekly"
              icon={CalendarWeekIcon}
              value={stats.weekly}
              label="This week"
              sub="Workouts since Monday"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard
              id="stat-total"
              icon={FitnessCenterIcon}
              value={stats.total}
              label="Total workouts"
              sub="All time"
            />
          </Grid>
        </Grid>
      )}

      {/* Weekly trend chart */}
      {hasWorkouts && (
        <Box>
          <Typography variant="h6" sx={{ fontSize: '0.85rem', mb: 1 }}>
            Last 7 days
          </Typography>
          <Box
            sx={{
              backgroundColor: '#14141C',
              border: `1px solid ${tokens.borderViolet}`,
              borderRadius: 2,
              p: 2,
            }}
          >
            <TrendChart data={stats.trend} label="workouts" id="weekly-trend-chart" />
          </Box>
        </Box>
      )}
    </Box>
  );
}
