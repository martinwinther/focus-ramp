'use client';

import { useEffect } from 'react';

export function ViewportMeta() {
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const content = viewport.getAttribute('content') || '';
      if (!content.includes('viewport-fit=cover')) {
        const updatedContent = content.includes('viewport-fit')
          ? content.replace(/viewport-fit=[^,]+/, 'viewport-fit=cover')
          : `${content}, viewport-fit=cover`.replace(/^,\s*/, '').replace(/,\s*,/g, ',');
        viewport.setAttribute('content', updatedContent);
      }
    }
  }, []);

  return null;
}

