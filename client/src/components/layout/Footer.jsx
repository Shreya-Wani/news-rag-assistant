const Footer = () => {
  return (
    <footer style={{ borderTop: "1px solid var(--border-primary)", padding: "16px 0", background: "var(--bg-primary)" }}>
      <div className="page-container page-container--wide">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: 0, textAlign: "center" }}>
            &copy; {new Date().getFullYear()} NewsMind. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
