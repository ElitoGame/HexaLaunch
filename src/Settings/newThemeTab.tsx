import {
  restrictValue,
  changeWindow,
  updateSettingData,
  useMainHexagonInput,
  setUseMainHexagonInput,
  getSettingsData,
} from '../settings';
import {
  SimpleSelect,
  SimpleOption,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Switch,
  Stack,
} from '@hope-ui/solid';

import Themes from '../Themes/Themes';
import { Show } from 'solid-js';
import { setThemes } from '../themes';
import { produce } from 'solid-js/store';
import { lastActiveTheme, setLastActiveTheme } from './appearanceTab';

export const theme = new Themes(
  '',
  '#414141',
  '#DFDFDF',
  '',
  '',
  '3px',
  'none',
  '#414141',
  '#DFDFDF',
  '',
  '',
  '3px',
  'none',
  '#31247B',
  '#DFDFDF',
  '',
  '',
  '3px',
  'none'
);

let tempSubHexData: Themes;

export const NewThemeTab = () => {
  return (
    <>
      <Stack class="relative">
        <Input
          size="xs"
          class="text-text mr-2"
          placeholder={`Custom Theme ` + `${getSettingsData()?.getThemes().length - 2}`}
          onInput={(e: Event) => {
            const inputElement = e.currentTarget as HTMLInputElement;
            getSettingsData()?.getNewTheme()?.setThemeName(inputElement.value);
            getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
            updateSettingData();
          }}
        ></Input>
        <div class="bg-neutral flex rounded-sm">
          <div class="w-5 h-5 m-1 bg-mainHexagonBg rounded-sm"></div>
          <div class="w-5 h-5 m-1 bg-mainHexagonIcon rounded-sm "></div>
          <div class="w-5 h-5 m-1 bg-subHexagonBg rounded-sm"></div>
          <div class="w-5 h-5 m-1 bg-hoverHexagonBg"></div>
        </div>
      </Stack>
      <h2 class="pt-7">Main Hexagon</h2>
      <p class="pb-2">Choose Colors for the main six Hexagons.</p>
      <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4" class="gap-y-0">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Corner Radius</p>
          <InputGroup size="xs">
            <Input
              class="text-text"
              type="number"
              max="20"
              min="0"
              value={getSettingsData()?.getNewTheme()?.getMainHexagonRadius()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                restrictValue(e);
                getSettingsData()?.getNewTheme()?.setMainHexagonRadius(inputElement.value);
                if (useMainHexagonInput() == true) {
                  getSettingsData()?.getNewTheme()?.setSubHexagonRadius(inputElement.value);
                }
                getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                updateSettingData();
              }}
              placeholder="0"
            />
            <InputRightElement pointerEvents="none">px</InputRightElement>
          </InputGroup>

          <p>Border Width</p>
          <InputGroup size="xs">
            <Input
              class="text-text"
              type="number"
              max="50"
              min="0"
              value={getSettingsData()?.getNewTheme()?.getMainHexagonWidth()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                restrictValue(e);
                getSettingsData()?.getNewTheme()?.setMainHexagonWidth(inputElement.value);
                if (useMainHexagonInput() == true) {
                  getSettingsData()?.getNewTheme()?.setSubHexagonWidth(inputElement.value);
                }
                getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                updateSettingData();
              }}
              placeholder="0"
            />
            <InputRightElement pointerEvents="none">px</InputRightElement>
          </InputGroup>

          <p>Border Style</p>
          <SimpleSelect
            class="text-text"
            size="xs"
            id="borderStyle"
            placeholder="none"
            value={getSettingsData()?.getNewTheme()?.getMainHexagonBorderStyle()}
            onChange={(e: Event) => {
              if (
                e.toString() != 'none' &&
                getSettingsData()?.getNewTheme()?.getMainHexagonBorder() === ''
              ) {
                getSettingsData()?.getNewTheme()?.setMainHexagonBorder('#000000');
              }
              console.log(e.toString());
              getSettingsData()?.getNewTheme()?.setMainHexagonBorderStyle(e.toString());
              if (useMainHexagonInput() == true) {
                getSettingsData()?.getNewTheme()?.setSubHexagonBorderStyle(e.toString());
              }
              getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
              updateSettingData();
            }}
          >
            <SimpleOption value="none">none</SimpleOption>
            <SimpleOption value="solid">solid</SimpleOption>
            <SimpleOption value="shadow">shadow</SimpleOption>
          </SimpleSelect>
        </GridItem>
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1}>
          <p>Background</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getNewTheme()?.getMainHexagonBg()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.getNewTheme()?.setMainHexagonBg(inputElement.value);
                    getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                    if (useMainHexagonInput() == true) {
                      getSettingsData()?.getNewTheme()?.setSubHexagonBg(inputElement.value);
                    }
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
                    value={getSettingsData()?.getNewTheme()?.getMainHexagonBg()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.getNewTheme()?.setMainHexagonBg(inputElement.value);
                      if (useMainHexagonInput() == true) {
                        getSettingsData()?.getNewTheme()?.setSubHexagonBg(inputElement.value);
                      }
                      getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                      updateSettingData();
                    }}
                  />
                  <InputRightElement pointerEvents="none">
                    <p>hex</p>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
          <p>Default Icon/Text</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getNewTheme()?.getMainHexagonIcon()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.getNewTheme()?.setMainHexagonIcon(inputElement.value);
                    if (useMainHexagonInput() == true) {
                      getSettingsData()?.getNewTheme()?.setSubHexagonIcon(inputElement.value);
                    }
                    getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
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
                    value={getSettingsData()?.getNewTheme()?.getMainHexagonIcon()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.getNewTheme()?.setMainHexagonIcon(inputElement.value);
                      if (useMainHexagonInput() == true) {
                        getSettingsData()?.getNewTheme()?.setSubHexagonIcon(inputElement.value);
                      }
                      getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                      updateSettingData();
                    }}
                  />
                  <InputRightElement pointerEvents="none">
                    <p>hex</p>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
          <p>Border</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getNewTheme()?.getMainHexagonBorder()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.getNewTheme()?.setMainHexagonBorder(inputElement.value);
                    if (useMainHexagonInput() == true) {
                      getSettingsData()?.getNewTheme()?.setSubHexagonBorder(inputElement.value);
                    }
                    getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
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
                    value={getSettingsData()?.getNewTheme()?.getMainHexagonBorder()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.getNewTheme()?.setMainHexagonBorder(inputElement.value);
                      if (useMainHexagonInput() == true) {
                        getSettingsData()?.getNewTheme()?.setSubHexagonBorder(inputElement.value);
                      }
                      getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                      updateSettingData();
                    }}
                  />
                  <InputRightElement pointerEvents="none">
                    <p>hex</p>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
        </GridItem>
      </Grid>

      <h2 class="pt-7">Sub Hexagon</h2>
      <p>Choose Colors for the other sub Hexagons.</p>
      <Stack class="flex justify-end relative -top-10">
        <p>Use main Hexagon Input</p>
        <Switch
          class="checked:accent active:accent relative top-0"
          checked={useMainHexagonInput()}
          onChange={() => {
            if (useMainHexagonInput() === false) {
              let newObject = Themes.fromJSON(getSettingsData()?.getNewTheme().toJSON());
              tempSubHexData = newObject as Themes;

              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonBg(getSettingsData()?.getNewTheme()?.getMainHexagonBg());
              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonIcon(getSettingsData()?.getNewTheme()?.getMainHexagonIcon());
              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonBorder(getSettingsData()?.getNewTheme()?.getMainHexagonBorder());
              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonRadius(getSettingsData()?.getNewTheme()?.getMainHexagonRadius());
              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonBorderStyle(
                  getSettingsData()?.getNewTheme()?.getMainHexagonBorderStyle()
                );
              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonWidth(getSettingsData()?.getNewTheme()?.getMainHexagonWidth());
              getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
              updateSettingData();
              setUseMainHexagonInput(!useMainHexagonInput());
              console.log(JSON.stringify(tempSubHexData) + 'testtt');
            } else if (useMainHexagonInput() === true) {
              console.log(JSON.stringify(tempSubHexData) + 'testtt');
              getSettingsData()?.getNewTheme()?.setSubHexagonBg(tempSubHexData.getSubHexagonBg());
              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonIcon(tempSubHexData.getSubHexagonIcon());
              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonBorder(tempSubHexData.getSubHexagonBorder());
              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonRadius(tempSubHexData.getSubHexagonRadius());
              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonBorderStyle(tempSubHexData.getSubHexagonBorderStyle());
              getSettingsData()
                ?.getNewTheme()
                ?.setSubHexagonWidth(tempSubHexData.getSubHexagonWidth());
              getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
              updateSettingData();
              setUseMainHexagonInput(!useMainHexagonInput());
            }
            // updateSettingData();
          }}
        ></Switch>
      </Stack>
      <Show when={!useMainHexagonInput()}>
        <Grid
          templateRows="repeat(1, 1fr)"
          templateColumns="repeat(2, 1fr)"
          gap="$4"
          class="gap-y-0"
        >
          <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
            <p>Corner Radius</p>
            <InputGroup size="xs">
              <Input
                class="text-text"
                type="number"
                max="20"
                min="0"
                value={getSettingsData()?.getNewTheme()?.getSubHexagonRadius()}
                onInput={(e: Event) => {
                  const inputElement = e.currentTarget as HTMLInputElement;
                  restrictValue(e);
                  getSettingsData()?.getNewTheme()?.setSubHexagonRadius(inputElement.value);
                  getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                  updateSettingData();
                }}
                placeholder="0"
              />
              <InputRightElement pointerEvents="none">px</InputRightElement>
            </InputGroup>

            <p>Border Width</p>
            <InputGroup size="xs">
              <Input
                class="text-text"
                type="number"
                max="50"
                min="0"
                value={getSettingsData()?.getNewTheme()?.getSubHexagonWidth()}
                onInput={(e: Event) => {
                  const inputElement = e.currentTarget as HTMLInputElement;
                  restrictValue(e);
                  getSettingsData()?.getNewTheme()?.setSubHexagonWidth(inputElement.value);
                  getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                  updateSettingData();
                }}
                placeholder="0"
              />
              <InputRightElement pointerEvents="none">px</InputRightElement>
            </InputGroup>

            <p>Border Style</p>
            <SimpleSelect
              class="text-text"
              size="xs"
              id="borderStyle"
              placeholder="none"
              value={getSettingsData()?.getNewTheme()?.getSubHexagonBorderStyle()}
              onChange={(e: Event) => {
                if (
                  e.toString() != 'none' &&
                  getSettingsData()?.getNewTheme()?.getSubHexagonBorder() === ''
                ) {
                  getSettingsData()?.getNewTheme()?.setSubHexagonBorder('#000000');
                }
                console.log(e.toString());
                getSettingsData()?.getNewTheme()?.setSubHexagonBorderStyle(e.toString());
                getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                updateSettingData();
              }}
            >
              <SimpleOption value="none">none</SimpleOption>
              <SimpleOption value="solid">solid</SimpleOption>
              <SimpleOption value="shadow">shadow</SimpleOption>
            </SimpleSelect>
          </GridItem>
          <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1}>
            <p>Background</p>
            <div class="form-group row">
              <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
              <div class="col-sm">
                <div id="demo">
                  <input
                    value={getSettingsData()?.getNewTheme()?.getSubHexagonBg()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.getNewTheme()?.setSubHexagonBg(inputElement.value);
                      getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
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
                      value={getSettingsData()?.getNewTheme()?.getSubHexagonBg()}
                      onChange={(e: Event) => {
                        const inputElement = e.currentTarget as HTMLInputElement;
                        getSettingsData()?.getNewTheme()?.setSubHexagonBg(inputElement.value);
                        getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                        updateSettingData();
                      }}
                    />
                    <InputRightElement pointerEvents="none">
                      <p>hex</p>
                    </InputRightElement>
                  </InputGroup>
                </div>
              </div>
            </div>
            <p>Default Icon/Text</p>
            <div class="form-group row">
              <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
              <div class="col-sm">
                <div id="demo">
                  <input
                    value={getSettingsData()?.getNewTheme()?.getSubHexagonIcon()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.getNewTheme()?.setSubHexagonIcon(inputElement.value);
                      getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
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
                      value={getSettingsData()?.getNewTheme()?.getSubHexagonIcon()}
                      onChange={(e: Event) => {
                        const inputElement = e.currentTarget as HTMLInputElement;
                        getSettingsData()?.getNewTheme()?.setSubHexagonIcon(inputElement.value);
                        getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                        updateSettingData();
                      }}
                    />
                    <InputRightElement pointerEvents="none">
                      <p>hex</p>
                    </InputRightElement>
                  </InputGroup>
                </div>
              </div>
            </div>
            <p>Border</p>
            <div class="form-group row">
              <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
              <div class="col-sm">
                <div id="demo">
                  <input
                    value={getSettingsData()?.getNewTheme()?.getSubHexagonBorder()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.getNewTheme()?.setSubHexagonBorder(inputElement.value);
                      getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
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
                      value={getSettingsData()?.getNewTheme()?.getSubHexagonBorder()}
                      onChange={(e: Event) => {
                        const inputElement = e.currentTarget as HTMLInputElement;
                        getSettingsData()?.getNewTheme()?.setSubHexagonBorder(inputElement.value);
                        getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                        updateSettingData();
                      }}
                    />
                    <InputRightElement pointerEvents="none">
                      <p>hex</p>
                    </InputRightElement>
                  </InputGroup>
                </div>
              </div>
            </div>
          </GridItem>
        </Grid>
      </Show>
      <h2 class="pt-7">Hover Effect</h2>
      <p class="pb-2">Choose Colors for the hover Effect.</p>

      <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4" class="gap-y-0">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Corner Radius</p>
          <InputGroup size="xs">
            <Input
              class="text-text"
              type="number"
              max="20"
              min="0"
              value={getSettingsData()?.getNewTheme()?.getHoverHexagonRadius()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                restrictValue(e);
                getSettingsData()?.getNewTheme()?.setHoverHexagonRadius(inputElement.value);
                getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                updateSettingData();
              }}
              placeholder="0"
            />
            <InputRightElement pointerEvents="none">px</InputRightElement>
          </InputGroup>

          <p>Border Width</p>
          <InputGroup size="xs">
            <Input
              class="text-text"
              type="number"
              max="50"
              min="0"
              value={getSettingsData()?.getNewTheme()?.getHoverHexagonWidth()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                restrictValue(e);
                getSettingsData()?.getNewTheme()?.setHoverHexagonWidth(inputElement.value);
                getSettingsData()?.setCurrentTheme(theme);
                updateSettingData();
              }}
              placeholder="0"
            />
            <InputRightElement pointerEvents="none">px</InputRightElement>
          </InputGroup>

          <p>Border Style</p>
          <SimpleSelect
            class="text-text"
            size="xs"
            id="borderStyle"
            placeholder="none"
            value={getSettingsData()?.getNewTheme()?.getHoverHexagonBorderStyle()}
            onChange={(e: Event) => {
              if (
                e.toString() != 'none' &&
                getSettingsData()?.getNewTheme()?.getHoverHexagonBorder() === ''
              ) {
                getSettingsData()?.getNewTheme()?.setHoverHexagonBorder('#000000');
              }
              console.log(e.toString());
              getSettingsData()?.getNewTheme()?.setHoverHexagonBorderStyle(e.toString());
              getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
              updateSettingData();
            }}
          >
            <SimpleOption value="none">none</SimpleOption>
            <SimpleOption value="solid">solid</SimpleOption>
            <SimpleOption value="shadow">shadow</SimpleOption>
          </SimpleSelect>
        </GridItem>
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1}>
          <p>Background</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getNewTheme()?.getHoverHexagonBg()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.getNewTheme()?.setHoverHexagonBg(inputElement.value);
                    getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());

                    console.log(JSON.stringify(getSettingsData()?.getNewTheme()?.toJSON));
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
                    value={getSettingsData()?.getNewTheme()?.getHoverHexagonBg()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.getNewTheme()?.setHoverHexagonBg(inputElement.value);
                      getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                      updateSettingData();
                    }}
                  />
                  <InputRightElement pointerEvents="none">
                    <p>hex</p>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
          <p>Default Icon/Text</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getNewTheme()?.getHoverHexagonIcon()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.getNewTheme()?.setHoverHexagonIcon(inputElement.value);
                    getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
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
                    value={getSettingsData()?.getNewTheme()?.getHoverHexagonIcon()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.getNewTheme()?.setHoverHexagonIcon(inputElement.value);
                      getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                      updateSettingData();
                    }}
                  />
                  <InputRightElement pointerEvents="none">
                    <p>hex</p>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
          <p>Border</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getNewTheme()?.getHoverHexagonBorder()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.getNewTheme()?.setHoverHexagonBorder(inputElement.value);
                    getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
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
                    value={getSettingsData()?.getNewTheme()?.getHoverHexagonBorder()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.getNewTheme()?.setHoverHexagonBorder(inputElement.value);
                      getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
                      updateSettingData();
                    }}
                  />
                  <InputRightElement pointerEvents="none">
                    <p>hex</p>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
        </GridItem>
      </Grid>
      <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2}>
          <Button
            class="mr-5 bg-accent"
            size="xs"
            onClick={() => {
              changeWindow();
              if (getSettingsData()?.getNewTheme()?.getThemeName() == '') {
                getSettingsData()
                  ?.getNewTheme()
                  ?.setThemeName(`Custom Theme ` + `${getSettingsData()?.getThemes().length - 2}`);
              }
              setThemes(produce((store) => store.themes.push(getSettingsData()?.getNewTheme())));
              getSettingsData()?.getThemes().push(getSettingsData()?.getNewTheme());
              getSettingsData()?.setCurrentTheme(
                getSettingsData()?.getThemes()[getSettingsData()?.getThemes().length - 1]
              );
              setLastActiveTheme(
                getSettingsData()?.getThemes()[getSettingsData()?.getThemes().length - 1]
              );
              let theme = new Themes(
                '',
                '#414141',
                '#DFDFDF',
                '',
                '',
                '3px',
                'none',
                '#414141',
                '#DFDFDF',
                '',
                '',
                '3px',
                'none',
                '#31247B',
                '#DFDFDF',
                '',
                '',
                '3px',
                'none'
              );

              tempSubHexData = theme;
              updateSettingData();
            }}
          >
            Save
          </Button>
        </GridItem>
        <GridItem
          class="justify-end flex items-end"
          rowStart={2}
          rowEnd={2}
          colStart={1}
          colEnd={1}
        >
          <Button
            class="bg-accent"
            size="xs"
            onClick={() => {
              changeWindow();
              getSettingsData()?.setCurrentTheme(lastActiveTheme() as Themes);
              let theme = new Themes(
                '',
                '#414141',
                '#DFDFDF',
                '',
                '',
                '3px',
                'none',
                '#414141',
                '#DFDFDF',
                '',
                '',
                '3px',
                'none',
                '#31247B',
                '#DFDFDF',
                '',
                '',
                '3px',
                'none'
              );
              // getSettingsData()?.setNewTheme(theme);

              updateSettingData();
            }}
          >
            Cancel
          </Button>{' '}
        </GridItem>
      </Grid>
    </>
  );
};
