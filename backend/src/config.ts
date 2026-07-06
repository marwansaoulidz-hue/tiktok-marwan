export const config = {
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  maxUploadSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '100', 10),
  maxVideosPerUser: parseInt(process.env.MAX_VIDEOS_PER_USER || '50', 10),
  maxVideoDurationSec: parseInt(process.env.MAX_VIDEO_DURATION_SEC || '45', 10),
  videoStorageLimitGb: parseInt(process.env.VIDEO_STORAGE_LIMIT_GB || '150', 10),
  giphyApiKey: process.env.GIPHY_API_KEY || '',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@localhost',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
};

export function videoStorageLimitBytes() {
  return BigInt(config.videoStorageLimitGb) * BigInt(1024 ** 3);
}
