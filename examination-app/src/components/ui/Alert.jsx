import React from 'react'
// Inline info/success/warning banner.
const ICON = {
  info: 'fa-info-circle',
  success: 'fa-check-circle',
  warning: 'fa-exclamation-triangle',
}

export default function Alert({ variant = 'info', children }) {
  return (
    <div className={`alert alert-${variant}`}>
      <i className={`fas ${ICON[variant]}`} />
      <span>{children}</span>
    </div>
  )
}
