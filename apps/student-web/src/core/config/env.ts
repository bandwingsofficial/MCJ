const requiredEnv = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  CUSTOMER_WEB_URL: process.env.NEXT_PUBLIC_CUSTOMER_WEB_URL,
};

Object.entries(requiredEnv).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

export const env = {
  API_BASE_URL: requiredEnv.API_BASE_URL!,
  CUSTOMER_WEB_URL: requiredEnv.CUSTOMER_WEB_URL!,
  STUDENT_WEB_URL:
    process.env.NEXT_PUBLIC_STUDENT_WEB_URL ??
    (typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3002"),
} as const;
