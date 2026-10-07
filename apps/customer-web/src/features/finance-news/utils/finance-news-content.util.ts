const HTML_CONTENT_PATTERN = /<\/?[a-z][\s\S]*>/i;

const BULLET_LINE_PATTERN = /^(\u2022|[-*]|\d+\.)\s+/;

export function isFinanceNewsHtmlContent(content: string): boolean {
  return HTML_CONTENT_PATTERN.test(content.trim());
}

function isBulletLine(line: string): boolean {
  return BULLET_LINE_PATTERN.test(line.trim());
}

function normalizeBulletLine(line: string): string {
  return line.trim().replace(BULLET_LINE_PATTERN, "");
}

function isLikelySectionHeading(line: string): boolean {
  const trimmed = line.trim();

  if (!trimmed || trimmed.length > 90) {
    return false;
  }

  if (/[.!?]$/.test(trimmed)) {
    return false;
  }

  if (isBulletLine(trimmed)) {
    return false;
  }

  return true;
}

function isBlockquoteBlock(block: string): boolean {
  const trimmed = block.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("\u201c") && trimmed.endsWith("\u201d"))
  ) {
    return true;
  }

  const lines = trimmed.split("\n").map((line) => line.trim());
  return lines.length > 0 && lines.every((line) => line.startsWith(">"));
}

function stripBlockquoteMarkers(block: string): string {
  const trimmed = block.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("\u201c") && trimmed.endsWith("\u201d"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed
    .split("\n")
    .map((line) => line.replace(/^>\s?/, "").trim())
    .join(" ")
    .trim();
}

export type FinanceNewsContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "blockquote"; text: string };

export function parseFinanceNewsPlainContent(
  content: string,
): FinanceNewsContentBlock[] {
  const blocks = content
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const parsed: FinanceNewsContentBlock[] = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index]!;

    if (isBlockquoteBlock(block)) {
      parsed.push({
        type: "blockquote",
        text: stripBlockquoteMarkers(block),
      });
      continue;
    }

    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

    if (lines.length > 0 && lines.every(isBulletLine)) {
      parsed.push({
        type: "list",
        items: lines.map(normalizeBulletLine),
      });
      continue;
    }

    if (lines.length === 1) {
      const line = lines[0]!;
      const nextBlock = blocks[index + 1];
      const nextLines = nextBlock
        ?.split("\n")
        .map((entry) => entry.trim())
        .filter(Boolean);

      if (
        isLikelySectionHeading(line) &&
        nextLines &&
        nextLines.length > 0 &&
        nextLines.every(isBulletLine)
      ) {
        parsed.push({ type: "heading", text: line });
        continue;
      }

      parsed.push({ type: "paragraph", text: line });
      continue;
    }

    parsed.push({ type: "paragraph", text: lines.join("\n") });
  }

  return parsed;
}
