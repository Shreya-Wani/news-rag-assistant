/**
 * Reusable Loading Spinner component
 */
const Loader = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-[var(--color-border)] border-t-indigo-500 rounded-full animate-spin`}
      />
    </div>
  );
};

export default Loader;
