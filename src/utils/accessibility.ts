// src/utils/accessibility.ts

/**
 * Generates a unique ID for form inputs and labels
 */
export const generateId = (prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Announces message to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

/**
 * Trap focus within an element (for modals, dialogs)
 */
export const trapFocus = (element: HTMLElement): (() => void) => {
    const focusableSelectors = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
    
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;
        
        const focusableElements = element.querySelectorAll<HTMLElement>(focusableSelectors);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement?.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement?.focus();
            }
        }
    };
    
    element.addEventListener('keydown', handleKeyDown);
    
    // Return cleanup function
    return () => {
        element.removeEventListener('keydown', handleKeyDown);
    };
};

/**
 * Get focus visible class for Tailwind CSS
 */
export const getFocusClasses = (color: string = 'primary'): string => {
    return `focus:outline-none focus:ring-2 focus:ring-${color} focus:ring-offset-2`;
};

/**
 * Check if element is visible to user
 */
export const isElementVisible = (element: HTMLElement): boolean => {
    return !!(
        element.offsetWidth ||
        element.offsetHeight ||
        element.getClientRects().length
    );
};

/**
 * Get the first focusable element within a container
 */
export const getFirstFocusable = (container: HTMLElement): HTMLElement | null => {
    const focusableSelectors = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])';
    return container.querySelector<HTMLElement>(focusableSelectors);
};

/**
 * Handle keyboard navigation for lists
 */
export const handleListKeyNavigation = (
    event: React.KeyboardEvent,
    currentIndex: number,
    itemCount: number,
    onSelect: (index: number) => void
): void => {
    let newIndex = currentIndex;
    
    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault();
            newIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
            break;
        case 'ArrowUp':
            event.preventDefault();
            newIndex = currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
            break;
        case 'Home':
            event.preventDefault();
            newIndex = 0;
            break;
        case 'End':
            event.preventDefault();
            newIndex = itemCount - 1;
            break;
        case 'Enter':
        case ' ':
            event.preventDefault();
            onSelect(currentIndex);
            return;
        default:
            return;
    }
    
    onSelect(newIndex);
};
