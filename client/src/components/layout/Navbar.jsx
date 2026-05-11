import { Link, NavLink } from "react-router";
import { HiOutlineNewspaper, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { RiRobot2Line } from "react-icons/ri";

const navLinks = [
  { to: "/", label: "Home", icon: null },
  { to: "/chat", label: "Chat", icon: HiOutlineChatBubbleLeftRight },
  { to: "/news", label: "News", icon: HiOutlineNewspaper },
];

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[var(--color-bg-dark)]/80 border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <RiRobot2Line className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              NewsMind AI
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-[var(--color-primary)]/15 text-indigo-400"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
                  }`
                }
              >
                {Icon && <Icon className="text-lg" />}
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
