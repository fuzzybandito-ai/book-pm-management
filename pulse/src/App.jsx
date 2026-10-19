import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Nav from './components/Nav';
import Dashboard from './components/Dashboard';
import LogForm from './components/LogForm';
import History from './components/History';
import AuthScreen from './components/AuthScreen';
import { AuthProvider, useAuth } from './hooks/useAuth';
import useFitnessData from './hooks/useFitnessData';
import brand from './brand';

/**
 * Root application component.
 * Wraps everything in AuthProvider. When signed out, shows AuthScreen.
 * When signed in, shows the fitness dashboard with goal + workout tracking.
 */
export default function App() {
  return (
    <AuthProvider>
      <AppBody />
    </AuthProvider>
  );
}

function AppBody() {
  const { user, loading, signOut } = useAuth();
  const {
    workouts,
    goal,
    loading: dataLoading,
    error,
    addWorkout,
    updateWorkout,
    removeWorkout,
    setGoalText,
    clearGoal,
  } = useFitnessData();

  const [view, setView] = useState(0); // 0=Dashboard, 1=Log, 2=History
  const [editEntry, setEditEntry] = useState(null);

  const handleLogSubmit = useCallback(
    async (entry) => {
      if (entry.id) {
        const { error: err } = await updateWorkout(entry.id, entry);
        return { error: err };
      }
      const { error: err } = await addWorkout(entry);
      return { error: err };
    },
    [addWorkout, updateWorkout]
  );

  const handleEdit = useCallback((entry) => {
    setEditEntry(entry);
    setView(1);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditEntry(null);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  // Auth gate
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav view={view} onChangeView={setView} onSignOut={handleSignOut} />

      <Box sx={{ flex: 1 }}>
        {dataLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading your workouts…
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ maxWidth: 560, mx: 'auto', px: 2, py: 6, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
          </Box>
        ) : (
          <>
            {view === 0 && (
              <Dashboard
                workouts={workouts}
                goal={goal}
                onSetGoal={setGoalText}
                onClearGoal={clearGoal}
                onLogClick={() => { setEditEntry(null); setView(1); }}
              />
            )}
            {view === 1 && (
              <LogForm
                onSubmit={handleLogSubmit}
                editEntry={editEntry}
                onCancel={editEntry ? handleCancelEdit : undefined}
              />
            )}
            {view === 2 && (
              <History
                workouts={workouts}
                onEdit={handleEdit}
                onDelete={removeWorkout}
              />
            )}
          </>
        )}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          textAlign: 'center',
          color: 'text.secondary',
          borderTop: 1,
          borderColor: 'divider',
          fontSize: '0.85rem',
        }}
      >
        {brand.name} — campus fitness progress dashboard.
      </Box>
    </Box>
  );
}
