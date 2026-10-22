import { API_BASE_URL } from "@/constants/auth";
import { CACHE_STALE, fetchJsonCached, peekCachedJson } from "@/utils/fetchCache";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Tutorial videos attached to resource-center guides.
 *
 * The written guides ship in the bundle; only the video is remote. Everything
 * here is therefore built to fail quietly: if the request errors, times out,
 * or the reader is offline, the result is simply "no videos", and the guide
 * screens render exactly as they did before videos existed. A help screen
 * must never show a broken player or an error about content the reader did
 * not ask for.
 */

export type GuideVideo = {
  id: string;
  guide_slug: string;
  /** null means the video covers the whole guide; a number targets that step. */
  step_index: number | null;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  width: number | null;
  height: number | null;
};

const GUIDE_VIDEOS_URL = `${API_BASE_URL}/guides/videos`;

function isPlayableVideo(value: unknown): value is GuideVideo {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GuideVideo>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.guide_slug === "string" &&
    typeof candidate.video_url === "string" &&
    // An https URL is the one thing the player cannot recover from being
    // wrong, and both platforms block cleartext media anyway.
    candidate.video_url.startsWith("https://")
  );
}

function groupBySlug(videos: GuideVideo[]): Record<string, GuideVideo[]> {
  const grouped: Record<string, GuideVideo[]> = {};
  for (const video of videos) {
    (grouped[video.guide_slug] ??= []).push(video);
  }
  return grouped;
}

function readCachedVideos(): GuideVideo[] {
  const cached = peekCachedJson<unknown>(GUIDE_VIDEOS_URL);
  return Array.isArray(cached) ? cached.filter(isPlayableVideo) : [];
}

export function useGuideVideos() {
  // Seeding from cache means navigating index → guide → back does not blank
  // the video section while a refetch is in flight.
  const [videos, setVideos] = useState<GuideVideo[]>(readCachedVideos);
  const [isLoading, setIsLoading] = useState(() => readCachedVideos().length === 0);

  // Returns the videos rather than setting state, so the effect below owns
  // the one write and can skip it if the screen has already gone away.
  const fetchVideos = useCallback(async (): Promise<GuideVideo[]> => {
    try {
      const payload = await fetchJsonCached<unknown>(GUIDE_VIDEOS_URL, {
        staleTimeMs: CACHE_STALE.guideVideos,
      });
      return Array.isArray(payload) ? payload.filter(isPlayableVideo) : [];
    } catch {
      // Deliberately silent: no video is a valid, common state.
      return [];
    }
  }, []);

  useEffect(() => {
    let active = true;

    void fetchVideos().then((next) => {
      if (!active) {
        return;
      }
      setVideos(next);
      setIsLoading(false);
    });

    return () => {
      active = false;
    };
  }, [fetchVideos]);

  const videosBySlug = useMemo(() => groupBySlug(videos), [videos]);

  const slugsWithVideo = useMemo(
    () => new Set(Object.keys(videosBySlug)),
    [videosBySlug],
  );

  const getGuideVideos = useCallback(
    (slug: string) => videosBySlug[slug] ?? [],
    [videosBySlug],
  );

  return { videos, videosBySlug, slugsWithVideo, getGuideVideos, isLoading };
}

/** Videos that introduce the whole guide, shown above its first step. */
export function selectOverviewVideos(videos: GuideVideo[]): GuideVideo[] {
  return videos.filter((video) => video.step_index === null);
}

/** Videos pinned to one step, shown inline beneath it. */
export function selectStepVideos(videos: GuideVideo[], stepIndex: number): GuideVideo[] {
  return videos.filter((video) => video.step_index === stepIndex);
}

export function formatVideoDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = Math.round(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}
