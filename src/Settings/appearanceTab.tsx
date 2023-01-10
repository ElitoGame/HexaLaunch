import { updateSettingData, changeWindow, getSettingsData } from '../settings';
import {
  Box,
  Grid,
  GridItem,
  Radio,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  createDisclosure,
  HStack,
  Tooltip,
} from '@hope-ui/solid';
import { primaryMonitor } from '@tauri-apps/api/window';
import { createSignal, For, Show } from 'solid-js';
import { themes } from '../themes';
import Themes from '../Themes/Themes';
import HexTile from '../HexUI/Components/HexTile';
import { FaSolidMoon } from 'solid-icons/fa';
import { FaSolidSun } from 'solid-icons/fa';
import { FaSolidCircleCheck } from 'solid-icons/fa';
import { FaSolidPen } from 'solid-icons/fa';
import { theme } from './newThemeTab';

const [getSize, setSize] = createSignal<number>(0);
export const [lastActiveTheme, setLastAcitveTheme] = createSignal();
setSize((await primaryMonitor()).size.height);

export const AppearanceTab = () => {
  const { isOpen, onOpen, onClose } = createDisclosure();
  return (
    <>
      <h2>Theme Selection</h2>
      <Box w="100%" pt="10px" pb="50px" class="flex justify-between">
        {' '}
        <For each={getSettingsData()?.getThemes()}>
          {(themeVar: Themes) => (
            <Show
              when={
                themeVar.getThemeName() == 'Honey' ||
                themeVar.getThemeName() == 'Light' ||
                themeVar.getThemeName() == 'Dark'
              }
            >
              <div class=" roundend-lg card">
                <input
                  class="hoverEffect checked:bg-accent checked:opacity-50 border-2 themes"
                  type="radio"
                  name="theme"
                  value={`${themeVar.getThemeName()}`}
                  checked={
                    themeVar.getThemeName() ===
                      getSettingsData()?.getCurrentTheme()?.getThemeName() ?? true
                  }
                  id={`${themeVar.getThemeName()}`}
                  onClick={(e: Event) => {
                    getSettingsData()?.setCurrentTheme(themeVar);
                    updateSettingData();
                  }}
                />{' '}
                <label class="pointer-events-none" for="card1">
                  <Show when={themeVar.getThemeName() == 'Honey'}>
                    <svg
                      style={` color:${themeVar.getMainHexagonIcon()}; font-size:30px;`}
                      class="z-20 absolute top-[40px] left-[66px]"
                    >
                      <path
                        d="M9.41992 7.69002C9.41992 4.3965 12.0899 1.72656 15.3834 1.72656C18.6769 1.72656 21.3468 4.3965 21.3468 7.69002H9.41992Z"
                        fill="#F68002"
                      />
                      <path
                        d="M21.3472 16.4782C21.3472 19.7717 18.6772 22.4417 15.3837 22.4417C12.0902 22.4417 9.42024 19.7717 9.42024 16.4782L9.42024 14.2811L21.3472 14.2811V16.4782Z"
                        fill="#F68002"
                      />
                      <rect
                        x="9.41992"
                        y="9.57324"
                        width="11.9269"
                        height="2.8248"
                        fill="#F68002"
                      />
                      <path
                        d="M0.569258 15.1998C0.230613 13.6335 0.917017 12.024 2.2818 11.1841L6.5047 8.58539C7.2307 8.13862 8.1655 8.66049 8.1662 9.51294L8.17012 14.3215C8.17177 16.3477 6.56998 18.0307 4.54847 18.1685C2.67707 18.2961 0.965645 17.0332 0.569258 15.1998Z"
                        fill="#F68002"
                      />
                      <path
                        d="M30.316 15.2064C30.6546 13.6401 29.9682 12.0306 28.6035 11.1907L24.3806 8.59198C23.6546 8.14521 22.7198 8.66708 22.7191 9.51954L22.7151 14.3281C22.7135 16.3543 24.3153 18.0373 26.3368 18.1751C28.2082 18.3027 29.9196 17.0398 30.316 15.2064Z"
                        fill="#F68002"
                      />
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M11.6627 0.0474556C12.07 -0.100642 12.5202 0.109457 12.6683 0.516725L13.3875 2.49441C13.5356 2.90168 13.3255 3.35189 12.9182 3.49999C12.5109 3.64808 12.0607 3.43798 11.9126 3.03072L11.1935 1.05303C11.0454 0.645766 11.2555 0.195553 11.6627 0.0474556ZM19.4149 0.0474556C19.8222 0.195553 20.0323 0.645766 19.8842 1.05303L19.165 3.03072C19.0169 3.43798 18.5667 3.64808 18.1594 3.49999C17.7522 3.35189 17.5421 2.90168 17.6902 2.49441L18.4093 0.516725C18.5574 0.109457 19.0076 -0.100642 19.4149 0.0474556Z"
                        fill="#F68002"
                      />
                    </svg>
                  </Show>
                  <Show when={themeVar.getThemeName() == 'Light'}>
                    <FaSolidSun
                      color={`${themeVar.getMainHexagonIcon()}`}
                      size={21}
                      class="z-20 absolute top-[40px] left-[72px]"
                    />
                  </Show>
                  <Show when={themeVar.getThemeName() == 'Dark'}>
                    <FaSolidMoon
                      color={`${themeVar.getMainHexagonIcon()}`}
                      size={21}
                      class="z-20 absolute top-[40px] left-[72px]"
                    />
                  </Show>
                  <span class="colorPreview">
                    <div
                      class="position-absolute w-5 h-5 m-1 rounded-sm"
                      style={`background-color:${themeVar.getMainHexagonBg()}`}
                    ></div>
                    <div
                      class="position-absolute w-5 h-5 m-1 rounded-sm"
                      style={`background-color:${themeVar.getMainHexagonIcon()}`}
                    ></div>
                    <div
                      class="position-absolute w-5 h-5 m-1 rounded-sm"
                      style={`background-color:${themeVar.getSubHexagonBg()}`}
                    ></div>
                    <div
                      class="position-absolute w-5 h-5 m-1 rounded-sm"
                      style={`background-color:${themeVar.getHoverHexagonBg()}`}
                    ></div>
                  </span>

                  <div
                    class=" left-[30px] top-[-9px] hexPreview pointer-events-none hexTile absolute bg-transparent  cursor-pointer inline-block"
                    style="clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%); transform-origin: center center;  width: 93px; margin: 5px; height: 108.717px; 10; transform: scale(1);"
                  >
                    <div
                      style={`fill:${themeVar.getMainHexagonBg()}; transform-origin: center center; clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%); left: -2.5px; bottom: -2.5px; width: 88px; margin: 5px; height: 102.872px;`}
                      class={` absolute cursor-pointer inline-block `}
                      id="radiant:0"
                    >
                      <svg width="98" height="102.872">
                        <clipPath id="hexClip">
                          <circle cx="40" cy="35" r="35"></circle>
                          <path
                            id="radiant:0"
                            d="
        M 44.45597072760119,0
        Q 44.45597072760119,0 44.45597072760119,0

        L 88.91194145520238,25.666666666666664
        Q 88.91194145520238,25.666666666666664 88.91194145520238,25.666666666666664

        L 88.91194145520238,77
        Q 88.91194145520238,77 88.91194145520238,77

        L 44.45597072760119,102.66666666666666
        Q 44.45597072760119,102.66666666666666 44.45597072760119,102.66666666666666
        
        L 0,77
        Q 0,77 0,77
        
        L 0,25.666666666666664
        Q 0,25.666666666666664 0,25.666666666666664
        Z
      "
                            style="transform: translate(-0.1%, 5%);"
                          ></path>
                        </clipPath>
                        <path
                          d="
        M 44.01141102032518,0
        Q 44.01141102032518,0 44.01141102032518,0

        L 88.02282204065035,25.409999999999997
        Q 88.02282204065035,25.409999999999997 88.02282204065035,25.409999999999997

        L 88.02282204065035,76.22999999999999
        Q 88.02282204065035,76.22999999999999 88.02282204065035,76.22999999999999

        L 44.01141102032518,101.63999999999999
        Q 44.01141102032518,101.63999999999999 44.01141102032518,101.63999999999999
        
        L 0,76.22999999999999
        Q 0,76.22999999999999 0,76.22999999999999
        
        L 0,25.409999999999997
        Q 0,25.409999999999997 0,25.409999999999997
        Z
      "
                          style={`fill:${themeVar.getMainHexagonBorder()}; transform: translate(0.9%, 0.9%);`}
                        ></path>
                        <path
                          d="
        M 40.01037365484107,0
        Q 40.01037365484107,0 40.01037365484107,0

        L 80.02074730968214,23.099999999999998
        Q 80.02074730968214,23.099999999999998 80.02074730968214,23.099999999999998

        L 80.02074730968214,69.3
        Q 80.02074730968214,69.3 80.02074730968214,69.3

        L 40.01037365484107,92.39999999999999
        Q 40.01037365484107,92.39999999999999 40.01037365484107,92.39999999999999
        
        L 0,69.3
        Q 0,69.3 0,69.3
        
        L 0,23.099999999999998
        Q 0,23.099999999999998 0,23.099999999999998
        Z
      "
                          style="transform: translate(5%, 5%);"
                        ></path>
                      </svg>
                      <span class="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                    </div>
                  </div>

                  <p class="top-[12px] left-[-8px] relative flex" id="label">
                    <Show
                      when={
                        getSettingsData()?.getCurrentTheme()?.getThemeName() ==
                        themeVar.getThemeName()
                      }
                      fallback={<span class="ml-2">{`${themeVar.getThemeName()}`}</span>}
                    >
                      <FaSolidCircleCheck class="fill-accent mt-1" size={14}></FaSolidCircleCheck>{' '}
                      <span class="ml-2">{`${themeVar.getThemeName()}`}</span>
                    </Show>
                  </p>
                </label>
              </div>
            </Show>
          )}
        </For>
      </Box>

      <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={1} rowEnd={1} colStart={1} colEnd={1} style="align-self: flex-end;">
          {' '}
          <h2>Custom Themes</h2>
        </GridItem>
        <GridItem style="align-self: flex;" class="flex justify-end">
          <Button
            class="bg-neutral mr-2 hover:bg-neutral hoverEffect text-text"
            size="xs"
            onClick={onOpen}
          >
            Import
          </Button>
          <Modal centered opened={isOpen()} onClose={onClose}>
            <ModalOverlay />
            <ModalContent class="bg-background">
              <ModalHeader>
                <h2 class="text-center text-neutral text-[16px]">Import a new Theme</h2>
              </ModalHeader>
              <ModalBody>
                <p>Path</p>{' '}
                <div class="flex justify-between">
                  <Input size="xs" class="w-3/4 h-8" type="text">
                    {' '}
                  </Input>
                  <Button
                    size="xs"
                    class="h-8 ml-5 w-1/5  bg-neutral mr-2 hover:bg-neutral hoverEffect text-text"
                  >
                    Browse
                  </Button>
                </div>
              </ModalBody>
              <ModalFooter class="flex justify-center">
                {' '}
                <div>
                  <Button size="xs">Cancel</Button>
                  <Button
                    onClick={onClose}
                    size="xs"
                    class="bg-accent hover:bg-accent hoverEffect text-text"
                  >
                    Continue
                  </Button>
                </div>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Button
            onClick={() => {
              changeWindow();
              getSettingsData()?.setNewTheme(
                new Themes(
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
                )
              );
              updateSettingData();
              // const el : Themes = getSettingsData()?.getCurrentTheme();
              // Object.assign(el, getSettingsData()?.getCurrentTheme());
              // setLastAcitveTheme(el);
              getSettingsData()?.setCurrentTheme(getSettingsData()?.getNewTheme());
            }}
            class="bg-accent hover:bg-accent hoverEffect text-text"
            size="xs"
          >
            + New
          </Button>
        </GridItem>
      </Grid>
      <p>Create your own Themes. You can use existing Themes as your basis.</p>

      <Box w="100%" pb="50px" class="flex customThemes w-[470px] overflow-x-auto">
        {' '}
        <For each={getSettingsData()?.getThemes()}>
          {(themeVar: Themes, i) => (
            <Show
              when={
                themeVar.getThemeName() !== 'Honey' &&
                themeVar.getThemeName() !== 'Light' &&
                themeVar.getThemeName() !== 'Dark'
              }
            >
              <div class=" mr-[11px] rounden-lg mt-10 focus:bg-accent hoverEffect card bg-neutral border">
                <input
                  class="hoverEffect checked:bg-accent checked:opacity-50 border-2 themes"
                  type="radio"
                  checked={
                    themeVar.getThemeName() ===
                      getSettingsData()?.getCurrentTheme()?.getThemeName() ?? true
                  }
                  name="theme"
                  value={`${themeVar.getThemeName()}`}
                  onClick={(e: Event) => {
                    getSettingsData()?.setCurrentTheme(themeVar);
                    updateSettingData();
                  }}
                />{' '}
                <label class="pointer-events-none" for="card1">
                  <FaSolidPen
                    color={`${themeVar.getMainHexagonIcon()}`}
                    size={21}
                    class="z-20 absolute top-[40px] left-[72px]"
                  />
                  <span class="colorPreview">
                    <div
                      class="position-absolute w-5 h-5 m-1 rounded-sm"
                      style={`background-color:${themeVar.getMainHexagonBg()}`}
                    ></div>
                    <div
                      class="position-absolute w-5 h-5 m-1 rounded-sm"
                      style={`background-color:${themeVar.getMainHexagonIcon()}`}
                    ></div>
                    <div
                      class="position-absolute w-5 h-5 m-1 rounded-sm"
                      style={`background-color:${themeVar.getSubHexagonBg()}`}
                    ></div>
                    <div
                      class="position-absolute w-5 h-5 m-1 rounded-sm"
                      style={`background-color:${themeVar.getHoverHexagonBg()}`}
                    ></div>
                  </span>

                  <div
                    class=" left-[30px] top-[-9px] hexPreview pointer-events-none hexTile absolute bg-transparent  cursor-pointer inline-block"
                    style="clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%); transform-origin: center center;  width: 93px; margin: 5px; height: 108.717px; 10; transform: scale(1);"
                  >
                    <div
                      style={`fill:${themeVar.getMainHexagonBg()}; transform-origin: center center; clip-path: polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%); left: -2.5px; bottom: -2.5px; width: 88px; margin: 5px; height: 102.872px;`}
                      class={` absolute cursor-pointer inline-block `}
                      id="radiant:0"
                    >
                      <svg width="98" height="102.872">
                        <clipPath id="hexClip">
                          <circle cx="40" cy="35" r="35"></circle>
                          <path
                            id="radiant:0"
                            d="
        M 44.45597072760119,0
        Q 44.45597072760119,0 44.45597072760119,0

        L 88.91194145520238,25.666666666666664
        Q 88.91194145520238,25.666666666666664 88.91194145520238,25.666666666666664

        L 88.91194145520238,77
        Q 88.91194145520238,77 88.91194145520238,77

        L 44.45597072760119,102.66666666666666
        Q 44.45597072760119,102.66666666666666 44.45597072760119,102.66666666666666
        
        L 0,77
        Q 0,77 0,77
        
        L 0,25.666666666666664
        Q 0,25.666666666666664 0,25.666666666666664
        Z
      "
                            style="transform: translate(-0.1%, 5%);"
                          ></path>
                        </clipPath>
                        <path
                          d="
        M 44.01141102032518,0
        Q 44.01141102032518,0 44.01141102032518,0

        L 88.02282204065035,25.409999999999997
        Q 88.02282204065035,25.409999999999997 88.02282204065035,25.409999999999997

        L 88.02282204065035,76.22999999999999
        Q 88.02282204065035,76.22999999999999 88.02282204065035,76.22999999999999

        L 44.01141102032518,101.63999999999999
        Q 44.01141102032518,101.63999999999999 44.01141102032518,101.63999999999999
        
        L 0,76.22999999999999
        Q 0,76.22999999999999 0,76.22999999999999
        
        L 0,25.409999999999997
        Q 0,25.409999999999997 0,25.409999999999997
        Z
      "
                          style={`fill:${themeVar.getMainHexagonBorder()}; transform: translate(0.9%, 0.9%);`}
                        ></path>
                        <path
                          d="
        M 40.01037365484107,0
        Q 40.01037365484107,0 40.01037365484107,0

        L 80.02074730968214,23.099999999999998
        Q 80.02074730968214,23.099999999999998 80.02074730968214,23.099999999999998

        L 80.02074730968214,69.3
        Q 80.02074730968214,69.3 80.02074730968214,69.3

        L 40.01037365484107,92.39999999999999
        Q 40.01037365484107,92.39999999999999 40.01037365484107,92.39999999999999
        
        L 0,69.3
        Q 0,69.3 0,69.3
        
        L 0,23.099999999999998
        Q 0,23.099999999999998 0,23.099999999999998
        Z
      "
                          style="transform: translate(5%, 5%);"
                        ></path>
                      </svg>
                      <span class="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></span>
                    </div>
                  </div>

                  <p class="top-[12px] left-[-8px] relative flex" id="label">
                    <Show
                      when={
                        getSettingsData()?.getCurrentTheme()?.getThemeName() ==
                        themeVar.getThemeName()
                      }
                      fallback={<span class="ml-2">{`${themeVar.getThemeName()}`}</span>}
                    >
                      <FaSolidCircleCheck class="fill-accent mt-1" size={14}></FaSolidCircleCheck>{' '}
                      <span class="ml-2">{`${themeVar.getThemeName()}`}</span>
                    </Show>
                  </p>
                </label>
              </div>
            </Show>
          )}
        </For>
      </Box>
      <h2 class="mt-5">Hexagon</h2>

      <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem
          rowStart={1}
          rowEnd={1}
          colStart={1}
          colEnd={1}
          style="align-self: flex-end;"
          class="flex-col justify-end flex"
        >
          <p>Size</p>
          <Tooltip label={getSettingsData()?.getHexagonSize() + 'px'} withArrow placement="top">
            <input
              class="slider rounded-sm mt-2"
              style={`color:${getSettingsData()?.getSettingsAccentColor()}`}
              type="range"
              id="hexagon-size"
              name="hexagon-size"
              min="20"
              max={Math.floor(getSize() / (9 * 1.169))}
              value={getSettingsData()?.getHexagonSize()}
              step="1"
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                getSettingsData()!.setHexagonSize(inputElement.value);
                updateSettingData();
              }}
            />
          </Tooltip>
        </GridItem>
        <GridItem style="align-self: flex;" class="flex-col justify-end flex ">
          <p>Margin</p>
          <Tooltip label={getSettingsData()?.getHexagonMargin() + 'px'} withArrow placement="top">
            <input
              class="slider w-full rounded-sm mt-2"
              style={`color:${getSettingsData()?.getSettingsAccentColor()}`}
              type="range"
              id="hexagon-size"
              name="hexagon-size"
              min="0"
              max="50"
              value={getSettingsData()?.getHexagonMargin()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                getSettingsData()?.setHexagonMargin(inputElement.value);
                updateSettingData();
              }}
              step="1"
            />
          </Tooltip>
        </GridItem>
      </Grid>

      <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Neutral Color</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getSettingsNeutralColor()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.setSettingsNeutralColor(inputElement.value);
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
                    value={getSettingsData()?.getSettingsNeutralColor()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.setSettingsNeutralColor(inputElement.value);
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
          <p>Text</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getSettingsTextColor()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.setSettingsTextColor(inputElement.value);
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
                    value={getSettingsData()?.getSettingsTextColor()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.setSettingsTextColor(inputElement.value);
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
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1}>
          <h2>Settings</h2>
          <p>Background</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getSettingsBgColor()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
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
                  <InputRightElement pointerEvents="none">
                    <p>hex</p>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
          <p>Accent Color</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getSettingsAccentColor()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.setSettingsAccentColor(inputElement.value);
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
                    value={getSettingsData()?.getSettingsAccentColor()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.setSettingsAccentColor(inputElement.value);
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
        <GridItem
          rowStart={2}
          rowEnd={2}
          colStart={2}
          colEnd={2}
          class="flex-row flex-end justify-end flex"
        >
          <Button
            onClick={() => {
              getSettingsData()?.setSettingsAccentColor('#5A6AFC');
              getSettingsData()?.setSettingsBgColor('#343434');
              getSettingsData()?.setSettingsNeutralColor('#5C5C5C');
              getSettingsData()?.setSettingsTextColor('#DFDFDF');
              updateSettingData();
            }}
            class="bg-accent hoverEffect text-text"
            style="width:55px"
            size="xs"
          >
            Reset
          </Button>
        </GridItem>
      </Grid>
    </>
  );
};
