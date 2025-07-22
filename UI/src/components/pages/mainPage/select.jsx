import * as React from "react";
import { Select } from "radix-ui";
import { LOG_LEVELS } from "../../codeComponents/logger.jsx";
import classnames from "classnames";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import "../../../CSS/select.css";

export const SelectCanvasBG = ({ currentBG, setCurrentBG }) => (
  <Select.Root value={currentBG} onValueChange={setCurrentBG}>
    <Select.Trigger className="select-trigger" aria-label="canvas-bg">
      <Select.Value placeholder="Select background" />
      <Select.Icon className="select-icon">
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="select-content">
        <Select.ScrollUpButton className="select-scroll-button">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="select-viewport">
          <Select.Group>
            <SelectItem value="dots">Dots</SelectItem>
            <SelectItem value="lines">Lines</SelectItem>
            <SelectItem value="cross">Cross</SelectItem>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

export const SelectTheme = ({ theme, setTheme }) => (
  <Select.Root value={theme} onValueChange={setTheme}>
    <Select.Trigger className="select-trigger" aria-label="Theme">
      <Select.Value placeholder="Select theme" />
      <Select.Icon className="select-icon">
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="select-content">
        <Select.ScrollUpButton className="select-scroll-button">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="select-viewport">
          <Select.Group>
            <SelectItem value="light">Light☀️</SelectItem>
            <SelectItem value="dark">Dark🌙</SelectItem>
            <SelectItem value="pick-me">Pick-me!🎀</SelectItem>
            <SelectItem value="tokyo-night">Tokyo Night🌃</SelectItem>
            <SelectItem value="green-nature">Green Nature🍃</SelectItem>
            <SelectItem value="solar-red">Solar Red🔥</SelectItem>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

export const SelectWireType = ({ wireType, setWireType }) => (
  <Select.Root value={wireType} onValueChange={setWireType}>
    <Select.Trigger className="select-trigger-wire" aria-label="Wire Type">
      <div className="select-value-wrapper">
        <Select.Value placeholder="Select type" />
      </div>
      <Select.Icon className="select-icon">
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="select-content">
        <Select.ScrollUpButton className="select-scroll-button">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="select-viewport">
          <Select.Group>
            <SelectItem value="default">Bezier</SelectItem>
            <SelectItem value="step">Step</SelectItem>
            <SelectItem value="straight">Straight</SelectItem>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

const SelectItem = React.forwardRef(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <Select.Item
        className={classnames("select-item", className)}
        {...props}
        ref={forwardedRef}
      >
        <Select.ItemText>{children}</Select.ItemText>
        <Select.ItemIndicator className="select-item-indicator">
          <CheckIcon />
        </Select.ItemIndicator>
      </Select.Item>
    );
  },
);

export const SelectLogLevel = ({ currentLogLevel, setCurrentLogLevel }) => (
  <Select.Root value={currentLogLevel} onValueChange={setCurrentLogLevel}>
    <Select.Trigger className="select-trigger" aria-label="Notification Level">
      <Select.Value placeholder="!!!!" />
      <Select.Icon className="select-icon">
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="select-content">
        <Select.ScrollUpButton className="select-scroll-button">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="select-viewport">
          <Select.Group>
            <SelectItem value={LOG_LEVELS.ERROR}>Critical</SelectItem>
            <SelectItem value={LOG_LEVELS.IMPORTANT}>Info</SelectItem>
            <SelectItem value={LOG_LEVELS.DEBUG}>Debug</SelectItem>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

export const SelectNotificationsPosition = ({
  toastPosition,
  setToastPosition,
}) => (
  <Select.Root value={toastPosition} onValueChange={setToastPosition}>
    <Select.Trigger
      className="select-trigger"
      aria-label="Notification Position"
    >
      <Select.Value placeholder="Select notifications position" />
      <Select.Icon className="select-icon">
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="select-content">
        <Select.ScrollUpButton className="select-scroll-button">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="select-viewport">
          <Select.Group>
            <SelectItem value={"top-center"}>Top center</SelectItem>
            <SelectItem value={"bottom-center"}>Bottom center</SelectItem>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);

export const SelectPastePosition = ({ pastePosition, setPastePosition }) => (
  <Select.Root value={pastePosition} onValueChange={setPastePosition}>
    <Select.Trigger className="select-trigger" aria-label="Paste Position">
      <Select.Value placeholder="Select paste position" />
      <Select.Icon className="select-icon">
        <ChevronDownIcon />
      </Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="select-content">
        <Select.ScrollUpButton className="select-scroll-button">
          <ChevronUpIcon />
        </Select.ScrollUpButton>
        <Select.Viewport className="select-viewport">
          <Select.Group>
            <SelectItem value={"cursor"}>Near the cursor</SelectItem>
            <SelectItem value={"center"}>Center of the screen</SelectItem>
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
);
