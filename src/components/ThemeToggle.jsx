import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ dark, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} title="Toggle light/dark mode">
      <div className={`toggle-track ${dark ? 'on' : ''}`}>
        <div className={`toggle-thumb ${dark ? 'on' : ''}`} />
      </div>
      {dark ? <Moon size={12} /> : <Sun size={12} />}
      <span>{dark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
