import { createContext, useContext, useState, useCallback } from 'react'

// Lightweight toast system so button clicks give visible feedback.
// Usage: const toast = useToast(); toast('Saved!')
const ToastContext = createContext(() => {})

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null)

  const show = useCallback((text) => {
    setMsg(text)
    clearTimeout(show._t)
    show._t = setTimeout(() => setMsg(null), 2600)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e293b',
            color: '#fff',
            padding: '11px 18px',
            borderRadius: 10,
            fontSize: 13,
            boxShadow: 'var(--shadow-lg)',
            zIndex: 500,
            maxWidth: '90vw',
            textAlign: 'center',
          }}
        >
          <i className="fas fa-check-circle" style={{ color: '#38bdf8', marginRight: 6 }} />
          {msg}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
