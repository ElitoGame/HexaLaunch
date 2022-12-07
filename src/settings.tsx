import { render } from 'solid-js/web';
import SettingsMenu from './Settings/SettingsMenu';
import { HopeProvider } from '@hope-ui/solid';
import './settings.css';

render(() => {
  return (
    <HopeProvider>
      <SettingsMenu />
    </HopeProvider>
  );
}, document.getElementById('settings') as HTMLElement);
