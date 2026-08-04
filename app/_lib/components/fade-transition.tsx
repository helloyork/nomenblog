'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useContext, useEffect, useRef } from 'react';

function FrozenRouter(props: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  if (!frozen) {
    return <>{props.children}</>;
  }

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {props.children}
    </LayoutRouterContext.Provider>
  );
}

const defaultVariants = {
  // Fade only, no scaling to avoid visual displacement on initial load
  hidden: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 },
};

function scrollToTop() {
  // html and body carry scroll-behavior: smooth, so a plain scrollTo starts an
  // animation that the incoming route promptly cancels, leaving the old offset.
  // Ask for an instant jump, and assign scrollTop as well for engines that
  // ignore the instant behavior.
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/**
 * FrozenRouter holds on to the old LayoutRouterContext so the outgoing page can
 * finish its exit animation. That is the same context Next uses to find the new
 * segment and scroll it into view, so Next's own scroll reset never lands and a
 * navigation keeps the previous page's offset. This sits inside the keyed
 * wrapper, so it mounts once per route and resets the offset itself.
 */
function ScrollReset({ skipOnce }: { skipOnce: React.MutableRefObject<boolean> }) {
  const pathname = usePathname();

  useEffect(() => {
    // Back and forward keep whatever offset the browser restores.
    if (skipOnce.current) {
      skipOnce.current = false;
      return;
    }
    scrollToTop();
  }, [pathname, skipOnce]);

  return null;
}

const FadeTransition = ({ children, variants }: { children: React.ReactNode, variants?: any }) => {
  // The `key` is tied to the url using the `usePathname` hook.
  const key = usePathname();
  const cameFromHistory = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      cameFromHistory.current = true;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants || defaultVariants}
        transition={{ ease: 'easeInOut', duration: 0.3 }}
        style={{ position: 'absolute', width: '100%' }}
      >
        <ScrollReset skipOnce={cameFromHistory} />
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
};

export default FadeTransition;