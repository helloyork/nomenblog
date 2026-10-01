'use client';

import { FC, useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
  chart: string;
}

const MermaidChart: FC<MermaidChartProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Initialize only once. Subsequent initializations are ignored by mermaid.
    // Posts are printed ink on paper; diagrams follow.
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        darkMode: false,
        background: '#f6f6f3',
        primaryColor: '#f6f6f3',
        primaryTextColor: '#0b0b0b',
        primaryBorderColor: '#0b0b0b',
        secondaryColor: '#f6f6f3',
        tertiaryColor: '#f6f6f3',
        lineColor: '#0b0b0b',
        textColor: '#0b0b0b',
        mainBkg: '#f6f6f3',
        nodeBorder: '#0b0b0b',
        clusterBkg: '#f6f6f3',
        clusterBorder: '#8a8a87',
        edgeLabelBackground: '#f6f6f3',
        fontFamily: 'var(--font-sans), sans-serif',
      },
    });

    // Generate a unique id for each diagram render.
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    // mermaid.render in v10 returns a Promise<{ svg: string }>
    mermaid
      .render(id, chart)
      .then(({ svg }: { svg: string }) => {
        if (ref.current) {
          ref.current.innerHTML = svg;
        }
      })
      .catch((err: unknown) => {
        /* eslint-disable no-console */
        console.error('Mermaid render error:', err);
      });
  }, [chart]);

  return <div ref={ref} className="w-full overflow-x-auto" />;
};

export default MermaidChart;
