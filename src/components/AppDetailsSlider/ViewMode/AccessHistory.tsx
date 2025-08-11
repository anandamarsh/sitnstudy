import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  History as HistoryIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";

interface UrlLogEntry {
  url: string;
  title?: string;
}

interface AccessHistoryProps {
  appKey: string;
}

const AccessHistory: React.FC<AccessHistoryProps> = ({ appKey }) => {
  const [accessHistory, setAccessHistory] = useState<UrlLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to find the JSON file for this app
  const findAccessHistoryFile = async () => {
    try {
      // Look for JSON files that match the app key pattern
      const files = await (window as any).ipcRenderer.getConfigFiles();
      const matchingFile = files.find(
        (file: string) => file.includes(appKey) && file.endsWith("_urls.json")
      );

      if (matchingFile) {
        return matchingFile;
      }
      return null;
    } catch (error) {
      console.error("Error finding access history file:", error);
      return null;
    }
  };

  // Function to load access history data
  const loadAccessHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const fileName = await findAccessHistoryFile();

      if (!fileName) {
        setAccessHistory([]);
        return;
      }

      const data = await (window as any).ipcRenderer.readConfigFile(fileName);

      if (data && Array.isArray(data)) {
        setAccessHistory(data);
      } else {
        setAccessHistory([]);
      }
    } catch (error) {
      console.error("Error loading access history:", error);
      setError("Failed to load access history");
      setAccessHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Load access history when component mounts or appKey changes
  useEffect(() => {
    loadAccessHistory();
  }, [appKey]);

  const handleUrlClick = (url: string) => {
    // Open URL in default browser or handle as needed
    if (url) {
      window.open(url, "_blank");
    }
  };

  const hasAccessHistory = accessHistory.length > 0;

  return (
    <Box sx={{ height: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
        }}
      >
        <HistoryIcon fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          Access History
        </Typography>
        {hasAccessHistory && (
          <Chip
            label={accessHistory.length}
            size="small"
            variant="outlined"
            color="primary"
          />
        )}
      </Box>

      {/* Scrollable Content Container */}
      <Box
        sx={{
          height: "calc(100% - 3rem)", // Full height minus header height (mb: 2 = 1rem + header content ~2rem)
          overflow: "auto",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          pl: 2,
          pr: 1,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Loading access history...
            </Typography>
          </Box>
        ) : error ? (
          <Typography variant="body2" color="error" sx={{ py: 1 }}>
            {error}
          </Typography>
        ) : !hasAccessHistory ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            No access history found for this application.
          </Typography>
        ) : (
          <List dense sx={{ py: 0 }}>
            {accessHistory.map((entry, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 0,
                  py: 0.5,
                  "&:hover": { backgroundColor: "action.hover" },
                  borderRadius: 1,
                }}
              >
                <ListItemButton
                  onClick={() => handleUrlClick(entry.url)}
                  sx={{ px: 1, py: 0.5, borderRadius: 1 }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: "break-all",
                          lineHeight: 1.4,
                          color: "text.primary",
                        }}
                      >
                        {entry.title || entry.url}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          wordBreak: "break-all",
                          lineHeight: 1.3,
                          mt: 0.5,
                        }}
                      >
                        {entry.url}
                      </Typography>
                    }
                  />
                  <Tooltip title="Open in browser">
                    <OpenInNewIcon fontSize="small" color="action" />
                  </Tooltip>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default AccessHistory;
