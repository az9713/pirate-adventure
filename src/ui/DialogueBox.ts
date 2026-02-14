export class DialogueBox {
  private container: HTMLElement;
  private speakerEl: HTMLElement;
  private textEl: HTMLElement;
  private advanceEl: HTMLElement;
  private advanceCallback: (() => void) | null = null;
  private typewriterTimer: number | null = null;
  private fullText = '';
  private charIndex = 0;

  constructor(parent: HTMLElement) {
    this.container = document.createElement('div');
    this.container.className = 'dialogue-box';

    this.speakerEl = document.createElement('div');
    this.speakerEl.className = 'dialogue-speaker';

    this.textEl = document.createElement('div');
    this.textEl.className = 'dialogue-text';

    this.advanceEl = document.createElement('div');
    this.advanceEl.className = 'dialogue-advance';
    this.advanceEl.textContent = 'Click to continue...';

    this.container.appendChild(this.speakerEl);
    this.container.appendChild(this.textEl);
    this.container.appendChild(this.advanceEl);

    parent.appendChild(this.container);

    this.container.addEventListener('click', this.onClick);
  }

  show(speaker: string, text: string): void {
    this.speakerEl.textContent = speaker;
    this.fullText = text;
    this.charIndex = 0;
    this.textEl.textContent = '';
    this.container.classList.add('visible');
    this.advanceEl.style.visibility = 'hidden';

    this.startTypewriter();
  }

  hide(): void {
    this.container.classList.remove('visible');
    this.stopTypewriter();
  }

  onAdvance(cb: () => void): void {
    this.advanceCallback = cb;
  }

  private onClick = (): void => {
    if (this.charIndex < this.fullText.length) {
      // Skip to end of typewriter
      this.stopTypewriter();
      this.textEl.textContent = this.fullText;
      this.charIndex = this.fullText.length;
      this.advanceEl.style.visibility = 'visible';
    } else {
      this.advanceCallback?.();
    }
  };

  private startTypewriter(): void {
    this.stopTypewriter();
    this.typewriterTimer = window.setInterval(() => {
      if (this.charIndex < this.fullText.length) {
        this.charIndex++;
        this.textEl.textContent = this.fullText.slice(0, this.charIndex);
      } else {
        this.stopTypewriter();
        this.advanceEl.style.visibility = 'visible';
      }
    }, 30);
  }

  private stopTypewriter(): void {
    if (this.typewriterTimer !== null) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
  }

  dispose(): void {
    this.stopTypewriter();
    this.container.removeEventListener('click', this.onClick);
    this.container.remove();
  }
}
