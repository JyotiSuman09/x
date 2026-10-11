import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

const BAR = colors.surface;
const ACTIVE = colors.green;
const INACTIVE = colors.muted;
const CENTER_GAP = 62;

const tabs = [
  { name: 'index', label: 'Home', icon: '⌂' },
  { name: 'categories', label: 'Categories', icon: '▦' },
  { name: 'budget', label: 'Budget', icon: '₹' },
  { name: 'purchased', label: 'More', icon: '•••' },
] as const;

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const safeBottom = Math.max(insets.bottom, 8);

  function renderTab(tab: (typeof tabs)[number]) {
    const routeIndex = state.routes.findIndex((route) => route.name === tab.name);
    const route = state.routes[routeIndex];
    if (!route) return null;

    const focused = state.index === routeIndex;
    const color = focused ? ACTIVE : INACTIVE;
    const options = descriptors[route.key]?.options;

    function onPress() {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
    }

    return (
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={focused ? { selected: true } : {}}
        accessibilityLabel={options?.tabBarAccessibilityLabel ?? tab.label}
        onPress={onPress}
        onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
        android_ripple={{ color: '#245D4D12', borderless: true }}
        style={styles.tab}
      >
        <Text style={[styles.icon, tab.icon === '•••' && styles.moreIcon, { color }]}>{tab.icon}</Text>
        <Text numberOfLines={1} style={[styles.label, { color }]}>{tab.label}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.wrapper, { height: 118 + safeBottom }]}>
      <View style={[styles.bar, { height: 86 + safeBottom, paddingBottom: safeBottom }]}>
        <View style={styles.group}>
          {renderTab(tabs[0])}
          {renderTab(tabs[1])}
        </View>
        <View style={{ width: CENTER_GAP }} />
        <View style={styles.group}>
          {renderTab(tabs[2])}
          {renderTab(tabs[3])}
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add wishlist item"
        onPress={() => router.push('/item/new')}
        style={({ pressed }) => [styles.addButtonHitArea, pressed && styles.addPressed]}
      >
        <View style={styles.addButtonCircle}>
          <Text style={styles.plus}>＋</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    justifyContent: 'flex-start',
    position: 'relative',
    width: '100%',
  },
  bar: {
    alignItems: 'center',
    backgroundColor: BAR,
    borderColor: colors.line,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    width: '100%',
  },
  group: { flex: 1, flexDirection: 'row', height: '100%' },
  tab: { alignItems: 'center', borderRadius: 18, flex: 1, justifyContent: 'center', minWidth: 0, paddingTop: 5 },
  icon: { fontSize: 21, fontWeight: '700', height: 27, lineHeight: 26, textAlign: 'center' },
  moreIcon: { fontSize: 15, letterSpacing: 1, lineHeight: 25 },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.1, marginTop: 1 },
  addButtonHitArea: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -36,
    position: 'absolute',
    top: 0,
    width: 72,
    zIndex: 2,
  },
  addButtonCircle: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 6,
    height: 64,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 5,
    width: 64,
  },
  addPressed: { opacity: 0.88, transform: [{ scale: 0.96 }] },
  plus: { color: '#1F2026', fontSize: 31, fontWeight: '400', lineHeight: 35, marginTop: -1 },
});
