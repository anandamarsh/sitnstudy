import React from "react";
import { Box, TextField } from "@mui/material";
import { SiteConfig } from "../types";

interface FormFieldsProps {
  formData: Partial<SiteConfig>;
  onUrlChange: (url: string) => void;
  onInputChange: (field: keyof SiteConfig, value: string) => void;
}

export const FormFields: React.FC<FormFieldsProps> = ({
  formData,
  onUrlChange,
  onInputChange,
}) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* URL Field */}
      <TextField
        label="URL"
        value={formData.url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Enter website URL (e.g., ixl.com)"
        fullWidth
        sx={{ width: "100%" }}
      />

      {/* Title Field */}
      <TextField
        label="Title"
        value={formData.title}
        onChange={(e) => onInputChange("title", e.target.value)}
        placeholder="Enter application title"
        fullWidth
        sx={{ width: "100%" }}
      />

      {/* Description Field */}
      <TextField
        label="Description"
        value={formData.description}
        onChange={(e) => onInputChange("description", e.target.value)}
        placeholder="Enter application description"
        fullWidth
        multiline
        rows={3}
        sx={{ width: "100%" }}
      />
    </Box>
  );
};
