import { useState, useEffect } from 'react';

export function useActiveSection(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const viewportCenter = scrollPosition + (windowHeight / 2);
      
      // Find which section is currently centered in the viewport
      let currentSection = '';
      let closestSection = '';
      let closestDistance = Infinity;
      
      for (let i = 0; i < sectionIds.length; i++) {
        const sectionId = sectionIds[i];
        const element = document.getElementById(sectionId);
        
        if (element) {
          const elementTop = element.offsetTop;
        //   const elementBottom = elementTop + element.offsetHeight;
          const elementCenter = elementTop + (element.offsetHeight / 2);
          
          // Calculate distance from viewport center to section center
          const distance = Math.abs(viewportCenter - elementCenter);
          
          // Keep track of the closest section
          if (distance < closestDistance) {
            closestDistance = distance;
            closestSection = sectionId;
          }
          
          // Check if the section center is within the viewport
          if (elementCenter >= scrollPosition && elementCenter <= scrollPosition + windowHeight) {
            currentSection = sectionId;
            break;
          }
        }
      }
      
      // If no section is centered in viewport, use the closest one
      if (!currentSection) {
        currentSection = closestSection;
      }
      
      // If we're at the very top, set home as active
      if (scrollPosition < 200) {
        currentSection = 'home';
      }
      
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
