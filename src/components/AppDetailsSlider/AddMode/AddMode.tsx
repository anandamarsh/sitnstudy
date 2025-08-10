import React from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { SiteConfig } from "../types";
import { useAddModeForm } from "./useAddModeForm";
import { FormFields } from "./FormFields";
import { IconPreview } from "./IconPreview";
import { WebviewPreview } from "./WebviewPreview";

interface AddModeProps {
  onClose: () => void;
  onSave: (app: SiteConfig) => void;
}

export const AddMode: React.FC<AddModeProps> = ({ onClose, onSave }) => {
  const {
    formData,
    setFormData,
    webviewLoading,
    webviewFailed,
    isValidUrl,
    handleUrlChange,
    handleInputChange,
    isSaveDisabled,
  } = useAddModeForm();

  const handleSave = () => {
    if (formData.url && formData.title && formData.key) {
      const newApp: SiteConfig = {
        key: formData.key,
        title: formData.title,
        url: formData.url,
        iconPath: formData.iconPath || "",
        iconType: formData.iconType || "svg",
        description: formData.description || "",
      };
      onSave(newApp);
    }
  };

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
          display: "flex",
          gap: 4,
          flex: 1,
          height: "calc(100vh - 120px)",
          px: 3,
          pb: 4,
        }}
      >
        {/* Left Column - Form */}
        <Box sx={{ flex: 1, maxWidth: 600, mx: "auto" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Icon Preview */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <IconPreview iconPath={formData.iconPath || ""} />
            </Box>

            <FormFields
              formData={formData}
              onUrlChange={handleUrlChange}
              onInputChange={handleInputChange}
            />

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 2,
                minWidth: "100%",
              }}
            >
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{ minWidth: 120 }}
              >
                CANCEL
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isSaveDisabled() || false}
                sx={{ minWidth: 120 }}
              >
                ADD APPLICATION
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Right Column - Preview */}
        <Box sx={{ flex: 1 }}>
          {/* Preview Container */}
          <Box
            sx={{
              height: "100%",
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              overflow: "hidden",
              backgroundColor: "#ffffff",
            }}
          >
            {/* Preview Content */}
            <Box sx={{ height: "100%", position: "relative" }}>
              <WebviewPreview
                url={formData.url || ""}
                webviewLoading={webviewLoading}
                webviewFailed={webviewFailed}
                isValidUrl={isValidUrl}
                onTitleExtracted={(title) => {
                  setFormData((prev) => ({
                    ...prev,
                    title: title,
                  }));
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
