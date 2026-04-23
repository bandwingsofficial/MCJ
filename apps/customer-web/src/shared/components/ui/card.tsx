export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="border rounded-xl p-4 hover:shadow-md transition">
      {children}
    </div>
  );
}