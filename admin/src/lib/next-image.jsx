import React from 'react';

export default function Image({ src, alt, fill, priority, sizes, className, style, width, height, ...props }) {
  let finalClass = className || '';
  if (fill) {
    finalClass = 'absolute inset-0 w-full h-full object-cover ' + finalClass;
  }
  return (
    <img
      src={src}
      alt={alt || ''}
      className={finalClass}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      {...props}
    />
  );
}

