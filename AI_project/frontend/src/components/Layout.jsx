import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const navClass = ({ isActive }) =>
    `block border-l-2 px-3 py-1.5 text-sm ${
      isActive
        ? "border-accent bg-[#f4e9ea] font-semibold text-accent"
        : "border-transparent text-muted hover:border-line hover:text-ink"
    }`;

  const studentLinks = (
    <>
      <p className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
        Library
      </p>
      <NavLink to="/" end className={navClass} onClick={() => setMenuOpen(false)}>
        Home
      </NavLink>
      <NavLink to="/books" className={navClass} onClick={() => setMenuOpen(false)}>
        Catalog
      </NavLink>
      <NavLink to="/recommendations" className={navClass} onClick={() => setMenuOpen(false)}>
        For You
      </NavLink>
      <NavLink to="/my-books" className={navClass} onClick={() => setMenuOpen(false)}>
        My Books
      </NavLink>
      <NavLink to="/history" className={navClass} onClick={() => setMenuOpen(false)}>
        History
      </NavLink>
      <NavLink to="/profile" className={navClass} onClick={() => setMenuOpen(false)}>
        Profile
      </NavLink>
    </>
  );

  const adminLinks =
    user?.role === "admin" ? (
      <>
        <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Staff
        </p>
        <NavLink to="/admin" end className={navClass} onClick={() => setMenuOpen(false)}>
          Desk overview
        </NavLink>
        <NavLink to="/admin/books" className={navClass} onClick={() => setMenuOpen(false)}>
          Manage books
        </NavLink>
        <NavLink to="/admin/borrows" className={navClass} onClick={() => setMenuOpen(false)}>
          Loan records
        </NavLink>
      </>
    ) : null;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-line bg-surface lg:flex lg:flex-col">
        <Link to="/" className="border-b border-line px-5 py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">College</p>
          <p className="mt-1 text-lg font-semibold leading-none">Campus Library</p>
        </Link>
        <nav className="flex-1 py-3">{studentLinks}{adminLinks}</nav>
        <div className="border-t border-line px-5 py-4 text-sm">
          <p className="font-medium">{user?.name}</p>
          <p className="text-muted capitalize">{user?.role}</p>
          <button type="button" onClick={handleLogout} className="btn btn-secondary mt-3 w-full">
            Log out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
          <Link to="/" className="font-semibold">
            Campus Library
          </Link>
          <button
            type="button"
            className="btn btn-secondary"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </header>

        {menuOpen ? (
          <nav id="mobile-nav" className="border-b border-line bg-surface py-3 lg:hidden">
            {studentLinks}
            {adminLinks}
            <div className="mt-3 border-t border-line px-3 pt-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs capitalize text-muted">{user?.role}</p>
              <button type="button" onClick={handleLogout} className="btn btn-secondary mt-2">
                Log out
              </button>
            </div>
          </nav>
        ) : null}

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
