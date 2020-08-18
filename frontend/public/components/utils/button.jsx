import React from 'react';
import './_button.scss';

export function Button({ children, ...props }) {
  return (
    <button className="button-icon" {...props}>
      {children}
    </button>
  );
}
