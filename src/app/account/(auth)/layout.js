// Route group layout for /account/login, /account/register, etc.
// This layout renders NOTHING extra — the auth pages render their own Header/Footer.
// By placing auth pages inside (auth)/, they bypass the /account/layout.js dashboard shell.
export default function AuthGroupLayout({ children }) {
  return children;
}
