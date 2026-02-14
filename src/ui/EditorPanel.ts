import { eventBus } from '../core/EventBus';

export class EditorPanel {
  private container: HTMLElement;
  private toggleBtn: HTMLElement;
  private panel: HTMLElement;
  private isOpen = false;

  constructor(parent: HTMLElement) {
    // Toggle button
    this.toggleBtn = document.createElement('div');
    this.toggleBtn.className = 'editor-toggle';
    this.toggleBtn.textContent = 'Editor [E]';
    this.toggleBtn.addEventListener('click', () => this.toggle());
    parent.appendChild(this.toggleBtn);

    // Editor panel
    this.panel = document.createElement('div');
    this.panel.className = 'editor-panel';
    this.panel.innerHTML = `
      <h3>Level Editor</h3>
      <button id="editor-toggle-navmesh">Toggle Nav Mesh Edit</button>
      <button id="editor-toggle-hotspots">Toggle Hotspot Edit</button>
      <button id="editor-add-vertex">Add Vertex (dbl-click ground)</button>
      <button id="editor-add-face">Add Face (select 3 verts)</button>
      <button id="editor-add-hotspot">Add Hotspot (dbl-click)</button>
      <button id="editor-export">Export Level JSON</button>
      <hr style="border-color:rgba(100,100,200,0.3);margin:8px 0">
      <div id="editor-info" style="font-size:11px;color:#888"></div>
    `;
    parent.appendChild(this.panel);

    this.container = parent;

    // Wire up buttons
    this.panel.querySelector('#editor-toggle-navmesh')?.addEventListener('click', () => {
      eventBus.emit('editor:toggleNavMesh');
    });
    this.panel.querySelector('#editor-toggle-hotspots')?.addEventListener('click', () => {
      eventBus.emit('editor:toggleHotspots');
    });
    this.panel.querySelector('#editor-add-vertex')?.addEventListener('click', () => {
      eventBus.emit('editor:addVertex');
    });
    this.panel.querySelector('#editor-add-face')?.addEventListener('click', () => {
      eventBus.emit('editor:addFace');
    });
    this.panel.querySelector('#editor-add-hotspot')?.addEventListener('click', () => {
      eventBus.emit('editor:addHotspot');
    });
    this.panel.querySelector('#editor-export')?.addEventListener('click', () => {
      eventBus.emit('editor:export');
    });

    // Keyboard shortcut
    document.addEventListener('keydown', this.onKeyDown);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'e' || e.key === 'E') {
      // Don't toggle if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      this.toggle();
    }
  };

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.panel.classList.toggle('visible', this.isOpen);
    eventBus.emit('editor:toggle', this.isOpen);
  }

  setInfo(text: string): void {
    const info = this.panel.querySelector('#editor-info');
    if (info) info.textContent = text;
  }

  isEditorOpen(): boolean {
    return this.isOpen;
  }

  dispose(): void {
    document.removeEventListener('keydown', this.onKeyDown);
    this.toggleBtn.remove();
    this.panel.remove();
  }
}
