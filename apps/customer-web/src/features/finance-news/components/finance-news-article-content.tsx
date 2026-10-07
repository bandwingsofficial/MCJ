import { Quote } from "lucide-react";

import {
  isFinanceNewsHtmlContent,
  parseFinanceNewsPlainContent,
} from "@/src/features/finance-news/utils/finance-news-content.util";
import { cn } from "@/src/shared/lib/cn";

interface FinanceNewsArticleContentProps {
  content: string | null;
  className?: string;
}

export function FinanceNewsArticleContent({
  content,
  className,
}: FinanceNewsArticleContentProps) {
  if (!content?.trim()) {
    return (
      <p className="text-sm text-slate-500">
        Full article content is not available.
      </p>
    );
  }

  if (isFinanceNewsHtmlContent(content)) {
    return (
      <div
        className={cn(
          "finance-news-article-prose w-full max-w-none text-[15px] leading-[1.75] text-[#1E293B] sm:text-base sm:leading-[1.8]",
          "[&_a]:text-[#2563EB] [&_a]:underline-offset-2 hover:[&_a]:underline",
          "[&_blockquote]:my-6 [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-[#2563EB]/70 [&_blockquote]:bg-[#F1F5F9] [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-[#334155] [&_blockquote]:italic",
          "[&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[#0B1F3A]",
          "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0B1F3A]",
          "[&_img]:my-6 [&_img]:max-w-full [&_img]:rounded-lg",
          "[&_li]:text-[#334155] [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_p]:mb-4 [&_p:last-child]:mb-0",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  const blocks = parseFinanceNewsPlainContent(content);

  return (
    <div
      className={cn(
        "w-full max-w-none space-y-4 text-[15px] leading-[1.75] text-[#334155] sm:text-base sm:leading-[1.8]",
        className,
      )}
    >
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2
              key={`heading-${index}`}
              className="pt-2 text-xl font-bold tracking-tight text-[#0B1F3A]"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={`list-${index}`}
              className="my-1 list-disc space-y-1.5 pl-5 marker:text-[#2563EB]"
            >
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "blockquote") {
          return (
            <figure
              key={`quote-${index}`}
              className="relative my-6 rounded-r-lg border-l-4 border-[#2563EB]/70 bg-[#F1F5F9] px-4 py-3"
            >
              <Quote
                className="absolute left-3 top-3 h-4 w-4 text-[#2563EB]/40"
                aria-hidden
              />
              <blockquote className="pl-5 text-[15px] italic leading-relaxed text-[#334155]">
                {block.text}
              </blockquote>
            </figure>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="whitespace-pre-line">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
