import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { SiteConfig } from "../types";
import { getIconComponent } from "../utils";
import { removeSite } from "../../../utils/siteManager";
import AccessHistory from "./AccessHistory";
import ConfirmationModal from "./ConfirmationModal";

interface ViewModeProps {
  app: SiteConfig;
  onClose: () => void;
  onOpenApp: (app: SiteConfig) => void;
  onRemoveApp: (app: SiteConfig) => void;
}

const ViewMode: React.FC<ViewModeProps> = ({ app, onClose, onOpenApp }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showUrlLoggingConfirm, setShowUrlLoggingConfirm] = useState(false);
  const [urlLoggingEnabled, setUrlLoggingEnabled] = useState(
    app.urlLogging || false
  );
  const [isTogglingLogging, setIsTogglingLogging] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger state

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

  const handleUrlLoggingConfirm = async () => {
    setShowUrlLoggingConfirm(false);
    await toggleUrlLogging(false);

    // Remove the history file when turning off URL logging
    try {
      const result = await (window as any).ipcRenderer.removeUrlLogFile(
        app.key
      );
      if (result.success) {
        console.log("URL log file removed successfully");
      } else {
        console.error("Failed to remove URL log file:", result.message);
      }
    } catch (error) {
      console.error("Error removing URL log file:", error);
    }
  };

  const handleUrlLoggingCancel = () => {
    setShowUrlLoggingConfirm(false);
  };

  const handleUrlLoggingToggle = async (enabled: boolean) => {
    if (!enabled && urlLoggingEnabled) {
      // Show confirmation when turning off URL logging
      setShowUrlLoggingConfirm(true);
      return;
    }

    await toggleUrlLogging(enabled);
  };

  const toggleUrlLogging = async (enabled: boolean) => {
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
        // Increment refresh trigger to refresh access history
        setRefreshTrigger((prev) => prev + 1);
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
      {/* Main Content */}
      <Box sx={{ flex: 1, position: "relative", padding: "3rem 4rem" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mx: "auto",
            height: "100%",
          }}
        >
          {/* Two-column layout: Left for app info + controls, Right for access history */}
          <Box sx={{ display: "flex", gap: 4, width: "100%" }}>
            {/* Left column: App Icon, Details, and all Controls - 50% width */}
            <Box
              sx={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
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
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
              >
                <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                  {app.url}
                </Typography>

                {app.description && (
                  <Typography variant="body2" color="text.secondary">
                    {app.description}
                  </Typography>
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: "2rem" }}>
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

            {/* Divider between left and right columns */}
            <Box
              sx={{
                width: "1px",
                backgroundColor: "divider",
                mx: 1,
              }}
            />

            {/* Right column: Access History in its own scrollable pane - 50% width */}
            <Box sx={{ width: "50%" }}>
              <AccessHistory
                appKey={app.key}
                refreshTrigger={refreshTrigger}
                urlLoggingSwitch={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      backgroundColor: "background.paper",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={urlLoggingEnabled}
                          onChange={(e) =>
                            handleUrlLoggingToggle(e.target.checked)
                          }
                          disabled={isTogglingLogging}
                          color="primary"
                        />
                      }
                      label={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <HistoryIcon fontSize="small" />
                          <Typography variant="body2" fontWeight="medium">
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
                }
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Confirmation modals */}
      <ConfirmationModal
        open={showRemoveConfirm}
        onClose={handleRemoveCancel}
        onConfirm={handleRemoveConfirm}
        title="Remove Application"
        message={`Are you sure you want to remove "${app.title}"?`}
        confirmText={isRemoving ? "Removing..." : "Remove"}
        cancelText="Cancel"
        confirmColor="error"
      />

      <ConfirmationModal
        open={showUrlLoggingConfirm}
        onClose={handleUrlLoggingCancel}
        onConfirm={handleUrlLoggingConfirm}
        title="Turn Off URL Logging"
        message={`Turning off URL logging for "${app.title}" will permanently remove all access history. This action cannot be undone. Are you sure you want to continue?`}
        confirmText="Turn Off Logging"
        cancelText="Cancel"
        confirmColor="warning"
      />
    </Box>
  );
};

export default ViewMode;
