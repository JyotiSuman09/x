import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { EmptyState, Eyebrow, Screen } from '../../components/Screen';
import { StatCard } from '../../components/StatCard';
import { getBudgetSummary, getCategories } from '../../db/wishlist';
import type { BudgetSummary } from '../../db/wishlist';
import type { CategorySummary } from '../../types/wishlist';
import { colors, formatRupees } from '../../theme';

const zero: BudgetSummary = { activeCount: 0, activeTotal: 0, purchasedCount: 0, purchasedTotal: 0 };

export default function BudgetScreen() {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState(zero);
  const [categories, setCategories] = useState<CategorySummary[]>([]);

  useFocusEffect(useCallback(() => {
    let active = true;
    Promise.all([getBudgetSummary(db), getCategories(db)]).then(([totals, grouped]) => {
      if (active) { setSummary(totals); setCategories(grouped); }
    });
    return () => { active = false; };
  }, [db]));

  return (
    <Screen>
      <View style={styles.heading}>
        <Eyebrow>MAKE ROOM FOR WHAT MATTERS</Eyebrow>
        <Text style={styles.title}>Your budget</Text>
        <Text style={styles.subtitle}>Wishlist plans and completed purchases, kept separate.</Text>
      </View>
      <View style={styles.stats}>
        <StatCard label="STILL TO BUY" amount={summary.activeTotal} detail={`${summary.activeCount} active items`} />
        <StatCard label="PURCHASED" amount={summary.purchasedTotal} detail={`${summary.purchasedCount} items`} tone="lilac" />
      </View>
      <View style={styles.section}>
        <Eyebrow>ACTIVE WISHLIST</Eyebrow>
        <Text style={styles.sectionTitle}>Estimated by category</Text>
      </View>
      {categories.length ? categories.map((category) => (
        <View key={category.category} style={styles.row}>
          <View style={styles.categoryInfo}>
            <Text style={styles.category}>{category.category}</Text>
            <Text style={styles.count}>{category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}</Text>
          </View>
          <Text style={styles.amount}>{formatRupees(category.estimatedTotal)}</Text>
        </View>
      )) : (
        <EmptyState title="Nothing to budget yet" detail="Your active wishlist totals will appear here when you add items." />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 6 },
  title: { color: colors.ink, fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  stats: { flexDirection: 'row', gap: 11, marginTop: 6 },
  section: { gap: 5, marginTop: 5 },
  sectionTitle: { color: colors.ink, fontSize: 21, fontWeight: '800' },
  row: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 16, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  categoryInfo: { gap: 4 },
  category: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  count: { color: colors.muted, fontSize: 12 },
  amount: { color: colors.ink, fontSize: 16, fontWeight: '800' },
});
