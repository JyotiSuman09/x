export const colors = {
  background: '#111315',
  surface: '#1F2228',
  ink: '#F2F4F3',
  muted: '#9AA1AA',
  line: '#343840',
  green: '#70D6A7',
  greenLight: '#21382F',
  amber: '#F2BD70',
  amberLight: '#3A3021',
  red: '#F18C86',
  redLight: '#3A2526',
  lilac: '#B9A9F5',
  lilacLight: '#302A42',
};

export const categoryPalette = [
  colors.green,
  colors.amber,
  colors.lilac,
  colors.red,
  '#67C7D4',
  '#ED9D72',
  '#E58CB5',
  '#83A9F5',
  '#A5C76B',
  '#D59AE8',
];

export const priorityLabels: Record<1 | 2 | 3 | 4, string> = {
  1: 'Must Have',
  2: 'Next Up',
  3: 'Nice to Have',
  4: 'Someday',
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
