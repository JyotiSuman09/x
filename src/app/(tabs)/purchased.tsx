import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ItemCard } from '../../components/ItemCard';
import { EmptyState, Eyebrow, Screen } from '../../components/Screen';
import { getItems } from '../../db/wishlist';
import type { WishlistItem } from '../../types/wishlist';
import { colors } from '../../theme';

export default function PurchasedScreen() {
  const db = useSQLiteContext();
  const [items, setItems] = useState<WishlistItem[]>([]);

  useFocusEffect(useCallback(() => {
    let active = true;
    getItems(db, 'purchased').then((data) => { if (active) setItems(data); });
    return () => { active = false; };
  }, [db]));

  return (
    <Screen>
      <View style={styles.heading}>
        <Eyebrow>GOOD THINGS, CHECKED OFF</Eyebrow>
        <Text style={styles.title}>More</Text>
        <Text style={styles.subtitle}>Your purchase history and more ways to plan.</Text>
      </View>
      <View style={styles.tools}>
        <Text style={styles.toolsTitle}>YOUR TOOLS</Text>
        <View style={styles.toolRow}>
          <Text style={styles.toolIcon}>▤</Text>
          <View style={styles.toolCopy}>
            <Text style={styles.toolTitle}>Purchased history</Text>
            <Text style={styles.toolDescription}>Your checked-off wishlist items</Text>
          </View>
          <Text style={styles.toolArrow}>↓</Text>
        </View>
        {[
          { icon: '▣', title: 'Archived items' },
          { icon: '⚙', title: 'Settings' },
          { icon: '⇧', title: 'Export data' },
        ].map((tool) => (
          <View key={tool.title} style={styles.toolRow}>
            <Text style={styles.toolIcon}>{tool.icon}</Text>
            <Text style={[styles.toolTitle, styles.toolCopy]}>{tool.title}</Text>
            <Text style={styles.comingSoon}>SOON</Text>
          </View>
        ))}
      </View>
      <View style={styles.historyHeading}>
        <Text style={styles.historyTitle}>Purchase history</Text>
        <Text style={styles.historyCount}>{items.length} {items.length === 1 ? 'item' : 'items'}</Text>
      </View>
      {items.length ? items.map((item) => (
        <ItemCard key={item.id} item={item} onPress={() => router.push(`/item/${item.id}`)} />
      )) : (
        <EmptyState title="Your first purchase is waiting" detail="When you buy something from your wishlist, mark it purchased to keep a record here." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 6, marginBottom: 3 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 14 },
  tools: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 19, borderWidth: 1, overflow: 'hidden' },
  toolsTitle: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, paddingHorizontal: 15, paddingTop: 14, paddingBottom: 5 },
  toolRow: { alignItems: 'center', borderTopColor: colors.line, borderTopWidth: 1, flexDirection: 'row', gap: 12, minHeight: 57, paddingHorizontal: 15 },
  toolIcon: { color: colors.green, fontSize: 18, fontWeight: '700', textAlign: 'center', width: 23 },
  toolCopy: { flex: 1 },
  toolTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  toolDescription: { color: colors.muted, fontSize: 11, marginTop: 3 },
  toolArrow: { color: colors.green, fontSize: 17, fontWeight: '800' },
  comingSoon: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.7 },
  historyHeading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  historyTitle: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  historyCount: { color: colors.muted, fontSize: 12 },
});
