import * as Switch from "@radix-ui/react-switch";
import "../../CSS/switch.css";
import React from "react";

export function MinimapSwitch({ minimapState, minimapToggle }) {
  return (
    <div style={{ display: "flex", alignItems: "", gap: "5rem" }}>
      <Switch.Root
        className="SwitchRoot"
        id="minimapSwitch"
        checked={minimapState}
        onCheckedChange={minimapToggle}
      >
        <Switch.Thumb className="SwitchThumb" />
      </Switch.Root>
    </div>
  );
}
