import { updateSettingData, getSettingsData } from '../settings';
import { Input, InputGroup, InputRightElement } from '@hope-ui/solid';

import '../../assets/settings.css';

//import '../../assets/index.css';

export const ColorInput = (formfield: { name: string }) => {
  return (
    <div class="form-group row">
      <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
      <div class="col-sm">
        <div id="demo">
          <input
            value={getSettingsData()?.getSettingsBgColor()}
            onChange={(e: Event) => {
              const inputElement = e.currentTarget as HTMLInputElement;
              console.log(getSettingsData()?.getSettingsBgColor());
              getSettingsData()?.setSettingsBgColor(inputElement.value);
              updateSettingData();
            }}
            class="colorPick"
            type="color"
            placeholder="#FFFFFF"
          ></input>
          <InputGroup size="xs">
            <Input
              type="text"
              id="theme-color"
              class="form-control @error('theme-color') is-invalid @enderror text-text"
              name="theme-color"
              value={getSettingsData()?.getSettingsBgColor()}
              onChange={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                getSettingsData()?.setSettingsBgColor(inputElement.value);
                updateSettingData();
              }}
            />
            <InputRightElement pointerEvents="none">hex</InputRightElement>
          </InputGroup>
        </div>
      </div>
    </div>
  );
};
