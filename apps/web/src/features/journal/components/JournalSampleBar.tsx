// Journal's "Load sample data" switch — see ../lib/sampleData.ts.
import { useMemo } from "react";
import SampleDataBar from "@/components/SampleDataBar";
import { useAuth } from "@/contexts/AuthContext";
import { requestSignIn } from "@/lib/guestGate";
import { useCurrency } from "@/contexts/CurrencyContext";
import { buildJournalSample, JOURNAL_SAMPLE_OPTIONS, journalSampleMode, previewJournalSample } from "../lib/sampleData";

const JournalSampleBar = ({ placement, iconOnly, buttonClassName }: { placement?: "bar" | "button" | "banner"; iconOnly?: boolean; buttonClassName?: string }) => {
  const { active, datasetId } = journalSampleMode.useState();
  const { user } = useAuth();
  const guest = !user;
  // The previews are in rupees; show them in the selected currency.
  const { formatInr } = useCurrency();

  const options = useMemo(
    () =>
      JOURNAL_SAMPLE_OPTIONS.map((option) => {
        const preview = previewJournalSample(option.id);
        return {
          ...option,
          meta: `${preview.count} trades · ${preview.winRate.toFixed(0)}% win rate · ${preview.pnl < 0 ? "-" : "+"}${formatInr(Math.abs(preview.pnl), { maxDecimals: 0 })}`,
        };
      }),
    [formatInr]
  );

  return (
    <SampleDataBar
      feature="Journal"
      placement={placement}
      label="Load sample data"
      iconOnly={iconOnly}
      buttonClassName={buttonClassName}
      active={active}
      activeName={JOURNAL_SAMPLE_OPTIONS.find((o) => o.id === datasetId)?.name}
      options={options}
      onLoad={(id) => journalSampleMode.enter(id, buildJournalSample(id))}
      onExit={guest ? () => requestSignIn("save") : journalSampleMode.exit}
      guest={guest}
    />
  );
};

export default JournalSampleBar;
