"use client";

import { Projects } from "@/app/_lib/data/site";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

// NOTE: Comments are written in English as requested.

export default function Page() {
  const items = Projects;
  const TOP_OFFSET = 120; // px, minimum distance from top of screen for cards
  const FADE_ZONE = 80; // px, distance from top where cards start fading
  const [titleOpacity, setTitleOpacity] = useState(1);
  const [cardOpacities, setCardOpacities] = useState<number[]>(new Array(items.length).fill(1));
  const [scrollHintOpacity, setScrollHintOpacity] = useState(1);
  const cardRefs = useRef<(HTMLDivElement | null)[]>(new Array(items.length).fill(null));

  // Calculate card opacity based on distance from top of viewport
  const calculateCardOpacity = (cardTop: number): number => {
    if (cardTop > TOP_OFFSET + FADE_ZONE) {
      return 1; // Card is well below the fade zone
    } else if (cardTop <= TOP_OFFSET) {
      return 0; // Card has reached the sticky position (fully faded)
    } else {
      // Card is in the fade zone
      const fadeProgress = (TOP_OFFSET + FADE_ZONE - cardTop) / FADE_ZONE;
      return Math.max(0, 1 - fadeProgress);
    }
  };

  // Initialize scroll position to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Adjust title opacity and card opacities based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const fadeStartPoint = viewportHeight * 0.1;
      const fadeEndPoint = viewportHeight * 0.5; // Complete fade by 120% of viewport height
      const scrollY = window.scrollY;
      
      // Update title opacity
      if (scrollY < fadeStartPoint) {
        setTitleOpacity(1);
      } else if (scrollY > fadeEndPoint) {
        setTitleOpacity(0.05);
      } else {
        const fadeRange = fadeEndPoint - fadeStartPoint;
        const scrollInRange = scrollY - fadeStartPoint;
        const ratio = scrollInRange / fadeRange;
        setTitleOpacity(1 - ratio * 0.95);
      }

      // Update scroll hint opacity - hide after scrolling starts
      if (scrollY > 50) {
        setScrollHintOpacity(0);
      } else {
        setScrollHintOpacity(1);
      }

      // Update card opacities
      const newOpacities = cardRefs.current.map((cardRef) => {
        if (!cardRef) return 1;
        const rect = cardRef.getBoundingClientRect();
        return calculateCardOpacity(rect.top);
      });
      setCardOpacities(newOpacities);
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Centered fixed title */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-20 pointer-events-none px-4 sm:px-6 md:px-8" 
        style={{ opacity: titleOpacity }}
      >
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-[12rem] font-bold text-white break-words leading-tight text-overflow-safe">
            PROJECTS
          </h1>
        </div>
      </div>

      {/* Scroll hint arrow */}
      <div 
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-500"
        style={{ opacity: scrollHintOpacity }}
      >
        <div className="flex flex-col items-center">
          <svg width="24" height="24" viewBox="0 0 12 8" className="fill-none stroke-white stroke-[1.5]">
            <path d="M2 2 L6 6 L10 2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Scroll container */}
      <div
        className="relative w-full bg-black text-white pb-40"
        style={{ marginTop: "100vh" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="sticky"
            style={{ 
              top: TOP_OFFSET, 
              zIndex: i + 1,
              opacity: cardOpacities[i]
            }}
          >
            <motion.a
              href={item.link}
              layoutId={`project-item-${i}`}
              className={clsx(
                "bg-black border border-white/25 cursor-pointer select-none block",
                "px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 w-full hover:bg-white/5 transition-all duration-200",
                "min-h-[100px] sm:min-h-[120px] md:h-32 lg:h-40"
              )}
            >
              {/* Responsive card layout */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-full gap-1 sm:gap-2 md:gap-0">
                {/* Technology type - responsive positioning */}
                <div className="flex-shrink-0 w-full sm:w-1/4 order-1 sm:order-1">
                  <span className="text-xs sm:text-sm opacity-50 break-words text-overflow-safe">
                    {item.subtitle}
                  </span>
                </div>
                
                {/* Project name and description - center on larger screens */}
                <div className="flex-1 text-center order-3 sm:order-2 px-1 sm:px-2 md:px-0">
                  <h2 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-semibold break-words leading-tight text-overflow-safe">
                    {item.title}
                    <span className="ml-1 sm:ml-2 inline-block transition-transform hover:translate-x-1 select-none align-middle">
                      <svg width="10" height="10" viewBox="0 0 12 8" className="sm:w-3 sm:h-3 md:w-4 md:h-4 fill-none stroke-current stroke-[1.5] rotate-[-90deg]">
                        <path d="M2 2 L6 6 L10 2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </h2>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm opacity-50 max-w-md mx-auto break-words line-clamp-2 text-overflow-safe">
                    {item.description}
                  </p>
                </div>
                
                {/* Status - responsive positioning */}
                <div className="flex-shrink-0 w-full sm:w-1/4 text-center sm:text-right order-2 sm:order-3">
                  <span className="text-xs sm:text-sm opacity-50 break-words text-overflow-safe">
                    {item.status}
                  </span>
                </div>
              </div>
            </motion.a>
          </div>
        ))}
      </div>
    </>
  );
}
