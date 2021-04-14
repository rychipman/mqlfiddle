import React, { useState } from "react";
import ReactJson from "react-json-view";
import { Tabs, Tab } from "@leafygreen-ui/tabs";

interface OutputProps {
  output: string | undefined;
}

const Output = ({ output }: OutputProps) => {
  const [selected, setSelected] = useState(0);
  if (output) {
    return (
      <div className="w-full h-2/5 border-t border-gray-light overflow-y-auto px-2 text-lg">
        <Tabs
          setSelected={setSelected}
          selected={selected}
          aria-labelledby="execution-results-tabs"
          className="h-full"
        >
          <Tab name="Result" className="p-2">
            <ReactJson
              name={false}
              src={JSON.parse(output)}
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
