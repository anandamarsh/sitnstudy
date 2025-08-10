export interface SiteConfig {
  key: string;
  title: string;
  url: string;
  iconPath?: string;
  iconType: "svg" | "react-icon";
  iconName?: string;
  iconProps?: Record<string, any>;
  description?: string;
}

export interface AppDetailsSliderProps {
  open: boolean;
  app: SiteConfig | null;
  isAddMode: boolean;
  onClose: () => void;
  onOpenApp: (app: SiteConfig) => void;
  onRemoveApp: (app: SiteConfig) => void;
}
