// Root layout — locale layouts inside [locale] handle the actual <html>/<body>.
// This passthrough is required by Next.js App Router.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
