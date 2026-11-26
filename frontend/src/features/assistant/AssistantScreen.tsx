import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
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

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "error";
  text: string;
}

const SUGGESTED_PROMPTS = [
  "Did I take all my pills this month?",
  "What is my recent petrol mileage?",
  "Summarize my fuel fill-ups",
];

export const AssistantScreen: React.FC = () => {
  const theme = useTheme<ExtendedTheme>();
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [androidKeyboardHeight, setAndroidKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setAndroidKeyboardHeight(e.endCoordinates?.height || 0);
      scrollToBottom();
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setAndroidKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  const handleAsk = async (promptOverride?: string) => {
    const query = (promptOverride ?? question).trim();
    if (!query || loading) return;

    Keyboard.dismiss();
    setQuestion("");

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    scrollToBottom();

    try {
      const response = await ask(query);
      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: response || "No response returned from the assistant.",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, role: "error", text: "Please retry" },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ResponsiveContainer maxWidth={780}>
        <View style={styles.flexContainer}>
          {/* Chat Thread */}
          <ScrollView
            ref={scrollRef}
            style={styles.chatScroll}
            contentContainerStyle={[
              styles.chatContent,
              messages.length === 0 && styles.emptyChatContent,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.emptyIconWrap,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="creation"
                    size={28}
                    color={theme.colors.primary}
                  />
                </View>
                <Text
                  variant="titleMedium"
                  style={[
                    styles.emptyTitle,
                    { color: theme.colors.onSurface },
                  ]}
                >
                  How can I help today?
                </Text>
                <Text
                  variant="bodySmall"
                  style={[styles.emptySub, { color: theme.colors.subText }]}
                >
                  Ask about your pill schedule, adherence, or fuel mileage.
                </Text>

                <View style={styles.suggestionsWrap}>
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <TouchableOpacity
                      key={prompt}
                      activeOpacity={0.75}
                      onPress={() => handleAsk(prompt)}
                      style={[
                        styles.suggestionChip,
                        {
                          backgroundColor: theme.colors.surface,
                          borderColor:
                            theme.colors.cardBorder || theme.colors.outline,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="lightning-bolt-outline"
                        size={14}
                        color={theme.colors.primary}
                      />
                      <Text
                        style={[
                          styles.suggestionText,
                          { color: theme.colors.onSurface },
                        ]}
                      >
                        {prompt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              messages.map((msg) => {
                if (msg.role === "user") {
                  return (
                    <View key={msg.id} style={styles.userRow}>
                      <View
                        style={[
                          styles.userBubble,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      >
                        <Text
                          selectable
                          style={[
                            styles.userText,
                            { color: theme.colors.onPrimary },
                          ]}
                        >
                          {msg.text}
                        </Text>
                      </View>
                    </View>
                  );
                }

                if (msg.role === "error") {
                  return (
                    <AppCard
                      key={msg.id}
                      style={[
                        styles.assistantCard,
                        {
                          backgroundColor: theme.colors.urgentBg,
                          borderColor: theme.colors.error,
                        },
                      ]}
                    >
                      <View style={styles.errorRow}>
                        <MaterialCommunityIcons
                          name="alert-circle-outline"
                          size={18}
                          color={theme.colors.error}
                        />
                        <Text
                          selectable
                          style={[
                            styles.errorText,
                            { color: theme.colors.urgentText },
                          ]}
                        >
                          {msg.text}
                        </Text>
                      </View>
                    </AppCard>
                  );
                }

                return (
                  <AppCard
                    key={msg.id}
                    leftIcon={
                      <View
                        style={[
                          styles.aiAvatar,
                          { backgroundColor: theme.colors.primaryContainer },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="creation"
                          size={15}
                          color={theme.colors.primary}
                        />
                      </View>
                    }
                    title="Assistant"
                    style={styles.assistantCard}
                  >
                    <Text
                      selectable
                      style={[
                        styles.answerText,
                        { color: theme.colors.onSurface },
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </AppCard>
                );
              })
            )}

            {loading && (
              <AppCard style={styles.assistantCard}>
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text
                    variant="bodyMedium"
                    style={[
                      styles.loadingText,
                      { color: theme.colors.subText },
                    ]}
                  >
                    Thinking...
                  </Text>
                </View>
              </AppCard>
            )}
          </ScrollView>

          {/* Bottom Docked Input Bar */}
          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor: theme.colors.surface,
                borderTopColor: theme.colors.cardBorder || theme.colors.outline,
                marginBottom: Platform.OS === "android" ? androidKeyboardHeight : 0,
              },
            ]}
          >
            <View style={styles.inputRow}>
              <AppTextField
                placeholder="Ask anything..."
                value={question}
                onChangeText={setQuestion}
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => handleAsk()}
                containerStyle={styles.textFieldContainer}
                style={styles.textField}
              />
              <AppButton
                mode="contained"
                icon="send"
                onPress={() => handleAsk()}
                disabled={loading || !question.trim()}
                loading={loading}
                style={styles.sendButton}
                contentStyle={styles.sendButtonContent}
              >
                Send
              </AppButton>
            </View>
          </View>
        </View>
      </ResponsiveContainer>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 20,
  },
  emptyChatContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  emptySub: {
    marginTop: 6,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  suggestionsWrap: {
    width: "100%",
    gap: 8,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginVertical: 6,
  },
  userBubble: {
    maxWidth: "82%",
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  userText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500",
  },
  assistantCard: {
    borderRadius: 18,
    marginVertical: 6,
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  answerText: {
    fontSize: 15,
    lineHeight: 23,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 18 : 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  textFieldContainer: {
    flex: 1,
    marginBottom: 0,
  },
  textField: {
    height: 48,
    textAlignVertical: "center",
  },
  sendButton: {
    marginVertical: 0,
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
  },
  sendButtonContent: {
    height: 48,
  },
});
