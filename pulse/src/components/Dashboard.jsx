import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import TrendChart from './TrendChart';
import GoalCard from './GoalCard';
import { tokens } from '../theme';
import {
  dayKey,
  todayKey,
  currentWeekDays,
  weekdayLabels,
  currentStreak,
  workoutsThisWeek,
} from '../lib/dates';

/**
 * Dashboard — the campus-focused progress dashboard.
 * Shows: the user's goal, current streak, total workouts, this week's
 * workouts with progress toward the weekly target, and a 14-day trend.
 * Updates immediately when a workout is logged (parent passes fresh data).
 */
export default function Dashboard({ workouts, goal, onSaveGoal, savingGoal, onLog }) {
  const total = workouts.length;
  const streak = useMemo(() => currentStreak(workouts), [workouts]);
  const thisWeek = useMemo(() => workoutsThisWeek(workouts), [workouts]);
  const targetDays = goal?.target_days ?? 0;
  const weekProgress = targetDays > 0 ? Math.min(thisWeek / targetDays, 1) : 0;
  const weekLabels = useMemo(() => weekdayLabels(), []);
  const weekDays = useMemo(() => currentWeekDays(), []);

  const todayCount = useMemo(
    () => workouts.filter((w) => dayKey(w.completed_at) === todayKey()).length,
    [workouts]
  );

  // 14-day trend: workouts per day
  const trendData = useMemo(() => {
    const byDay = {};
    workouts.forEach((w) => {
      const k = dayKey(w.completed_at);
      byDay[k] = (byDay[k] || 0) + 1;
    });
    const out = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dayKey(d);
      out.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: byDay[k] || 0,
      });
    }
    return out;
  }, [workouts]);

  // Weekly dot row: which days this week have at least one workout
  const weekActivity = weekDays.map((k) => workouts.some((w) => dayKey(w.completed_at) === k));

  // Empty state — no workouts and no goal yet
  if (total === 0 && !goal) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 3 }}>
        <EmptyHero onLog={onLog} />
        <Box sx={{ mt: 3 }}>
          <GoalCard goal={goal} onSave={onSaveGoal} saving={savingGoal} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontSize: '1.2rem' }}>
          Your Progress
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={onLog}
          id="dashboard-log-button"
        >
          Log workout
        </Button>
      </Box>

      <Grid container spacing={2}>
        {/* Goal card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <GoalCard goal={goal} onSave={onSaveGoal} saving={savingGoal} />
        </Grid>

        {/* Streak + total stats */}
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            id="streak-card"
            icon={<LocalFireDepartmentIcon />}
            label="Current streak"
            value={streak}
            unit={streak === 1 ? 'day' : 'days'}
            highlight
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            id="total-card"
            icon={<FitnessCenterIcon />}
            label="Total workouts"
            value={total}
            unit={total === 1 ? 'workout' : 'workouts'}
          />
        </Grid>

        {/* Weekly progress card */}
        <Grid size={{ xs: 12 }}>
          <Card id="weekly-card">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarTodayIcon sx={{ color: 'primary.light', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontSize: '0.8rem' }}>
                    This Week
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {thisWeek} {targetDays > 0 ? `of ${targetDays}` : ''} {thisWeek === 1 ? 'workout' : 'workouts'}
                </Typography>
              </Box>

              {targetDays > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={weekProgress * 100}
                    id="weekly-progress-bar"
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: tokens.accentDim12,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor: tokens.violetBright,
                      },
                    }}
                  />
                  {weekProgress >= 1 && (
                    <Typography variant="body2" sx={{ mt: 1, color: '#4ADE80', fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 }}>
                      Goal reached — nice work.
                    </Typography>
                  )}
                </Box>
              )}

              {/* Week dot row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                {weekLabels.map((label, i) => (
                  <Box key={label} sx={{ flex: 1, textAlign: 'center' }}>
                    <Box
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        mb: 0.5,
                        backgroundColor: weekActivity[i] ? tokens.violetBright : tokens.accentDim12,
                        transition: 'background-color 0.3s ease',
                      }}
                    />
                    <Typography variant="body2" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      {label[0]}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {todayCount > 0 && (
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                  {todayCount} {todayCount === 1 ? 'workout' : 'workouts'} logged today. Keep it going.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 14-day trend */}
        <Grid size={{ xs: 12 }}>
          <Card id="trend-card">
            <CardContent>
              <Typography variant="h6" sx={{ fontSize: '0.8rem', mb: 1.5 }}>
                Last 14 Days
              </Typography>
              <TrendChart data={trendData} label="workouts" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function StatCard({ id, icon, label, value, unit, highlight }) {
  return (
    <Card id={id} sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ color: highlight ? tokens.violetBright : 'primary.light' }}>{icon}</Box>
          <Typography variant="h6" sx={{ fontSize: '0.75rem' }}>
            {label}
          </Typography>
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontSize: '2.2rem',
            fontWeight: 700,
            color: highlight ? tokens.violetBright : 'text.primary',
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {unit}
        </Typography>
      </CardContent>
    </Card>
  );
}

function EmptyHero({ onLog }) {
  return (
    <Card id="empty-state-card" sx={{ overflow: 'hidden' }}>
      <CardContent sx={{ textAlign: 'center', py: 6, px: { xs: 3, sm: 5 } }}>
        <FitnessCenterIcon sx={{ fontSize: 56, color: 'primary.light', opacity: 0.5, mb: 2 }} />
        <Typography variant="h5" sx={{ fontSize: '1.1rem', mb: 1 }}>
          Log your first workout
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: 'auto', lineHeight: 1.6 }}>
          Every workout counts — solo or a campus group class. Log one to start your streak and see your progress here.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={onLog}
          id="empty-log-button"
        >
          Log a workout
        </Button>
      </CardContent>
    </Card>
  );
}
