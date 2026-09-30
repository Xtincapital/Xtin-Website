// Gini's "Load sample data" switch — see ../lib/sampleData.ts.
import SampleDataBar from "@/components/SampleDataBar";
import { buildGiniSample, giniSampleMode } from "../lib/sampleData";

const OPTIONS = [
  {
    id: "kumar-family",
    name: "The Kumar family",
    description: "Two earners, two children and a dependent parent, with assets, loans, goals and education plans.",
  },
];

const GiniSampleBar = () => {
  const { active } = giniSampleMode.useState();

  return (
    <SampleDataBar
      feature="Gini"
      active={active}
      activeName={active ? OPTIONS[0].name : null}
      options={OPTIONS}
      onLoad={(id) => giniSampleMode.enter(id, buildGiniSample())}
      onExit={giniSampleMode.exit}
    />
  );
};

export default GiniSampleBar;
