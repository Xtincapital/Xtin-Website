// Gini's "Load sample data" switch — see ../lib/sampleData.ts — plus the
// "Download my data" / "Upload data" pair (./GiniDataControls.tsx).
import SampleDataBar from "@/components/SampleDataBar";
import { buildGiniSample, giniSampleMode } from "../lib/sampleData";
import GiniDataControls from "./GiniDataControls";

const OPTIONS = [
  {
    id: "kumar-family",
    name: "The Kumar family",
    description: "Two earners, two children and a dependent parent, with assets, loans, goals and education plans.",
  },
];

const GiniSampleBar = () => {
  const { active } = giniSampleMode.useState();

  const bar = (placement: "button" | "banner") => (
    <SampleDataBar
      feature="Gini"
      active={active}
      activeName={active ? OPTIONS[0].name : null}
      options={OPTIONS}
      onLoad={(id) => giniSampleMode.enter(id, buildGiniSample())}
      onExit={giniSampleMode.exit}
      placement={placement}
    />
  );

  if (active) return bar("banner");

  return (
    <div className="flex flex-wrap justify-end gap-2 px-4 py-2 bg-white border-b border-gray-200">
      <GiniDataControls />
      {bar("button")}
    </div>
  );
};

export default GiniSampleBar;
