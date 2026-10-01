'use client';

import { AnimatePresence, usePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { routeScheme } from '@lib/chuanzi/types';
import { dive } from './dive';

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

/** One route. When it is replaced it stays mounted, under the transition, until the screen is covered. */
function RoutePage({ path, children }: { path: string; children: React.ReactNode }) {
  const [isPresent, safeToRemove] = usePresence();

  useEffect(() => {
    if (isPresent) return;
    let live = true;
    void dive.covered().then(() => { if (live) safeToRemove?.(); });
    return () => { live = false; };
  }, [isPresent, safeToRemove]);

  return (
    <div data-route={path} data-scheme={routeScheme(path)} className="n-route" style={{ position: 'absolute', width: '100%' }}>
      {children}
    </div>
  );
}

/**
 * Both pages are mounted while the route changes: the old one dives or sinks
 * away on top, the new one waits hidden underneath and comes up once the
 * screen is covered. FrozenRouter keeps the old page on its own route.
 */
const FadeTransition = ({ children }: { children: React.ReactNode }) => {
  const key = usePathname();
  const shown = useRef(key);

  useLayoutEffect(() => {
    if (shown.current === key) return;
    const from = shown.current;
    shown.current = key;
    dive.navigate(from, key);
  }, [key]);

  return (
    <AnimatePresence initial={false}>
      <RoutePage key={key} path={key}>
        <FrozenRouter>{children}</FrozenRouter>
      </RoutePage>
    </AnimatePresence>
  );
};

export default FadeTransition;
