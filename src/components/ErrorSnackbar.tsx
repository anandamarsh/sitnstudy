import React, { useState } from 'react';
import { Snackbar, Alert, Typography, Box } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

interface ErrorSnackbarProps {
  open: boolean;
  message: string;
  details?: string;
  onClose: () => void;
}

export default function ErrorSnackbar({ open, message, details, onClose }: ErrorSnackbarProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleClick = () => {
    if (details) {
      setShowDetails(!showDetails);
    }
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    // Only close if it's a manual close (X button or escape key)
    // Don't close if it's a click on the main content area
    if (reason === 'clickaway') {
      return;
    }
    setShowDetails(false);
    onClose();
  };

  // Reset showDetails when snackbar opens
  React.useEffect(() => {
    if (open) {
      setShowDetails(false);
    }
  }, [open]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ zIndex: 9999 }}
    >
      <Alert
        onClose={handleClose}
        severity="error"
        variant="filled"
        icon={<ErrorIcon />}
        onClick={handleClick}
        sx={{
          width: '100%',
          maxWidth: '500px',
          cursor: details ? 'pointer' : 'default',
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          {message}
        </Typography>
        {details && showDetails && (
          <Box sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            p: 1,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            mt: 1,
            wordBreak: 'break-all'
          }}>
            {details}
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
}
