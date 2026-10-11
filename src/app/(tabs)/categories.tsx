import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { EmptyState, Eyebrow, Screen } from '../../components/Screen';
import { getCategories } from '../../db/wishlist';
import type { CategorySummary } from '../../types/wishlist';
import { colors, formatRupees } from '../../theme';

const accents = [colors.green, colors.amber, colors.lilac, colors.red];

export default function CategoriesScreen() {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState<CategorySummary[]>([]);

  useFocusEffect(useCallback(() => {
    let active = true;
    getCategories(db).then((data) => { if (active) setCategories(data); });
    return () => { active = false; };
  }, [db]));

  return (
    <Screen>
      <View style={styles.heading}>
        <Eyebrow>SHOP WITH A PLAN</Eyebrow>
        <Text style={styles.title}>Categories</Text>
        <Text style={styles.subtitle}>A clear view of what you’re saving for.</Text>
      </View>
      {categories.length ? (
        <View style={styles.grid}>
          {categories.map((category, index) => (
            <Pressable
              key={category.category}
              onPress={() => router.push({ pathname: '/', params: { category: category.category } })}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={[styles.dot, { backgroundColor: accents[index % accents.length] }]} />
              <Text style={styles.categoryName} numberOfLines={2}>{category.category}</Text>
              <Text style={styles.count}>{category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}</Text>
              <Text style={styles.total}>{formatRupees(category.estimatedTotal)}</Text>
              <Text style={styles.link}>View items  ›</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState title="Your categories will show here" detail="Add an item and give it a category, like Home, Fitness, or Electronics." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 6, marginBottom: 2 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 20, borderWidth: 1, flexBasis: '47%', flexGrow: 1, minHeight: 190, padding: 16 },
  pressed: { opacity: 0.8 },
  dot: { borderRadius: 5, height: 10, marginBottom: 14, width: 10 },
  categoryName: { color: colors.ink, fontSize: 17, fontWeight: '800', minHeight: 42 },
  count: { color: colors.muted, fontSize: 12, marginTop: 3 },
  total: { color: colors.ink, fontSize: 20, fontWeight: '900', marginTop: 15 },
  link: { color: colors.green, fontSize: 12, fontWeight: '700', marginTop: 8 },
});
