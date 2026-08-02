/**
 * Optimizes a Cloudinary image URL by injecting dynamic format (f_auto),
 * quality (q_auto), and size (w_xxx, c_limit) transformation parameters.
 * 
 * Example:
 * Input:  https://res.cloudinary.com/doznr2qm4/image/upload/v1781797812/pic.jpg
 * Output: https://res.cloudinary.com/doznr2qm4/image/upload/f_auto,q_auto,w_800,c_limit/v1781797812/pic.jpg
 */
export function getOptimizedImageUrl(url: string, width?: number): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  
  // Prevent double-optimization
  if (url.includes("f_auto") || url.includes("q_auto")) return url;

  const target = "image/upload/";
  const index = url.indexOf(target);
  if (index === -1) return url;

  const insertIndex = index + target.length;
  const prefix = url.substring(0, insertIndex);
  const suffix = url.substring(insertIndex);

  const transform = width 
    ? `f_auto,q_auto,w_${width},c_limit/` 
    : "f_auto,q_auto/";

  return `${prefix}${transform}${suffix}`;
}
