import { Link, NavLink } from "react-router-dom";
import { HiOutlineNewspaper, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { HiOutlineSun, HiOutlineMoon } from "react-icons/hi2";
import { useTheme } from "../../context/ThemeContext.jsx";

const navLinks = [
  { to: "/", label: "Home", icon: null },
  { to: "/chat", label: "Chat", icon: HiOutlineChatBubbleLeftRight },
  { to: "/news", label: "News", icon: HiOutlineNewspaper },
];

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="glass" style={{ position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid var(--border-primary)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 52, width: "100%" }}>
        {/* Logo — flush left with minimal padding like ChatGPT */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", paddingLeft: 10, flexShrink: 0 }}>
          <img
            src="/logo.svg"
            alt="NewsMind AI"
            style={{ width: 32, height: 32 }}
          />
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            NewsMind AI
          </span>
        </Link>

        {/* Nav Links + Theme Toggle — right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingRight: 16 }}>
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

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{ marginLeft: 8 }}
          >
            {theme === "dark" ? (
              <HiOutlineSun style={{ fontSize: 18 }} />
            ) : (
              <HiOutlineMoon style={{ fontSize: 18 }} />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
