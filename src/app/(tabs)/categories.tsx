import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg';
import { Screen } from '../../components/Screen';
import { getCategories } from '../../db/wishlist';
import type { CategorySummary } from '../../types/wishlist';
import { categoryPalette, colors, formatRupees } from '../../theme';

const CHART_SIZE = 196;
const CHART_CENTER = CHART_SIZE / 2;
const OUTER_RADIUS = 76;
const INNER_RADIUS = 51;
const LABEL_RADIUS = (OUTER_RADIUS + INNER_RADIUS) / 2;

interface CategorySlice {
  category: CategorySummary;
  color: string;
  percentage: number;
  startAngle: number;
}

export default function CategoriesScreen() {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState<CategorySummary[]>([]);

  useFocusEffect(useCallback(() => {
    let active = true;
    getCategories(db).then((data) => { if (active) setCategories(data); });
    return () => { active = false; };
  }, [db]));

  const total = categories.reduce((sum, category) => sum + category.estimatedTotal, 0);
  const slices = categories.reduce((acc, category, index) => {
    const percentage = total > 0 ? category.estimatedTotal / total * 100 : 0;
    const slice = {
      category,
      color: categoryPalette[index % categoryPalette.length],
      percentage,
      startAngle: acc.nextAngle,
    };
    return {
      nextAngle: acc.nextAngle + percentage / 100 * 360,
      slices: [...acc.slices, slice],
    };
  }, { nextAngle: -90, slices: [] as CategorySlice[] }).slices;
  const nonZeroSliceCount = slices.filter((slice) => slice.percentage > 0).length;

  return (
    <Screen>
      <View style={styles.card}>
        <View style={styles.heading}>
          <Text style={styles.title}>Category breakdown</Text>
          <Text style={styles.subtitle}>Active wishlist</Text>
        </View>

        <View style={styles.chart}>
          <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
            <Circle
              cx={CHART_CENTER}
              cy={CHART_CENTER}
              r={LABEL_RADIUS}
              fill="none"
              stroke={colors.line}
              strokeWidth={OUTER_RADIUS - INNER_RADIUS}
            />
            {slices.map((slice, index) => {
              if (slice.percentage <= 0) return null;
              if (nonZeroSliceCount === 1) {
                return (
                  <Circle
                    key={slice.category.category}
                    cx={CHART_CENTER}
                    cy={CHART_CENTER}
                    r={LABEL_RADIUS}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={OUTER_RADIUS - INNER_RADIUS}
                  />
                );
              }

              const endAngle = slice.startAngle + slice.percentage / 100 * 360;
              const startOuter = pointAtAngle(slice.startAngle, OUTER_RADIUS);
              const endOuter = pointAtAngle(endAngle, OUTER_RADIUS);
              const startInner = pointAtAngle(slice.startAngle, INNER_RADIUS);
              const endInner = pointAtAngle(endAngle, INNER_RADIUS);
              const largeArc = endAngle - slice.startAngle > 180 ? 1 : 0;
              const path = [
                `M ${startOuter.x} ${startOuter.y}`,
                `A ${OUTER_RADIUS} ${OUTER_RADIUS} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
                `L ${endInner.x} ${endInner.y}`,
                `A ${INNER_RADIUS} ${INNER_RADIUS} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
                'Z',
              ].join(' ');

              const midpoint = slice.startAngle + (endAngle - slice.startAngle) / 2;
              const label = pointAtAngle(midpoint, LABEL_RADIUS);
              return (
                <G key={slice.category.category}>
                  <Path d={path} fill={slice.color} />
                  {slice.percentage >= 7 && (
                    <SvgText
                      x={label.x}
                      y={label.y + 3}
                      fill={colors.background}
                      fontSize={9}
                      fontWeight="700"
                      textAnchor="middle"
                    >
                      {`${Math.round(slice.percentage)}%`}
                    </SvgText>
                  )}
                </G>
              );
            })}
          </Svg>
          <View pointerEvents="none" style={styles.chartCenter}>
            <Text style={styles.centerLabel}>{total > 0 ? 'ACTIVE TOTAL' : 'NO ESTIMATE'}</Text>
            <Text style={styles.centerTotal}>{formatRupees(total)}</Text>
          </View>
        </View>

        {categories.length ? (
          <View style={styles.list}>
            {slices.map(({ category, color, percentage }) => (
            <Pressable
              key={category.category}
              accessibilityRole="button"
              accessibilityLabel={`${category.category}, ${formatRupees(category.estimatedTotal)}, ${Math.round(percentage)} percent`}
              onPress={() => router.push({ pathname: '/', params: { category: category.category } })}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={[styles.categoryIcon, { backgroundColor: color }]}>
                <Text style={styles.categoryInitial}>{category.category.trim().charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.categoryName} numberOfLines={1}>{category.category}</Text>
              <View style={styles.amounts}>
                <Text style={styles.total}>{formatRupees(category.estimatedTotal)}</Text>
                <Text style={styles.percentage}>{`${Math.round(percentage)}%`}</Text>
              </View>
            </Pressable>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>Add active wishlist items to see your category breakdown.</Text>
        )}
      </View>
    </Screen>
  );
}

function pointAtAngle(angle: number, radius: number) {
  const radians = angle * Math.PI / 180;
  return {
    x: CHART_CENTER + radius * Math.cos(radians),
    y: CHART_CENTER + radius * Math.sin(radians),
  };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  heading: { gap: 3 },
  title: { color: colors.ink, fontSize: 19, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 12 },
  chart: { alignItems: 'center', height: CHART_SIZE, justifyContent: 'center', alignSelf: 'center', width: CHART_SIZE },
  chartCenter: { alignItems: 'center', justifyContent: 'center', position: 'absolute' },
  centerLabel: { color: colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  centerTotal: { color: colors.ink, fontSize: 17, fontWeight: '800', marginTop: 3 },
  list: { borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth },
  row: {
    alignItems: 'center',
    borderBottomColor: colors.line,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 11,
    minHeight: 54,
    paddingVertical: 7,
  },
  pressed: { opacity: 0.72 },
  categoryIcon: { alignItems: 'center', borderRadius: 9, height: 32, justifyContent: 'center', width: 32 },
  categoryInitial: { color: colors.background, fontSize: 14, fontWeight: '900' },
  categoryName: { color: colors.ink, flex: 1, fontSize: 14, fontWeight: '600' },
  amounts: { alignItems: 'flex-end', gap: 1 },
  total: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  percentage: { color: colors.muted, fontSize: 10 },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 19, paddingBottom: 2, textAlign: 'center' },
});
