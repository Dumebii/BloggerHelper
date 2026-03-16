export default function SkeletonGrid() {
  return (
    <div className="space-y-12 animate-pulse">
      {/* X Skeleton */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-5 h-5 bg-slate-200 rounded" />
          <div className="h-6 w-32 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-slate-200 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 w-16 bg-slate-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                  <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                </div>
              </div>
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 rounded" />
              <div className="h-4 w-4/6 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-200 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </section>

      {/* LinkedIn Skeleton */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-5 h-5 bg-slate-200 rounded" />
          <div className="h-6 w-40 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-slate-200 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 w-16 bg-slate-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                  <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                </div>
              </div>
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 rounded" />
              <div className="h-4 w-4/6 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-200 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </section>

      {/* Discord Skeleton */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-5 h-5 bg-slate-200 rounded" />
          <div className="h-6 w-40 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-slate-200 p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-4 w-16 bg-slate-200 rounded" />
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                  <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                </div>
              </div>
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 rounded" />
              <div className="h-4 w-4/6 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-200 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}