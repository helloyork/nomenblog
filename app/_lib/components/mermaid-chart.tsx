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
    // The two site colours only: ice lines and text on near-black.
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        darkMode: true,
        background: '#07090d',
        primaryColor: '#07090d',
        primaryTextColor: '#d6ecff',
        primaryBorderColor: '#d6ecff',
        secondaryColor: '#07090d',
        tertiaryColor: '#07090d',
        lineColor: '#d6ecff',
        textColor: '#d6ecff',
        mainBkg: '#07090d',
        nodeBorder: '#d6ecff',
        clusterBkg: '#07090d',
        clusterBorder: '#8398ad',
        edgeLabelBackground: '#07090d',
        fontFamily: 'var(--font-mono), monospace',
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
