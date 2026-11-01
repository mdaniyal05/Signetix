/** Helpers for grabbing downscaled JPEG frames from a <video> element. */

/** Draw the video frame to a canvas (downscaled) and return base64 JPEG, or null if not ready. */
export function captureJpegBase64(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  maxWidth: number,
  quality = 0.8,
): string | null {
  const { videoWidth, videoHeight } = video;
  if (video.readyState < 2 || videoWidth === 0 || videoHeight === 0) {
    return null;
  }

  const scale = Math.min(1, maxWidth / videoWidth);
  const width = Math.round(videoWidth * scale);
  const height = Math.round(videoHeight * scale);
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(video, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const commaIndex = dataUrl.indexOf(",");
  return commaIndex === -1 ? null : dataUrl.slice(commaIndex + 1);
}
