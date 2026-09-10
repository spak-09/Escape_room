import React, { useState, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * TerminalText UI Primitive
 * Monospaced text with optional typewriter effect and blinking cursor.
 */
export default function TerminalText({
  text = '',
  speed = 25,
  delay = 0,
  className = '',
  showCursor = true,
  onComplete,
  as: Component = 'p',
  ...props
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedText(text);
      setIsDone(true);
      if (onComplete) onComplete();
      return;
    }

    setDisplayedText('');
    setIsDone(false);

    let timeoutId;
    let currentIndex = 0;

    timeoutId = setTimeout(() => {
      const intervalId = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsDone(true);
          if (onComplete) onComplete();
        }
      }, speed);

      return () => clearInterval(intervalId);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [text, speed, delay, prefersReducedMotion, onComplete]);

  return (
    <Component className={`font-mono ${className}`} {...props}>
      {displayedText}
      {showCursor && !isDone && (
        <span className="inline-block w-2 h-4 ml-0.5 bg-cyan-400 animate-pulse align-middle" />
      )}
    </Component>
  );
}
