import React, { useState } from "react";
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
import { removeSite } from "../../utils/siteManager";

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
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemoveConfirm = async () => {
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
          {/* App Icon and Details Row */}
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
            {/* App Icon - Left side, no borders */}
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

            {/* App Details - Right side */}
            <Box
              sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
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
          </Box>

          {/* Action Buttons - Same row */}
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
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
              onClick={handleRemoveConfirm}
              disabled={isRemoving}
              startIcon={<DeleteIcon />}
              sx={{ minWidth: 120 }}
            >
              {isRemoving ? "REMOVING..." : "REMOVE"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ViewMode;
