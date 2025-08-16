import React from "react";
import { Drawer } from "@mui/material";
import { AppDetailsSliderProps } from "./types";
import ViewMode from "./ViewMode";
import { AddMode } from "./AddMode";

const AppDetailsSlider: React.FC<AppDetailsSliderProps> = ({
  open,
  app,
  isAddMode,
  onClose,
  onOpenApp,
  onRemoveApp,
}) => {
  const handleSave = (newApp: any) => {
    // TODO: Implement save logic
    console.log("Saving new app:", newApp);
    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "100vw",
          height: "100vh",
        },
      }}
    >
      {isAddMode ? (
        <AddMode onClose={onClose} onSave={handleSave} />
      ) : (
        app && (
          <ViewMode
            app={app}
            onClose={onClose}
            onOpenApp={onOpenApp}
            onRemoveApp={onRemoveApp}
          />
        )
      )}
    </Drawer>
  );
};

export default AppDetailsSlider;
