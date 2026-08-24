export function getVideoDurationFromFile(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (Number.isFinite(duration) && duration > 0) {
        resolve(Math.floor(duration));
        return;
      }
      reject(new Error("Could not detect video duration from the uploaded file."));
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Could not load the uploaded video file."));
    };

    video.src = objectUrl;
  });
}

export function getVideoDurationFromUrl(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      if (Number.isFinite(duration) && duration > 0) {
        resolve(Math.floor(duration));
        return;
      }
      reject(new Error("Could not detect video duration from this URL."));
    };

    video.onerror = () => {
      cleanup();
      reject(
        new Error(
          "This video URL could not be loaded. Check the URL or upload the file instead.",
        ),
      );
    };

    video.src = url;
  });
}
