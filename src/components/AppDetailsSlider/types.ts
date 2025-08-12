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
  allowExternalNavigation?: boolean; // Enable/disable external navigation for this app
  showAddressBar?: boolean; // Show/hide address bar above webview
}

export interface UrlLogEntry {
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
