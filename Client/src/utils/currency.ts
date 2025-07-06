interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', decimals: 2 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', decimals: 2 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', decimals: 2 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimals: 0 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimals: 2 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimals: 2 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimals: 2 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimals: 2 },
  SEK: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimals: 2 },
  NOK: { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimals: 2 },
  MXN: { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimals: 2 },
  NZD: { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimals: 2 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimals: 2 },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimals: 2 },
  KRW: { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimals: 0 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimals: 2 },
  BRL: { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimals: 2 },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimals: 2 },
  RUB: { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimals: 2 },
  PLN: { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimals: 2 }
};

/**
 * Format an amount with the appropriate currency symbol and formatting
 * @param amount - The numeric amount to format
 * @param currencyCode - The 3-letter currency code (e.g., 'USD', 'EUR')
 * @param options - Additional formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currencyCode: string = 'USD',
  options: {
    showSymbol?: boolean;
    showCode?: boolean;
    showSign?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    showSymbol = true,
    showCode = false,
    showSign = false,
    minimumFractionDigits,
    maximumFractionDigits
  } = options;

  const currencyInfo = CURRENCY_MAP[currencyCode.toUpperCase()] || CURRENCY_MAP.USD;
  
  // Determine decimal places
  const decimals = minimumFractionDigits !== undefined 
    ? minimumFractionDigits 
    : currencyInfo.decimals;
  
  const maxDecimals = maximumFractionDigits !== undefined 
    ? maximumFractionDigits 
    : currencyInfo.decimals;

  // Format the number
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: maxDecimals,
  }).format(Math.abs(amount));

  // Build the formatted string
  let result = '';
  
  // Add sign if needed
  if (showSign && amount !== 0) {
    result += amount < 0 ? '-' : '+';
  } else if (amount < 0) {
    result += '-';
  }

  // Add currency symbol
  if (showSymbol) {
    result += currencyInfo.symbol;
  }

  // Add the amount
  result += formattedAmount;

  // Add currency code
  if (showCode) {
    result += ` ${currencyInfo.code}`;
  }

  return result;
};

/**
 * Get currency information for a given currency code
 * @param currencyCode - The 3-letter currency code
 * @returns Currency information object
 */
export const getCurrencyInfo = (currencyCode: string): CurrencyInfo => {
  return CURRENCY_MAP[currencyCode.toUpperCase()] || CURRENCY_MAP.USD;
};

/**
 * Get the currency symbol for a given currency code
 * @param currencyCode - The 3-letter currency code
 * @returns Currency symbol string
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return getCurrencyInfo(currencyCode).symbol;
};

/**
 * Format currency for display in tables and lists (shorter format)
 * @param amount - The numeric amount to format
 * @param currencyCode - The 3-letter currency code
 * @returns Formatted currency string
 */
export const formatCurrencyCompact = (amount: number, currencyCode: string = 'USD'): string => {
  return formatCurrency(amount, currencyCode, { showSymbol: true, showCode: false });
};

/**
 * Format currency for detailed views (includes currency code)
 * @param amount - The numeric amount to format
 * @param currencyCode - The 3-letter currency code
 * @returns Formatted currency string
 */
export const formatCurrencyDetailed = (amount: number, currencyCode: string = 'USD'): string => {
  return formatCurrency(amount, currencyCode, { showSymbol: true, showCode: true });
};

/**
 * Format currency for forms and inputs (no symbol, just number)
 * @param amount - The numeric amount to format
 * @param currencyCode - The 3-letter currency code
 * @returns Formatted number string
 */
export const formatCurrencyInput = (amount: number, currencyCode: string = 'USD'): string => {
  return formatCurrency(amount, currencyCode, { showSymbol: false, showCode: false });
};

/**
 * Parse a currency string and return the numeric value
 * @param currencyString - The currency string to parse
 * @returns Numeric value
 */
export const parseCurrency = (currencyString: string): number => {
  // Remove currency symbols and letters, keep numbers, decimal points, and minus signs
  const cleanString = currencyString.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Get a list of all available currencies
 * @returns Array of currency information objects
 */
export const getAllCurrencies = (): CurrencyInfo[] => {
  return Object.values(CURRENCY_MAP);
};

/**
 * Check if a currency code is valid
 * @param currencyCode - The currency code to validate
 * @returns True if valid, false otherwise
 */
export const isValidCurrency = (currencyCode: string): boolean => {
  return currencyCode.toUpperCase() in CURRENCY_MAP;
};