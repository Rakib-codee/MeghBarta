// Custom hook for keyboard navigation and accessibility
import { useEffect, useCallback } from 'react';

export const useKeyboardNavigation = ({ 
  onUnitToggle, 
  onLocationRequest, 
  onRefresh 
}) => {
  const handleKeyDown = useCallback((event) => {
    // Only handle if not typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'f':
      case 'c':
        event.preventDefault();
        onUnitToggle && onUnitToggle();
        break;
      
      case 'l':
        event.preventDefault();
        onLocationRequest && onLocationRequest();
        break;
      
      case 'r':
        if (event.ctrlKey || event.metaKey) {
          // Let default browser refresh behavior work
          return;
        }
        event.preventDefault();
        onRefresh && onRefresh();
        break;
        
      case 'escape':
        // Close any open modals or dropdowns
        document.activeElement?.blur();
        break;
        
      case '?':
        event.preventDefault();
        // Show keyboard shortcuts help
        showKeyboardHelp();
        break;
        
      default:
        break;
    }
  }, [onUnitToggle, onLocationRequest, onRefresh]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { handleKeyDown };
};

// Function to show keyboard shortcuts
const showKeyboardHelp = () => {
  const helpText = `
🌤️ MeghBarta Keyboard Shortcuts:

🌡️ F/C - Toggle temperature units (°F/°C)
📍 L - Use your current location  
🔄 R - Refresh weather data
❌ ESC - Close search/modal
❓ ? - Show this help

💡 Tip: Use Tab to navigate through elements
  `;
  
  // Show as a temporary overlay
  const overlay = document.createElement('div');
  overlay.className = 'keyboard-help-overlay';
  overlay.innerHTML = `
    <div class="keyboard-help-modal">
      <h2>⌨️ Keyboard Shortcuts</h2>
      <pre>${helpText}</pre>
      <button onclick="this.parentElement.parentElement.remove()">Got it!</button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (overlay.parentElement) {
      overlay.remove();
    }
  }, 10000);
};

// Hook for managing focus and ARIA attributes
export const useAccessibility = () => {
  const announceToScreenReader = useCallback((message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  const setFocusToElement = useCallback((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.focus();
    }
  }, []);

  return {
    announceToScreenReader,
    setFocusToElement
  };
};