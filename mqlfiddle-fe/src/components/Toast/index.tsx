import React, { useState, useEffect } from "react";
import LeafyToast, { Variant } from "@leafygreen-ui/toast";
import { ToastProps } from "react-toast-notifications";

type mappingOption = {
  [key: string]: Variant;
};

const mappings: mappingOption = {
  success: Variant.Success,
  error: Variant.Warning,
  warning: Variant.Important,
  info: Variant.Note,
};

const Toast = (props: ToastProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (props.transitionState === "entering") setOpen(true);
    else if (props.transitionState === "exited") setOpen(false);
  }, [props.transitionState]);

  return (
    <LeafyToast
      variant={mappings[props.appearance.valueOf()]}
      body={props.children}
      open={open}
    />
  );
};

export default Toast;
