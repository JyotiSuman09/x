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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.category}, ${formatRupees(item.status === 'purchased' ? item.actualPrice ?? item.estimatedPrice : item.estimatedPrice)}`}
      accessibilityHint="Opens item details"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <Text style={[styles.name, item.status === 'purchased' && styles.purchasedName]} numberOfLines={2}>{item.name}</Text>
        <View style={styles.meta}>
          <Text style={styles.category} numberOfLines={1}>{item.category}</Text>
          <View style={[styles.priority, { backgroundColor: badge.background }]}>
            <Text style={[styles.priorityText, { color: badge.foreground }]}>P{item.priority} · {priorityLabels[item.priority]}</Text>
          </View>
        </View>
      </View>
      <View style={styles.trailing}>
        <Text style={styles.price} numberOfLines={1}>{formatRupees(item.status === 'purchased' ? item.actualPrice ?? item.estimatedPrice : item.estimatedPrice)}</Text>
        {(moveUp || moveDown) && (
          <View style={styles.orderControls}>
            {moveUp && <Pressable accessibilityRole="button" accessibilityLabel="Move item up" onPress={moveUp} hitSlop={8} style={styles.orderButton}><Text style={styles.orderIcon}>↑</Text></Pressable>}
            {moveDown && <Pressable accessibilityRole="button" accessibilityLabel="Move item down" onPress={moveDown} hitSlop={8} style={styles.orderButton}><Text style={styles.orderIcon}>↓</Text></Pressable>}
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 68,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  pressed: { opacity: 0.86 },
  copy: { flex: 1, gap: 4, paddingRight: 12 },
  meta: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  priority: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  priorityText: { fontSize: 10, fontWeight: '800' },
  trailing: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 74 },
  price: { color: colors.ink, fontSize: 15, fontWeight: '800', maxWidth: 120, textAlign: 'right' },
  name: { color: colors.ink, fontSize: 16, fontWeight: '800', lineHeight: 20 },
  purchasedName: { textDecorationLine: 'line-through' },
  category: { color: colors.muted, flexShrink: 1, fontSize: 12 },
  orderControls: { flexDirection: 'row', gap: 2, marginTop: 1 },
  orderButton: { alignItems: 'center', height: 28, justifyContent: 'center', width: 28 },
  orderIcon: { color: colors.green, fontSize: 16, fontWeight: '800' },
});
