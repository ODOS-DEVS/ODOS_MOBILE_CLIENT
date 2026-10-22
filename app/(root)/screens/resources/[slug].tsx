import { FaqStillNeedHelp } from "@/components/help/FaqUi";
import {
  GuideCard,
  GuideDetailHero,
  GuideNoteCard,
  GuideReadToggle,
  GuideSectionHeader,
  GuideStepRow,
} from "@/components/help/GuideUi";
import { GuideVideoList } from "@/components/help/GuideVideoCard";
import { AccountEmptyState, AccountListCard, useAccountStyles } from "@/components/profile/ProfileHubUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { getGuide, GUIDES_BY_SLUG } from "@/constants/resourceGuides";
import {
  selectOverviewVideos,
  selectStepVideos,
  useGuideVideos,
} from "@/hooks/useGuideVideos";
import { useGuideProgress } from "@/utils/guideProgress";
import { rV } from "@/styles/responsive";
import { router, useLocalSearchParams, type Href } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { ScrollView, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";

const RESOURCES_HREF = "/(root)/screens/profileScreens/helpAndSupport/Resources" as Href;

/** Within this many points of the end counts as having reached the bottom. */
const BOTTOM_THRESHOLD = 48;

export default function GuideDetailScreen() {
  const accountStyles = useAccountStyles();
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const guide = useMemo(() => getGuide(slug), [slug]);
  const { isRead, setRead } = useGuideProgress();
  const { getGuideVideos } = useGuideVideos();

  // Reaching the end is the honest signal that a guide was read, so the
  // checkmark appears without anyone having to remember to tap anything. The
  // ref keeps a long scroll from re-writing the same value on every frame.
  const autoMarkedRef = useRef(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  const markReadOnce = useCallback(() => {
    if (autoMarkedRef.current || !guide) {
      return;
    }
    autoMarkedRef.current = true;
    setRead(guide.slug, true);
  }, [guide, setRead]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
      const reachedEnd =
        contentOffset.y + layoutMeasurement.height >= contentSize.height - BOTTOM_THRESHOLD;

      if (reachedEnd) {
        markReadOnce();
      }
    },
    [markReadOnce],
  );

  // A guide short enough to fit on screen never fires a scroll event, so it
  // would otherwise be the one guide you could never finish.
  const handleContentSizeChange = useCallback(
    (_width: number, height: number) => {
      if (viewportHeight > 0 && height <= viewportHeight + BOTTOM_THRESHOLD) {
        markReadOnce();
      }
    },
    [markReadOnce, viewportHeight],
  );

  if (!guide) {
    return (
      <View style={accountStyles.screen}>
        <ProfileHeader title="Guide" fallbackHref={RESOURCES_HREF} />
        <View style={accountStyles.content}>
          <AccountEmptyState
            icon="book-outline"
            title="We couldn't find that guide"
            message="It may have been renamed or removed. Browse the guide center to find what you need."
            actionLabel="Open guide center"
            onAction={() => router.replace(RESOURCES_HREF)}
          />
        </View>
      </View>
    );
  }

  const related = guide.related
    .map((relatedSlug) => GUIDES_BY_SLUG[relatedSlug])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const guideIsRead = isRead(guide.slug);
  const guideVideos = getGuideVideos(guide.slug);
  const overviewVideos = selectOverviewVideos(guideVideos);

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Guide" fallbackHref={RESOURCES_HREF} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={accountStyles.content}
        onScroll={handleScroll}
        scrollEventThrottle={64}
        onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        onContentSizeChange={handleContentSizeChange}
      >
        <GuideDetailHero guide={guide} isRead={guideIsRead} />

        <GuideVideoList videos={overviewVideos} label="Watch the walkthrough" />

        <AccountListCard>
          {guide.steps.map((step, index) => (
            <GuideStepRow
              key={step.title}
              step={step}
              index={index}
              isLast={index === guide.steps.length - 1}
              videos={selectStepVideos(guideVideos, index)}
            />
          ))}
        </AccountListCard>

        {guide.notes?.length ? (
          <AccountListCard>
            {guide.notes.map((note) => (
              <GuideNoteCard key={note.title} note={note} />
            ))}
          </AccountListCard>
        ) : null}

        <GuideReadToggle
          isRead={guideIsRead}
          onToggle={() => setRead(guide.slug, !guideIsRead)}
        />

        {related.length > 0 ? (
          <View>
            <GuideSectionHeader title="Read next" icon="arrow-forward-circle-outline" />
            <View style={{ gap: rV(10) }}>
              {related.map((entry) => (
                <GuideCard
                  key={entry.slug}
                  guide={entry}
                  isRead={isRead(entry.slug)}
                  onPress={() =>
                    router.push(`/(root)/screens/resources/${entry.slug}` as Href)
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        <FaqStillNeedHelp />
      </ScrollView>
    </View>
  );
}
