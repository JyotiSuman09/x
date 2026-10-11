import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const content = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
    </SafeAreaView>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyMark}>✳</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDetail}>{detail}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 18 },
  eyebrow: { color: colors.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' },
  empty: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 24, borderWidth: 1, paddingHorizontal: 24, paddingVertical: 34, gap: 9 },
  emptyMark: { color: colors.green, fontSize: 28, marginBottom: 4 },
  emptyTitle: { color: colors.ink, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyDetail: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center' },
});
