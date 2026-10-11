import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { migrateDbIfNeeded } from '../db/wishlist';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="wishlist.db" onInit={migrateDbIfNeeded}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="item/new" options={{ presentation: 'modal' }} />
          <Stack.Screen name="item/[id]" options={{ presentation: 'modal' }} />
        </Stack>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
