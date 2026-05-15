/**
 * CORS Configuration
 */

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
];

/**
 * Check if an origin is a Vercel preview deployment URL.
 * Vercel preview URLs follow the pattern: https://<project>-<hash>-<user>.vercel.app
 */
const isVercelPreview = (origin) => {
  return origin && /^https:\/\/news-rag-assistant.*\.vercel\.app$/.test(origin);
};

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin) || isVercelPreview(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
