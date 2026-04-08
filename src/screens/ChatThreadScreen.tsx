import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  measure,
  runOnJS,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { ChatMessage } from '../types/chat';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addMessage,
  setAIFeedback,
  setMessageReaction,
  toggleAIDislikeChip,
} from '../store/chat/chatSlice';
import { selectChatById, selectMessagesByChatId } from '../store/chat/selectors';
import { safeAreaBackground, screenSurface, threadBackground } from '../theme/colors';

function formatTimeBubble(ts: number) {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes();
  const hh = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm}`;
}

function isOutgoing(m: ChatMessage) {
  return m.sender === 'user';
}

function isSystem(m: ChatMessage) {
  return m.sender === 'system' || m.type === 'event';
}

function senderLabel(m: ChatMessage) {
  if (m.sender === 'system') return 'System';
  if (m.sender === 'ai_astrologer') return 'AI Astrologer';
  if (m.sender === 'human_astrologer') return 'Human Astrologer';
  return '';
}

const SWIPE_MAX_X = 72;
const SWIPE_REPLY_THRESHOLD = 56;
const REACTIONS = ['🙏', '✨', '🌙', '❤️', '😂'] as const;
const DISLIKE_CHIPS = ['Inaccurate', 'Too Vague', 'Too Long'] as const;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.min(Math.max(value, min), max);
}

function MessageBubble({
  message,
  outgoing,
  repliedTo,
  onSwipeReply,
  onPressReplyAttach,
  onLongPressReactions,
  onAIFeedback,
  onToggleChip,
}: {
  message: ChatMessage;
  outgoing: boolean;
  repliedTo?: ChatMessage;
  onSwipeReply: (messageId: string) => void;
  onPressReplyAttach: (messageId: string) => void;
  onLongPressReactions: (payload: {
    messageId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  onAIFeedback: (messageId: string, next: 'liked' | 'disliked') => void;
  onToggleChip: (
    messageId: string,
    chip: (typeof DISLIKE_CHIPS)[number],
  ) => void;
}) {
  const bubbleRef = useAnimatedRef<Animated.View>();
  const translateX = useSharedValue(0);

  const pan = useMemo(() => {
    return Gesture.Pan()
      .activeOffsetY([-8, 8])
      .onUpdate(e => {
        // swipe-to-reply:
        // - incoming: swipe right
        // - outgoing: swipe left
        const x = outgoing
          ? clamp(e.translationX, -SWIPE_MAX_X, 0)
          : clamp(e.translationX, 0, SWIPE_MAX_X);
        translateX.value = x;
      })
      .onEnd(() => {
        const shouldReply = outgoing
          ? translateX.value <= -SWIPE_REPLY_THRESHOLD
          : translateX.value >= SWIPE_REPLY_THRESHOLD;
        if (shouldReply) {
          runOnJS(onSwipeReply)(message.id);
        }
        translateX.value = withSpring(0, {
          damping: 16,
          stiffness: 220,
          mass: 0.6,
        });
      });
  }, [message.id, onSwipeReply, outgoing, translateX]);

  const longPress = useMemo(() => {
    return Gesture.LongPress()
      .minDuration(220)
      .onStart(() => {
        const m = measure(bubbleRef);
        if (!m) return;
        runOnJS(onLongPressReactions)({
          messageId: message.id,
          x: m.pageX,
          y: m.pageY,
          width: m.width,
          height: m.height,
        });
      });
  }, [bubbleRef, message.id, onLongPressReactions]);

  const composed = useMemo(() => Gesture.Simultaneous(pan, longPress), [pan, longPress]);

  const bubbleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const replyIconStyle = useAnimatedStyle(() => {
    // reveal icon as you swipe
    const progress = outgoing ? -translateX.value : translateX.value;
    const opacity = clamp(progress / 28, 0, 1);
    const scale = 0.9 + 0.1 * opacity;
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.swipeWrap}>
      <Animated.View
        style={[
          styles.replyIconWrap,
          outgoing ? styles.replyIconWrapLeft : styles.replyIconWrapRight,
          replyIconStyle,
        ]}
      >
        <Text style={styles.replyIcon}>↩</Text>
      </Animated.View>
      <GestureDetector gesture={composed}>
        <Animated.View
          ref={bubbleRef}
          style={[
            styles.bubble,
            repliedTo ? styles.bubbleWithReply : null,
            outgoing ? styles.bubbleOut : styles.bubbleIn,
            bubbleStyle,
            isSystem(message) ? styles.systemBubble : null,
          ]}
        >
          {isSystem(message) ? (
            <Text style={styles.systemText}>{message.text}</Text>
          ) : (
            <>
          {repliedTo ? (
            <Pressable
              onPress={() => onPressReplyAttach(repliedTo.id)}
              style={styles.replyAttach}
            >
              <View style={styles.replyAttachBar} />
              <View style={styles.replyAttachBody}>
                <Text style={styles.replyAttachTitle} numberOfLines={1}>
                  {repliedTo.sender === 'user' ? 'You' : 'Message'}
                </Text>
                <Text style={styles.replyAttachText} numberOfLines={1}>
                  {repliedTo.text}
                </Text>
              </View>
            </Pressable>
          ) : null}
          <Text style={styles.msgText}>{message.text}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>{formatTimeBubble(message.timestamp)}</Text>
          </View>
          {!outgoing ? (
            <Text style={styles.fromText} numberOfLines={1}>
              {senderLabel(message)}
            </Text>
          ) : null}
          {message.reactions?.length ? (
            <View
              style={[
                styles.reactionPill,
                outgoing ? styles.reactionPillOut : styles.reactionPillIn,
              ]}
            >
              <Text style={styles.reactionText}>
                {message.reactions.join(' ')}
              </Text>
            </View>
          ) : null}
          {message.sender === 'ai_astrologer' ? (
            <View style={styles.aiFeedbackRow}>
              <Pressable
                onPress={() => onAIFeedback(message.id, 'liked')}
                style={[
                  styles.aiFeedbackBtn,
                  message.feedbackType === 'liked' ? styles.aiFeedbackBtnActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.aiFeedbackBtnText,
                    message.feedbackType === 'liked'
                      ? styles.aiFeedbackBtnTextActive
                      : null,
                  ]}
                >
                  Like
                </Text>
              </Pressable>
              <Pressable
                onPress={() => onAIFeedback(message.id, 'disliked')}
                style={[
                  styles.aiFeedbackBtn,
                  message.feedbackType === 'disliked'
                    ? styles.aiFeedbackBtnActiveDislike
                    : null,
                ]}
              >
                <Text
                  style={[
                    styles.aiFeedbackBtnText,
                    message.feedbackType === 'disliked'
                      ? styles.aiFeedbackBtnTextActive
                      : null,
                  ]}
                >
                  Dislike
                </Text>
              </Pressable>
            </View>
          ) : null}
          {message.sender === 'ai_astrologer' &&
          message.feedbackType === 'disliked' ? (
            <Animated.View
              style={[
                styles.aiChipsWrap,
              ]}
            >
              <View style={styles.aiChipsRow}>
                {DISLIKE_CHIPS.map(chip => {
                  const selected = message.feedbackChips?.includes(chip) ?? false;
                  return (
                    <Pressable
                      key={chip}
                      onPress={() => onToggleChip(message.id, chip)}
                      style={[
                        styles.chip,
                        selected ? styles.chipSelected : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selected ? styles.chipTextSelected : null,
                        ]}
                      >
                        {chip}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
          ) : null}
            </>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <View style={styles.starsRow}>
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const filled = n <= value;
        return (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={8}>
            <Text style={[styles.star, filled ? styles.starFilled : null]}>
              ★
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ChatThreadScreen({
  chatId,
  onBack,
}: {
  chatId: string;
  onBack: () => void;
}) {
  const dispatch = useAppDispatch();
  const chat = useAppSelector(s => selectChatById(s, chatId));
  const messages = useAppSelector(s => selectMessagesByChatId(s, chatId));
  const [draft, setDraft] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [reactionTarget, setReactionTarget] = useState<{
    messageId: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const reactionsOpen = useSharedValue(0);

  const [endOpen, setEndOpen] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const messageById = useMemo(() => {
    const map: Record<string, ChatMessage> = {};
    for (const m of messages) map[m.id] = m;
    return map;
  }, [messages]);

  const replyToMessage = useMemo(() => {
    if (!replyToId) return undefined;
    return messageById[replyToId];
  }, [messageById, replyToId]);

  const data = useMemo(() => {
    // inverted FlatList expects newest first
    return [...messages].sort((a, b) => b.timestamp - a.timestamp);
  }, [messages]);

  const indexById = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach((m, idx) => {
      map[m.id] = idx;
    });
    return map;
  }, [data]);

  const scrollToMessageId = useCallback(
    (messageId: string) => {
      const index = indexById[messageId];
      if (index === undefined) return;
      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    },
    [indexById],
  );

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;

    const now = Date.now();
    const id = `m-${now}`;

    dispatch(
      addMessage({
        chatId,
        message: {
          id,
          sender: 'user',
          text,
          timestamp: now,
          type: 'text',
          ...(replyToId ? { replyTo: replyToId } : null),
        },
      }),
    );
    setDraft('');
    setReplyToId(null);
  }, [chatId, dispatch, draft, replyToId]);

  const openReactions = useCallback(
    (payload: {
      messageId: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }) => {
      setReactionTarget(payload);
      reactionsOpen.value = 0;
      reactionsOpen.value = withSpring(1, { damping: 18, stiffness: 220, mass: 0.6 });
    },
    [reactionsOpen],
  );

  const closeReactions = useCallback(() => {
    reactionsOpen.value = withTiming(0, { duration: 120 }, finished => {
      if (finished) runOnJS(setReactionTarget)(null);
    });
  }, [reactionsOpen]);

  const onPickReaction = useCallback(
    (emoji: string) => {
      if (!reactionTarget) return;
      dispatch(setMessageReaction({ messageId: reactionTarget.messageId, emoji }));
      closeReactions();
    },
    [closeReactions, dispatch, reactionTarget],
  );

  const reactionsBarStyle = useAnimatedStyle(() => {
    return {
      opacity: reactionsOpen.value,
      transform: [{ scale: 0.92 + 0.08 * reactionsOpen.value }],
    };
  });

  const reactionsBarWidth = useMemo(() => {
    // reactionBtn: 34, gap: 8, horizontal padding: 10*2
    return 20 + REACTIONS.length * 34 + (REACTIONS.length - 1) * 8;
  }, []);

  const onAIFeedbackPress = useCallback(
    (messageId: string, next: 'liked' | 'disliked') => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      dispatch(setAIFeedback({ messageId, feedbackType: next }));
    },
    [dispatch],
  );

  const onChipToggle = useCallback(
    (messageId: string, chip: (typeof DISLIKE_CHIPS)[number]) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      dispatch(toggleAIDislikeChip({ messageId, chip }));
    },
    [dispatch],
  );

  const onEndChat = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEndOpen(true);
  }, []);

  const onSubmitRating = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEndOpen(false);
    const stars = rating || 0;
    const now = Date.now();
    dispatch(
      addMessage({
        chatId,
        message: {
          id: `sys-end-${now}`,
          sender: 'system',
          type: 'event',
          timestamp: now,
          text: `Chat ended. Rating given: ${stars}/5.`,
        },
      }),
    );
    Alert.alert('Rating captured', `Thanks! You rated this session ${stars}/5.`);
  }, [chatId, dispatch, rating]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={10}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {chat?.title ?? 'Chat'}
            </Text>
            <Text style={styles.headerSub} numberOfLines={1}>
              {chat?.subscriber ?? ''}
            </Text>
          </View>

          <Pressable onPress={onEndChat} style={styles.endChatBtn} hitSlop={10}>
            <Text style={styles.endChatText}>End Chat</Text>
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior="padding"
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 48 : 8}
        >
          <View style={styles.threadBg}>
            <FlatList
            inverted
            ref={listRef}
            data={data}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            renderItem={({ item }) => {
              const outgoing = isOutgoing(item);
              return (
                <View
                  style={[
                    styles.msgRow,
                    outgoing ? styles.msgRowRight : styles.msgRowLeft,
                    outgoing && item.reactions?.length
                      ? styles.msgRowRightReactionSpace
                      : null,
                    isSystem(item) ? styles.msgRowCenter : null,
                  ]}
                >
                  <MessageBubble
                    message={item}
                    outgoing={outgoing}
                    repliedTo={item.replyTo ? messageById[item.replyTo] : undefined}
                    onSwipeReply={setReplyToId}
                    onPressReplyAttach={scrollToMessageId}
                    onLongPressReactions={openReactions}
                    onAIFeedback={onAIFeedbackPress}
                    onToggleChip={onChipToggle}
                  />
                </View>
              );
            }}
          />

            {reactionTarget ? (
              <View style={styles.reactionsOverlay} pointerEvents="box-none">
                <Pressable
                  style={StyleSheet.absoluteFill}
                  onPress={closeReactions}
                />

                <Animated.View
                  style={[
                    styles.reactionsBar,
                    {
                      left: Math.min(
                        Math.max(
                          12,
                          reactionTarget.x +
                            reactionTarget.width / 2 -
                            reactionsBarWidth / 2,
                        ),
                        Math.max(12, windowWidth - 12 - reactionsBarWidth),
                      ),
                      top: Math.max(12, reactionTarget.y - 56),
                    },
                    reactionsBarStyle,
                  ]}
                >
                  {REACTIONS.map(e => (
                    <Pressable
                      key={e}
                      onPress={() => onPickReaction(e)}
                      style={styles.reactionBtn}
                    >
                      <Text style={styles.reactionBtnText}>{e}</Text>
                    </Pressable>
                  ))}
                </Animated.View>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.composer,
              {
                paddingBottom: 10 + insets.bottom,
                marginBottom: 14,
              },
            ]}
          >
            {replyToMessage ? (
              <View style={styles.replyPreview}>
                <View style={styles.replyPreviewLeft}>
                  <Text style={styles.replyPreviewTitle} numberOfLines={1}>
                    Replying to {replyToMessage.sender === 'user' ? 'You' : 'Message'}
                  </Text>
                  <Text style={styles.replyPreviewText} numberOfLines={1}>
                    {replyToMessage.text}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setReplyToId(null)}
                  style={styles.replyCancelBtn}
                  hitSlop={10}
                >
                  <Text style={styles.replyCancelText}>✕</Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable style={styles.composerIconBtn} hitSlop={8}>
              <Text style={styles.composerIcon}>😊</Text>
            </Pressable>

            <View style={styles.inputWrap}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Type your message..."
                placeholderTextColor="#A8ADB8"
                style={styles.input}
                multiline
              />
            </View>

            <Pressable
              onPress={send}
              style={({ pressed }) => [
                styles.sendBtn,
                pressed ? styles.sendBtnPressed : null,
              ]}
              hitSlop={8}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        {endOpen ? (
          <View style={styles.endOverlay}>
            <BlurView style={StyleSheet.absoluteFill} blurType="light" blurAmount={12} />
            <View style={[styles.endCard, { marginBottom: insets.bottom }]}>
              <Text style={styles.endTitle}>Thank You</Text>
              <Text style={styles.endSub}>Please rate your session</Text>
              <Stars value={rating} onChange={setRating} />
              <Pressable onPress={onSubmitRating} style={styles.submitBtn}>
                <Text style={styles.submitText}>Submit</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: safeAreaBackground },
  root: { flex: 1, backgroundColor: screenSurface },
  keyboardAvoid: {
    flex: 1,
  },

  header: {
    height: 56,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F4',
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontSize: 28, color: '#1F2430', marginTop: -2 },
  headerTitleWrap: { flex: 1, paddingRight: 10 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#1F2430' },
  headerSub: { marginTop: 2, fontSize: 12, color: '#8A90A0' },
  endChatBtn: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFF0ED',
    borderWidth: 1,
    borderColor: '#FFD2C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endChatText: { fontSize: 12, fontWeight: '900', color: '#FF4B2B' },

  threadBg: {
    flex: 1,
    backgroundColor: threadBackground,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  msgRow: { flexDirection: 'row' },
  msgRowLeft: { justifyContent: 'flex-start' },
  msgRowRight: { justifyContent: 'flex-end' },
  msgRowRightReactionSpace: { paddingRight: 18 },
  msgRowCenter: { justifyContent: 'center' },
  swipeWrap: {
    position: 'relative',
  },
  replyIconWrap: {
    position: 'absolute',
    top: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F4',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  replyIconWrapRight: { left: 0 },
  replyIconWrapLeft: { right: 0 },
  replyIcon: { fontSize: 14, color: '#5C6478', fontWeight: '800' },
  bubble: {
    maxWidth: '100%',
    minWidth: 160,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 1,
  },
  bubbleWithReply: {
    minWidth: 200,
  },
  bubbleIn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F4',
  },
  bubbleOut: {
    backgroundColor: '#CFF5C8',
  },
  systemBubble: {
    backgroundColor: '#EEF0F4',
    borderWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 0,
  },
  systemText: { fontSize: 12, color: '#5C6478', fontWeight: '700' },
  replyAttach: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  replyAttachBar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: '#FF4B2B',
  },
  replyAttachBody: { flex: 1 },
  replyAttachTitle: { fontSize: 12, fontWeight: '800', color: '#1F2430' },
  replyAttachText: { marginTop: 2, fontSize: 12, color: '#6C7386' },
  msgText: { fontSize: 14, color: '#1F2430', lineHeight: 19 },
  metaRow: { marginTop: 4, alignItems: 'flex-end' },
  timeText: { fontSize: 11, color: '#6C7386', fontWeight: '600' },
  fromText: { marginTop: 4, fontSize: 11, color: '#8A90A0', fontWeight: '700' },
  reactionPill: {
    position: 'absolute',
    bottom: -14,
    paddingHorizontal: 8,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  reactionPillIn: {
    left: 10,
    backgroundColor: '#FFFFFF',
    borderColor: '#EEF0F4',
  },
  reactionPillOut: {
    right: 10,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(0,0,0,0.06)',
  },
  reactionText: { fontSize: 14 },

  aiFeedbackRow: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  aiFeedbackBtn: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F4F6F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiFeedbackBtnActive: {
    backgroundColor: '#E9F7EE',
  },
  aiFeedbackBtnActiveDislike: {
    backgroundColor: '#FFF0ED',
  },
  aiFeedbackBtnText: { fontSize: 12, fontWeight: '800', color: '#2B313E' },
  aiFeedbackBtnTextActive: { color: '#1F2430' },

  aiChipsWrap: {
    marginTop: 8,
  },
  aiChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#1F2430',
    borderColor: '#1F2430',
  },
  chipText: { fontSize: 12, fontWeight: '800', color: '#2B313E' },
  chipTextSelected: { color: '#FFFFFF' },

  endOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCard: {
    width: '86%',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#EEF0F4',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  endTitle: { fontSize: 20, fontWeight: '900', color: '#1F2430' },
  endSub: { marginTop: 6, fontSize: 13, color: '#6C7386' },
  starsRow: { marginTop: 14, flexDirection: 'row', gap: 8 },
  star: { fontSize: 28, color: '#C7CBD6' },
  starFilled: { color: '#FFB020' },
  submitBtn: {
    marginTop: 16,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FF4B2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },

  reactionsOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  reactionsBar: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F4',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  reactionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F8FB',
  },
  reactionBtnText: { fontSize: 18 },

  composer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F4',
    backgroundColor: '#FFFFFF',
    flexWrap: 'wrap',
  },
  replyPreview: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7EAF0',
    backgroundColor: '#F7F8FB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  replyPreviewLeft: { flex: 1 },
  replyPreviewTitle: { fontSize: 12, fontWeight: '800', color: '#1F2430' },
  replyPreviewText: { marginTop: 2, fontSize: 12, color: '#6C7386' },
  replyCancelBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    marginLeft: 10,
  },
  replyCancelText: { fontSize: 14, color: '#6C7386', fontWeight: '900' },
  composerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6F9',
  },
  composerIcon: { fontSize: 16 },
  inputWrap: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7EAF0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    fontSize: 14,
    color: '#1F2430',
    padding: 0,
    margin: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FF4B2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnPressed: { opacity: 0.85 },
  sendIcon: { fontSize: 18, color: '#FFFFFF', marginLeft: 2 },
});

