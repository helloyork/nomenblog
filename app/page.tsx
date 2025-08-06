/* eslint-disable indent */
"use client";

import { useEffect, useState, useMemo } from "react";
import React from "react";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    
    // Array of words for each page
    const words = useMemo(() => ['Nomen', 'About', 'Projects', 'Blogs'], []);
    
    // Links for each word (except the first one)
    const wordLinks = useMemo(() => ['', '/about', '/projects', '/blog'], []);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        function handleScroll() {
            const scrollTop = window.pageYOffset;
            const windowHeight = window.innerHeight;
            
            // Calculate current page index (each 100vh is one page)
            const pageIndex = Math.floor(scrollTop / windowHeight);
            // Calculate scroll progress within current page (0-1)
            const pageScrollProgress = (scrollTop % windowHeight) / windowHeight;

            // Text index for word/background: strictly by full page
            const textIndex = Math.min(pageIndex, words.length - 1);

            // Navigation index: switch when scrolling past half page
            let navIndex = pageIndex;
            if (pageScrollProgress > 0.5 && pageIndex < words.length - 1) {
                navIndex = pageIndex + 1;
            }
            navIndex = Math.min(navIndex, words.length - 1);
            
            // Get page dots for later use
            const pageDots = document.querySelectorAll('.page-dot');
            
            // Set current and next words
            const currentWord = words[textIndex] || 'Nomen';
            const nextWord = words[Math.min(textIndex + 1, words.length - 1)] || 'Nomen';
            
            const currentText = document.getElementById('currentText');
            const nextText = document.getElementById('nextText');
            const scrollHint = document.getElementById('scrollHint');
            
            if (!currentText || !nextText || !scrollHint) return;
            
            // Update text content without arrow symbols
            if (currentText.textContent !== currentWord) {
                currentText.textContent = currentWord;
            }
            if (nextText.textContent !== nextWord) {
                nextText.textContent = nextWord;
            }

            // Toggle custom arrow indicator class
            if (textIndex > 0) {
                currentText.classList.add('arrow-right');
            } else {
                currentText.classList.remove('arrow-right');
            }
            if (textIndex + 1 > 0) {
                nextText.classList.add('arrow-right');
            } else {
                nextText.classList.remove('arrow-right');
            }

            // Toggle pointer style for the first page
            (currentText as HTMLElement).style.cursor = textIndex > 0 ? 'pointer' : 'default';
            (currentText as HTMLElement).style.pointerEvents = textIndex > 0 ? 'auto' : 'none';
            
            // Hide scroll hint after first scroll
            if (scrollTop > 50) {
                scrollHint.classList.add('hidden');
            } else {
                scrollHint.classList.remove('hidden');
            }
            
            // Calculate split position for text transition
            let splitPosition = 100; // Default: show current text completely

            if (textIndex < words.length - 1) {
                if (pageScrollProgress < 0.4) {
                    // 0%-40%: keep current text fully visible
                    splitPosition = 100;
                } else if (pageScrollProgress > 0.6) {
                    // 60%-100%: transition complete, show next text
                    splitPosition = 0;
                } else {
                    // 40%-60%: linear transition between texts
                    const transitionProgress = (pageScrollProgress - 0.4) / 0.2; // 0-1
                    splitPosition = 100 - (transitionProgress * 100); // 100 → 0
                }
            }
            
            // Apply split effect with small overlap to avoid gaps
            // Extend horizontal clip area to accommodate arrow
            const clampedSplitPosition = Math.max(0, Math.min(100, splitPosition));
            const overlap = 0.5;
            const currentBottom = Math.min(100, clampedSplitPosition + overlap);
            const nextTop = Math.max(0, clampedSplitPosition - overlap);

            // Extend clipping area horizontally to prevent arrow cutoff
            currentText.style.clipPath = `polygon(0 0, 110% 0, 110% ${currentBottom}%, 0 ${currentBottom}%)`;
            nextText.style.clipPath = `polygon(0 ${nextTop}%, 110% ${nextTop}%, 110% 100%, 0 100%)`;
            
            // Set colors based on page index
            const isOddPage = textIndex % 2 === 0; // Page 0,2,4 are odd pages (black background)
            
            if (isOddPage) {
                // Odd pages: black background, white text
                document.body.style.backgroundColor = '#000';
                currentText.style.color = '#fff';
                nextText.style.color = textIndex + 1 < words.length && (textIndex + 1) % 2 !== 0 ? '#000' : '#fff';
            } else {
                // Even pages: white background, black text
                document.body.style.backgroundColor = '#fff';
                currentText.style.color = '#000';
                nextText.style.color = textIndex + 1 < words.length && (textIndex + 1) % 2 === 0 ? '#fff' : '#000';
            }

            // Update page dots colors
            const isOddNav = navIndex % 2 === 0;
            const inactiveColor = isOddNav ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
            const activeColor = isOddNav ? '#fff' : '#000';
            pageDots.forEach((dot, index) => {
                const dotElement = dot as HTMLElement;
                dotElement.style.backgroundColor = index === navIndex ? activeColor : inactiveColor;
                // Also update the active class for scaling effect
                dotElement.classList.toggle('active', index === navIndex);
            });
            // Update nav label colors
            const navLabels = document.querySelectorAll('.nav-label') as NodeListOf<HTMLElement>;
            navLabels.forEach((label, labelIndex) => {
                (label as HTMLElement).style.color = labelIndex === navIndex ? activeColor : inactiveColor;
            });

            // Update scroll hint color
            scrollHint.style.color = isOddPage ? '#fff' : '#000';
            
            setCurrentIndex(textIndex);
        }
        
        // Add scroll listener
        window.addEventListener('scroll', handleScroll);
        
        // Initialize
        handleScroll();
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [words]);
    
    // Smooth scroll to specific page
    const scrollToPage = (index: number) => {
        const targetScroll = index * window.innerHeight;
        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    };
    
    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === ' ') {
                e.preventDefault();
                const nextPage = Math.min(currentIndex + 1, words.length - 1);
                scrollToPage(nextPage);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prevPage = Math.max(currentIndex - 1, 0);
                scrollToPage(prevPage);
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, words.length]);

    // Unified hover state for arrow across split texts
    useEffect(() => {
        const currentText = document.getElementById('currentText');
        const nextText = document.getElementById('nextText');
        if (!currentText || !nextText) return;

        const addHover = () => {
            currentText.classList.add('arrow-hover');
            nextText.classList.add('arrow-hover');
        };

        const removeHover = () => {
            currentText.classList.remove('arrow-hover');
            nextText.classList.remove('arrow-hover');
        };

        currentText.addEventListener('mouseenter', addHover);
        currentText.addEventListener('mouseleave', removeHover);
        nextText.addEventListener('mouseenter', addHover);
        nextText.addEventListener('mouseleave', removeHover);

        return () => {
            currentText.removeEventListener('mouseenter', addHover);
            currentText.removeEventListener('mouseleave', removeHover);
            nextText.removeEventListener('mouseenter', addHover);
            nextText.removeEventListener('mouseleave', removeHover);
        };
    }, []);

    return (
        <>
            {/* Global styles for this page */}
            <style jsx global>{`
                .hidden {
                    opacity: 0 !important;
                }
                html, body {
                    scroll-behavior: smooth;
                    overflow-x: hidden;
                }

                /* custom right arrow using two lines - scaled for large text */
                .arrow-right::after {
                    content: "";
                    display: inline-block;
                    width: 0.3em; /* slightly larger width for thicker arrow */
                    height: 0.3em; /* slightly larger height for thicker arrow */
                    border-top: 0.04em solid currentColor; /* thicker border */
                    border-right: 0.04em solid currentColor; /* thicker border */
                    border-radius: 0.01em; /* rounded corners on all sides */
                    transform: rotate(45deg);
                    margin-left: 0.1em; /* tighter spacing */
                    vertical-align: middle; /* better alignment */
                    transition: transform 0.3s ease; /* smooth transition for hover effect */
                }

                /* unified hover effect for arrow displacement */
                .arrow-hover::after {
                    transform: rotate(45deg) translateX(0.1em) translateY(-0.1em); /* move arrow to the right on hover */
                }

                /* Page indicator active scaling */
                .page-dot.active {
                    transform: scale(1.5);
                }
            `}</style>
            
            {/* Fixed text container */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-screen h-screen flex justify-center items-center pointer-events-none">
                {/* Current text (top half) */}
                <h1 
                    id="currentText"
                    className="uppercase absolute text-white font-black whitespace-nowrap leading-tight tracking-tight text-center w-auto left-1/2 transform -translate-x-1/2 z-[2] pointer-events-none"
                    style={{
                        fontSize: 'clamp(60px, 12vw, 200px)',
                        clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'
                    }}
                    onClick={() => {
                        const currentWord = document.getElementById('currentText')?.textContent?.replace(' →', '') || '';
                        const wordIndex = words.indexOf(currentWord);
                        if (wordIndex > 0 && wordLinks[wordIndex]) {
                            router.push(wordLinks[wordIndex], { scroll: false });
                        }
                    }}
                >
                    Nomen
                </h1>
                
                {/* Next text (bottom half) */}
                <h2 
                    id="nextText"
                    className="uppercase absolute text-black font-black whitespace-nowrap leading-tight tracking-tight text-center w-auto left-1/2 transform -translate-x-1/2 z-[1] pointer-events-auto cursor-pointer"
                    style={{
                        fontSize: 'clamp(60px, 12vw, 200px)',
                        clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)'
                    }}
                    onClick={() => {
                        const nextWord = document.getElementById('nextText')?.textContent?.replace(' →', '') || '';
                        const wordIndex = words.indexOf(nextWord);
                        if (wordIndex > 0 && wordLinks[wordIndex]) {
                            router.push(wordLinks[wordIndex], { scroll: false });
                        }
                    }}
                >
                    About
                </h2>
            </div>

            {/* Page indicators */}
            <div id="pageNav" className="group fixed right-5 top-1/2 transform -translate-y-1/2 z-[100] flex flex-col gap-2.5">
                {words.map((word, index) => (
                    <div
                        key={index}
                        className="relative flex items-center cursor-pointer select-none"
                        onClick={() => scrollToPage(index)}
                    >
                        <div
                            className="page-dot w-2 h-2 rounded-full bg-white/50 transition-all duration-300 group-hover:opacity-0 group-hover:scale-0"
                        />
                        <span
                            className="nav-label absolute right-0 top-1/2 -translate-y-1/2 uppercase opacity-0 transform scale-95 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 text-xs font-medium cursor-pointer"
                            style={{ transitionDelay: `${index * 80}ms` }}
                        >
                            {word}
                        </span>
                    </div>
                ))}
            </div>

            {/* Scroll hint */}
            <div 
                id="scrollHint"
                className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white text-sm text-center z-[100] opacity-100 transition-opacity duration-500"
            >
                {/* Two-line arrow pointing down using SVG */}
                <div className="flex flex-col items-center">
                    <svg width="24" height="24" viewBox="0 0 12 8" className="fill-none stroke-current stroke-[1.5]">
                        <path d="M2 2 L6 6 L10 2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </div>

            {/* Scroll container */}
            <div style={{ height: `${words.length * 100}vh` }}>
                {words.map((_, index) => (
                    <div
                        key={index}
                        className="h-screen w-full relative"
                        style={{
                            backgroundColor: index % 2 === 0 ? '#000' : '#fff'
                        }}
                    />
                ))}
            </div>
        </>
    );
}

