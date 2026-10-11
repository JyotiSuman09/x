import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { deleteItem, getCategories, getItem, saveItem } from '../db/wishlist';
import type { Priority, WishlistItem } from '../types/wishlist';
import { colors, priorityColors, priorityLabels } from '../theme';

const priorities: Priority[] = [1, 2, 3, 4];

export default function ItemFormScreen({ itemId }: { itemId?: string }) {
  const db = useSQLiteContext();
  const [item, setItem] = useState<WishlistItem | null>(null);
  const [loading, setLoading] = useState(Boolean(itemId));
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const [priority, setPriority] = useState<Priority>(3);
  const [category, setCategory] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'purchased'>('active');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const [categories, saved] = await Promise.all([
        getCategories(db),
        itemId ? getItem(db, itemId) : Promise.resolve(null),
      ]);
      if (!mounted) return;
      setSuggestions(categories.map((entry) => entry.category));
      if (saved) {
        setItem(saved);
        setName(saved.name);
        setPrice(String(saved.estimatedPrice));
        setActualPrice(saved.actualPrice == null ? '' : String(saved.actualPrice));
        setPriority(saved.priority);
        setCategory(saved.category);
        setProductUrl(saved.productUrl);
        setNotes(saved.notes);
        setStatus(saved.status);
      }
      setLoading(false);
    }
    void load();
    return () => { mounted = false; };
  }, [db, itemId]);

  async function submit() {
    const cleanName = name.trim();
    const cleanCategory = category.trim();
    const estimate = price.trim() ? Number(price.replace(/,/g, '')) : 0;
    const actual = actualPrice.trim() ? Number(actualPrice.replace(/,/g, '')) : null;
    if (!cleanName) {
      Alert.alert('Name required', 'Add a name for this wishlist item.');
      return;
    }
    if (!cleanCategory) {
      Alert.alert('Category required', 'Add a category, such as Home or Fitness.');
      return;
    }
    if (!Number.isFinite(estimate) || estimate < 0 || (actual != null && (!Number.isFinite(actual) || actual < 0))) {
      Alert.alert('Check the price', 'Prices must be zero or more.');
      return;
    }
    const cleanUrl = productUrl.trim();
    if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
      Alert.alert('Invalid product link', 'Enter a full link beginning with https://');
      return;
    }
    setSaving(true);
    try {
      await saveItem(db, {
        id: itemId,
        name: cleanName,
        estimatedPrice: estimate,
        actualPrice: status === 'purchased' ? actual ?? estimate : null,
        priority,
        category: cleanCategory,
        status,
        productUrl: cleanUrl,
        notes: notes.trim(),
      });
      router.back();
    } catch {
      Alert.alert('Could not save', 'Please try again.');
      setSaving(false);
    }
  }

  function remove() {
    if (!itemId) return;
    Alert.alert('Delete this item?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        void deleteItem(db, itemId).then(() => router.back());
      } },
    ]);
  }

  if (loading) return <View style={styles.loading}><Text style={styles.hint}>Loading item…</Text></View>;
  if (itemId && !item) return <View style={styles.loading}><Text style={styles.hint}>Item not found.</Text><Pressable onPress={() => router.back()}><Text style={styles.link}>Go back</Text></Pressable></View>;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>{itemId ? 'WISHLIST DETAILS' : 'A LITTLE SOMETHING'}</Text>
            <Text style={styles.title}>{itemId ? 'Edit item' : 'Add to wishlist'}</Text>
          </View>
          {itemId ? <Pressable onPress={remove} hitSlop={10}><Text style={styles.delete}>Delete</Text></Pressable> : <View style={styles.headerSpacer} />}
        </View>

        <View style={styles.formCard}>
          <FieldLabel>Item name *</FieldLabel>
          <TextInput value={name} onChangeText={setName} placeholder="e.g. Running shoes" placeholderTextColor={colors.muted} style={styles.input} maxLength={100} returnKeyType="next" />

          <FieldLabel>Estimated price (₹)</FieldLabel>
          <TextInput value={price} onChangeText={setPrice} placeholder="0" placeholderTextColor={colors.muted} style={styles.input} keyboardType="decimal-pad" />

          <FieldLabel>Priority</FieldLabel>
          <View style={styles.priorityRow}>
            {priorities.map((value) => {
              const tint = priorityColors[value];
              const selected = value === priority;
              return (
                <Pressable key={value} onPress={() => setPriority(value)} style={[styles.priorityChoice, { backgroundColor: selected ? tint.background : colors.background, borderColor: selected ? tint.foreground : colors.line }]}>
                  <Text style={[styles.priorityChoiceText, { color: selected ? tint.foreground : colors.muted }]}>P{value}</Text>
                  <Text style={[styles.priorityLabel, { color: selected ? tint.foreground : colors.muted }]}>{priorityLabels[value]}</Text>
                </Pressable>
              );
            })}
          </View>

          <FieldLabel>Category *</FieldLabel>
          <TextInput value={category} onChangeText={setCategory} placeholder="e.g. Fitness" placeholderTextColor={colors.muted} style={styles.input} maxLength={40} returnKeyType="next" />
          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map((value) => (
                <Pressable key={value} onPress={() => setCategory(value)} style={[styles.suggestion, category.toLowerCase() === value.toLowerCase() && styles.suggestionActive]}>
                  <Text style={[styles.suggestionText, category.toLowerCase() === value.toLowerCase() && styles.suggestionTextActive]}>{value}</Text>
                </Pressable>
              ))}
            </View>
          )}

          <FieldLabel>Product link (optional)</FieldLabel>
          <TextInput value={productUrl} onChangeText={setProductUrl} placeholder="https://…" placeholderTextColor={colors.muted} style={styles.input} autoCapitalize="none" keyboardType="url" />

          <FieldLabel>Notes (optional)</FieldLabel>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Size, model, specifications…" placeholderTextColor={colors.muted} style={[styles.input, styles.notes]} multiline textAlignVertical="top" maxLength={500} />

          {item?.productUrl ? (
            <Pressable onPress={() => { void Linking.openURL(item.productUrl); }} style={styles.openLink}>
              <Text style={styles.link}>Open product link  ↗</Text>
            </Pressable>
          ) : null}

          <View style={styles.divider} />
          <Pressable onPress={() => setStatus(status === 'active' ? 'purchased' : 'active')} style={[styles.statusToggle, status === 'purchased' && styles.statusPurchased]}>
            <View style={[styles.check, status === 'purchased' && styles.checkSelected]}>
              {status === 'purchased' && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <View style={styles.statusCopy}>
              <Text style={styles.statusTitle}>{status === 'purchased' ? 'Purchased' : 'Mark as purchased'}</Text>
              <Text style={styles.statusHint}>Keep it in your purchase history</Text>
            </View>
          </Pressable>
          {status === 'purchased' && (
            <>
              <FieldLabel>Actual price (₹, optional)</FieldLabel>
              <TextInput value={actualPrice} onChangeText={setActualPrice} placeholder={price || '0'} placeholderTextColor={colors.muted} style={styles.input} keyboardType="decimal-pad" />
            </>
          )}
        </View>

        <Pressable disabled={saving} onPress={() => { void submit(); }} style={[styles.saveButton, saving && styles.disabled]}>
          <Text style={styles.saveText}>{saving ? 'Saving…' : itemId ? 'Save changes' : 'Add to wishlist'}</Text>
        </Pressable>
        <Text style={styles.localNote}>Your wishlist is saved privately on this device.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  page: { padding: 20, paddingTop: 28, paddingBottom: 40, gap: 16 },
  loading: { alignItems: 'center', backgroundColor: colors.background, flex: 1, justifyContent: 'center', gap: 12 },
  hint: { color: colors.muted, fontSize: 14 },
  header: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  back: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 15, borderWidth: 1, height: 45, justifyContent: 'center', width: 45 },
  backText: { color: colors.ink, fontSize: 34, lineHeight: 38, marginTop: -3 },
  headerCopy: { flex: 1, gap: 3 },
  headerSpacer: { width: 40 },
  eyebrow: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '900' },
  delete: { color: colors.red, fontSize: 13, fontWeight: '800' },
  formCard: { backgroundColor: colors.surface, borderColor: colors.line, borderRadius: 22, borderWidth: 1, padding: 17, gap: 10 },
  fieldLabel: { color: colors.ink, fontSize: 13, fontWeight: '800', marginTop: 6 },
  input: { backgroundColor: colors.background, borderColor: colors.line, borderRadius: 13, borderWidth: 1, color: colors.ink, fontSize: 15, minHeight: 48, paddingHorizontal: 13, paddingVertical: 12 },
  notes: { minHeight: 88 },
  priorityRow: { flexDirection: 'row', gap: 6 },
  priorityChoice: { alignItems: 'center', borderRadius: 13, borderWidth: 1, flex: 1, gap: 3, paddingVertical: 10 },
  priorityChoiceText: { fontSize: 14, fontWeight: '900' },
  priorityLabel: { fontSize: 9, fontWeight: '700' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  suggestion: { backgroundColor: colors.background, borderColor: colors.line, borderRadius: 99, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 },
  suggestionActive: { backgroundColor: colors.greenLight, borderColor: colors.green },
  suggestionText: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  suggestionTextActive: { color: colors.green },
  openLink: { alignSelf: 'flex-start' },
  link: { color: colors.green, fontSize: 13, fontWeight: '800' },
  divider: { backgroundColor: colors.line, height: 1, marginVertical: 3 },
  statusToggle: { alignItems: 'center', backgroundColor: colors.background, borderColor: colors.line, borderRadius: 14, borderWidth: 1, flexDirection: 'row', gap: 12, padding: 12 },
  statusPurchased: { backgroundColor: colors.greenLight, borderColor: colors.green },
  check: { alignItems: 'center', borderColor: colors.muted, borderRadius: 7, borderWidth: 1.5, height: 23, justifyContent: 'center', width: 23 },
  checkSelected: { backgroundColor: colors.green, borderColor: colors.green },
  checkMark: { color: colors.surface, fontSize: 15, fontWeight: '900' },
  statusCopy: { flex: 1, gap: 3 },
  statusTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  statusHint: { color: colors.muted, fontSize: 11 },
  saveButton: { alignItems: 'center', backgroundColor: colors.green, borderRadius: 15, paddingVertical: 16 },
  disabled: { opacity: 0.6 },
  saveText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  localNote: { color: colors.muted, fontSize: 11, textAlign: 'center' },
});
