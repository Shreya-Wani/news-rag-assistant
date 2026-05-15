import { Link } from "react-router-dom";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";

/**
 * 404 Not Found Page
 */
const NotFoundPage = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "1.5rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <HiOutlineExclamationTriangle
        style={{ fontSize: "4rem", color: "var(--color-text-tertiary, #888)" }}
      />
      <h1 style={{ fontSize: "3rem", fontWeight: 700, margin: 0 }}>404</h1>
      <p
        style={{
          fontSize: "1.125rem",
          color: "var(--color-text-secondary, #666)",
          margin: 0,
        }}
      >
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          background: "var(--color-primary, #6366f1)",
          color: "#fff",
          textDecoration: "none",
          fontWeight: 500,
          transition: "opacity 0.2s",
        }}
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
