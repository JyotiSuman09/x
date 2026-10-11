import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { WishlistItem } from '../types/wishlist';
import { colors, formatRupees, priorityColors, priorityLabels } from '../theme';

export function ItemCard({
  item,
  onPress,
  moveUp,
  moveDown,
}: {
  item: WishlistItem;
  onPress: () => void;
  moveUp?: () => void;
  moveDown?: () => void;
}) {
  const badge = priorityColors[item.priority];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <View style={[styles.priority, { backgroundColor: badge.background }]}>
          <Text style={[styles.priorityText, { color: badge.foreground }]}>P{item.priority} · {priorityLabels[item.priority]}</Text>
        </View>
        <Text style={styles.price}>{formatRupees(item.status === 'purchased' ? item.actualPrice ?? item.estimatedPrice : item.estimatedPrice)}</Text>
      </View>
      <Text style={[styles.name, item.status === 'purchased' && styles.purchasedName]} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <View style={styles.bottomRow}>
        <Text style={styles.itemCaption}>{item.status === 'purchased' ? 'Purchased' : 'Estimated price'}</Text>
        {(moveUp || moveDown) && (
          <View style={styles.orderControls}>
            {moveUp && <Pressable accessibilityLabel="Move item up" onPress={moveUp} hitSlop={8}><Text style={styles.orderIcon}>↑</Text></Pressable>}
            {moveDown && <Pressable accessibilityLabel="Move item down" onPress={moveDown} hitSlop={8}><Text style={styles.orderIcon}>↓</Text></Pressable>}
          </View>
        )}
        <Text style={styles.editHint}>Open details  ›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 20, borderWidth: 1, padding: 14, gap: 8 },
  pressed: { opacity: 0.8 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  priority: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  priorityText: { fontSize: 11, fontWeight: '800' },
  price: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  name: { color: colors.ink, fontSize: 17, fontWeight: '800', lineHeight: 23 },
  purchasedName: { textDecorationLine: 'line-through' },
  category: { color: colors.muted, fontSize: 13 },
  bottomRow: { alignItems: 'center', borderTopColor: colors.line, borderTopWidth: 1, flexDirection: 'row', gap: 10, marginTop: 3, paddingTop: 10 },
  itemCaption: { color: colors.muted, flex: 1, fontSize: 12 },
  orderControls: { flexDirection: 'row', gap: 14 },
  orderIcon: { color: colors.green, fontSize: 19, fontWeight: '800' },
  editHint: { color: colors.green, fontSize: 12, fontWeight: '700' },
});
