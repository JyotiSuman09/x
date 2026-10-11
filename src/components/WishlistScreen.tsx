import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { EmptyState, Eyebrow, Screen } from './Screen';
import { ItemCard } from './ItemCard';
import { StatCard } from './StatCard';
import { getItems, moveItem } from '../db/wishlist';
import type { Priority, WishlistItem } from '../types/wishlist';
import { colors, formatRupees } from '../theme';

export default function WishlistScreen() {
  const db = useSQLiteContext();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | null>(null);
  const [sortMode, setSortMode] = useState<'priority' | 'custom'>('priority');

  const refresh = useCallback(async () => {
    setItems(await getItems(db, 'active'));
  }, [db]);

  useFocusEffect(useCallback(() => {
    let active = true;
    getItems(db, 'active').then((data) => { if (active) setItems(data); });
    return () => { active = false; };
  }, [db]));

  const displayedItems = useMemo(() => {
    const ordered = [...items].sort((a, b) => sortMode === 'priority'
      ? a.priority - b.priority || a.sortOrder - b.sortOrder
      : a.sortOrder - b.sortOrder);
    const query = search.trim().toLowerCase();
    return ordered.filter((item) =>
      (!query || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)) &&
      (!priorityFilter || item.priority === priorityFilter) &&
      (!category || item.category === category),
    );
  }, [items, search, priorityFilter, sortMode, category]);

  const total = items.reduce((sum, item) => sum + item.estimatedPrice, 0);

  async function nudge(item: WishlistItem, direction: -1 | 1) {
    const customOrder = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    await moveItem(db, customOrder, customOrder.findIndex((entry) => entry.id === item.id), direction);
    await refresh();
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Eyebrow>YOUR NEXT PURCHASES</Eyebrow>
          <Text style={styles.title}>My wishlist</Text>
          <Text style={styles.date}>{new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.push('/item/new')} style={styles.addButton}>
          <Text style={styles.addButtonText}>＋</Text>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <StatCard label="WISHLIST ITEMS" amount={items.length} displayValue={String(items.length)} detail="Active items" />
        <StatCard label="ESTIMATED COST" amount={total} detail="For your wishlist" tone="lilac" />
      </View>

      <View style={styles.sectionHeading}>
        <View>
          <Eyebrow>KEEP YOUR GOALS IN SIGHT</Eyebrow>
          <Text style={styles.sectionTitle}>Your priorities</Text>
        </View>
        <Text style={styles.count}>{displayedItems.length} items</Text>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search wishlist"
        placeholderTextColor={colors.muted}
        style={styles.search}
        returnKeyType="search"
      />

      <View style={styles.filters}>
        {([null, 1, 2, 3, 4] as const).map((priority) => {
          const selected = priorityFilter === priority;
          return (
            <Pressable key={priority ?? 'all'} onPress={() => setPriorityFilter(priority)} style={[styles.filterChip, selected && styles.filterSelected]}>
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{priority ? `P${priority}` : 'All'}</Text>
            </Pressable>
          );
        })}
      </View>

      {category ? (
        <Pressable onPress={() => router.setParams({ category: undefined })} style={styles.categoryFilter}>
          <Text style={styles.categoryFilterText}>Category: {category}  ×</Text>
        </Pressable>
      ) : null}

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort</Text>
        <Pressable onPress={() => setSortMode('priority')} style={[styles.sortOption, sortMode === 'priority' && styles.sortSelected]}>
          <Text style={[styles.sortOptionText, sortMode === 'priority' && styles.sortSelectedText]}>Priority ↓</Text>
        </Pressable>
        <Pressable onPress={() => setSortMode('custom')} style={[styles.sortOption, sortMode === 'custom' && styles.sortSelected]}>
          <Text style={[styles.sortOptionText, sortMode === 'custom' && styles.sortSelectedText]}>My order</Text>
        </Pressable>
      </View>

      {displayedItems.length ? displayedItems.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onPress={() => router.push(`/item/${item.id}`)}
          moveUp={sortMode === 'custom' ? () => { void nudge(item, -1); } : undefined}
          moveDown={sortMode === 'custom' ? () => { void nudge(item, 1); } : undefined}
        />
      )) : (
        <EmptyState
          title={items.length ? 'No matches found' : 'Start with something you want'}
          detail={items.length ? 'Try another search or clear a filter.' : 'Add your first wishlist item. Your list stays on this device.'}
        />
      )}
      <Text style={styles.footnote}>{formatRupees(total)} estimated across active items</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  headerText: { gap: 5 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
  date: { color: colors.muted, fontSize: 13 },
  addButton: { alignItems: 'center', backgroundColor: colors.green, borderRadius: 17, height: 52, justifyContent: 'center', width: 52 },
  addButtonText: { color: colors.surface, fontSize: 29, fontWeight: '400', lineHeight: 32 },
  stats: { flexDirection: 'row', gap: 11 },
  sectionHeading: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '800', marginTop: 5 },
  count: { color: colors.muted, fontSize: 12, paddingBottom: 3 },
  search: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 14, borderWidth: 1, color: colors.ink, fontSize: 15, paddingHorizontal: 15, paddingVertical: 13 },
  filters: { flexDirection: 'row', gap: 8 },
  filterChip: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 99, borderWidth: 1, minWidth: 49, paddingHorizontal: 14, paddingVertical: 8 },
  filterSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  filterTextSelected: { color: colors.surface },
  categoryFilter: { alignSelf: 'flex-start', backgroundColor: colors.greenLight, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 8 },
  categoryFilterText: { color: colors.green, fontSize: 12, fontWeight: '700' },
  sortRow: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  sortLabel: { color: colors.muted, fontSize: 12, fontWeight: '700', marginRight: 2 },
  sortOption: { borderColor: colors.line, borderRadius: 99, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  sortSelected: { backgroundColor: colors.surface, borderColor: colors.green },
  sortOptionText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  sortSelectedText: { color: colors.green },
  footnote: { color: colors.muted, fontSize: 12, textAlign: 'center' },
});
