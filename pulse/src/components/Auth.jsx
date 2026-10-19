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
import { tokens } from '../theme';
import brand from '../brand';

/**
 * Auth screen — email/password sign in and sign up.
 * The whole flow lives here so a new user can create an account and reach the
 * app, and a returning user can sign back in.
 */
export default function Auth({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const action = mode === 'signin' ? onSignIn : onSignUp;
    const result = await action(email.trim(), password);
    setBusy(false);
    if (result.error) {
      setError(friendlyError(result.error, mode));
    }
  }

  function friendlyError(err, mode) {
    const msg = err.message || String(err);
    if (mode === 'signup') {
      if (/already/i.test(msg)) return 'An account with that email already exists. Try signing in.';
    } else {
      if (/invalid/i.test(msg) || /credentials/i.test(msg)) return 'That email or password is incorrect.';
      if (/not confirmed/i.test(msg)) return 'Your account is not confirmed yet.';
    }
    return 'Something went wrong. Please try again.';
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
            background: `linear-gradient(135deg, ${tokens.violet} 0%, ${tokens.violetBright} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {brand.name}
        </Typography>
      </Box>

      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
            Track your campus workouts, set a goal, and keep your streak going.
            Your workout data is private to you.
          </Typography>

          <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={(_, v) => v && (setMode(v), setError(null))}
            fullWidth
            size="small"
            aria-label="Sign in or sign up"
            sx={{ mb: 2.5 }}
          >
            <ToggleButton
              value="signin"
              id="auth-mode-signin"
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
              id="auth-mode-signup"
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
              Create account
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
              id="auth-password"
            />

            {error && <Alert severity="error" id="auth-error">{error}</Alert>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={busy}
              id="auth-submit"
            >
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center', maxWidth: 420, lineHeight: 1.6 }}>
        For the York University community. Your workouts are visible only to you.
      </Typography>
    </Box>
  );
}
