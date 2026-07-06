// Card with an optional header (title + optional right-side actions).
export default function Card({ title, icon, actions, children }) {
  return (
    <div className="card">
      {title && (
        <div className="card-header">
          <h3>
            {icon && <i className={`fas ${icon}`} />} {title}
          </h3>
          {actions}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  )
}
