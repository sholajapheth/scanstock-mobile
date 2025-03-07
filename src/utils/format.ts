// utils/format.ts

/**
 * Formats a number as currency (naira by default)
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: 'NGN')
 * @param {string} locale - The locale to use for formatting (default: 'en-NG')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency = "NGN",
  locale = "en-NG"
) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback in case of any errors with Intl
    return `₦${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  }
};

/**
 * Formats a number with commas as thousands separators
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number: number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Formats a date to a readable string
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (
  date: string | Date,
  options: Partial<Intl.DateTimeFormatOptions> = {}
) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  try {
    return new Date(date).toLocaleDateString("en-US", defaultOptions);
  } catch (error) {
    // Fallback in case of any errors
    return new Date(date).toDateString();
  }
};
