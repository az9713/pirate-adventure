import { Game } from './Game';

const container = document.getElementById('app');
if (!container) throw new Error('No #app container found');

const game = new Game(container);
game.init().catch((err) => {
  console.error('Game init failed:', err);
  container.innerHTML = `<div style="color:#fff;padding:20px;font-family:sans-serif">
    <h2>Failed to load game</h2>
    <p>${err.message}</p>
  </div>`;
});

window.addEventListener('beforeunload', () => {
  game.dispose();
});
