import React, { useState } from "react";
import ReactJson from "react-json-view";
import { Tabs, Tab } from "@leafygreen-ui/tabs";
import { useTheme } from "../../hooks/useTheme";
interface OutputProps {
  output: string | undefined;
}

const Output = ({ output }: OutputProps) => {
  const [selected, setSelected] = useState(0);
  const { dark } = useTheme();
  if (output) {
    return (
      <div className="w-full h-2/5 border-t border-gray-light dark:border-gray-dark overflow-y-auto px-2 text-lg dark:text-white">
        <Tabs
          setSelected={setSelected}
          selected={selected}
          aria-labelledby="execution-results-tabs"
          className="h-full"
          darkMode={dark}
        >
          <Tab name="Result" className="p-2">
            <ReactJson
              name={false}
              src={JSON.parse(output)}
              theme={dark ? "harmonic" : "rjv-default"}
              style={{
                backgroundColor: "transparent",
              }}
              displayDataTypes={false}
              displayObjectSize={false}
              enableClipboard={false}
              indentWidth={2}
            />
          </Tab>
          <Tab name="Explain" className="p-2">
            Explain
          </Tab>
        </Tabs>
      </div>
    );
  }
  return null;
};

export default Output;
