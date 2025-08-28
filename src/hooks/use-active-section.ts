import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
        
      // Find which section is currently centered in the viewport
      let currentSection = '';
      
      for (let i = 0; i < sectionIds.length; i++) {
        const sectionId = sectionIds[i];
        const element = document.getElementById(sectionId);
        
        if (element) {
          const elementTop = element.offsetTop;
          // const elementBottom = elementTop + element.offsetHeight;
          const elementCenter = elementTop + (element.offsetHeight / 2);
          
          // Check if the section is actually visible in the viewport
          // A section is considered visible if its center is within the viewport
          if (elementCenter >= scrollPosition && elementCenter <= scrollPosition + windowHeight) {
            currentSection = sectionId;
            break;
          }
        }
      }
      
      // Only set active section if we found a section that's actually visible
      setActiveSection(currentSection);
    };

    // Initial check
    handleScroll();
    
    // Add scroll listener with throttling
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [sectionIds, offset]);

  return activeSection;
}
