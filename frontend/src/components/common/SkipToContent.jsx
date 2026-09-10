import React from 'react';

/**
 * SkipToContent Accessibility Primitive
 * Off-screen link visible on keyboard focus allowing screen readers and
 * keyboard operators to bypass navigation straight to primary facility content.
 */
export default function SkipToContent({ targetId = 'main-content' }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 px-4 py-2 bg-cyan-950 text-cyan-300 border-2 border-cyan-400 font-mono text-xs font-bold uppercase rounded tracking-wider shadow-tactical-cyan focus:outline-none"
    >
      [ SKIP TO MAIN CONTENT ]
    </a>
  );
}
