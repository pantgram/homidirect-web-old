import * as dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET,
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8080",
  r2: {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
    publicUrl: process.env.R2_PUBLIC_URL!, // Public URL for serving images (e.g., https://pub-xxx.r2.dev)
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, // API endpoint for uploads
  },
  email: {
    smtpHost: process.env.SMTP_HOST || "smtp.zoho.com",
    smtpPort: parseInt(process.env.SMTP_PORT || "465"),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    emailFrom: process.env.EMAIL_FROM || "donotreply@homidirect.com",
  },
  geoapifyApiKey: process.env.GEOAPIFY_API_KEY,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/v1/auth/google/callback",
  },
};
