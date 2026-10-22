import Fonts from "@/constants/Fonts";
import { useTheme } from "@/context/ThemeContext";
import { formatVideoDuration, type GuideVideo } from "@/hooks/useGuideVideos";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

/**
 * One tutorial video inside a guide.
 *
 * Playback starts behind a poster rather than on mount: `useVideoPlayer` is a
 * hook and cannot be called conditionally, so the player is always created,
 * but nothing streams until the reader actually taps play. On a metered
 * connection that is the difference between opening a help page and paying
 * for a video you never watched.
 *
 * Callers decide whether a video exists at all — this component is only
 * rendered when there is something to show, which is what keeps a guide with
 * no video free of any empty player or "coming soon" placeholder.
 */

const DEFAULT_ASPECT_RATIO = 16 / 9;

export default function GuideVideoCard({ video }: { video: GuideVideo }) {
  const { colors } = useTheme();
  const [hasStarted, setHasStarted] = useState(false);

  const player = useVideoPlayer(video.video_url, (instance) => {
    instance.loop = false;
  });

  const aspectRatio =
    video.width && video.height && video.width > 0 && video.height > 0
      ? video.width / video.height
      : DEFAULT_ASPECT_RATIO;

  const duration = formatVideoDuration(video.duration_seconds);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: {
          borderRadius: rMS(18),
          overflow: "hidden",
          backgroundColor: colors.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.cardBorder,
        },
        stage: {
          width: "100%",
          aspectRatio,
          backgroundColor: colors.inverseSurface,
        },
        video: {
          width: "100%",
          height: "100%",
        },
        poster: {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          alignItems: "center",
          justifyContent: "center",
        },
        posterImage: {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
        posterScrim: {
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: "rgba(15, 23, 42, 0.35)",
        },
        playButton: {
          width: rMS(58),
          height: rMS(58),
          borderRadius: rMS(29),
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.92)",
        },
        durationBadge: {
          position: "absolute",
          right: rS(10),
          bottom: rV(10),
          paddingHorizontal: rS(8),
          paddingVertical: rV(4),
          borderRadius: rMS(8),
          backgroundColor: "rgba(15, 23, 42, 0.78)",
        },
        durationText: {
          fontFamily: Fonts.titleBold,
          fontSize: rMS(10.5),
          color: "#FFFFFF",
        },
        copy: {
          paddingHorizontal: rS(14),
          paddingVertical: rV(12),
        },
        titleRow: {
          flexDirection: "row",
          alignItems: "center",
          gap: rS(7),
        },
        title: {
          flex: 1,
          fontFamily: Fonts.titleBold,
          fontSize: rMS(13.5),
          lineHeight: rMS(19),
          color: colors.text,
        },
        description: {
          marginTop: rV(4),
          fontFamily: Fonts.text,
          fontSize: rMS(12),
          lineHeight: rMS(18),
          color: colors.textMuted,
        },
      }),
    [aspectRatio, colors],
  );

  const startPlayback = () => {
    setHasStarted(true);
    player.play();
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.stage}>
        <VideoView
          style={styles.video}
          player={player}
          contentFit="contain"
          nativeControls={hasStarted}
          fullscreenOptions={{ enable: true }}
        />

        {!hasStarted ? (
          <Pressable
            style={styles.poster}
            onPress={startPlayback}
            accessibilityRole="button"
            accessibilityLabel={`Play video: ${video.title}`}
          >
            {video.thumbnail_url ? (
              <>
                <Image
                  source={{ uri: video.thumbnail_url }}
                  style={styles.posterImage}
                  contentFit="cover"
                  transition={160}
                />
                <View style={styles.posterScrim} />
              </>
            ) : null}

            <View style={styles.playButton}>
              <Ionicons
                name="play"
                size={rMS(26)}
                color={colors.inverseSurface}
                style={{ marginLeft: rS(3) }}
              />
            </View>

            {duration ? (
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>{duration}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Ionicons name="videocam-outline" size={rMS(15)} color={colors.primary} />
          <Text style={styles.title}>{video.title}</Text>
        </View>
        {video.description ? (
          <Text style={styles.description}>{video.description}</Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Renders a list of videos, or nothing at all when the list is empty — the
 * single place that guarantees an absent video leaves no trace in the UI.
 */
export function GuideVideoList({
  videos,
  label,
}: {
  videos: GuideVideo[];
  label?: string;
}) {
  const { colors } = useTheme();

  if (videos.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: rV(10) }}>
      {label ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: rS(7) }}>
          <Ionicons name="play-circle-outline" size={rMS(15)} color={colors.primary} />
          <Text
            style={{
              fontFamily: Fonts.titleBold,
              fontSize: rMS(11.5),
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: colors.textMuted,
            }}
          >
            {label}
          </Text>
        </View>
      ) : null}

      {videos.map((video) => (
        <GuideVideoCard key={video.id} video={video} />
      ))}
    </View>
  );
}
