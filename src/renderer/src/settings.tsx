import { render } from 'solid-js/web';
import SettingsMenu from './Settings/SettingsMenu';
import { HopeProvider } from '@hope-ui/solid';

render(() => {
  return (
    <HopeProvider>
      <SettingsMenu />
    </HopeProvider>
  );
}, document.getElementById('settings') as HTMLElement);
