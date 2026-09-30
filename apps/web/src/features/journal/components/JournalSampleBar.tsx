// Journal's "Load sample data" switch — see ../lib/sampleData.ts.
import { useMemo } from "react";
import SampleDataBar from "@/components/SampleDataBar";
import { buildJournalSample, JOURNAL_SAMPLE_OPTIONS, journalSampleMode, previewJournalSample } from "../lib/sampleData";

const formatInr = (value: number) =>
  `${value < 0 ? "-" : "+"}₹${Math.abs(Math.round(value)).toLocaleString("en-IN")}`;

const JournalSampleBar = () => {
  const { active, datasetId } = journalSampleMode.useState();

  const options = useMemo(
    () =>
      JOURNAL_SAMPLE_OPTIONS.map((option) => {
        const preview = previewJournalSample(option.id);
        return {
          ...option,
          meta: `${preview.count} trades · ${preview.winRate.toFixed(0)}% win rate · ${formatInr(preview.pnl)}`,
        };
      }),
    []
  );

  return (
    <SampleDataBar
      feature="Journal"
      active={active}
      activeName={JOURNAL_SAMPLE_OPTIONS.find((o) => o.id === datasetId)?.name}
      options={options}
      onLoad={(id) => journalSampleMode.enter(id, buildJournalSample(id))}
      onExit={journalSampleMode.exit}
    />
  );
};

export default JournalSampleBar;
