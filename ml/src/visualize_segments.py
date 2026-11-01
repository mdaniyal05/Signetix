"""Sanity-check clip segmentation: print segment counts/durations, optionally plot timelines."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path
from statistics import mean

sys.path.append(str(Path(__file__).resolve().parent.parent))

import config  # noqa: E402
from src.landmark_extractor import HandLandmarkExtractor  # noqa: E402
from src.segmentation import Segment, segment_frames  # noqa: E402


def _sample_clips(word: str | None, per_word: int) -> list[tuple[str, Path]]:
    words = [word] if word else config.WORDS
    clips: list[tuple[str, Path]] = []

    for current in words:
        word_dir = config.DATASET_DIR / current

        if not word_dir.is_dir():
            print(f"  (skipping missing word folder: {current})")

            continue

        videos = sorted(word_dir.glob("*.mp4"))[:per_word]
        clips.extend((current, video) for video in videos)

    return clips


def _plot_timeline(
    word: str, video: Path, frames, segments: list[Segment], output_dir: Path
) -> None:
    import matplotlib

    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    times = [frame.timestamp_sec for frame in frames]
    active = [1 if frame.has_hand else 0 for frame in frames]

    fig, axis = plt.subplots(figsize=(12, 2.5))
    axis.fill_between(times, active, step="pre",
                      color="#2e7d32", alpha=0.35, label="hand present")

    for i, segment in enumerate(segments):
        axis.axvspan(
            segment.start_time, segment.end_time, color="#1565c0", alpha=0.25,
            label="segment" if i == 0 else None,
        )

    axis.set_title(f"{word} — {video.name} — {len(segments)} segments")
    axis.set_xlabel("time (s)")
    axis.set_yticks([0, 1])
    axis.set_yticklabels(["rest", "hand"])
    axis.legend(loc="upper right", fontsize=8)
    fig.tight_layout()

    output_dir.mkdir(parents=True, exist_ok=True)
    out_path = output_dir / f"{word}__{video.stem}.png"
    fig.savefig(out_path, dpi=90)
    plt.close(fig)
    print(f"    saved plot: {out_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Visualize clip segmentation.")
    parser.add_argument(
        "--word", help="restrict to a single word (folder name)")
    parser.add_argument("--per-word", type=int, default=2,
                        help="clips per word (default 2)")
    parser.add_argument("--plot", action="store_true",
                        help="save timeline PNGs")
    args = parser.parse_args()

    clips = _sample_clips(args.word, args.per_word)

    if not clips:
        print("No clips found.")

        return

    plot_dir = config.PROJECT_DIR / "segmentation_plots"
    per_clip_counts: list[int] = []
    all_durations: list[float] = []

    with HandLandmarkExtractor() as extractor:
        for word, video in clips:
            frames = list(extractor.extract_from_video(video))
            segments = segment_frames(frames)
            per_clip_counts.append(len(segments))
            all_durations.extend(segment.duration for segment in segments)

            durations = ", ".join(f"{s.duration:.1f}s" for s in segments)
            hands_present = sum(
                frame.has_hand for frame in frames) / max(len(frames), 1)

            print(
                f"[{word:<18}] {video.name:<32} "
                f"frames={len(frames):>3} hand={hands_present:>4.0%} "
                f"segments={len(segments):>2}  [{durations}]"
            )

            if args.plot:
                _plot_timeline(word, video, frames, segments, plot_dir)

    print("\n--- summary ---")
    print(f"clips processed      : {len(clips)}")
    print(f"total segments       : {sum(per_clip_counts)}")
    print(
        f"avg segments / clip  : {mean(per_clip_counts):.1f}" if per_clip_counts else "n/a")

    if all_durations:
        print(f"segment duration     : min={min(all_durations):.1f}s "
              f"mean={mean(all_durations):.1f}s max={max(all_durations):.1f}s")


if __name__ == "__main__":
    main()
