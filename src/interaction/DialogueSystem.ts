import { eventBus } from '../core/EventBus';
import type { DialogueDef, DialogueLine } from '../types/LevelTypes';
import type { DialogueBox } from '../ui/DialogueBox';
import type { AudioManager } from '../audio/AudioManager';

export class DialogueSystem {
  private dialogueBox: DialogueBox;
  private audioManager: AudioManager;
  private lines: DialogueLine[] = [];
  private currentLine = 0;
  private active = false;

  constructor(dialogueBox: DialogueBox, audioManager: AudioManager) {
    this.dialogueBox = dialogueBox;
    this.audioManager = audioManager;

    eventBus.on('hotspot:dialogue', this.onDialogue as (...args: unknown[]) => void);
    this.dialogueBox.onAdvance(() => this.advance());
  }

  private onDialogue = (dialogue: DialogueDef): void => {
    this.start(dialogue);
  };

  start(dialogue: DialogueDef): void {
    this.lines = dialogue.lines;
    this.currentLine = 0;
    this.active = true;
    eventBus.emit('dialogue:start');
    this.showLine();
  }

  private showLine(): void {
    if (this.currentLine >= this.lines.length) {
      this.end();
      return;
    }

    const line = this.lines[this.currentLine];
    this.dialogueBox.show(line.speaker, line.text);

    if (line.audio) {
      this.audioManager.playDialogue(line.audio);
    }
  }

  advance(): void {
    if (!this.active) return;
    this.currentLine++;
    this.showLine();
  }

  private end(): void {
    this.active = false;
    this.dialogueBox.hide();
    this.audioManager.stopDialogue();
    eventBus.emit('dialogue:end');
  }

  isActive(): boolean {
    return this.active;
  }

  dispose(): void {
    eventBus.off('hotspot:dialogue', this.onDialogue as (...args: unknown[]) => void);
  }
}
