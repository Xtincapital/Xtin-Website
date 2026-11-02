/** Full-page "Loading…" spinner, the same one ProtectedPageRoute shows while auth is checked. */
const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

export default PageSpinner;
