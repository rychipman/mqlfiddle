import React, { Dispatch, SetStateAction } from "react";
import ConfirmationModal from "@leafygreen-ui/confirmation-modal";
import TextInput from "@leafygreen-ui/text-input";

interface LoadDialogProps {
  open: boolean;
  onLoad: () => void;
  onCancel: () => void;
  fiddleId: string;
  setFiddleId: Dispatch<SetStateAction<string>>;
}

const LoadDialog = ({
  open,
  onLoad,
  onCancel,
  fiddleId,
  setFiddleId,
}: LoadDialogProps) => {
  return (
    <ConfirmationModal
      open={open}
      onConfirm={onLoad}
      onCancel={onCancel}
      title="Load A Saved Fiddle"
      buttonText="Load"
      submitDisabled={fiddleId === ""}
    >
      <TextInput
        className="mt-10"
        aria-labelledby="load-input"
        autoComplete="off"
        onChange={(event) => setFiddleId(event.target.value)}
        value={fiddleId}
        placeholder="Code"
      />
    </ConfirmationModal>
  );
};

export default LoadDialog;
