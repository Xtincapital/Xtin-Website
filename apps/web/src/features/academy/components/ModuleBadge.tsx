// "Beginner · Module 3" tag shown on each module's Lesson 1. The number comes
// from getModuleInfo(), i.e. the same numbering as the cards on /learn.
import React from "react";
import { getModuleInfo } from "../../../constants/learningModules";

const ModuleBadge = ({ moduleId }: { moduleId: string }) => {
  const info = getModuleInfo(moduleId);
  if (!info) return null;
  return (
    <span
      className="px-3 py-1 mr-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-sm font-semibold whitespace-nowrap"
      title={info.title}
    >
      {info.level} · Module {info.number}
    </span>
  );
};

export default ModuleBadge;
