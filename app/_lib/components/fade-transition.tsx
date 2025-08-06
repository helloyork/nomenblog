'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useContext, useRef } from 'react';

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

const FadeTransition = ({ children, variants }: { children: React.ReactNode, variants?: any }) => {
  // The `key` is tied to the url using the `usePathname` hook.
  const key = usePathname();

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
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
};

export default FadeTransition;