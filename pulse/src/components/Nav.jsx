import React from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { tokens } from '../theme';
import brand from '../brand';

/**
 * App header with logo and responsive navigation.
 * Mobile (≤600px): BottomNavigation fixed to bottom.
 * Desktop: Tabs in the header.
 * Sign-out is available from the header on all sizes.
 */
export default function Nav({ view, onChangeView, onSignOut, email }) {
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <>
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          py: 1.5,
          borderBottom: `1px solid ${tokens.borderViolet}`,
          backgroundColor: 'rgba(20,20,28,0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 1100,
        }}
      >
        {/* Logo + name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FitnessCenterIcon sx={{ color: 'primary.light', fontSize: 28 }} />
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.3rem' },
              fontWeight: 700,
              background: `linear-gradient(135deg, ${tokens.violet} 0%, ${tokens.violetBright} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {brand.name}
          </Typography>
        </Box>

        {/* Desktop tabs + sign out */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tabs
              value={view}
              onChange={(_, v) => onChangeView(v)}
              aria-label="Main navigation"
            >
              <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" value={0} id="nav-dashboard" />
              <Tab icon={<AddCircleOutlineIcon />} iconPosition="start" label="Log" value={1} id="nav-log" />
              <Tab icon={<HistoryIcon />} iconPosition="start" label="History" value={2} id="nav-history" />
            </Tabs>
            <Tooltip title={email ? `Signed in as ${email}` : 'Sign out'}>
              <IconButton
                onClick={onSignOut}
                aria-label="Sign out"
                id="signout-button"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.light' } }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}

        {/* Mobile sign out */}
        {isMobile && (
          <IconButton
            onClick={onSignOut}
            aria-label="Sign out"
            id="signout-button-mobile"
            size="small"
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.light' } }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <BottomNavigation
          value={view}
          onChange={(_, v) => onChangeView(v)}
          showLabels
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }}
        >
          <BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} id="nav-mobile-dashboard" />
          <BottomNavigationAction label="Log" icon={<AddCircleOutlineIcon />} id="nav-mobile-log" />
          <BottomNavigationAction label="History" icon={<HistoryIcon />} id="nav-mobile-history" />
        </BottomNavigation>
      )}
    </>
  );
}
