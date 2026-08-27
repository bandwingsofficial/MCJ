export function AdminFooter() {
  return (
    <footer className="shrink-0 border-t border-[#DCE8F5] bg-white px-8 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#102A56]">
          © 2026 MCJ Institute. All rights reserved.
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
