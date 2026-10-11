export const colors = {
  background: '#F6F5F1',
  surface: '#FFFFFF',
  ink: '#1D2926',
  muted: '#7D8984',
  line: '#E8EBE6',
  green: '#245D4D',
  greenLight: '#E3F0E9',
  amber: '#B5782E',
  amberLight: '#FBF0DD',
  red: '#B95045',
  redLight: '#F8E8E5',
  lilac: '#7664A2',
  lilacLight: '#EEEAF7',
};

export const priorityLabels: Record<1 | 2 | 3 | 4, string> = {
  1: 'Critical',
  2: 'High',
  3: 'Normal',
  4: 'Later',
};

export const priorityColors: Record<1 | 2 | 3 | 4, { foreground: string; background: string }> = {
  1: { foreground: colors.red, background: colors.redLight },
  2: { foreground: colors.amber, background: colors.amberLight },
  3: { foreground: colors.green, background: colors.greenLight },
  4: { foreground: colors.lilac, background: colors.lilacLight },
};

export function formatRupees(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
