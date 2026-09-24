export function AdminFooter() {
  return (
    <footer className="box-border w-full min-w-0 shrink-0 border-t border-[#DCE8F5] bg-white px-8 py-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#102A56]">
          © 2026 MCJ Academy. All rights reserved.
        </p>

        <nav className="flex items-center gap-5 text-sm">
          <a
            href="#privacy"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            Privacy Policy
          </a>
          <a
            href="#terms"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            Terms & Conditions
          </a>
        </nav>
      </div>
    </footer>
  );
}
