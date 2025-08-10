export interface SiteConfig {
  key: string;
  title: string;
  url: string;
  iconPath?: string;
  iconType: "svg" | "react-icon";
  iconName?: string;
  iconProps?: Record<string, any>;
  description?: string;
  svgContent?: string; // Temporary property for SVG content during creation
  urlLogging?: boolean; // Enable/disable URL logging for this app
}

export interface UrlLogEntry {
  timestamp: string;
  url: string;
  title?: string;
}

export interface AppDetailsSliderProps {
  open: boolean;
  app: SiteConfig | null;
  isAddMode: boolean;
  onClose: () => void;
  onOpenApp: (app: SiteConfig) => void;
  onRemoveApp: (app: SiteConfig) => void;
}
