import {
  AppearanceTypes,
  useToasts as RTNuseToasts,
} from "react-toast-notifications";
import { Disclaimer, Subtitle } from "@leafygreen-ui/typography";
import clsx from "clsx";

export function useToasts() {
  const context = RTNuseToasts();
  return {
    ...context,
    addToast: (variant: AppearanceTypes, title: string, body: string) =>
      context.addToast(
        <div className="space-y-1">
          <Subtitle
            className={clsx(
              "font-bold",
              variant === "success" && "text-primary"
            )}
          >
            {title}
          </Subtitle>
          <Disclaimer>{body}</Disclaimer>
        </div>,
        { appearance: variant }
      ),
  };
}
