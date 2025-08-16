import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  IconButton,
  TextField,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { SiteConfig } from "../types";
import { getIconComponent } from "../utils";
import { removeSite } from "../../../utils/siteManager";
import AccessHistory from "./AccessHistory";
import ConfirmationModal from "../../ConfirmationModal";

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
  const [allowExternalNavigation, setAllowExternalNavigation] = useState(
    app.allowExternalNavigation || false // Default to false if not set
  );
  const [allowInternalNavigation, setAllowInternalNavigation] = useState(
    app.allowInternalNavigation || false // Default to false if not set
  );
  const [showAddressBar, setShowAddressBar] = useState(
    app.showAddressBar || false // Default to false if not set
  );
  const [isTogglingLogging, setIsTogglingLogging] = useState(false);
  const [isTogglingNavigation, setIsTogglingNavigation] = useState(false);
  const [isTogglingInternalNavigation, setIsTogglingInternalNavigation] =
    useState(false);
  const [isTogglingAddressBar, setIsTogglingAddressBar] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger state

  // Whitelist state
  const [whitelistedUrls, setWhitelistedUrls] = useState<string[]>([]);
  const [editingUrl, setEditingUrl] = useState<string>("");
  const [isAddingUrl, setIsAddingUrl] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
        setRefreshTrigger((prev) => prev + 1); // Trigger refresh of access history
      } else {
        console.error("Failed to toggle URL logging:", result.error);
      }
    } catch (error) {
      console.error("Error toggling URL logging:", error);
    } finally {
      setIsTogglingLogging(false);
    }
  };

  const toggleExternalNavigation = async (enabled: boolean) => {
    setIsTogglingNavigation(true);
    try {
      const result = await (window as any).ipcRenderer.toggleExternalNavigation(
        app.key,
        enabled
      );
      if (result.success) {
        setAllowExternalNavigation(enabled);
      } else {
        console.error("Failed to toggle external navigation:", result.error);
      }
    } catch (error) {
      console.error("Error toggling external navigation:", error);
    } finally {
      setIsTogglingNavigation(false);
    }
  };

  const toggleInternalNavigation = async (enabled: boolean) => {
    setIsTogglingInternalNavigation(true);
    try {
      const result = await (window as any).ipcRenderer.toggleInternalNavigation(
        app.key,
        enabled
      );
      if (result.success) {
        setAllowInternalNavigation(enabled);
      } else {
        console.error("Failed to toggle internal navigation:", result.error);
      }
    } catch (error) {
      console.error("Error toggling internal navigation:", error);
    } finally {
      setIsTogglingInternalNavigation(false);
    }
  };

  const toggleAddressBar = async (enabled: boolean) => {
    setIsTogglingAddressBar(true);
    try {
      const result = await (window as any).ipcRenderer.toggleAddressBar(
        app.key,
        enabled
      );
      if (result.success) {
        setShowAddressBar(enabled);
      } else {
        console.error("Failed to toggle address bar:", result.error);
      }
    } catch (error) {
      console.error("Error toggling address bar:", error);
    } finally {
      setIsTogglingAddressBar(false);
    }
  };

  // Whitelist functions
  const startAddingUrl = () => {
    setIsAddingUrl(true);
    setEditingUrl("");
  };

  const saveUrl = (url: string) => {
    if (url.trim() && !whitelistedUrls.includes(url.trim())) {
      setWhitelistedUrls((prev) => [...prev, url.trim()]); // Add to bottom
    }
    setIsAddingUrl(false);
    setEditingUrl("");
  };

  const startEditingUrl = (index: number, url: string) => {
    setEditingIndex(index);
    setEditingUrl(url);
  };

  const saveEditedUrl = (index: number, url: string) => {
    if (url.trim() && !whitelistedUrls.includes(url.trim())) {
      setWhitelistedUrls((prev) => {
        const newUrls = [...prev];
        newUrls[index] = url.trim();
        return newUrls;
      });
    }
    setEditingIndex(null);
    setEditingUrl("");
  };

  const removeWhitelistedUrl = (index: number) => {
    setWhitelistedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Sync URL logging state when app changes
  useEffect(() => {
    setUrlLoggingEnabled(app.urlLogging || false);
  }, [app.urlLogging]);

  // Sync internal navigation state when app changes
  useEffect(() => {
    setAllowInternalNavigation(app.allowInternalNavigation || false);
  }, [app.allowInternalNavigation]);

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 3, pb: 2 }}
      >
        <Typography variant="h5" component="h2"></Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          padding: "0 4rem",
          height: "calc(100vh - 120px)",
        }}
      >
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

              {/* Address Bar Toggle */}
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
                      checked={showAddressBar}
                      onChange={(e) => toggleAddressBar(e.target.checked)}
                      disabled={isTogglingAddressBar}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {isTogglingAddressBar
                          ? "Updating..."
                          : "Show Address Bar"}
                      </Typography>
                    </Box>
                  }
                />
                {showAddressBar && (
                  <Chip
                    label="Enabled"
                    size="small"
                    variant="outlined"
                    color="success"
                  />
                )}
              </Box>

              {/* URL Logging Toggle */}
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
                      onChange={(e) => handleUrlLoggingToggle(e.target.checked)}
                      disabled={isTogglingLogging}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {isTogglingLogging ? "Updating..." : "Watch URLs"}
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

              {/* Block External Navigation Toggle */}
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
                      checked={!allowExternalNavigation}
                      onChange={(e) =>
                        toggleExternalNavigation(!e.target.checked)
                      }
                      disabled={isTogglingNavigation}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {isTogglingNavigation
                          ? "Updating..."
                          : "Block External Navigation"}
                      </Typography>
                    </Box>
                  }
                />
                {!allowExternalNavigation && (
                  <Chip
                    label="Blocked"
                    size="small"
                    variant="outlined"
                    color="warning"
                  />
                )}
              </Box>

              {/* Block Internal Navigation Toggle */}
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
                      checked={!allowInternalNavigation}
                      onChange={(e) =>
                        toggleInternalNavigation(!e.target.checked)
                      }
                      disabled={isTogglingInternalNavigation}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {isTogglingInternalNavigation
                          ? "Updating..."
                          : "Block Internal Navigation"}
                      </Typography>
                    </Box>
                  }
                />
                {!allowInternalNavigation && (
                  <Chip
                    label="Blocked"
                    size="small"
                    variant="outlined"
                    color="warning"
                  />
                )}
              </Box>
            </Box>

            {/* Divider between left and right columns */}
            <Box
              sx={{
                width: "1px",
                backgroundColor: "transparent",
                mx: 1,
              }}
            />

            {/* Right column: Access History in a contained scrollable box - 50% width */}
            <Box
              sx={{
                width: "50%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Internal Navigation Whitelist URLs - only show when internal navigation is blocked */}
              {!allowInternalNavigation && (
                <Box
                  sx={{
                    height: urlLoggingEnabled
                      ? "calc((100vh - 120px) / 2)"
                      : "calc(100vh - 120px)", // Half height when both visible, full height when only this visible
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "background.paper",
                    display: "flex",
                    flexDirection: "column",
                    px: 2,
                    pt: 2,
                    pb: 1,
                    mb: 2,
                  }}
                >
                  {/* Static Header - Non-scrollable */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 2,
                      flexShrink: 0, // Prevent shrinking
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight="medium"
                      sx={{ pl: 1 }}
                    >
                      Allowed Internal URLs
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={startAddingUrl}
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>

                  {/* Scrollable Content Container */}
                  <Box
                    sx={{
                      flex: 1,
                      overflow: "auto",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Inline URL Input Row */}
                    {isAddingUrl && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1.5,
                          borderRadius: 1,
                          mb: 1,
                          border: "1px solid",
                          borderColor: "primary.main",
                          backgroundColor: "primary.50",
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Enter URL to whitelist..."
                          value={editingUrl}
                          onChange={(e) => setEditingUrl(e.target.value)}
                          onBlur={() => saveUrl(editingUrl)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              saveUrl(editingUrl);
                            }
                          }}
                          autoFocus
                          variant="standard"
                          sx={{
                            "& .MuiInput-root": {
                              fontSize: "0.875rem",
                              fontFamily: "monospace",
                              "&:before": {
                                borderBottom: "none",
                              },
                              "&:after": {
                                borderBottom: "none",
                              },
                              "&:hover:before": {
                                borderBottom: "none",
                              },
                            },
                          }}
                        />
                      </Box>
                    )}

                    {whitelistedUrls.length === 0 ? (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        No whitelisted URLs yet. Add URLs to allow specific
                        internal navigation.
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                        }}
                      >
                        {whitelistedUrls.map((url, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 1.5,
                              borderRadius: 1,
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: "action.hover",
                                "& .delete-button": {
                                  opacity: 1,
                                },
                              },
                            }}
                            onClick={() => {
                              if (editingIndex !== index) {
                                startEditingUrl(index, url);
                              }
                            }}
                          >
                            {editingIndex === index ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={editingUrl}
                                onChange={(e) => setEditingUrl(e.target.value)}
                                onBlur={() => saveEditedUrl(index, editingUrl)}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    saveEditedUrl(index, editingUrl);
                                  }
                                }}
                                autoFocus
                                variant="standard"
                                sx={{
                                  "& .MuiInput-root": {
                                    fontSize: "0.875rem",
                                    fontFamily: "monospace",
                                    "&:before": {
                                      borderBottom: "none",
                                    },
                                    "&:after": {
                                      borderBottom: "none",
                                    },
                                    "&:hover:before": {
                                      borderBottom: "none",
                                    },
                                  },
                                }}
                              />
                            ) : (
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "monospace",
                                  fontSize: "0.875rem",
                                  userSelect: "none",
                                }}
                              >
                                {url}
                              </Typography>
                            )}
                            <IconButton
                              className="delete-button"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click when clicking delete button
                                removeWhitelistedUrl(index);
                              }}
                              color="error"
                              sx={{
                                opacity: 0,
                                transition: "opacity 0.2s ease",
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* URL History Box - only show when URL logging is enabled */}
              {urlLoggingEnabled && (
                <Box
                  sx={{
                    height: allowInternalNavigation
                      ? "calc(100vh - 120px)"
                      : "calc((100vh - 120px) / 2)", // Full height when whitelist hidden, half when visible
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "background.paper",
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column",
                    px: 2, // 1rem left and right padding
                    pt: 2, // 1rem top padding
                    pb: 1, // 0.5rem bottom padding
                  }}
                >
                  <AccessHistory
                    appKey={app.key}
                    refreshTrigger={refreshTrigger}
                    onAddToWhitelist={(url: string) => {
                      if (url.trim() && !whitelistedUrls.includes(url.trim())) {
                        setWhitelistedUrls((prev) => [...prev, url.trim()]); // Add to bottom
                      }
                    }}
                  />
                </Box>
              )}
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
