import { StyleSheet, Text, View } from 'react-native';
import { colors, formatRupees } from '../theme';

export function StatCard({ label, amount, displayValue, detail, tone = 'green' }: { label: string; amount: number; displayValue?: string; detail: string; tone?: 'green' | 'lilac' }) {
  const tint = tone === 'green' ? colors.greenLight : colors.lilacLight;
  const accent = tone === 'green' ? colors.green : colors.lilac;
  return (
    <View style={[styles.card, { backgroundColor: tint }]}>
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
      <Text style={styles.amount}>{displayValue ?? formatRupees(amount)}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, flex: 1, minHeight: 120, padding: 16, justifyContent: 'space-between' },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  amount: { color: colors.ink, fontSize: 23, fontWeight: '900' },
  detail: { color: colors.muted, fontSize: 12 },
});
