import CommerceImage from "@/components/media/CommerceImage";
import { resolveApiMediaUrl } from "@/utils/media";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { useUpcomingFlashSaleEvents } from "@/hooks/useFlashSaleEvents";
import {
  fetchMyFlashReminders,
  setFlashReminder,
  unsetFlashReminder,
} from "@/services/flashReminderService";
import Fonts from "@/constants/Fonts";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

function startsLabel(iso?: string | null): string {
  if (!iso) {
    return "Soon";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Soon";
  }
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Scheduled flash sales with a notify-me toggle per event.
 *
 * Renders nothing when nothing is scheduled — an empty "coming up" shelf is
 * noise, not information. Toggles are optimistic and roll back on failure so
 * the button never feels like a network request.
 */
export default function UpcomingFlashRail() {
  const { colors } = useTheme();
  const { showToast } = useToast();
  const { events } = useUpcomingFlashSaleEvents();
  const [reminded, setReminded] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchMyFlashReminders().then((ids) => {
      if (!cancelled) {
        setReminded(new Set(ids));
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(
    async (eventId: string) => {
      const next = !reminded.has(eventId);
      setBusyId(eventId);
      setReminded((prev) => {
        const copy = new Set(prev);
        if (next) {
          copy.add(eventId);
        } else {
          copy.delete(eventId);
        }
        return copy;
      });
      try {
        if (next) {
          await setFlashReminder(eventId);
          showToast("We'll remind you just before it starts.", "success");
        } else {
          await unsetFlashReminder(eventId);
          showToast("Reminder removed.", "info");
        }
      } catch (error) {
        // Roll the optimistic flip back — the server said no.
        setReminded((prev) => {
          const copy = new Set(prev);
          if (next) {
            copy.delete(eventId);
          } else {
            copy.add(eventId);
          }
          return copy;
        });
        showToast(error instanceof Error ? error.message : "We couldn't update that reminder.", "error");
      } finally {
        setBusyId(null);
      }
    },
    [reminded, showToast],
  );

  if (events.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <View style={[styles.headingIcon, { backgroundColor: colors.primary + "1A" }]}>
          <Ionicons name="calendar-outline" size={rMS(15)} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headingTitle, { color: colors.text }]}>Coming up</Text>
          <Text style={[styles.headingSubtitle, { color: colors.textMuted }]}>
            Ask to be told the moment these start
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {events.map((event) => {
          const isOn = reminded.has(event.id);
          const isBusy = busyId === event.id;
          return (
            <View
              key={event.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <CommerceImage
                source={{ uri: resolveApiMediaUrl(event.imageUrl) ?? event.imageUrl ?? undefined }}
                style={styles.cardImage}
                contentFit="cover"
                participateInReadyGate={false}
              />
              <View style={styles.cardBody}>
                <Text numberOfLines={1} style={[styles.cardTitle, { color: colors.text }]}>
                  {event.title}
                </Text>
                <Text numberOfLines={1} style={[styles.cardMeta, { color: colors.textMuted }]}>
                  Starts {startsLabel(event.startsAt)}
                  {event.productCount > 0
                    ? ` · ${event.productCount} deal${event.productCount === 1 ? "" : "s"}`
                    : ""}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  disabled={isBusy}
                  onPress={() => void toggle(event.id)}
                  style={[
                    styles.notifyButton,
                    isOn
                      ? { backgroundColor: colors.primary + "1A", borderColor: colors.primary }
                      : { backgroundColor: "transparent", borderColor: colors.border },
                    isBusy && { opacity: 0.6 },
                  ]}
                >
                  <Ionicons
                    name={isOn ? "notifications" : "notifications-outline"}
                    size={rMS(14)}
                    color={isOn ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.notifyLabel,
                      { color: isOn ? colors.primary : colors.text },
                    ]}
                  >
                    {isOn ? "We'll remind you" : "Notify me"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: rV(10),
  },
  heading: {
    flexDirection: "row",
    alignItems: "center",
    gap: rS(10),
  },
  headingIcon: {
    width: rMS(30),
    height: rMS(30),
    borderRadius: rMS(15),
    alignItems: "center",
    justifyContent: "center",
  },
  headingTitle: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(15),
  },
  headingSubtitle: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
    marginTop: rV(1),
  },
  rail: {
    gap: rS(12),
    paddingRight: rS(4),
  },
  card: {
    width: rS(230),
    borderRadius: rMS(16),
    borderWidth: 1,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: rV(96),
  },
  cardBody: {
    padding: rS(12),
    gap: rV(4),
  },
  cardTitle: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(13.5),
  },
  cardMeta: {
    fontFamily: Fonts.text,
    fontSize: rMS(11.5),
  },
  notifyButton: {
    marginTop: rV(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rS(6),
    borderWidth: 1,
    borderRadius: rMS(999),
    paddingVertical: rV(8),
  },
  notifyLabel: {
    fontFamily: Fonts.textBold,
    fontSize: rMS(12.5),
  },
});
