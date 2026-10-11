// The category-specific part of the Add / Edit Goal form: "who is it for",
// the category's own questions, and how the cost and year were worked out.
// Logic lives in ../lib/goalCategories.ts.
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FamilyMember } from "../lib/api";
import { configFor, visibleQuestions, type Answers, type Computed } from "../lib/goalCategories";

export const NO_MEMBER = "__household__";

function memberLabel(member: FamilyMember) {
  return member.relationship ? `${member.name} (${member.relationship})` : member.name;
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

interface Props {
  category: string;
  answers: Answers;
  onAnswer: (id: string, value: string) => void;
  members: FamilyMember[];
  memberId: string;
  onMember: (id: string) => void;
  computed: Computed | null;
}

export default function GoalCategoryQuestions({ category, answers, onAnswer, members, memberId, onMember, computed }: Props) {
  const cfg = configFor(category);
  const preferred = cfg.member?.prefer;
  const sortedMembers = preferred ? [...members].sort((a, b) => Number(preferred(b)) - Number(preferred(a))) : members;

  return (
    <div className="space-y-4">
      {cfg.member && (
        <div className="space-y-1.5">
          <Label>{cfg.member.label}</Label>
          <Select value={memberId} onValueChange={onMember}>
            <SelectTrigger aria-label={cfg.member.label}>
              <SelectValue placeholder="Choose a family member" />
            </SelectTrigger>
            <SelectContent>
              {sortedMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {memberLabel(m)}
                </SelectItem>
              ))}
              <SelectItem value={NO_MEMBER}>Someone not in my family list</SelectItem>
            </SelectContent>
          </Select>
          {members.length === 0 && (
            <p className="text-xs text-muted-foreground">Add family members on the Family page to pick them here and fill in their ages.</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleQuestions(category, answers).map((q) => {
          const id = `goal-q-${q.id}`;
          const value = answers[q.id] ?? "";
          return (
            <div key={q.id} className={q.hint ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
              <Label htmlFor={id}>
                {q.label}
                {q.kind === "money" && " (₹)"}
              </Label>
              {q.kind === "select" ? (
                <Select value={value || q.options?.[0]} onValueChange={(v) => onAnswer(q.id, v)}>
                  <SelectTrigger id={id} aria-label={q.label}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {q.options?.map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={id}
                  type="number"
                  inputMode="decimal"
                  min={q.min ?? 0}
                  max={q.max}
                  step={q.kind === "money" ? "1" : q.kind === "percent" ? "0.1" : "1"}
                  value={value}
                  onChange={(e) => onAnswer(q.id, e.target.value)}
                />
              )}
              {q.hint && <p className="text-xs text-muted-foreground">{q.hint}</p>}
            </div>
          );
        })}
      </div>

      {computed && (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm" aria-live="polite">
          <div className="flex items-center gap-2 font-medium">
            <Calculator className="h-4 w-4" aria-hidden="true" />
            {computed.cost != null && computed.targetYear != null
              ? `${inr(computed.cost)} at today's prices, needed by ${computed.targetYear}`
              : "Answer the questions above to work out the cost"}
          </div>
          {computed.breakdown.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-muted-foreground">
              {computed.breakdown.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          {computed.problems.length > 0 && computed.breakdown.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-amber-700 dark:text-amber-400">
              {computed.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
