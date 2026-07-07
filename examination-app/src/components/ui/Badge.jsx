import React from 'react'
// Small status pill. `variant` maps to the badge-* CSS classes.
export default function Badge({ variant = 'neutral', children }) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}
