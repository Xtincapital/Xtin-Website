// Shared pieces for the calculators' pie charts, so every pie shows its values
// the same way: the share on each slice and a legend underneath with the
// amount, instead of leaving the numbers to hover-only tooltips.
//
// Use with `isAnimationActive={false}` on the <Pie>: recharts hides slice labels
// while its enter animation runs and replays it whenever the data changes,
// which made the pies look empty and unresponsive after pressing Calculate.
import { moneyTooltip } from "./format";

/** `label` for a <Pie>: just the share, e.g. "62%". Names and amounts live in the legend. */
export const piePercentLabel = ({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`;

/** `content` for a recharts <Legend> on a pie: dot, name, amount and share per slice. */
export const pieLegend = ({ payload }: { payload?: any[] }) => {
  const total = (payload ?? []).reduce((sum, e) => sum + Number(e.payload?.value ?? 0), 0);
  return (
  <ul className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-gray-700">
    {(payload ?? []).map((entry, i) => (
      <li key={`${entry.value}-${i}`} className="flex items-center gap-2">
        <span className="inline-block h-3 w-3 rounded-full" style={{ background: entry.color }} />
        <span>{entry.value}:</span>
        <span className="font-semibold">{moneyTooltip(entry.payload?.value ?? 0)}</span>
        <span className="text-gray-500">({total > 0 ? ((Number(entry.payload?.value ?? 0) / total) * 100).toFixed(0) : 0}%)</span>
      </li>
    ))}
  </ul>
  );
};
