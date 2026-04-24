export function Avatar({ src }: { src?: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
      {src ? (
        <img src={src} className="w-full h-full object-cover" />
      ) : null}
    </div>
  );
}