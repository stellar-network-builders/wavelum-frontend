'use client';

import { useEffect } from 'react';

export function AxeCore() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    async function loadAxe() {
      const React = await import('react');
      const ReactDOM = await import('react-dom/client');
      const axe = await import('@axe-core/react');
      axe.default(React, ReactDOM, 1000);
    }

    loadAxe();
  }, []);

  return null;
}
