import { GameCanvas } from './components/Game/GameCanvas';
import { Analytics } from '@vercel/analytics/react';
import './App.css';

function App() {
  return (
    <div className="app">
      <GameCanvas />
      <Analytics />
    </div>
  );
}

export default App;

