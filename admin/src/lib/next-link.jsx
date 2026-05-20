import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export default function Link({ href, children, ...props }) {
  let to = href;
  if (typeof href === 'object') {
    const searchParams = new URLSearchParams(href.query).toString();
    to = `${href.pathname}${searchParams ? '?' + searchParams : ''}`;
  }
  return (
    <RouterLink to={to} {...props}>
      {children}
    </RouterLink>
  );
}
