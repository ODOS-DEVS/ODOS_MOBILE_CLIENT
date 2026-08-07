import { useTheme } from "@/context/ThemeContext";
import React, { useMemo } from "react";
import {
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
} from "react-native";

type MarkdownTextProps = {
  content: string;
  textStyle?: StyleProp<TextStyle>;
  linkColor?: string;
  bulletColor?: string;
};

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; value: string; url: string };

const BOLD_RE = /\*\*(.+?)\*\*/;
const CODE_RE = /`([^`]+)`/;
const URL_RE = /(https?:\/\/[^\s)]+)/;
const INLINE_RE = new RegExp(
  `${BOLD_RE.source}|${CODE_RE.source}|${URL_RE.source}`,
  "g",
);

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text))) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) {
      tokens.push({ type: "bold", value: match[1] });
    } else if (match[2] !== undefined) {
      tokens.push({ type: "code", value: match[2] });
    } else if (match[3] !== undefined) {
      tokens.push({ type: "link", value: match[3], url: match[3] });
    }
    lastIndex = INLINE_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push({ type: "text", value: text.slice(lastIndex) });
  }
  return tokens.length ? tokens : [{ type: "text", value: text }];
}

type Block = { type: "paragraph"; text: string } | { type: "list"; items: string[] };

const BULLET_RE = /^[-*•]\s+(.*)$/;
const NUMBERED_RE = /^\d+[.)]\s+(.*)$/;

function parseBlocks(content: string): Block[] {
  const lines = content.split("\n");
  const blocks: Block[] = [];
  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length) {
      blocks.push({ type: "paragraph", text: paragraphBuffer.join(" ").trim() });
      paragraphBuffer = [];
    }
  };
  const flushList = () => {
    if (listBuffer.length) {
      blocks.push({ type: "list", items: listBuffer });
      listBuffer = [];
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }
    const bulletMatch = BULLET_RE.exec(line) || NUMBERED_RE.exec(line);
    if (bulletMatch) {
      flushParagraph();
      listBuffer.push(bulletMatch[1]);
    } else {
      flushList();
      paragraphBuffer.push(line);
    }
  }
  flushParagraph();
  flushList();
  return blocks;
}

function InlineRun({
  tokens,
  textStyle,
  linkColor,
}: {
  tokens: InlineToken[];
  textStyle?: StyleProp<TextStyle>;
  linkColor: string;
}) {
  const flatStyle = StyleSheet.flatten(textStyle);
  const codeFontSize = typeof flatStyle?.fontSize === "number" ? flatStyle.fontSize - 1 : 13;
  return (
    <Text style={textStyle}>
      {tokens.map((token, index) => {
        if (token.type === "bold") {
          return (
            <Text key={index} style={{ fontWeight: "700" }}>
              {token.value}
            </Text>
          );
        }
        if (token.type === "code") {
          return (
            <Text
              key={index}
              style={{
                fontFamily: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
                fontSize: codeFontSize,
              }}
            >
              {token.value}
            </Text>
          );
        }
        if (token.type === "link") {
          return (
            <Text
              key={index}
              style={{ color: linkColor, textDecorationLine: "underline" }}
              onPress={() => {
                void Linking.openURL(token.url).catch(() => {});
              }}
            >
              {token.value}
            </Text>
          );
        }
        return <Text key={index}>{token.value}</Text>;
      })}
    </Text>
  );
}

export default function MarkdownText({
  content,
  textStyle,
  linkColor,
  bulletColor,
}: MarkdownTextProps) {
  const { colors } = useTheme();
  const resolvedLinkColor = linkColor ?? colors.primary;
  const flatStyle = StyleSheet.flatten(textStyle);
  const resolvedBulletColor = bulletColor ?? (flatStyle?.color as string | undefined) ?? colors.text;
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return (
    <View>
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <View key={index} style={{ marginTop: index > 0 ? 4 : 0, gap: 3 }}>
              {block.items.map((item, itemIndex) => (
                <View key={itemIndex} style={{ flexDirection: "row", gap: 6 }}>
                  <Text style={[textStyle, { color: resolvedBulletColor }]}>{"•"}</Text>
                  <View style={{ flex: 1 }}>
                    <InlineRun
                      tokens={tokenizeInline(item)}
                      textStyle={textStyle}
                      linkColor={resolvedLinkColor}
                    />
                  </View>
                </View>
              ))}
            </View>
          );
        }
        return (
          <View key={index} style={{ marginTop: index > 0 ? 6 : 0 }}>
            <InlineRun
              tokens={tokenizeInline(block.text)}
              textStyle={textStyle}
              linkColor={resolvedLinkColor}
            />
          </View>
        );
      })}
    </View>
  );
}
