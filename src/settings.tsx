import { render } from 'solid-js/web';
import SettingsMenu from './Settings/SettingsMenu';
import { HopeProvider, HopeThemeConfig, NotificationsProvider } from '@hope-ui/solid';
import './settings.css';

render(() => {
  const config: HopeThemeConfig = {
    initialColorMode: 'light',
    lightTheme: {
      colors: {
        background: '#00000000',
      },
    },
  };

  return (
    <HopeProvider config={config}>
      <NotificationsProvider>
        <SettingsMenu />
      </NotificationsProvider>
    </HopeProvider>
  );
}, document.getElementById('settings') as HTMLElement);
