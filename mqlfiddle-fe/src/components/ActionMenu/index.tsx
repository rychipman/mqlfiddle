import React, { useState } from "react";
import { Menu, MenuItem } from "@leafygreen-ui/menu";
import IconButton from "@leafygreen-ui/icon-button";
import Icon from "@leafygreen-ui/icon";

export interface ActionMenuItemProps {
  label: string;
  description: string;
  func: Function;
  disabled: boolean;
  glyph: string;
}

interface ActionMenuProps {
  triggers: Array<ActionMenuItemProps>;
}

const ActionMenu = ({ triggers }: ActionMenuProps) => {
  const [open, setOpen] = useState(false);

  const onClick = (callback: Function) => {
    setOpen(false);
    callback();
  };

  return (
    <Menu
      align="top"
      justify="start"
      open={open}
      trigger={
        <IconButton onClick={() => setOpen(!open)} aria-label="action-menu">
          <Icon glyph="Menu" />
        </IconButton>
      }
    >
      {triggers
        .filter((trigger: ActionMenuItemProps) => !trigger.disabled)
        .map((trigger: ActionMenuItemProps) => (
          <MenuItem
            key={`action-menu-item-${trigger.label}`}
            onClick={() => onClick(trigger.func)}
            description={trigger.description}
            glyph={<Icon glyph={trigger.glyph} />}
          >
            {trigger.label}
          </MenuItem>
        ))}
    </Menu>
  );
};

export default ActionMenu;
