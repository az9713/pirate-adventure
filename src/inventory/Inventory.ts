import { eventBus } from '../core/EventBus';
import type { ItemDef } from '../types/GameTypes';

export class Inventory {
  private items = new Map<string, ItemDef>();
  private coins = 0;

  addItem(item: ItemDef): void {
    this.items.set(item.id, item);
    eventBus.emit('inventory:changed');
  }

  removeItem(id: string): void {
    this.items.delete(id);
    eventBus.emit('inventory:changed');
  }

  hasItem(id: string): boolean {
    return this.items.has(id);
  }

  getItems(): ItemDef[] {
    return Array.from(this.items.values());
  }

  addCoin(): void {
    this.coins++;
    eventBus.emit('inventory:changed');
  }

  getCoinCount(): number {
    return this.coins;
  }
}

export const inventory = new Inventory();
