import type { SQLiteDatabase } from 'expo-sqlite';
import type { CategorySummary, ItemStatus, WishlistItem, WishlistItemInput } from '../types/wishlist';

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      estimated_price REAL NOT NULL DEFAULT 0,
      actual_price REAL,
      priority INTEGER NOT NULL DEFAULT 3,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      sort_order INTEGER NOT NULL DEFAULT 0,
      product_url TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      purchased_at TEXT
    );
    CREATE INDEX IF NOT EXISTS wishlist_status_priority
      ON wishlist_items(status, priority, sort_order);
  `);
}

const itemColumns = `
  id, name, estimated_price AS estimatedPrice, actual_price AS actualPrice,
  priority, category, status, sort_order AS sortOrder, product_url AS productUrl,
  notes, created_at AS createdAt, purchased_at AS purchasedAt
`;

export async function getItems(db: SQLiteDatabase, status: ItemStatus): Promise<WishlistItem[]> {
  const order = status === 'active' ? 'priority ASC, sort_order ASC' : 'purchased_at DESC';
  return db.getAllAsync<WishlistItem>(
    `SELECT ${itemColumns} FROM wishlist_items WHERE status = ? ORDER BY ${order}`,
    status,
  );
}

export async function getItem(db: SQLiteDatabase, id: string): Promise<WishlistItem | null> {
  return db.getFirstAsync<WishlistItem>(
    `SELECT ${itemColumns} FROM wishlist_items WHERE id = ?`,
    id,
  );
}

export async function saveItem(db: SQLiteDatabase, item: WishlistItemInput): Promise<void> {
  const now = new Date().toISOString();
  if (item.id) {
    await db.runAsync(
      `UPDATE wishlist_items SET name = ?, estimated_price = ?, actual_price = ?, priority = ?,
       category = ?, status = ?, product_url = ?, notes = ?,
       purchased_at = CASE WHEN ? = 'purchased' THEN COALESCE(purchased_at, ?) ELSE NULL END
       WHERE id = ?`,
      item.name, item.estimatedPrice, item.actualPrice, item.priority, item.category,
      item.status, item.productUrl, item.notes, item.status, now, item.id,
    );
    return;
  }

  const nextOrder = await db.getFirstAsync<{ nextOrder: number }>(
    'SELECT COALESCE(MAX(sort_order), -1) + 1 AS nextOrder FROM wishlist_items WHERE status = \'active\'',
  );
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  await db.runAsync(
    `INSERT INTO wishlist_items
      (id, name, estimated_price, actual_price, priority, category, status, sort_order,
       product_url, notes, created_at, purchased_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, item.name, item.estimatedPrice, item.actualPrice, item.priority, item.category,
    item.status, nextOrder?.nextOrder ?? 0, item.productUrl, item.notes, now,
    item.status === 'purchased' ? now : null,
  );
}

export async function deleteItem(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM wishlist_items WHERE id = ?', id);
}

export async function moveItem(
  db: SQLiteDatabase,
  items: WishlistItem[],
  index: number,
  direction: -1 | 1,
): Promise<void> {
  const otherIndex = index + direction;
  if (otherIndex < 0 || otherIndex >= items.length) return;
  const current = items[index];
  const other = items[otherIndex];
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE wishlist_items SET sort_order = ? WHERE id = ?', other.sortOrder, current.id);
    await db.runAsync('UPDATE wishlist_items SET sort_order = ? WHERE id = ?', current.sortOrder, other.id);
  });
}

export async function getCategories(db: SQLiteDatabase): Promise<CategorySummary[]> {
  return db.getAllAsync<CategorySummary>(`
    SELECT category, COUNT(*) AS itemCount, COALESCE(SUM(estimated_price), 0) AS estimatedTotal
    FROM wishlist_items WHERE status = 'active'
    GROUP BY category ORDER BY category COLLATE NOCASE
  `);
}

export interface BudgetSummary {
  activeCount: number;
  activeTotal: number;
  purchasedCount: number;
  purchasedTotal: number;
}

export async function getBudgetSummary(db: SQLiteDatabase): Promise<BudgetSummary> {
  const result = await db.getFirstAsync<BudgetSummary>(`
    SELECT
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeCount,
      COALESCE(SUM(CASE WHEN status = 'active' THEN estimated_price ELSE 0 END), 0) AS activeTotal,
      SUM(CASE WHEN status = 'purchased' THEN 1 ELSE 0 END) AS purchasedCount,
      COALESCE(SUM(CASE WHEN status = 'purchased' THEN COALESCE(actual_price, estimated_price) ELSE 0 END), 0) AS purchasedTotal
    FROM wishlist_items
  `);
  return result ?? { activeCount: 0, activeTotal: 0, purchasedCount: 0, purchasedTotal: 0 };
}
