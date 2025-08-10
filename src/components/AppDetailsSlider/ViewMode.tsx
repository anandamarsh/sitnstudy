import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
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
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

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
              onClick={handleRemoveClick}
              disabled={isRemoving}
              startIcon={<DeleteIcon />}
              sx={{ minWidth: 120 }}
            >
              {isRemoving ? "REMOVING..." : "REMOVE"}
            </Button>
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
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 1,
            px: 3,
            pt: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5
          }}
        >
          <DeleteIcon color="error" sx={{ fontSize: 28 }} />
          <Typography variant="h6" component="span">
            Remove Application
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
            Are you sure you want to remove <strong>"{app.title}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
            This action cannot be undone. The application will be permanently removed from your list.
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
              borderRadius: 2
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRemoveConfirm}
            color="error"
            variant="contained"
            disabled={isRemoving}
            startIcon={isRemoving ? <CircularProgress size={16} /> : <DeleteIcon />}
            sx={{ 
              minWidth: 120,
              px: 3,
              py: 1.5,
              borderRadius: 2,
              boxShadow: 2
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
