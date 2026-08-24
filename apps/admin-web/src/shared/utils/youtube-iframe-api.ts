declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string | HTMLElement,
        options: Record<string, unknown>,
      ) => YouTubePlayer;
      PlayerState: {
        UNSTARTED: -1;
        ENDED: 0;
        PLAYING: 1;
        PAUSED: 2;
        BUFFERING: 3;
        CUED: 5;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YouTubePlayer {
  getDuration: () => number;
  destroy: () => void;
}

let youtubeApiPromise: Promise<void> | null = null;

export function loadYouTubeIframeApi(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      resolve();
    };

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

export function getYouTubeVideoDuration(videoId: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let player: YouTubePlayer | null = null;
    let cancelled = false;
    const container = document.createElement("div");
    container.className = "hidden";
    container.setAttribute("aria-hidden", "true");
    document.body.appendChild(container);

    const cleanup = () => {
      cancelled = true;
      player?.destroy();
      container.remove();
    };

    void loadYouTubeIframeApi()
      .then(() => {
        if (cancelled || !window.YT?.Player) {
          cleanup();
          reject(new Error("YouTube player failed to initialize."));
          return;
        }

        player = new window.YT.Player(container, {
          videoId,
          height: "1",
          width: "1",
          playerVars: {
            playsinline: 1,
          },
          events: {
            onReady: (event: { target: YouTubePlayer }) => {
              const readDuration = (attempt = 0) => {
                if (cancelled) {
                  return;
                }

                const duration = event.target.getDuration();
                if (Number.isFinite(duration) && duration > 0) {
                  cleanup();
                  resolve(Math.floor(duration));
                  return;
                }

                if (attempt >= 12) {
                  cleanup();
                  reject(
                    new Error(
                      "Could not detect duration for this YouTube video.",
                    ),
                  );
                  return;
                }

                window.setTimeout(() => readDuration(attempt + 1), 250);
              };

              readDuration();
            },
            onError: () => {
              cleanup();
              reject(
                new Error(
                  "This YouTube video could not be loaded. Check the URL and try again.",
                ),
              );
            },
          },
        });
      })
      .catch(() => {
        cleanup();
        reject(new Error("YouTube player failed to initialize."));
      });
  });
}
