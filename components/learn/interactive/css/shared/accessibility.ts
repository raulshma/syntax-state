/**
 * Accessibility utilities for CSS interactive components
 */

/**
 * Handle keyboard events for interactive elements
 * Triggers callback on Enter or Space key press
 */
export function handleKeyboardActivation(
  event: React.KeyboardEvent,
  callback: () => void
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
}

/**
 * Generate ARIA label for box model visualization
 */
export function getBoxModelAriaLabel(
  content: { width: number; height: number },
  padding: { top: number; right: number; bottom: number; left: number },
  border: { width: number },
  margin: { top: number; right: number; bottom: number; left: number }
): string {
  return `Box model visualization showing content ${content.width} by ${content.height} pixels, ` +
    `padding ${padding.top} ${padding.right} ${padding.bottom} ${padding.left}, ` +
    `border ${border.width} pixels, ` +
    `and margin ${margin.top} ${margin.right} ${margin.bottom} ${margin.left}`;
}

/**
 * Generate ARIA label for flexbox container
 */
export function getFlexboxAriaLabel(
  itemCount: number,
  direction: string,
  justifyContent: string,
  alignItems: string
): string {
  return `Flexbox container with ${itemCount} items, ` +
    `direction ${direction}, ` +
    `justify-content ${justifyContent}, ` +
    `align-items ${alignItems}`;
}

/**
 * Generate ARIA label for flex item
 */
export function getFlexItemAriaLabel(
  id: string,
  flexGrow: number,
  flexShrink: number,
  flexBasis: string,
  order?: number
): string {
  let label = `Flex item ${id}, grow ${flexGrow}, shrink ${flexShrink}, basis ${flexBasis}`;
  if (order && order !== 0) {
    label += `, order ${order}`;
  }
  return label;
}

/**
 * Generate ARIA label for grid container
 */
export function getGridAriaLabel(
  itemCount: number,
  templateColumns: string,
  templateRows: string,
  gap: { row: number; column: number }
): string {
  return `Grid container with ${itemCount} items, ` +
    `columns ${templateColumns}, ` +
    `rows ${templateRows}, ` +
    `gap ${gap.row}px by ${gap.column}px`;
}

/**
 * Generate ARIA label for grid item
 */
export function getGridItemAriaLabel(
  id: string,
  gridColumn?: string,
  gridRow?: string
): string {
  let label = `Grid item ${id}`;
  if (gridColumn) {
    label += `, column ${gridColumn}`;
  }
  if (gridRow) {
    label += `, row ${gridRow}`;
  }
  return label;
}

/**
 * Common focus styles for interactive elements
 */
export const focusRingClasses = 'focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2';

/**
 * Announce changes to screen readers
 * Uses aria-live region pattern
 */
export function announceToScreenReader(message: string): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}
