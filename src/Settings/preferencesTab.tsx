import { updateSettingData, handleHotkeyEvent, getSettingsData } from '../settings';
import { Grid, GridItem, Input, Switch } from '@hope-ui/solid';

export const PreferencesTab = () => {
  return (
    <>
      <p class="font-medium">Start Hotkey</p>

      <Input
        size="md"
        class="w-60 text-text"
        id="hello"
        onKeyDown={handleHotkeyEvent}
        onfocusout={(e: Event) => {
          const inputElement = e.currentTarget as HTMLInputElement;
          inputElement.value = getSettingsData()?.getHotkeys().join('+');
        }}
        onfocus={(e: Event) => {
          const inputElement = e.currentTarget as HTMLInputElement;
          inputElement.value = 'Press any Key(s)';
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
      <p>
        Always show all the available Hexagons, even when they are empty Filled Hexagons don't need
        to be attached to another anymore
      </p>
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
    </>
  );
};
