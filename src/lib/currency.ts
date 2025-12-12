// Currency utility for formatting amounts based on user preference

export interface CurrencyInfo {
  code: string;
  symbol: string;
  locale: string;
}

export const currencies: Record<string, CurrencyInfo> = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
};

export function getCurrencyInfo(code: string): CurrencyInfo {
  return currencies[code] || currencies.INR;
}

export function formatCurrency(amount: number, currencyCode: string = 'INR'): string {
  const currency = getCurrencyInfo(currencyCode);
  
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number, currencyCode: string = 'INR'): string {
  const currency = getCurrencyInfo(currencyCode);
  
  if (amount >= 100000) {
    return `${currency.symbol}${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    return `${currency.symbol}${(amount / 1000).toFixed(1)}K`;
  }
  
  return `${currency.symbol}${amount.toLocaleString(currency.locale, { maximumFractionDigits: 0 })}`;
}

export function getCurrencySymbol(currencyCode: string = 'INR'): string {
  return getCurrencyInfo(currencyCode).symbol;
}
