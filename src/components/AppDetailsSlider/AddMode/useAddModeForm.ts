import { useState } from "react";
import { SiteConfig } from "../types";

export const useAddModeForm = () => {
  const [formData, setFormData] = useState<Partial<SiteConfig>>({
    url: "",
    title: "",
    description: "",
    iconPath: "",
    iconType: "svg",
    key: "",
  });

  const [webviewLoading, setWebviewLoading] = useState(false);
  const [webviewFailed, setWebviewFailed] = useState(false);

  const isValidUrl = (url: string): boolean => {
    try {
      const urlToTest = url.includes("://") ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    const normalizedUrl = url.includes("://") ? url : `https://${url}`;

    if (isValidUrl(normalizedUrl)) {
      try {
        const urlObj = new URL(normalizedUrl);
        const domain = urlObj.hostname.replace("www.", "");
        const baseKey = domain.split(".")[0];
        const timestamp = Date.now().toString(36);
        const key = `${baseKey}_${timestamp}`;

        const faviconUrl = `${urlObj.origin}/favicon.ico`;

        // Set initial data
        setFormData((prev) => ({
          ...prev,
          url: normalizedUrl,
          key,
          title: urlObj.hostname, // Fallback to hostname
          description: `Access ${urlObj.hostname} - a web application for productivity and learning.`,
          iconPath: faviconUrl,
          iconType: "svg",
        }));

        setWebviewFailed(false);

        // Note: Title will be extracted via webview instead of fetch to avoid CORS issues
      } catch (error) {
        console.error("Error parsing URL:", error);
      }
    } else {
      setFormData((prev) => ({ ...prev, url }));
    }
  };

  const handleInputChange = (field: keyof SiteConfig, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isSaveDisabled = () => {
    return (
      !formData.url ||
      !isValidUrl(formData.url) ||
      (formData.url && isValidUrl(formData.url) && webviewFailed)
    );
  };

  return {
    formData,
    setFormData,
    webviewLoading,
    setWebviewLoading,
    webviewFailed,
    setWebviewFailed,
    isValidUrl,
    handleUrlChange,
    handleInputChange,
    isSaveDisabled,
  };
};
