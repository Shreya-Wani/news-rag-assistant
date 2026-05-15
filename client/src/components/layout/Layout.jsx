import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const Layout = () => {
  return (
    <div className="bg-grid" style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-primary)", overflow: "hidden", position: "relative" }}>
      <div className="bg-glow" />
      <Navbar />
      <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
