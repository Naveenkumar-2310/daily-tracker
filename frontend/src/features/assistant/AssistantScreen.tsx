import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ExtendedTheme } from "../../theme/theme";
import { ResponsiveContainer } from "../../components/common/ResponsiveContainer";
import { AppTextField } from "../../components/common/AppTextField";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { ask } from "../../services/api";

const SUGGESTED_PROMPTS = [
  "Did I take all my pills this month?",
  "What is my recent petrol mileage?",
  "Summarize my fuel fill-ups",
];

export const AssistantScreen: React.FC = () => {
  const theme = useTheme<ExtendedTheme>();
  const [question, setQuestion] = useState("");
  const [askedQuestion, setAskedQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (promptOverride?: string) => {
    const query = (promptOverride ?? question).trim();
    if (!query || loading) return;

    Keyboard.dismiss();
    if (promptOverride) {
      setQuestion(promptOverride);
    }

    setLoading(true);
    setError(null);
    setAskedQuestion(query);

    try {
      const response = await ask(query);
      setAnswer(response || "No response returned from the assistant.");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to reach the assistant right now. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion("");
    setAskedQuestion(null);
    setAnswer(null);
    setError(null);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ResponsiveContainer maxWidth={760}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Editorial Hero Header */}
          <View
            style={[
              styles.heroBanner,
              {
                backgroundColor: theme.colors.primaryContainer,
                borderColor: theme.colors.cardBorder || theme.colors.outline,
              },
            ]}
          >
            <View
              style={[
                styles.heroBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <MaterialCommunityIcons
                name="creation"
                size={20}
                color={theme.colors.onPrimary}
              />
            </View>
            <View style={styles.heroTextWrap}>
              <Text
                variant="titleLarge"
                style={[
                  styles.heroTitle,
                  { color: theme.colors.onPrimaryContainer },
                ]}
              >
                Daily Flow Assistant
              </Text>
              <Text
                variant="bodySmall"
                style={[
                  styles.heroSubtitle,
                  { color: theme.colors.onPrimaryContainer },
                ]}
              >
                Ask anything about your pill adherence, intake history, or fuel
                mileage.
              </Text>
            </View>
          </View>

          {/* Prompt Composer Card */}
          <AppCard
            title="Ask a Question"
            subtitle="Powered by your live tracker records"
            leftIcon={
              <View
                style={[
                  styles.iconPill,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <MaterialCommunityIcons
                  name="chat-processing-outline"
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
            }
            style={styles.composerCard}
          >
            <AppTextField
              label="Your question"
              placeholder="e.g. How many pills did I take this month?"
              value={question}
              onChangeText={(text) => {
                setQuestion(text);
                if (error) setError(null);
              }}
              multiline
              numberOfLines={3}
              returnKeyType="send"
              onSubmitEditing={() => handleAsk()}
              errorText={error ?? undefined}
              containerStyle={styles.inputContainer}
            />

            {/* Quick Suggestion Chips */}
            <View style={styles.suggestionsWrap}>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  activeOpacity={0.75}
                  disabled={loading}
                  onPress={() => handleAsk(prompt)}
                  style={[
                    styles.suggestionChip,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.cardBorder || theme.colors.outline,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="lightning-bolt-outline"
                    size={13}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.suggestionText,
                      { color: theme.colors.onSurface },
                    ]}
                    numberOfLines={1}
                  >
                    {prompt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actionRow}>
              {(answer || error || question.length > 0) && (
                <AppButton
                  mode="outlined"
                  onPress={handleClear}
                  disabled={loading}
                  style={styles.clearButton}
                >
                  Clear
                </AppButton>
              )}
              <AppButton
                mode="contained"
                icon={loading ? undefined : "send"}
                onPress={() => handleAsk()}
                disabled={loading || !question.trim()}
                loading={loading}
                style={styles.askButton}
              >
                {loading ? "Thinking..." : "Ask Assistant"}
              </AppButton>
            </View>
          </AppCard>

          {/* Loading State */}
          {loading && (
            <AppCard style={styles.responseCard}>
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <View style={styles.loadingTextWrap}>
                  <Text
                    variant="titleSmall"
                    style={{ color: theme.colors.onSurface, fontWeight: "700" }}
                  >
                    Analyzing your tracker data
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.subText, marginTop: 2 }}
                  >
                    Checking pill logs and fuel records...
                  </Text>
                </View>
              </View>
            </AppCard>
          )}

          {/* Answer Card */}
          {!loading && answer !== null && (
            <AppCard
              title="Assistant Response"
              subtitle={askedQuestion ? `“${askedQuestion}”` : undefined}
              leftIcon={
                <View
                  style={[
                    styles.iconPill,
                    { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="robot-happy-outline"
                    size={18}
                    color={theme.colors.secondary}
                  />
                </View>
              }
              style={styles.responseCard}
            >
              <View
                style={[
                  styles.answerSurface,
                  {
                    backgroundColor: theme.colors.metricBoxBg,
                    borderColor: theme.colors.cardBorder || theme.colors.outline,
                  },
                ]}
              >
                <Text
                  selectable
                  style={[
                    styles.answerText,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  {answer}
                </Text>
              </View>
            </AppCard>
          )}
        </ScrollView>
      </ResponsiveContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },
  heroBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    marginTop: 3,
    opacity: 0.85,
    lineHeight: 18,
  },
  composerCard: {
    borderRadius: 20,
  },
  iconPill: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    marginBottom: 10,
  },
  suggestionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  clearButton: {
    minWidth: 88,
  },
  askButton: {
    flex: 1,
  },
  responseCard: {
    marginTop: 10,
    borderRadius: 20,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  loadingTextWrap: {
    marginLeft: 14,
    flex: 1,
  },
  answerSurface: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 23,
    letterSpacing: 0.1,
  },
});

