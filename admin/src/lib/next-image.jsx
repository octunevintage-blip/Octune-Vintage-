import React from 'react';

export default function Image({ src, alt, fill, priority, sizes, className, style, ...props }) {
  let finalClass = className || '';
  if (fill) {
    finalClass = 'absolute inset-0 w-full h-full object-cover ' + finalClass;
  }
  return <img src={src} alt={alt} className={finalClass} style={style} {...props} />;
}
