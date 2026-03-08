export default function Loading() {
  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full border-4 border-navy-600 border-t-orange-500 animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
