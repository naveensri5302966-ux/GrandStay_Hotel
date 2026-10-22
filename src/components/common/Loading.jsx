export function Loading({ message = "Loading luxury experiences...", fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F8FBFF]/90 backdrop-blur-sm">
        <div className="h-12 w-12 animate-spin rounded-full border-3 border-[#B7E3FF] border-t-[#2F7FC1]" />
        <p className="mt-5 text-[10px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#B7E3FF] border-t-[#2F7FC1]" />
      <p className="mt-4 text-[10px] font-semibold tracking-[3px] uppercase text-[#2F7FC1]">
        {message}
      </p>
    </div>
  );
}

export default Loading;
