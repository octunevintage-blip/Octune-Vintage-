import React, { useEffect } from 'react';

export default function Script({ src, onLoad, ...props }) {
  useEffect(() => {
    if (!src) return;
    let script = document.querySelector(`script[src="${src}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = true;
      Object.keys(props).forEach((key) => {
        script.setAttribute(key, props[key]);
      });
      document.body.appendChild(script);
    }
    
    const handleLoad = () => {
      if (onLoad) onLoad();
    };

    script.addEventListener('load', handleLoad);

    return () => {
      script.removeEventListener('load', handleLoad);
    };
  }, [src, onLoad]);

  return null;
}
