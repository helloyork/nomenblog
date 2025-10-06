"use client";

import React, { useRef, useState, useLayoutEffect } from "react";
import clsx from "clsx";

// 焦点中心偏移量（可根据实际视觉调整）
const FOCUS_OFFSET = 100;

interface ScrollListItem {
  id: string;
  title: string;
  content: string;
}

interface ScrollListProps {
  items: ScrollListItem[];
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export default function ScrollList({ items, className, onScroll }: ScrollListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Pure scroll-driven animation: store scrollTop
  const [scrollTop, setScrollTop] = useState(0);

  // useLayoutEffect: ensure DOM and refs are ready before triggering animation
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
      if (onScroll) onScroll(container.scrollTop);
    };

    // Only when all itemRefs are ready, trigger animation
    if (
      itemRefs.current.length === items.length &&
      itemRefs.current.every(Boolean)
    ) {
      setScrollTop(container.scrollTop);
      if (onScroll) onScroll(container.scrollTop);
      requestAnimationFrame(() => {
        setScrollTop(container.scrollTop);
        if (onScroll) onScroll(container.scrollTop);
      });
    }

    container.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [items.length, items, itemRefs.current.map(Boolean).join(","), onScroll]);

  // All animation properties are scroll-driven
  const calculateProps = (index: number) => {
    const container = containerRef.current;
    const item = itemRefs.current[index];
    if (!container || !item) return { opacity: 0.2, scale: 0.85, translate: 0 };
    const containerHeight = container.clientHeight;
    const containerCenter = containerHeight / 2 + FOCUS_OFFSET;
    const itemTop = item.offsetTop;
    const itemHeight = item.offsetHeight;
    const itemCenter = itemTop + itemHeight / 2;
    // Use current scrollTop
    const visibleItemCenter = itemCenter - scrollTop;
    const rawDistance = visibleItemCenter - containerCenter;
    const distance = Math.abs(rawDistance);
    // Asymmetric factor: above center fade/scale faster
    const factor = rawDistance < 0 ? 1 : 1;
    const maxDistance = containerHeight / 4 + itemHeight;
    // Opacity: non-linear decay
    const opacity = Math.max(0.15, 1 - Math.min(1, Math.pow((distance * factor) / maxDistance, 2)) * 0.85);
    // Scale: non-linear decay
    const minScale = 0.85;
    const maxScale = 1;
    let scale = maxScale - Math.min(1, Math.pow((distance * factor) / maxDistance, 2)) * (maxScale - minScale);
    if (distance * factor > maxDistance) scale = minScale;
    // TranslateX: scale越大越右移，最大40px
    const maxTranslate = 40;
    const translate = ((scale - minScale) / (maxScale - minScale)) * maxTranslate;
    return { opacity, scale, translate };
  };

  return (
    <div
      ref={containerRef}
      className={clsx(
        "h-full overflow-y-auto scrollbar-hide",
        "scroll-smooth",
        className
      )}
    >
      <div className="space-y-8 py-12">
        {/* 顶部预留空间，保证第一个元素能滚到中央 */}
        <div style={{ height: '60vh' }} />
        {items.map((item, index) => {
          const { opacity, scale, translate } = calculateProps(index);
          return (
            <div
              key={item.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className={clsx(
                "transition-all duration-500 ease-out flex justify-start",
                "px-4 sm:px-6 md:px-8",
                index === 0 ? "pt-0" : ""
              )}
              style={{
                opacity,
                transform: `scale(${scale}) translateX(${translate}px)`,
              }}
            >
              <div className="w-full text-left">
                <h3 className={clsx(
                  "text-2xl sm:text-3xl md:text-4xl font-bold mb-4",
                  "text-white transition-colors duration-300"
                )}>
                  {item.title}
                </h3>
                <div className={clsx(
                  "text-sm sm:text-base font-light leading-relaxed",
                  "text-gray-300 transition-colors duration-300",
                  "whitespace-pre-line" // 保证换行符显示为换行
                )}>
                  {item.content}
                </div>
              </div>
            </div>
          );
        })}
        {/* 底部预留空间，保证最后一个元素能滚到中央 */}
        <div style={{ height: '50vh' }} />
      </div>
    </div>
  );
}
