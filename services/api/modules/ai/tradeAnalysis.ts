// Helper function to analyze trades
export function analyzeTrades(trades) {
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);

  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const winRate = (winningTrades.length / totalTrades) * 100;

  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;

  const profitFactor = avgLoss > 0 ? (avgWin * winningTrades.length) / (avgLoss * losingTrades.length) : (winningTrades.length > 0 ? 999 : 0);
  const expectancy = (winRate/100 * avgWin) - ((100-winRate)/100 * avgLoss);

  return {
    total_trades: totalTrades,
    win_rate: winRate,
    total_pnl: totalPnL,
    avg_win: avgWin,
    avg_loss: avgLoss,
    profit_factor: profitFactor,
    expectancy: expectancy
  };
}

// Helper function to identify issues
export function identifyIssues(analysis) {
  const issues = [];

  if (analysis.win_rate < 50) {
    issues.push({
      issue: 'Low Win Rate',
      severity: 'high',
      metric: `${analysis.win_rate.toFixed(1)}%`,
      fix: 'Focus on trade entries and risk management. Consider using tighter stop losses and better entry criteria.'
    });
  }

  if (analysis.profit_factor < 1.5) {
    issues.push({
      issue: 'Poor Profit Factor',
      severity: 'high',
      metric: analysis.profit_factor.toFixed(2),
      fix: 'Your winning trades are not covering your losses adequately. Consider cutting losses earlier and letting winners run.'
    });
  }

  if (analysis.expectancy < 0) {
    issues.push({
      issue: 'Negative Expectancy',
      severity: 'critical',
      metric: `₹${analysis.expectancy.toFixed(2)}`,
      fix: 'Your trading system is losing money on average. Review your strategy completely or consider taking a break.'
    });
  }

  return issues;
}
