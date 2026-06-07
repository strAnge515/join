/** Utility functions for the summary page, including text manipulation and normalization. */
/**
 * This module provides utility functions for the summary page, including text manipulation and normalization.
 * It includes functions to set text content of elements, normalize strings, and format names.
 * These functions are used across the summary page to ensure consistent formatting and display of user information and greetings.
 */
export function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

/** Normalizes a string by trimming whitespace, converting to lowercase, and replacing various delimiters with spaces. It also handles camelCase by inserting spaces between lowercase and uppercase letters. This function is useful for standardizing input values for comparison or display purposes.
 * @param {string} value - The string to be normalized.
 * @returns {string} The normalized string with consistent formatting.
 */
export function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ");
}