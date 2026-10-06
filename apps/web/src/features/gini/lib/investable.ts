// What the planners treat as money you can invest. Your home (Real Estate) and
// insurance policies count toward net worth but can't fund a goal, so they are left
// out. Loans are not subtracted: the big one is usually the home loan, which is
// backed by the home already excluded.
export const NON_INVESTABLE_CATEGORIES = new Set(["Real Estate", "Insurance"]);

export function investableAssets(assets: { category?: string | null; value?: number | null }[]): number {
  return assets.reduce((sum, a) => (NON_INVESTABLE_CATEGORIES.has(a.category ?? "") ? sum : sum + (a.value || 0)), 0);
}
