/**
 * Calculate ad rank score based on the formula:
 * rankScore = (featured ? 50 : 0) + (packageWeight * 10) + freshnessPoints + adminBoost + verifiedSellerPoints
 */
export function calculateRankScore(params: {
  isFeatured: boolean;
  packageWeight: number;
  freshnessPoints: number;
  adminBoost: number;
  isVerifiedSeller: boolean;
}): number {
  const { isFeatured, packageWeight, freshnessPoints, adminBoost, isVerifiedSeller } = params;

  return (
    (isFeatured ? 50 : 0) +
    packageWeight * 10 +
    freshnessPoints +
    adminBoost +
    (isVerifiedSeller ? 5 : 0)
  );
}

/**
 * Calculate freshness points based on last refresh time
 * Decays from 10 to 0 over 30 days
 */
export function calculateFreshnessPoints(lastRefreshedAt: Date): number {
  const now = new Date();
  const daysSinceRefresh = Math.floor(
    (now.getTime() - lastRefreshedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceRefresh <= 0) return 10;
  if (daysSinceRefresh >= 30) return 0;

  return Math.max(0, 10 - Math.floor(daysSinceRefresh / 3));
}
