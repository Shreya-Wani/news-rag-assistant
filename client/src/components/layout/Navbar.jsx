import { Link, NavLink } from "react-router-dom";
import { HiOutlineNewspaper, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { RiRobot2Line } from "react-icons/ri";

const navLinks = [
  { to: "/", label: "Home", icon: null },
  { to: "/chat", label: "Chat", icon: HiOutlineChatBubbleLeftRight },
  { to: "/news", label: "News", icon: HiOutlineNewspaper },
];

const Navbar = () => {
  return (
    <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border-primary)" }}>
      <div className="page-container page-container--wide">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: "var(--text-primary)", display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>
              <RiRobot2Line style={{ color: "var(--bg-primary)", fontSize: 16 }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              NewsMind
            </span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 6,
                  fontSize: 13, fontWeight: 500, textDecoration: "none",
                  transition: "all 0.15s",
                  background: isActive ? "var(--bg-tertiary)" : "transparent",
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                })}
              >
                {Icon && <Icon style={{ fontSize: 14 }} />}
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
