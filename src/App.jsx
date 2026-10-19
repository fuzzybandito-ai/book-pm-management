import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import Nav from './components/Nav';
import Dashboard from './components/Dashboard';
import LogForm from './components/LogForm';
import History from './components/History';
import Auth from './components/Auth';
import useAuth from './hooks/useAuth';
import useWorkouts from './hooks/useWorkouts';
import useGoal from './hooks/useGoal';
import brand from './brand';

/**
 * Root application component.
 * Owns the sign-in gate, view state (Dashboard / Log / History), and the
 * edit flow. Data is per-user via Supabase auth + RLS — no user can see or
 * modify another user's workouts or goal.
 */
export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const { workouts, loading: workoutsLoading, add, update, remove } = useWorkouts();
  const { goal, loading: goalLoading, upsert } = useGoal();

  const [view, setView] = useState(0); // 0=Dashboard, 1=Log, 2=History
  const [editEntry, setEditEntry] = useState(null);
  const [savingGoal, setSavingGoal] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  // ---- Auth gate ----
  if (authLoading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) {
    return <Auth onSignIn={signIn} onSignUp={signUp} />;
  }

  // ---- Workout submit (add or update) ----
  const handleLogSubmit = useCallback(
    async (payload) => {
      if (payload.id) {
        const { id, ...changes } = payload;
        const result = await update(id, changes);
        if (result.error) return { error: result.error };
        setEditEntry(null);
        setView(0);
        return {};
      }
      const result = await add(payload);
      if (result.error) return { error: result.error };
      setEditEntry(null);
      setView(0); // Back to dashboard so the user sees it update
      return {};
    },
    [add, update]
  );

  const handleEdit = useCallback((entry) => {
    setEditEntry(entry);
    setView(1);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditEntry(null);
  }, []);

  const handleLogNav = useCallback(() => {
    setEditEntry(null);
    setView(1);
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleSaveGoal = useCallback(
    async (values) => {
      setSavingGoal(true);
      const result = await upsert(values);
      setSavingGoal(false);
      return result;
    },
    [upsert]
  );

  const handleDelete = useCallback(async (id) => {
    const result = await remove(id);
    if (result.error) {
      // Surface a simple alert; the list refreshes on success
      console.error('Failed to delete workout:', result.error.message);
    }
  }, [remove]);

  const dataLoading = workoutsLoading || goalLoading;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pb: isMobile ? '72px' : 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Nav
        view={view}
        onChangeView={setView}
        onSignOut={handleSignOut}
        email={user?.email}
      />

      <Box sx={{ flex: 1 }}>
        {dataLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading your workouts…
            </Typography>
          </Box>
        ) : (
          <>
            {view === 0 && (
              <Dashboard
                workouts={workouts}
                goal={goal}
                onSaveGoal={handleSaveGoal}
                savingGoal={savingGoal}
                onLog={handleLogNav}
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
                onDelete={handleDelete}
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
        {brand.name} — campus workout dashboard. Your data is private to you.
      </Box>
    </Box>
  );
}
