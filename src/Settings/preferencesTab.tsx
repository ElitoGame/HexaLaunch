import { updateSettingData, handleHotkeyEvent, getSettingsData } from '../settings';
import { Grid, GridItem, Input, Switch } from '@hope-ui/solid';
import { invoke } from '@tauri-apps/api';
import { createSignal } from 'solid-js';
import { UserSettings } from '../datastore';

const [isAutoStartEnabled, setAutoStartEnabled] = createSignal(
  UserSettings.settings.getAutoLaunch()
);

export const PreferencesTab = () => {
  return (
    <>
      <p class="font-medium">Start Hotkey</p>

      <Input
        size="md"
        class="w-60 text-text mb-4"
        id="hello"
        onKeyDown={handleHotkeyEvent}
        onfocusout={(e: Event) => {
          const inputElement = e.currentTarget as HTMLInputElement;
          inputElement.value = getSettingsData()?.getHotkeys().join('+');
          invoke('set_changing_hotkey', { changing: false });
        }}
        onfocus={(e: Event) => {
          const inputElement = e.currentTarget as HTMLInputElement;
          inputElement.value = 'Press any Key(s)';
          invoke('set_changing_hotkey', { changing: true });
        }}
        value={getSettingsData()?.getHotkeys().join('+')}
        placeholder="Press any Key(s)"
      />

      <br></br>
      <Grid h="100%" templateRows="repeat(, 1fr)" templateColumns="repeat(2, 1fr)" gap="$1">
        <p class="font-medium">Navigation via keyboard</p>{' '}
        <GridItem class="flex justify-end">
          <Switch
            class="checked:accent active:accent flex-end"
            checked={getSettingsData()!.getKeyboardNavigation()}
            onChange={() => {
              getSettingsData()?.setKeyboardNavigation(!getSettingsData()?.getKeyboardNavigation());
              updateSettingData();
            }}
          ></Switch>
        </GridItem>
      </Grid>
      <p>Navigation through the Application with your Keyboard</p>
      <br></br>
      <Grid h="100%" templateRows="repeat(, 1fr)" templateColumns="repeat(2, 1fr)" gap="$1">
        <p class="font-medium">Full Layout</p>
        <GridItem class="flex justify-end">
          <Switch
            onChange={() => {
              getSettingsData()?.setFullLayout(!getSettingsData()?.getFullLayout());
              updateSettingData();
            }}
            checked={getSettingsData()!.getFullLayout()}
            class="flex-end"
          ></Switch>
        </GridItem>
      </Grid>
      <p>Always show all the available Hexagons, even when they are empty.</p>
      <br></br>
      <Grid h="100%" templateRows="repeat(, 1fr)" templateColumns="repeat(2, 1fr)" gap="$1">
        <p class="font-medium">Move to Cursor</p>
        <GridItem class="flex justify-end">
          <Switch
            onChange={() => {
              getSettingsData()?.setMoveToCursor(!getSettingsData()?.getMoveToCursor());
              updateSettingData();
            }}
            class="flex-end"
            checked={getSettingsData()!.getMoveToCursor()}
          ></Switch>
        </GridItem>
      </Grid>
      <p>The Layout will open where your mouse is located when you open the Application</p>
      <br></br>
      <Grid h="100%" templateRows="repeat(, 1fr)" templateColumns="repeat(2, 1fr)" gap="$1">
        <p class="font-medium">Autostart</p>
        <GridItem class="flex justify-end">
          <Switch
            onChange={() => {
              if (isAutoStartEnabled()) {
                invoke('plugin:autostart|disable');
                setAutoStartEnabled(false);
                UserSettings.settings.setAutoLaunch(false);
                updateSettingData();
              } else {
                invoke('plugin:autostart|enable');
                setAutoStartEnabled(true);
                UserSettings.settings.setAutoLaunch(true);
                updateSettingData();
              }
            }}
            class="flex-end"
            checked={isAutoStartEnabled()}
          ></Switch>
        </GridItem>
      </Grid>
      <p>Toggle if the App should automatically start together with Windows.</p>
    </>
  );
};
