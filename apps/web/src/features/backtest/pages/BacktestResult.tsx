import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, RotateCcw } from "lucide-react";
import BacktestLayout from "../components/BacktestLayout";
import Report from "../components/Report";
import { v1 } from "../lib/v1";
import { btnSecondary, card, muted } from "../lib/styles";

export default function BacktestResult() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({ queryKey: ["bt-run", id], queryFn: () => v1.getBacktest(id as string) });

  return (
    <BacktestLayout>
      <Link to="/backtest/app/history" className={`mb-4 inline-flex items-center gap-1.5 text-sm ${muted} hover:text-slate-900 dark:hover:text-white`}>
        <ArrowLeft className="h-4 w-4" /> History
      </Link>
      {isLoading && (
        <div className="space-y-4">
          <div className={`${card} h-52 animate-pulse`} />
          <div className={`${card} h-80 animate-pulse`} />
        </div>
      )}
      {(isError || (data && !data.result)) && <p className="text-rose-600">Could not load this backtest.</p>}
      {data?.result && (
        <Report
          result={data.result}
          title={data.name}
          subtitle={`${data.period.from} → ${data.period.to}`}
          definition={data.spec ?? data.legacy_definition ?? undefined}
          sentence={data.summary ?? undefined}
          actions={
            data.strategy_id && (
              <Link to={`/backtest/app/strategies/${data.strategy_id}/run`} className={btnSecondary}>
                <RotateCcw className="h-4 w-4" /> Re-run
              </Link>
            )
          }
        />
      )}
    </BacktestLayout>
  );
}
