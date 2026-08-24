export function parseYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }

      const pathMatch = parsed.pathname.match(
        /^\/(embed|shorts|live|v)\/([^/?]+)/,
      );
      if (pathMatch?.[2]) {
        return pathMatch[2];
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeVideoId(url) !== null;
}

export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = parseYouTubeVideoId(url);
  if (!videoId) {
    return null;
  }

  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

export function isDirectVideoUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    const pathname = parsed.pathname.toLowerCase();
    return /\.(mp4|webm|mov|m4v|ogg)(\?.*)?$/i.test(pathname);
  } catch {
    return false;
  }
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
