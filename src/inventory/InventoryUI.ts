import { eventBus } from '../core/EventBus';
import { inventory } from './Inventory';

const TOTAL_COINS = 6;

export class InventoryUI {
  private container: HTMLElement;
  private coinCounter!: HTMLElement;
  private itemSlots!: HTMLElement;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'inventory-bar';
    parent.appendChild(this.container);

    this.createCoinCounter();
    this.createItemSlots();

    eventBus.on('inventory:changed', this.render);
    eventBus.on('coin:collected', this.showCoinPopup as (...args: unknown[]) => void);
    this.render();
  }

  private createCoinCounter(): void {
    this.coinCounter = document.createElement('div');
    this.coinCounter.className = 'coin-counter';
    this.container.appendChild(this.coinCounter);
  }

  private createItemSlots(): void {
    this.itemSlots = document.createElement('div');
    this.itemSlots.className = 'item-slots';
    this.container.appendChild(this.itemSlots);
  }

  private render = (): void => {
    const count = inventory.getCoinCount();
    this.coinCounter.innerHTML = `<span class="coin-icon">&#x1FA99;</span> ${count} / ${TOTAL_COINS}`;

    this.itemSlots.innerHTML = '';
    for (const item of inventory.getItems()) {
      const slot = document.createElement('div');
      slot.className = 'inventory-item';
      slot.innerHTML = `<span class="item-icon">${item.icon}</span><span class="item-name">${item.name}</span>`;
      slot.title = item.description;
      this.itemSlots.appendChild(slot);
    }
  };

  private showCoinPopup = (_id: unknown): void => {
    const popup = document.createElement('div');
    popup.className = 'coin-popup';
    popup.textContent = '+1';
    this.container.appendChild(popup);
    popup.addEventListener('animationend', () => popup.remove());
  };

  dispose(): void {
    eventBus.off('inventory:changed', this.render);
    eventBus.off('coin:collected', this.showCoinPopup as (...args: unknown[]) => void);
    this.container.remove();
  }
}
