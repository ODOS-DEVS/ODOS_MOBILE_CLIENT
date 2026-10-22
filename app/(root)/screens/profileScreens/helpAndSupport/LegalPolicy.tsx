import ProfileHeader from "@/components/profile/ProfileHeader";
import {
  AccountBulletList,
  AccountInsightCard,
  AccountLinkRow,
  AccountListCard,
  AccountMetaFooter,
  AccountSegmentedTabs,
  AccountTipBanner,
  useAccountStyles,
} from "@/components/profile/ProfileHubUi";
import Fonts from "@/constants/Fonts";
import {
  DATA_CONTROLS,
  DELETION_NOTE,
  LEGAL_EMAIL,
  POLICY_DOCS,
  POLICY_LAST_UPDATED,
  type PolicyDoc,
  type PolicySection,
} from "@/constants/legal";
import type { ThemeColors } from "@/constants/theme";
import { useTheme } from "@/context/ThemeContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { rMS, rS, rV } from "@/styles/responsive";
import { Ionicons } from "@expo/vector-icons";
import { router, type Href } from "expo-router";
import React, { useMemo, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

/**
 * In-app Terms, Privacy and the data controls that go with them.
 *
 * The hosted pages at `/terms` and `/privacy` are authoritative — the App
 * Store listing points at them and a reviewer will open both. This screen is a
 * faithful mirror sourced from `constants/legal.ts`, and every document links
 * out to its canonical version so the two can be checked against each other.
 */

type TabKey = PolicyDoc["key"] | "data";

const TABS: { key: TabKey; label: string }[] = [
  ...POLICY_DOCS.map((doc) => ({ key: doc.key as TabKey, label: doc.tabLabel })),
  { key: "data", label: "Your data" },
];

function PolicySectionBlock({
  section,
  isLast,
}: {
  section: PolicySection;
  isLast: boolean;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={isLast ? undefined : styles.sectionSpacing}>
      <Text style={styles.sectionHeading}>{section.heading}</Text>
      {section.body?.map((paragraph) => (
        <Text key={paragraph} style={styles.paragraph}>
          {paragraph}
        </Text>
      ))}
      {section.points ? (
        <View style={styles.bulletWrap}>
          <AccountBulletList points={section.points} />
        </View>
      ) : null}
    </View>
  );
}

export default function LegalPoliciesScreen() {
  const accountStyles = useAccountStyles();
  const { colors } = useTheme();
  const { requireAuth } = useRequireAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeTab, setActiveTab] = useState<TabKey>("terms");

  const activeDoc = useMemo(
    () => POLICY_DOCS.find((doc) => doc.key === activeTab) ?? null,
    [activeTab],
  );

  const openDataControl = (href: string, label: string) => {
    if (
      !requireAuth({
        title: "Sign in to manage your data",
        message: `Log in to ${label.toLowerCase()}.`,
      })
    ) {
      return;
    }
    router.push(href as Href);
  };

  return (
    <View style={accountStyles.screen}>
      <ProfileHeader title="Legal & Policies" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={accountStyles.content}>
        <AccountInsightCard
          title="ODOS is a marketplace"
          subtitle="Independent sellers list and deliver their own products. ODOS runs the platform, takes payment, and holds both sides to these terms."
          stats={[
            { value: POLICY_DOCS.length + 1, label: "Documents" },
            { value: "Oct 2026", label: "Updated" },
          ]}
        />

        <AccountSegmentedTabs
          options={TABS}
          activeKey={activeTab}
          onChange={setActiveTab}
        />

        {activeDoc ? (
          <>
            <AccountListCard>
              <Text style={styles.docTitle}>{activeDoc.title}</Text>
              <Text style={styles.docLede}>{activeDoc.lede}</Text>
              <View style={styles.divider} />

              {activeDoc.sections.map((section, index) => (
                <PolicySectionBlock
                  key={section.heading}
                  section={section}
                  isLast={index === activeDoc.sections.length - 1}
                />
              ))}
            </AccountListCard>

            {/* A reviewer checks the hosted copy against this one; make that
                one tap rather than a hunt through a browser. */}
            <Pressable
              style={styles.canonicalRow}
              onPress={() => void Linking.openURL(activeDoc.canonicalUrl)}
            >
              <Ionicons name="globe-outline" size={rMS(16)} color={colors.primary} />
              <Text style={styles.canonicalLabel}>
                Read the full {activeDoc.title} online
              </Text>
              <Ionicons name="open-outline" size={rMS(15)} color={colors.iconMuted} />
            </Pressable>
          </>
        ) : (
          <>
            <AccountListCard>
              <Text style={styles.docTitle}>Your data, your controls</Text>
              <Text style={styles.docLede}>
                Everything the Privacy Policy describes can be changed or removed from inside the
                app.
              </Text>
            </AccountListCard>

            <AccountListCard>
              {DATA_CONTROLS.map((control, index) => (
                <AccountLinkRow
                  key={control.href}
                  icon={control.icon}
                  title={control.label}
                  subtitle={control.description}
                  badge={control.destructive ? "Permanent" : undefined}
                  isLast={index === DATA_CONTROLS.length - 1}
                  onPress={() => openDataControl(control.href, control.label)}
                />
              ))}
            </AccountListCard>

            <AccountTipBanner
              title={DELETION_NOTE.title}
              message={DELETION_NOTE.body}
              icon="information-circle-outline"
            />
          </>
        )}

        <AccountMetaFooter
          meta={`Last updated · ${POLICY_LAST_UPDATED}`}
          message="Questions about these terms, your data, or a deletion request? Email us and we'll reply, usually within one business day."
          actionLabel={LEGAL_EMAIL}
          onAction={() => void Linking.openURL(`mailto:${LEGAL_EMAIL}`)}
        />
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    docTitle: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(17),
      color: colors.text,
    },
    docLede: {
      marginTop: rV(5),
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(19),
      color: colors.textMuted,
    },
    divider: {
      marginVertical: rV(14),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderStrong,
    },
    sectionSpacing: {
      marginBottom: rV(18),
    },
    sectionHeading: {
      fontFamily: Fonts.titleBold,
      fontSize: rMS(13.5),
      color: colors.text,
      marginBottom: rV(6),
    },
    paragraph: {
      fontFamily: Fonts.text,
      fontSize: rMS(13),
      lineHeight: rMS(20),
      color: colors.textSecondary,
      marginBottom: rV(6),
    },
    bulletWrap: {
      marginTop: rV(2),
    },
    canonicalRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: rS(9),
      paddingHorizontal: rS(14),
      paddingVertical: rV(13),
      borderRadius: rMS(16),
      backgroundColor: colors.surfaceSubtle,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    canonicalLabel: {
      flex: 1,
      fontFamily: Fonts.titleBold,
      fontSize: rMS(12.5),
      color: colors.textSecondary,
    },
  });
}
