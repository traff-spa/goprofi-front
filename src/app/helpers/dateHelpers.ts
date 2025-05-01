/**
 * Format date to DD.MM.YYYY
 * @param dateString - Date string or Date object to format
 * @returns Formatted date string in DD.MM.YYYY format
 */
export const formatDate = (dateString: Date | string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
};