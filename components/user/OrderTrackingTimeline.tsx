import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export interface TrackingEvent {
  id: string;
  status: string;
  label: string;
  description?: string;
  timestamp: string;
  location?: string;
}

interface Props {
  events: TrackingEvent[];
  currentStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
}

export function OrderTrackingTimeline({ events, currentStatus }: Props) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingVertical: 16,
          paddingHorizontal: 16,
        },
        timelineContainer: {
          gap: 0,
        },
        eventItem: {
          flexDirection: 'row',
          marginBottom: 20,
        },
        timelineTrack: {
          width: 2,
          backgroundColor: colors.border,
          marginRight: 12,
          marginTop: 8,
        },
        timelineTrackActive: {
          backgroundColor: colors.primary,
        },
        eventDot: {
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: colors.border,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 0,
          borderWidth: 2,
          borderColor: colors.card,
          marginLeft: -11,
        },
        eventDotActive: {
          backgroundColor: colors.primary,
          borderColor: colors.card,
        },
        eventContent: {
          flex: 1,
          paddingLeft: 12,
          paddingTop: 2,
        },
        eventTime: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 2,
        },
        eventLabel: {
          fontSize: 13,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 4,
        },
        eventDescription: {
          fontSize: 12,
          color: colors.textMuted,
          marginBottom: 2,
          lineHeight: 16,
        },
        eventLocation: {
          fontSize: 11,
          color: colors.textMuted,
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 4,
        },
        locationIcon: {
          marginRight: 4,
        },
        cancelledEvent: {
          opacity: 0.6,
        },
      }),
    [colors]
  );

  const getEventIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return 'cog';
      case 'shipped':
        return 'send';
      case 'in_transit':
        return 'airplane';
      case 'out_for_delivery':
        return 'navigate';
      case 'delivered':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'checkmark';
    }
  };

  const isEventActive = (eventStatus: string) => {
    const statusOrder = ['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const eventIndex = statusOrder.indexOf(eventStatus);
    return eventIndex <= currentIndex && currentStatus !== 'cancelled';
  };

  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        {events.map((event, index) => {
          const isActive = isEventActive(event.status);
          const isLast = index === events.length - 1;

          return (
            <View
              key={event.id}
              style={[
                styles.eventItem,
                currentStatus === 'cancelled' && styles.cancelledEvent,
              ]}
            >
              {/* Timeline Track */}
              {!isLast && (
                <View
                  style={[
                    styles.timelineTrack,
                    isActive && styles.timelineTrackActive,
                  ]}
                />
              )}

              {/* Event Dot */}
              <View
                style={[
                  styles.eventDot,
                  isActive && styles.eventDotActive,
                ]}
              >
                <Ionicons
                  name={getEventIcon(event.status) as any}
                  size={12}
                  color={isActive ? '#fff' : colors.textMuted}
                />
              </View>

              {/* Event Content */}
              <View style={styles.eventContent}>
                <Text style={styles.eventTime}>
                  {new Date(event.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={styles.eventLabel}>{event.label}</Text>

                {event.description && (
                  <Text style={styles.eventDescription}>
                    {event.description}
                  </Text>
                )}

                {event.location && (
                  <View style={styles.eventLocation}>
                    <Ionicons
                      name="location-sharp"
                      size={11}
                      color={colors.textMuted}
                      style={styles.locationIcon}
                    />
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      {event.location}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
