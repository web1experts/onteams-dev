import React, { useEffect } from 'react';

const useFilledClass = (selector) => {
  useEffect(() => {
    const updateFilledClass = (element) => {
      if (element.value || (element.options && element.options[element.selectedIndex].value)) {
        element.classList.add('filled');
      } else {
        element.classList.remove('filled');
      }
    };

    const handleInputEvent = (event) => {
      updateFilledClass(event.target);
    };

    const applyFilledClass = (elements) => {
      elements.forEach(element => {
        // Initial check in case the input/select is pre-filled
        updateFilledClass(element);

        // Add event listener for input/change event
        element.addEventListener('input', handleInputEvent);
        element.addEventListener('change', handleInputEvent);
      });
    };

    // Select initial elements and apply the filled class
    const initialElements = document.querySelectorAll(selector);
    applyFilledClass(initialElements);

    // Set up a MutationObserver to handle dynamically added elements
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.matches(selector)) {
            setTimeout(function(){
                applyFilledClass([node]);
            },100)
            
          } else if (node.nodeType === 1) {
            const nestedElements = node.querySelectorAll(selector);
            setTimeout(function(){
                applyFilledClass(nestedElements);
            },100)
            
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up event listeners and observer on component unmount
    return () => {
      initialElements.forEach(element => {
        element.removeEventListener('input', handleInputEvent);
        element.removeEventListener('change', handleInputEvent);
      });

      observer.disconnect();
    };
  }, [selector]); // Dependency array to re-run effect if selector changes
};

export default useFilledClass;
