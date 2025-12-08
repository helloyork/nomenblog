import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const FRAME_HEIGHT = 24;
const EMPTY_LINE = ".".repeat(66);
const EMPTY_FRAME_CONTENT = `\r\n${" ".repeat(66)}${"\r\n".repeat(FRAME_HEIGHT)}\r\n`;
const isChrome = typeof navigator !== "undefined"
  && /chrome/i.test(navigator.userAgent)
  && !/edg|opr|brave/i.test(navigator.userAgent);

export type FrameData = string[];

export type FrameLoader = () => Promise<FrameData>;

export interface UseBadAppleOptions {
  fps?: number;
  autoStart?: boolean;
  loadFrames?: FrameLoader;
}

export interface UseBadAppleReturn {
  pause: () => void;
  resume: () => void;
  restart: () => void;
  isPlaying: boolean;
  isLoaded: boolean;
}

export const loadBadAppleFrames: FrameLoader = async () => {
  const res = await fetch("/static/bad_apple.json");
  if (!res.ok) {
    throw new Error("Failed to load bad_apple.json");
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Invalid bad_apple.json format");
  }
  return data as FrameData;
};

function createCommentNodes(): { node: Comment | null; nodes: Comment[] | null } {
  const root = document.documentElement;

  if (isChrome) {
    const node = document.createComment(EMPTY_FRAME_CONTENT);
    root.prepend(node);
    return { node, nodes: null };
  }

  // Browsers not based on Chromium don't render newlines in comments, so I'm using multiple comments
  const nodes: Comment[] = [];
  for (let i = 0; i < FRAME_HEIGHT; i++) {
    const comment = document.createComment(EMPTY_LINE);
    nodes.unshift(comment);
    root.prepend(comment);
  }
  return { node: null, nodes };
}

function removeCommentNodes(node: Comment | null, nodes: Comment[] | null): void {
  node?.remove();

  for (const n of nodes ?? []) {
    n.remove();
  }
}

function renderFrame(frames: FrameData, frameIndex: number, node: Comment | null, nodes: Comment[] | null): void {
  const frame = frames[frameIndex];

  if (isChrome && node) {
    node.textContent = `\n${frame}`;
    return;
  }

  if (nodes) {
    const lines = (frame ?? "").replace(/ /g, ".").split("\r\n");
    for (let i = 0; i < lines.length; i++) {
      const comment = nodes[i];
      if (comment) {
        comment.textContent = lines[i];
      }
    }
  }
}

export function useBadApple(options: UseBadAppleOptions = {}): UseBadAppleReturn {
  const { fps = 24, autoStart = true, loadFrames = loadBadAppleFrames } = options;

  const [isPlaying, setIsPlaying] = useState(autoStart);
  const [frames, setFrames] = useState<FrameData | null>(null);

  const nodeRef = useRef<Comment | null>(null);
  const nodesRef = useRef<Comment[] | null>(null);
  const frameIndexRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    loadFrames().then((data) => {
      if (!cancelled) setFrames(data);
    });
    return () => {
      cancelled = true;
    };
  }, [loadFrames]);

  useLayoutEffect(() => {
    if (!isPlaying || !frames) return;

    const { node, nodes } = createCommentNodes();
    nodeRef.current = node;
    nodesRef.current = nodes;
    frameIndexRef.current = 0;

    return () => {
      removeCommentNodes(nodeRef.current, nodesRef.current);
      nodeRef.current = null;
      nodesRef.current = null;
    };
  }, [isPlaying, frames]);

  useEffect(() => {
    if (!isPlaying || !frames) return;

    const intervalMs = 1000 / fps;

    const intervalId = window.setInterval(() => {
      renderFrame(frames, frameIndexRef.current, nodeRef.current, nodesRef.current);
      frameIndexRef.current = (frameIndexRef.current + 1) % frames.length;
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fps, isPlaying, frames]);

  const pause = useCallback(() => setIsPlaying(false), []);
  const resume = useCallback(() => setIsPlaying(true), []);
  const restart = useCallback(() => {
    frameIndexRef.current = 0;
  }, []);

  return {
    pause,
    resume,
    restart,
    isPlaying,
    isLoaded: frames !== null,
  };
}