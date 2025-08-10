import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { SiteConfig } from "../types";
import { getIconComponent } from "../utils";
import { removeSite } from "../../../utils/siteManager";
import AccessHistory from "./AccessHistory";

interface ViewModeProps {
  app: SiteConfig;
  onClose: () => void;
  onOpenApp: (app: SiteConfig) => void;
  onRemoveApp: (app: SiteConfig) => void;
}

const ViewMode: React.FC<ViewModeProps> = ({ app, onClose, onOpenApp }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [urlLoggingEnabled, setUrlLoggingEnabled] = useState(
    app.urlLogging || false
  );
  const [isTogglingLogging, setIsTogglingLogging] = useState(false);

  const handleRemoveClick = () => {
    setShowRemoveConfirm(true);
  };

  const handleRemoveConfirm = async () => {
    setShowRemoveConfirm(false);
    setIsRemoving(true);
    try {
      const result = await removeSite(app.key);
      if (result.success) {
        // Just close the slider, don't call onRemoveApp here
        // The parent component will handle refreshing the list
        onClose();
      } else {
        console.error("Failed to remove site:", result.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error removing site:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleRemoveCancel = () => {
    setShowRemoveConfirm(false);
  };

  const handleUrlLoggingToggle = async (enabled: boolean) => {
    setIsTogglingLogging(true);
    try {
      const result = await (window as any).ipcRenderer.toggleUrlLogging(
        app.key,
        enabled
      );
      if (result.success) {
        setUrlLoggingEnabled(enabled);
        // Update the app object locally
        app.urlLogging = enabled;
      } else {
        console.error("Failed to toggle URL logging:", result.message);
      }
    } catch (error) {
      console.error("Error toggling URL logging:", error);
    } finally {
      setIsTogglingLogging(false);
    }
  };

  // Sync URL logging state when app changes
  useEffect(() => {
    setUrlLoggingEnabled(app.urlLogging || false);
  }, [app.urlLogging]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          p: 3,
          pb: 2,
        }}
      >
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
            maxWidth: 800,
            mx: "auto",
            height: "100%",
          }}
        >
          {/* Two-column layout: Left for app info + controls, Right for access history */}
          <Box sx={{ display: "flex", gap: 4, mt: 2, width: "100%" }}>
            {/* Left column: App Icon, Details, and all Controls - flexible width */}
            <Box
              sx={{
                minWidth: "280px",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {/* App Icon */}
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {getIconComponent(app)}
              </Box>

              {/* App Details */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                  {app.url}
                </Typography>

                {app.description && (
                  <Typography variant="body2" color="text.secondary">
                    {app.description}
                  </Typography>
                )}
              </Box>

              {/* URL Logging Toggle */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={urlLoggingEnabled}
                      onChange={(e) => handleUrlLoggingToggle(e.target.checked)}
                      disabled={isTogglingLogging}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HistoryIcon fontSize="small" />
                      <Typography variant="body2">
                        {isTogglingLogging ? "Updating..." : "URL Logging"}
                      </Typography>
                    </Box>
                  }
                />
                {urlLoggingEnabled && (
                  <Chip
                    label="Active"
                    size="small"
                    variant="outlined"
                    color="success"
                  />
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => onOpenApp(app)}
                  sx={{ minWidth: 120 }}
                >
                  OPEN APPLICATION
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleRemoveClick}
                  disabled={isRemoving}
                  startIcon={<DeleteIcon />}
                  sx={{ minWidth: 120 }}
                >
                  {isRemoving ? "REMOVING..." : "REMOVE"}
                </Button>
              </Box>
            </Box>

            {/* Right column: Access History in its own scrollable pane - takes remaining space */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <AccessHistory appKey={app.key} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Remove confirmation dialog */}
      <Dialog
        open={showRemoveConfirm}
        onClose={handleRemoveCancel}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 400,
            maxWidth: 500,
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            px: 3,
            pt: 3,
          }}
        >
          <Typography variant="h6" component="span">
            Remove Application
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            Are you sure you want to remove <strong>"{app.title}"</strong>?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={handleRemoveCancel}
            variant="outlined"
            sx={{
              minWidth: 100,
              px: 3,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemoveConfirm}
            color="error"
            variant="contained"
            disabled={isRemoving}
            startIcon={
              isRemoving ? <CircularProgress size={16} /> : <DeleteIcon />
            }
            sx={{
              minWidth: 120,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            {isRemoving ? "Removing..." : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewMode;
