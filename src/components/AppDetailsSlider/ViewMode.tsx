import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
} from "@mui/material";
import { Close as CloseIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { SiteConfig } from "./types";
import { getIconComponent } from "./utils";

interface ViewModeProps {
  app: SiteConfig;
  onClose: () => void;
  onOpenApp: (app: SiteConfig) => void;
  onRemoveApp: (app: SiteConfig) => void;
}

const ViewMode: React.FC<ViewModeProps> = ({
  app,
  onClose,
  onOpenApp,
  onRemoveApp,
}) => {
  const handleRemoveConfirm = () => {
    onRemoveApp(app);
    onClose();
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 3,
          pb: 2,
        }}
      >
        <Typography variant="h5" component="h2">
          {app.title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, px: 3, pb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            maxWidth: 600,
            mx: "auto",
            height: "100%",
          }}
        >
          {/* App Icon */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: "white",
              }}
            >
              {getIconComponent(app)}
            </Box>
          </Box>

          {/* App Details */}
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                URL
              </Typography>
              <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                {app.url}
              </Typography>
            </Box>

            {app.description && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1">{app.description}</Typography>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                App Key
              </Typography>
              <Chip label={app.key} size="small" variant="outlined" />
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => onOpenApp(app)}
              sx={{ minWidth: 120 }}
            >
              OPEN APPLICATION
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleRemoveConfirm}
              startIcon={<DeleteIcon />}
              sx={{ minWidth: 120 }}
            >
              REMOVE
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ViewMode;
