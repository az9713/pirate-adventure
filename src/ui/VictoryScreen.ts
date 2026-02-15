import { eventBus } from '../core/EventBus';
import { inventory } from '../inventory/Inventory';

const TOTAL_COINS = 6;

export class VictoryScreen {
  private parent: HTMLElement;
  private element: HTMLElement | null = null;

  constructor(parent: HTMLElement) {
    this.parent = parent;
  }

  show(startTime: number): void {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const coins = inventory.getCoinCount();
    const items = inventory.getItems();

    this.element = document.createElement('div');
    this.element.className = 'victory-screen';

    const title = document.createElement('div');
    title.className = 'victory-title';
    title.textContent = 'Victory!';
    this.element.appendChild(title);

    const stats = document.createElement('div');
    stats.className = 'victory-stats';
    stats.innerHTML = `
      <div><span class="stat-label">Gold Coins: </span><span class="stat-value">&#x1FA99; ${coins} / ${TOTAL_COINS}</span></div>
      <div><span class="stat-label">Play Time: </span><span class="stat-value">${timeStr}</span></div>
    `;
    this.element.appendChild(stats);

    if (items.length > 0) {
      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'victory-items';
      for (const item of items) {
        const slot = document.createElement('div');
        slot.className = 'inventory-item';
        slot.innerHTML = `<span class="item-icon">${item.icon}</span><span class="item-name">${item.name}</span>`;
        itemsDiv.appendChild(slot);
      }
      this.element.appendChild(itemsDiv);
    }

    const btn = document.createElement('button');
    btn.className = 'victory-btn';
    btn.textContent = 'Play Again';
    btn.addEventListener('click', () => location.reload());
    this.element.appendChild(btn);

    this.parent.appendChild(this.element);
  }

  dispose(): void {
    this.element?.remove();
  }
}
