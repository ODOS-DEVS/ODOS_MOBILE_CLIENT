import {
  FaqSearchBar,
  FaqStillNeedHelp,
  HelpCategoryChips,
  filterFaqItems,
} from "@/components/help/FaqUi";
import {
  GuideCard,
  GuideEmptyState,
  GuideFaqResult,
  GuideProgressHero,
  GuideSectionHeader,
  GuideVideoFilterToggle,
} from "@/components/help/GuideUi";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAccountStyles } from "@/components/profile/ProfileHubUi";
import { FAQ_ITEMS } from "@/constants/faqContent";
import {
  GUIDE_CATEGORIES,
  RESOURCE_GUIDES,
  STARTER_GUIDES,
  buildGuideCounts,
  filterGuides,
  groupGuidesByCategory,
  type GuideCategory,
} from "@/constants/resourceGuides";
import { rV } from "@/styles/responsive";
import { useGuideVideos } from "@/hooks/useGuideVideos";
import { useGuideProgress } from "@/utils/guideProgress";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

/** FAQ hits are a supporting answer here, not the main event — keep them few. */
const MAX_FAQ_MATCHES = 4;

const CATEGORY_ICONS = GUIDE_CATEGORIES.reduce(
  (map, entry) => {
    map[entry.key] = entry.icon;
    return map;
  },
  {} as Record<string, keyof typeof Ionicons.glyphMap>,
);

function openGuide(slug: string) {
  router.push(`/(root)/screens/resources/${slug}` as Href);
}

export default function ResourcesScreen() {
  const accountStyles = useAccountStyles();
  const { isRead, readCount } = useGuideProgress();
  const { slugsWithVideo } = useGuideVideos();
  const [selectedCategory, setSelectedCategory] = useState<GuideCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [videosOnly, setVideosOnly] = useState(false);

  const trimmedQuery = query.trim();
  const isSearching = trimmedQuery.length > 0;
  const isBrowsingAll = selectedCategory === "All" && !isSearching && !videosOnly;

  const counts = useMemo(() => buildGuideCounts(RESOURCE_GUIDES), []);

  const filtered = useMemo(() => {
    const matches = filterGuides(RESOURCE_GUIDES, selectedCategory, query);
    return videosOnly ? matches.filter((guide) => slugsWithVideo.has(guide.slug)) : matches;
  }, [query, selectedCategory, slugsWithVideo, videosOnly]);

  const grouped = useMemo(
    () => (isBrowsingAll ? groupGuidesByCategory(filtered) : null),
    [filtered, isBrowsingAll],
  );

  // Searching the guides alone would strand anyone whose question has a
  // one-line answer on the FAQ screen, so both are searched from this one box.
  const faqMatches = useMemo(
    () => (isSearching ? filterFaqItems(FAQ_ITEMS, "All", query).slice(0, MAX_FAQ_MATCHES) : []),
    [isSearching, query],
  );

  // Point people at the next thing worth reading: finish the starter path
  // first, then whatever else is still unread.
  const resumeGuide = useMemo(() => {
    const nextStarter = STARTER_GUIDES.find((guide) => !isRead(guide.slug));
    return nextStarter ?? RESOURCE_GUIDES.find((guide) => !isRead(guide.slug)) ?? null;
  }, [isRead]);

  const clearSearch = () => {
    setQuery("");
    setSelectedCategory("All");
    setVideosOnly(false);
  };

  const hasResults = filtered.length > 0 || faqMatches.length > 0;

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Resources" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={accountStyles.content}>
        <GuideProgressHero
          total={RESOURCE_GUIDES.length}
          readCount={readCount}
          onResume={resumeGuide ? () => openGuide(resumeGuide.slug) : undefined}
          resumeLabel={
            resumeGuide
              ? readCount === 0
                ? `Start with “${resumeGuide.title}”`
                : `Continue: ${resumeGuide.title}`
              : undefined
          }
        />

        <View style={{ marginTop: rV(14), gap: rV(12) }}>
          <FaqSearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search guides, e.g. refund, momo, tracking…"
          />
          <HelpCategoryChips
            categories={GUIDE_CATEGORIES}
            activeKey={selectedCategory}
            onChange={setSelectedCategory}
            counts={counts}
          />
          {slugsWithVideo.size > 0 ? (
            <GuideVideoFilterToggle
              active={videosOnly}
              count={slugsWithVideo.size}
              onToggle={() => setVideosOnly((current) => !current)}
            />
          ) : null}
        </View>

        {isBrowsingAll && STARTER_GUIDES.length > 0 ? (
          <View>
            <GuideSectionHeader title="New to ODOS? Read these first" icon="sparkles-outline" />
            <View style={{ gap: rV(10) }}>
              {STARTER_GUIDES.map((guide, index) => (
                <GuideCard
                  key={guide.slug}
                  guide={guide}
                  isRead={isRead(guide.slug)}
                  hasVideo={slugsWithVideo.has(guide.slug)}
                  stepIndex={index + 1}
                  onPress={() => openGuide(guide.slug)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {!hasResults ? (
          <GuideEmptyState query={trimmedQuery} onClear={clearSearch} />
        ) : grouped ? (
          grouped.map((section) => (
            <View key={section.category}>
              <GuideSectionHeader
                title={section.category}
                icon={CATEGORY_ICONS[section.category] ?? "folder-outline"}
              />
              <View style={{ gap: rV(10) }}>
                {section.items.map((guide) => (
                  <GuideCard
                    key={guide.slug}
                    guide={guide}
                    isRead={isRead(guide.slug)}
                    hasVideo={slugsWithVideo.has(guide.slug)}
                    onPress={() => openGuide(guide.slug)}
                  />
                ))}
              </View>
            </View>
          ))
        ) : (
          <View>
            {filtered.length > 0 ? (
              <>
                <GuideSectionHeader
                  title={`${filtered.length} ${filtered.length === 1 ? "guide" : "guides"}`}
                  icon="book-outline"
                />
                <View style={{ gap: rV(10) }}>
                  {filtered.map((guide) => (
                    <GuideCard
                      key={guide.slug}
                      guide={guide}
                      isRead={isRead(guide.slug)}
                      hasVideo={slugsWithVideo.has(guide.slug)}
                      onPress={() => openGuide(guide.slug)}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </View>
        )}

        {faqMatches.length > 0 ? (
          <View>
            <GuideSectionHeader title="Quick answers" icon="help-circle-outline" />
            <View style={{ gap: rV(10) }}>
              {faqMatches.map((item) => (
                <GuideFaqResult
                  key={item.id}
                  item={item}
                  onPress={() =>
                    router.push({
                      pathname: "/(root)/screens/profileScreens/helpAndSupport/FAQ",
                      params: { q: item.title },
                    } as never)
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
