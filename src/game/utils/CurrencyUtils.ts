/**
 * CURRENCY UTILITIES
 * Formatting and conversion for display
 */

import { Currency, CURRENCIES, DEFAULT_CURRENCY, CurrencyConfig } from "../config/GameConfig";

let currentCurrency: Currency = DEFAULT_CURRENCY;

/**
 * Set active currency
 */
export function setCurrency(currency: Currency): void {
  currentCurrency = currency;
}

/**
 * Get current currency config
 */
export function getCurrencyConfig(): CurrencyConfig {
  return CURRENCIES[currentCurrency];
}

/**
 * Convert credits to display amount
 */
export function creditsToDisplay(credits: number): number {
  const config = getCurrencyConfig();
  return credits * config.denomination;
}

/**
 * Format amount for display with currency symbol
 */
export function formatAmount(credits: number): string {
  const config = getCurrencyConfig();
  const displayAmount = creditsToDisplay(credits);
  
  if (config.code === "USDT") {
    return `${displayAmount.toFixed(config.decimals)} ${config.symbol}`;
  }
  
  return `${config.symbol}${displayAmount.toFixed(config.decimals)}`;
}

/**
 * Format win amount with multiplier
 */
export function formatWinWithMultiplier(credits: number, bet: number): string {
  const multiplier = credits / bet;
  const formattedAmount = formatAmount(credits);
  
  if (multiplier >= 10) {
    return `${formattedAmount} (${multiplier.toFixed(1)}x)`;
  }
  
  return formattedAmount;
}

/**
 * Format large numbers with abbreviations
 */
export function formatCompact(credits: number): string {
  const config = getCurrencyConfig();
  const displayAmount = creditsToDisplay(credits);
  
  if (displayAmount >= 1_000_000) {
    return `${config.symbol}${(displayAmount / 1_000_000).toFixed(2)}M`;
  }
  if (displayAmount >= 1_000) {
    return `${config.symbol}${(displayAmount / 1_000).toFixed(1)}K`;
  }
  
  return formatAmount(credits);
}


