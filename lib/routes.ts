// Paths anyone can reach without a session. Every other path needs one.
const PUBLIC_PAGES = ["/", "/how-it-works"];
const PUBLIC_PREFIXES = ["/auth"];

export function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PAGES.includes(pathname) ||
    // A prefix matches a whole path segment, so /auth/login is public and /authority isn't.
    PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
  );
}
