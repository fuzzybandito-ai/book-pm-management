import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TrendChart from './TrendChart';
import { tokens } from '../theme';

/**
 * Compact stat card for the dashboard: icon, big number, label, optional
 * sub-text.
 */
export default function StatCard({ id, icon: Icon, value, label, sub, accent }) {
  return (
    <Card id={id} sx={{ height: '100%' }}>
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Icon sx={{ color: accent || 'primary.light', fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontSize: '0.78rem' }}>
            {label}
          </Typography>
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontSize: '2.2rem',
            fontWeight: 700,
            color: 'text.primary',
            lineHeight: 1,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        {sub && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
