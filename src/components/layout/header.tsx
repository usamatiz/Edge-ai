"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileSidebar } from "./mobile-sidebar";
import { NAVIGATION_ITEMS, BRAND_NAME, ANIMATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-analytics";

// Throttle function for scroll performance
function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastExecTime = 0;
  
  return (...args: Parameters<T>) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
}

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { trackNavigation, trackButtonClick } = useAnalytics();

  // Throttled scroll handler for better performance
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleScroll = React.useCallback(
    throttle(() => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > ANIMATIONS.scrollThreshold);
    }, ANIMATIONS.throttleDelay), // ~60fps
    []
  );

  // Handle scroll effect with throttling
  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle escape key for mobile menu
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-out",
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-lg"
            : "bg-transparent"
        )}
        role="banner"
      >
        <div className="max-w-[1260px] mx-auto px-3">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-10">
            {/* Logo */}
            <Link 
              href="/"
              className="text-[#5046E5] text-xl font-bold"
              aria-label={`${BRAND_NAME} - Go to homepage`}
              onClick={() => {
                if (pathname !== "/") {
                  trackNavigation(pathname, "/", "click");
                }
              }}
            >
            EdgeAI<span className="text-[#E54B46] font-bold">Realty</span>
            </Link>

            {/* Desktop Navigation */}
            <nav 
              className="hidden lg:flex items-center space-x-1"
              role="navigation"
              aria-label="Main navigation"
            >
              {NAVIGATION_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                      "group relative px-4 py-2 text-sm font-semibold transition-all duration-500 ease-out focus:outline-none",  
                      isActive
                        ? "text-[#5046E5]"
                        : "text-[#282828] hover:text-[#5046E5]"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`${item.label}${isActive ? " (current page)" : ""}`}
                    onClick={() => {
                      if (!isActive) {
                        trackNavigation(pathname, item.href, "click");
                      }
                    }}
                  >
                    {/* Text with smooth hover animation */}
                    <span className="relative z-10 transition-transform duration-300 ease-out group-hover:translate-y-[-1px]">
                      {item.label}
                    </span>
                    
                    {/* Bottom border animation only */}
                    <div className={cn(
                      "absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[#5046E5] to-purple-600 transition-all duration-500 ease-out transform -translate-x-1/2",
                      isActive
                        ? "w-full"
                        : "group-hover:w-full"
                    )} />
                  </Link>
                );
              })}
            </nav>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Link
                href="/login"
                className={cn(
                  "inline-flex text-[#282828] py-[10.9px] px-[19.5px] rounded-full hover:bg-gray-200 transition-all duration-300",
                )}
                aria-label="Log in to your account"
                onClick={() => trackButtonClick("login", "header", "navigate")}
              >
                Log In
              </Link>
              <Link
                href="/register"
                className={cn(
                  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium focus-visible:outline-none py-[10.9px] px-[19.5px] bg-gradient-to-r from-[#5046E5] to-[#3A2DFD] text-white border border-[#5046e5] hover:bg-transparent hover:[background-image:none] hover:text-[#5046e5] transition-all duration-500"
                )}
                                
                aria-label="Create a new account"
                onClick={() => trackButtonClick("register", "header", "navigate")}
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(true);
                trackButtonClick("mobile_menu", "header", "open");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsMobileMenuOpen(true);
                  trackButtonClick("mobile_menu", "header", "open");
                }
              }}
              className={cn(
                "lg:hidden p-2 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none",
                isScrolled
                  ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  : "text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              )}
              aria-label="Open mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-sidebar"
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
