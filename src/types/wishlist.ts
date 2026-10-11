export type Priority = 1 | 2 | 3 | 4;
export type ItemStatus = 'active' | 'purchased';

export interface WishlistItem {
  id: string;
  name: string;
  estimatedPrice: number;
  actualPrice: number | null;
  priority: Priority;
  category: string;
  status: ItemStatus;
  sortOrder: number;
  productUrl: string;
  notes: string;
  createdAt: string;
  purchasedAt: string | null;
}

export interface WishlistItemInput {
  id?: string;
  name: string;
  estimatedPrice: number;
  actualPrice: number | null;
  priority: Priority;
  category: string;
  status: ItemStatus;
  productUrl: string;
  notes: string;
}

export interface CategorySummary {
  category: string;
  itemCount: number;
  estimatedTotal: number;
}
