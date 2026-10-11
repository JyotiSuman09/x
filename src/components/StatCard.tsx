import { StyleSheet, Text, View } from 'react-native';
import { colors, formatRupees } from '../theme';

export function StatCard({ label, amount, displayValue, detail, tone = 'green' }: { label: string; amount: number; displayValue?: string; detail: string; tone?: 'green' | 'lilac' }) {
  const accent = tone === 'green' ? colors.green : colors.lilac;
  return (
    <View style={styles.card}>
      <Text style={[styles.label, { color: accent }]}>{label}</Text>
      <Text style={styles.amount}>{displayValue ?? formatRupees(amount)}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 112,
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  label: { fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  amount: { color: colors.ink, fontSize: 23, fontWeight: '900' },
  detail: { color: colors.muted, fontSize: 12 },
});
