"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import React, { useContext, useRef } from "react";

// Keep children tree alive during exit animations
function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  if (!frozen) return <>{props.children}</>;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {props.children}
    </LayoutRouterContext.Provider>
  );
}

// Preset route order for vertical navigation
const VERTICAL_ORDER = ["/about", "/projects", "/blog"];

function getDirection(prev: string | null, curr: string): "home" | "vertical-up" | "vertical-down" | "horizontal" | "none" {
  if (!prev) return "none";
  if (prev === "/" && curr !== "/") return "horizontal"; // From home to a section
  if (curr === "/" && prev !== "/") return "horizontal"; // Back to home – treat the same

  const prevIndex = VERTICAL_ORDER.indexOf(prev);
  const currIndex = VERTICAL_ORDER.indexOf(curr);
  if (prevIndex !== -1 && currIndex !== -1) {
    if (currIndex > prevIndex) return "vertical-up"; // navigate downwards (page slides up)
    if (currIndex < prevIndex) return "vertical-down"; // navigate upwards (page slides down)
  }
  return "none";
}

const variants = {
  // Starting state for the entering page
  hidden: (direction: string) => {
    // Place entering page underneath the leaving page (zIndex: 0)
    const base = { zIndex: 0 };
    switch (direction) {
      case "horizontal":
      case "none":
        return { ...base, x: "100%", y: 0, opacity: 1 };
      case "vertical-up":
        return { ...base, y: "100%", x: 0, opacity: 1 };
      case "vertical-down":
        return { ...base, y: "-100%", x: 0, opacity: 1 };
      default:
        return { ...base, opacity: 0 };
    }
  },
  // Active state for the current page
  enter: { x: 0, y: 0, opacity: 1, zIndex: 0 },
  // State for the leaving page
  exit: (direction: string) => {
    // Keep leaving page on top while it animates out (zIndex: 1)
    const base = { zIndex: 1 };
    switch (direction) {
      case "horizontal":
      case "none":
        return { ...base, x: "-100%", y: 0, opacity: 1 };
      case "vertical-up":
        return { ...base, y: "-100%", x: 0, opacity: 1 };
      case "vertical-down":
        return { ...base, y: "100%", x: 0, opacity: 1 };
      default:
        return { ...base, opacity: 0 };
    }
  },
};

export default function SlideTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prevPathRef = useRef<string>(pathname);

  // Determine direction based on previous path stored in ref
  const direction = getDirection(prevPathRef.current, pathname);

  // Update previous pathname for next navigation
  prevPathRef.current = pathname;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={pathname}
        custom={direction}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        transition={{ ease: "easeInOut", duration: 0.4 }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
