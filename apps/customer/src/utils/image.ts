/**
 * Resolves an image path to a full URL based on the current environment's base URL.
 * Handles existing full URLs (http/https) and data URIs gracefully.
 *
 * @param path - The image path (e.g., "/assets/menu/curry.jpg")
 * @returns The fully qualified URL
 */
export function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }

  // Clean up path - remove leading slash if present to avoid double slashes
  // when combining with BASE_URL which might end with slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // import.meta.env.BASE_URL is provided by Vite
  // It defaults to '/' but in our case it's '/customer/' or '/admin/'
  const baseUrl = import.meta.env.BASE_URL;

  return `${baseUrl}${cleanPath}`;
}
