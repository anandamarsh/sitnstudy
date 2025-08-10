import React from 'react';
import { Snackbar, Alert, Typography } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorSnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorSnackbar({ open, message, details, onClose }: ErrorSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ zIndex: 9999 }}
    >
      <Alert
        onClose={onClose}
        severity="error"
        variant="filled"
        icon={<ErrorIcon />}
        sx={{
          width: '100%',
          maxWidth: '500px',
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          {message}
        </Typography>
      </Alert>
    </Snackbar>
  );
}
