import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppSelector } from '../store/hooks';
import {
  selectChatThreads,
  selectLastMessageByChatId,
} from '../store/chat/selectors';

type TabKey = 'all' | 'unread';

function formatTime(ts?: number) {
  if (!ts) return '';
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes();
  const hh = ((h + 11) % 12) + 1;
  const mm = String(m).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${hh}:${mm} ${ampm}`;
}

export function ChatListScreen({
  onOpenChat,
}: {
  onOpenChat: (chatId: string) => void;
}) {
  const [tab, setTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');

  const threads = useAppSelector(selectChatThreads);
  const lastById = useAppSelector(s => {
    const map: Record<string, ReturnType<typeof selectLastMessageByChatId>> = {};
    for (const t of s.chat.chatOrder) map[t] = selectLastMessageByChatId(s, t);
    return map;
  });

  const data = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return threads.filter(t => {
      if (tab === 'unread' && !t.unreadCount) return false;
      if (!normalizedSearch) return true;
      return t.title.toLowerCase().includes(normalizedSearch);
    });
  }, [threads, tab, search]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoMark}>
              <Text style={styles.logoMarkText}>M</Text>
            </View>
            <Text style={styles.brand}>MyNaksh</Text>
            {/* <View style={styles.availabilityPill}>
              <View style={styles.availabilityDot} />
              <Text style={styles.availabilityText}>Available</Text>
            </View> */}
          </View>
{/* 
          <View style={styles.headerRight}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🔔</Text>
            </View>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>👤</Text>
            </View>
          </View> */}
        </View>

        <View style={styles.tabsRow}>
          <Pressable
            onPress={() => setTab('all')}
            style={[styles.tabPill, tab === 'all' && styles.tabPillActive]}
          >
            <Text style={[styles.tabText, tab === 'all' && styles.tabTextActive]}>
              All
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('unread')}
            style={[styles.tabPill, tab === 'unread' && styles.tabPillActive]}
          >
            <Text
              style={[styles.tabText, tab === 'unread' && styles.tabTextActive]}
            >
              Unread
            </Text>
          </Pressable>

          <View style={styles.tabsSpacer} />

          <View style={styles.actionPills}>
            <View style={styles.smallPill}>
              <Text style={styles.smallPillText}>🔕</Text>
            </View>
            <View style={styles.smallPill}>
              <Text style={styles.smallPillText}>📞</Text>
            </View>
            <View style={styles.smallPill}>
              <Text style={styles.smallPillText}>💬</Text>
            </View>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.countryPill}>
            <Text style={styles.countryText}>+91</Text>
            <Text style={styles.countryChevron}>▾</Text>
          </View>
          <View style={styles.searchInputWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search by Mobile, Name."
              placeholderTextColor="#A8ADB8"
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.plusBtn}>
            <Text style={styles.plusText}>＋</Text>
          </Pressable>
        </View>

        <FlatList
          data={data}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const last = lastById[item.id];
            const time = formatTime(last?.timestamp);
            const subtitlePrefix = item.subtitlePrefix ?? 'Customer';
            const snippet = last?.text ?? '';

            return (
              <Pressable style={styles.row} onPress={() => onOpenChat(item.id)}>
                <View style={styles.avatarWrap}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarIcon}>👤</Text>
                  </View>
                  {item.isOnline ? <View style={styles.onlineDot} /> : null}
                </View>

                <View style={styles.rowMid}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.rowSubtitle} numberOfLines={1}>
                    <Text style={styles.rowSubtitlePrefix}>{subtitlePrefix}:</Text>{' '}
                    {snippet}
                  </Text>
                </View>

                <View style={styles.rowRight}>
                  <Text
                    style={[
                      styles.timeText,
                      item.unreadCount ? styles.timeTextActive : null,
                    ]}
                  >
                    {time || 'Yesterday'}
                  </Text>
                  {item.unreadCount ? <View style={styles.unreadDot} /> : null}
                </View>
              </Pressable>
            );
          }}
        />

        <View style={styles.bottomNav}>
          <View style={styles.navItem}>
            <Text style={styles.navIcon}>▦</Text>
          </View>
          <View style={[styles.navItem, styles.navItemActive]}>
            <View style={styles.navPill}>
              <Text style={styles.navPillIcon}>💬</Text>
              <Text style={styles.navPillText}>Chats</Text>
            </View>
          </View>
          <View style={styles.navItem}>
            <Text style={styles.navIcon}>☎</Text>
          </View>
          <View style={styles.navItem}>
            <Text style={styles.navIcon}>📅</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  root: { flex: 1, backgroundColor: '#FFFFFF' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMark: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FF4B2B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  brand: { fontSize: 18, fontWeight: '700', color: '#1F2430' },
  availabilityPill: {
    marginLeft: 2,
    paddingHorizontal: 10,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF7F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2ECC71',
  },
  availabilityText: { color: '#2C7A3F', fontSize: 12, fontWeight: '600' },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F5F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 16 },

  tabsRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tabPill: {
    height: 32,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F4F6F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: { backgroundColor: '#FF4B2B' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#2B313E' },
  tabTextActive: { color: '#FFFFFF' },
  tabsSpacer: { flex: 1 },
  actionPills: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallPill: {
    width: 40,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F6F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallPillText: { fontSize: 14 },

  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  countryPill: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#F4F6F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryText: { fontSize: 13, fontWeight: '700', color: '#2B313E' },
  countryChevron: { fontSize: 12, color: '#8A90A0' },
  searchInputWrap: {
    flex: 1,
    height: 38,
    borderRadius: 18,
    backgroundColor: '#F4F6F9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, color: '#1F2430' },
  plusBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: { fontSize: 20, color: '#FF4B2B', marginTop: -1 },

  listContent: { paddingTop: 6, paddingBottom: 86 },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: { width: 44, height: 44 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F4F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarIcon: { fontSize: 18 },
  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ECC71',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rowMid: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '700', color: '#1F2430' },
  rowSubtitle: { marginTop: 2, fontSize: 13, color: '#7C8395' },
  rowSubtitlePrefix: { color: '#5C6478', fontWeight: '700' },
  rowRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 44,
  },
  timeText: { fontSize: 12, color: '#8A90A0', fontWeight: '600' },
  timeTextActive: { color: '#2ECC71' },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2ECC71',
  },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 10,
  },
  navItem: { width: 72, alignItems: 'center', justifyContent: 'center' },
  navItemActive: { width: 120 },
  navIcon: { fontSize: 18, color: '#2B313E' },
  navPill: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FF4B2B',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navPillIcon: { fontSize: 16, color: '#fff' },
  navPillText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});

