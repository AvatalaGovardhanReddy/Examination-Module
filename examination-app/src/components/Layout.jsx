import Sidebar from './Sidebar.jsx'
import Topbar from './Topbar.jsx'

// Page frame: fixed sidebar + sticky top bar + scrollable content.
// Each page passes its title/breadcrumb and renders its body as children.
export default function Layout({ title, breadcrumb, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <Topbar title={title} breadcrumb={breadcrumb} />
        <div className="content">
          <div className="page">{children}</div>
        </div>
      </div>
    </div>
  )
}
