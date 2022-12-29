import { getNewTheme, isDraggingTiles, setIsDraggingTiles, wasDraggingTiles } from '../settings';
import {
  Grid,
  GridItem,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  VStack,
  Center,
} from '@hope-ui/solid';

import { batch, createEffect, createResource, For, lazy, onMount, Show } from 'solid-js';

//import '../../assets/index.css';
import HexTile from '../HexUI/Components/HexTile';
import HexTileData, { actionType } from '../DataModel/HexTileData';
import {
  getCurrentRadiant,
  getHexMargin,
  getHexSize,
  getHexUiData,
  getShowPosition,
  setSearchResults,
} from '../main';
import { NewThemeTab } from './newThemeTab';
import { AppearanceTab } from './appearanceTab';
import { LayoutTab } from './layoutTab';
import { PreferencesTab } from './preferencesTab';
import { setCurrentTab, getCurrentTab } from '../settings';
import { RetrievedDoc, search, SearchResult } from '@lyrasearch/lyra';

import { createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { getSearchResults } from '../main';
import HexUiData from '../DataModel/HexUiData';
import { appWindow } from '@tauri-apps/api/window';
import { VsChromeMaximize, VsChromeMinimize, VsChromeRestore, VsClose } from 'solid-icons/vs';
import { UserSettings } from '../datastore';
import { externalApp, externalAppManager } from '../externalAppManager';
import { IoTrashBin } from 'solid-icons/io';
import { invoke } from '@tauri-apps/api';

//import { MultipleListsExample } from './App';
let dragElement: HTMLImageElement | undefined;

const [isDev, setDev] = createSignal(true);
invoke('is_dev').then((res) => setDev(res as boolean));

const [getHexTileData, setHexTileData] = createSignal<dragHexData | null>(null);

window.addEventListener('mouseup', (e) => {
  if (wasDraggingTiles() && dragElement) {
    setIsDraggingTiles(false);
    setIsDraggingFromGrid(false);
    const element = document
      .elementsFromPoint(e.clientX, e.clientY)
      .filter((x) => x.classList.contains('hexTile'))[0] as HTMLDivElement;

    if (element) {
      const data: any = JSON.parse(element.id);
      const newData = getHexTileData() ?? new dragHexData('Unset', '', '', '', 0, 0, 0);
      if (data.x == newData.x && data.y == newData.y && data.radiant == newData.radiant) {
        return;
      }
      const newTile = new HexTileData(
        parseInt(data.x),
        parseInt(data.y),
        parseInt(data.radiant),
        newData.type,
        newData.executable,
        newData.url
      );
      const targetTile =
        getHexUiData()
          ?.getTiles()
          .find(
            (x) => x.getX() === data.x && x.getY() === data.y && x.getRadiant() === data.radiant
          ) ?? new HexTileData(newData.x, newData.y, newData.radiant, data.action, data.icon, '');
      console.log('Target? ', targetTile, newTile);
      UserSettings.setHexTileData(newTile);
      let tiles = getHexUiData()
        ?.getTiles()
        .map((x) => {
          // If the tile is the old tile, set it to the current target tile
          if (
            x.getX() === newData.x &&
            x.getY() === newData.y &&
            x.getRadiant() === newData.radiant
          ) {
            return targetTile ?? x;
          }
          // If the tile is the current target tile, set it to the old tile (new now.)
          if (x.getX() === data.x && x.getY() === data.y && x.getRadiant() === data.radiant) {
            return newTile;
          }
          return x;
        });
      console.log('Add new tile!', data, newData, newTile, targetTile, tiles);
      setSettingsGridTiles(tiles);
      getHexUiData()?.setTiles(tiles);
    }
    setHexTileData(null);
  }
});

window.addEventListener('mousemove', (e) => {
  if (isDraggingTiles() && dragElement) {
    dragElement.style.left = e.clientX - dragElement.clientWidth / 2 + 'px';
    dragElement.style.top = e.clientY - dragElement.clientHeight / 2 + 'px';

    const element = document
      .elementsFromPoint(e.clientX, e.clientY)
      .filter((x) => x.classList.contains('hexTile'))[0] as HTMLDivElement;
    if (element) {
    }
  }
});

const HexAppIcon = async (app: string) => await externalAppManager.getIconOfActionExe(app);
const [hexAppIcon, setHexAppIcon] = createSignal('');
const [hexIcon] = createResource(hexAppIcon, HexAppIcon);

export const [getOptionsVisible, setOptionsVisible] = createSignal({ visible: false, x: 0, y: 0 });

export const [getSettingsGridTiles, setSettingsGridTiles] = createSignal<HexTileData[]>(
  getHexUiData()?.getTiles() ?? [],
  { equals: false }
);

const [isDraggingFromGrid, setIsDraggingFromGrid] = createSignal(false);

createEffect(() => {
  console.log('Tiles changed!', getSettingsGridTiles());
});

const HexUIGrid = () => {
  console.log('found hexUIData: ', getHexUiData());

  let tileList: HTMLDivElement | undefined;

  return (
    <>
      <div class="relative w-full h-full">
        <div
          ref={tileList}
          style={{
            position: 'absolute',
            top: `50%`,
            left: `50%`,
            'font-size': '0',
          }}
        >
          <For each={getSettingsGridTiles()}>
            {(tile: HexTileData, i) => (
              <span
                onMouseDown={(e) => {
                  if (
                    e.target.classList.contains('hexOptions') ||
                    e.target.parentElement.classList.contains('hexOptions')
                  ) {
                    return;
                  }
                  if (tile.getAction() === 'Unset') return;
                  setIsDraggingTiles(true);
                  setIsDraggingFromGrid(true);
                  // setHexTileData(dragData.fromExternalApp(tile));
                  setHexTileData(
                    new dragHexData(
                      tile.getAction() as actionType,
                      tile.getApp(),
                      tile.getUrl(),
                      tile.getIcon(),
                      tile.getX(),
                      tile.getY(),
                      tile.getRadiant()
                    )
                  );
                  dragElement.style.left = e.clientX - dragElement.clientWidth / 2 + 'px';
                  dragElement.style.top = e.clientY - dragElement.clientHeight / 2 + 'px';
                  setHexAppIcon(tile.getApp());
                  e.preventDefault();
                }}
                draggable={false}
                onMouseOver={() => {
                  if (tile.getAction() === 'Unset') return;
                  setOptionsVisible({ visible: true, x: tile.getX(), y: tile.getY() });
                }}
                onMouseLeave={(e) => {
                  setOptionsVisible({ visible: false, x: tile.getX(), y: tile.getY() });
                }}
              >
                <Show
                  when={
                    getOptionsVisible().visible &&
                    getOptionsVisible().x === tile.getX() &&
                    getOptionsVisible().y === tile.getY()
                  }
                >
                  <div
                    class={`hexOptions absolute bg-accent rounded-full h-6 w-${
                      isDev() ? '32' : '6'
                    } flex items-center justify-center z-50 text-base -translate-x-1/2 translate-y-1/2`}
                    style={{
                      left: `${
                        getOptionsVisible().x * (getHexSize() + getHexMargin()) -
                        (getOptionsVisible().y % 2 === 0
                          ? 0
                          : (getHexSize() + getHexMargin()) / 2) -
                        getHexSize() / 2 -
                        (getHexMargin() / 8) * 11.75 +
                        getHexSize() / 2 +
                        (getHexMargin() / 8) * 11.75
                      }px`,
                      bottom: `${
                        getOptionsVisible().y * (getHexSize() * 0.86 + getHexMargin()) -
                        (getHexSize() / 13) * 8 -
                        (getHexMargin() / 8) * 11.75 +
                        getHexSize() +
                        (getHexMargin() / 8) * 11.75
                      }px`,
                    }}
                  >
                    <IoTrashBin
                      class="hexOptions bin fill-text"
                      onClick={() => {
                        console.log('remove tile');
                        // remove tile
                        const oldTile = new HexTileData(
                          tile.getX(),
                          tile.getY(),
                          tile.getRadiant(),
                          'Unset',
                          '',
                          ''
                        );
                        console.log('oldTile', oldTile, getHexTileData());
                        UserSettings.setHexTileData(oldTile);
                        let tiles = getHexUiData()
                          ?.getTiles()
                          .map((x) => {
                            if (
                              x.getX() === tile.getX() &&
                              x.getY() === tile.getY() &&
                              x.getRadiant() === tile.getRadiant()
                            ) {
                              return oldTile;
                            }
                            return x;
                          });
                        setSettingsGridTiles(tiles);
                        getHexUiData()?.setTiles(tiles);
                        setOptionsVisible({ visible: false, x: tile.getX(), y: tile.getY() });
                      }}
                    />
                    <Show when={isDev()}>
                      <span class="ml-2">
                        x:{tile.getX()}, y:{tile.getY()}, r:{tile.getRadiant()}
                      </span>
                    </Show>
                  </div>
                </Show>
                <HexTile
                  zIndex={10}
                  x={tile.getX()}
                  y={tile.getY()}
                  radiant={tile.getRadiant()}
                  title={
                    tile.getAction() === 'Unset'
                      ? '+'
                      : tile
                          .getApp()
                          ?.split('.')[0]
                          ?.split('/')
                          [tile.getApp()?.split('.')[0]?.split('/')?.length - 1]?.slice(0, 3) ??
                        tile
                          .getUrl()
                          ?.split('.')[0]
                          ?.split('/')
                          [tile.getUrl()?.split('.')[0]?.split('/')?.length - 1]?.slice(0, 3)
                  }
                  action={tile.getAction()}
                  icon={tile.getApp()}
                  hasAnimation={false}
                  isSettings={true}
                ></HexTile>
              </span>
            )}
          </For>
        </div>
      </div>
      <Show when={isDraggingTiles() && isDraggingFromGrid()}>
        <img class="w-8 h-8 absolute z-40 cursor-pointer" ref={dragElement} src={hexIcon()}></img>
      </Show>
    </>
  );
};

const HexUIPreview = () => {
  return (
    <>
      <div class="relative w-full h-full">
        <div
          style={{
            position: 'absolute',
            top: `50%`,
            left: `50%`,
            'font-size': '0',
          }}
        >
          <For each={getHexUiData()?.getCoreTiles()}>
            {(tile: HexTileData) => (
              <HexTile
                x={tile.getX()}
                y={tile.getY()}
                radiant={0}
                onClick={() => {
                  console.log(tile);
                }}
                title={
                  tile
                    .getApp()
                    ?.split('.')[0]
                    ?.split('/')
                    [tile.getApp()?.split('.')[0]?.split('/')?.length - 1]?.slice(0, 3) ??
                  tile
                    .getUrl()
                    ?.split('.')[0]
                    ?.split('/')
                    [tile.getUrl()?.split('.')[0]?.split('/')?.length - 1]?.slice(0, 3)
                }
                action={tile.getAction()}
                icon={tile.getApp()}
                hasAnimation={false}
                isSettings={true}
              ></HexTile>
            )}
          </For>
        </div>
      </div>
    </>
  );
};
const SettingsMenu = () => {
  const [isMaximized, setMaximized] = createSignal(false);
  const [getMaxStatus] = createResource(isMaximized, async () => await appWindow.isMaximized());
  // console.log(getHexUiData()?.getCoreTiles());
  const tabStyle = `w-100 text-text text-base h-30 py-0 mt-0
                    focus:bg-accent focus:hover:brightness-125 focus:text-white 
                    aria-selected:hover:bg-accent aria-selected:bg-accent aria-selected:text-white
                    hover:bg-accent select:text-gray select:bg-accent`;
  return (
    <>
      <div data-tauri-drag-region class="h-5 w-full absolute z-20">
        <Center class="absolute top-0 right-0 w-max inline h-full">
          <button
            class="text-text h-full px-2 focus:outline-none hover:bg-background"
            onClick={() => {
              appWindow.minimize();
            }}
          >
            <VsChromeMinimize />
          </button>

          <button
            class="text-text h-full px-2 focus:outline-none hover:bg-background"
            onClick={() => {
              appWindow.toggleMaximize();
            }}
          >
            <Show when={getMaxStatus()} fallback={<VsChromeMaximize />}>
              <VsChromeRestore />
            </Show>
          </button>

          <button
            class="text-text h-full px-2 focus:outline-none hover:bg-red-500"
            onClick={() => {
              appWindow.hide();
            }}
          >
            <VsClose />
          </button>
        </Center>
      </div>
      <Grid
        h="100%"
        templateColumns="repeat(3, 1fr)"
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          console.log(e);
          if (e?.dataTransfer?.dropEffect) {
            e.dataTransfer.dropEffect = 'copy';
          }
          return false;
        }}
      >
        <GridItem class="bg-background rounded-r-md pt-5" id="leftPanelWindow">
          <VStack alignItems="left" spacing="$4">
            <Tabs keepAlive variant="pills" defaultIndex={0}>
              <TabList borderWidth="0px" gap="$8">
                <h1 class="pl-3 text-2xl">Settings</h1>
                <Tab
                  class={tabStyle}
                  onClick={() => {
                    setCurrentTab('Appearance');
                  }}
                >
                  Appearance
                </Tab>
                <Tab
                  class={tabStyle}
                  onClick={() => {
                    setCurrentTab('Layout');
                  }}
                >
                  Layout
                </Tab>
                <Tab
                  class={tabStyle}
                  onClick={() => {
                    setCurrentTab('Preferences');
                  }}
                >
                  Preferences
                </Tab>
              </TabList>
              <Divider class="pb-2" />
              <TabPanel
                onClick={() => {
                  setCurrentTab('Appearance');
                }}
                id="tp_appearance"
              >
                <Show when={getNewTheme()} fallback={<AppearanceTab></AppearanceTab>}>
                  <NewThemeTab></NewThemeTab>
                </Show>
              </TabPanel>
              <TabPanel
                onClick={() => {
                  setCurrentTab('Layout');
                }}
                id="tp_layout"
                class="overflow-y-auto h-screen"
              >
                <LayoutTab></LayoutTab>
              </TabPanel>
              <TabPanel
                onClick={() => {
                  setCurrentTab('Preferences');
                }}
                id="tp_preferences"
              >
                <PreferencesTab></PreferencesTab>
              </TabPanel>
            </Tabs>
          </VStack>
        </GridItem>
        <GridItem rowSpan={1} colSpan={2} h="100%">
          <Show when={getCurrentTab() == 'Layout'}>
            <HexUIGrid></HexUIGrid>
          </Show>
          <Show when={getCurrentTab() == 'Appearance'}>
            <HexUIPreview></HexUIPreview>
          </Show>
        </GridItem>
      </Grid>
    </>
  );
};

export default SettingsMenu;

class dragHexData {
  // include the type, executable (app), url and icon
  type: actionType;
  executable: string;
  url: string;
  icon: string;
  x: number;
  y: number;
  radiant: number;
  constructor(
    type: actionType,
    executable: string,
    url: string,
    icon: string,
    x: number,
    y: number,
    radiant: number
  ) {
    this.type = type;
    this.executable = executable;
    this.url = url;
    this.icon = icon;
    this.x = x;
    this.y = y;
    this.radiant = radiant;
  }
}
