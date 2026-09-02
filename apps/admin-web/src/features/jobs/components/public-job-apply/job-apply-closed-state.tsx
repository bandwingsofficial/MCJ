interface JobApplyClosedStateProps {
  title: string;
  description: string;
}

export function JobApplyClosedState({
  title,
  description,
}: JobApplyClosedStateProps) {
  return (
    <section className="rounded-2xl border border-[#DCE8F5] bg-white p-6 text-center shadow-[0_8px_24px_rgba(16,42,86,0.06)] sm:p-8">
      <h2 className="text-xl font-semibold text-[#102A56]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#647A9B]">
        {description}
      </p>
    </section>
  );
}
