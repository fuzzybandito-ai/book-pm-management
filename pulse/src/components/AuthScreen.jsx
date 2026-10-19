import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { useAuth } from '../hooks/useAuth';
import { tokens } from '../theme';
import brand from '../brand';

/**
 * Auth screen: sign in or sign up with email + password.
 * The first thing a user sees when not signed in.
 */
export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fn = mode === 'signin' ? signIn : signUp;
    const { error: err } = await fn(email.trim(), password);
    setSubmitting(false);
    if (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <FitnessCenterIcon sx={{ fontSize: 36, color: 'primary.light' }} />
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.6rem', sm: '2rem' },
            fontWeight: 700,
            background: `linear-gradient(135deg, ${tokens.violet} 0%, ${tokens.violetBright} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {brand.name}
        </Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography variant="h5" sx={{ fontSize: '1.1rem', mb: 0.5 }}>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {mode === 'signin'
                ? 'Sign in to track your workouts and streaks.'
                : 'Start logging your campus workouts today.'}
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => v && (setMode(v), setError(null))}
            fullWidth
            size="small"
            aria-label="Auth mode"
          >
            <ToggleButton
              value="signin"
              sx={{
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
              Sign in
            </ToggleButton>
            <ToggleButton
              value="signup"
              sx={{
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
              Sign up
            </ToggleButton>
          </ToggleButtonGroup>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
              id="auth-email"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              inputProps={{ minLength: 6 }}
              id="auth-password"
            />

            {error && (
              <Alert severity="error" sx={{ fontSize: '0.85rem' }} id="auth-error">
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              id="auth-submit"
            >
              {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.78rem' }}>
            Your workout data is private — only you can see or change it.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
