import React, { useState } from "react";
import ReactJson from "react-json-view";
import { Tabs, Tab } from "@leafygreen-ui/tabs";
import { useTheme } from "../../hooks/useTheme";
import Badge from "@leafygreen-ui/badge";

export interface OutputProps {
  results: any | undefined;
  stats: any | undefined;
}

const getExecutionTime = (stats: any) => {
  if (stats?.executionStats?.executionTimeMillis !== undefined) {
    return stats.executionStats.executionTimeMillis;
  } else {
    return stats.stages.reduce(
      (execTime: number, stage: any) =>
        execTime + stage.executionTimeMillisEstimate,
      0
    );
  }
};

const Output = ({ results, stats }: OutputProps) => {
  const [selected, setSelected] = useState(0);
  const { dark } = useTheme();
  if (results) {
    return (
      <div className="w-full h-2/5 border-t border-gray-light dark:border-gray-dark overflow-y-auto px-2 text-lg dark:text-white">
        <Tabs
          setSelected={setSelected}
          selected={selected}
          aria-labelledby="execution-results-tabs"
          className="h-full relative"
          darkMode={dark}
        >
          <Tab name="Result" className="p-2">
            <ReactJson
              name={false}
              src={results}
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
          {stats && (
            <Tab name="Explain" className="p-2">
              <ReactJson
                name={false}
                src={stats}
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
          )}
          <Badge
            variant="green"
            className="execution-time-badge absolute top-3 right-2"
          >
            {`Execution Time: ${getExecutionTime(stats)}ms`}
          </Badge>
        </Tabs>
      </div>
    );
  }
  return null;
};

export default Output;
