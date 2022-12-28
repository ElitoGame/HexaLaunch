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

import { batch, createResource, For, lazy, onMount, Show } from 'solid-js';

//import '../../assets/index.css';
import HexTile from '../HexUI/Components/HexTile';
import HexTileData, { actionType } from '../DataModel/HexTileData';
import { getCurrentRadiant, getHexUiData, getShowPosition, setSearchResults } from '../main';
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

//import { MultipleListsExample } from './App';
let dragElement: HTMLImageElement | undefined;

const [getHexTileData, setHexTileData] = createSignal<dragHexData | null>(null);

window.addEventListener('mouseup', (e) => {
  setIsDraggingTiles(false);
  const element = document
    .elementsFromPoint(e.clientX, e.clientY)
    .filter((x) => x.classList.contains('hexTile'))[0] as HTMLDivElement;

  const binelement = document
    .elementsFromPoint(e.clientX, e.clientY)
    .filter((x) => x.classList.contains('bin'))[0] as HTMLDivElement;
  if (element) {
    const data: any = JSON.parse(element.id);
    if (data.action === 'Unset') {
      const newData = getHexTileData() ?? new dragHexData('Unset', '', '', '', 0, 0, 0);
      const newTile = new HexTileData(
        parseInt(data.x),
        parseInt(data.y),
        parseInt(data.radiant),
        newData.type,
        newData.executable,
        newData.url
      );
      UserSettings.setHexTileData(newTile);
      console.log('Unset', data, newData, newTile);
    } else {
      console.log(data, dragHexData);
    }
  } else if (binelement) {
    console.log('no element');
    // remove tile
    const oldTile = new HexTileData(
      getHexTileData()?.x ?? 0,
      getHexTileData()?.y ?? 0,
      getHexTileData()?.radiant ?? 0,
      'Unset',
      '',
      ''
    );
    console.log('oldTile', oldTile, getHexTileData());
    UserSettings.setHexTileData(oldTile);
  }
  setHexTileData(null);
});

window.addEventListener('mousemove', (e) => {
  if (isDraggingTiles()) {
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
          <For each={getHexUiData()?.getTiles() ?? []}>
            {(tile: HexTileData, i) => (
              <span
                onMouseDown={(e) => {
                  if (tile.getAction() === 'Unset') return;
                  console.log('mouse down');
                  setIsDraggingTiles(true);
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
              >
                <HexTile
                  zIndex={10}
                  x={tile.getX()}
                  y={tile.getY()}
                  radiant={tile.getRadiant()}
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
              </span>
            )}
          </For>
        </div>
      </div>
      <Show when={isDraggingTiles()}>
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
  const tabStyle =
    'w-100 text-text text-base h-30 focus:bg-accent focus:hover:brightness-125 focus:text-white aria-selected:hover:bg-accent aria-selected:bg-accent aria-selected:text-white hover:bg-accent select:text-gray select:bg-accent';
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
          <Show when={wasDraggingTiles()}>
            <IoTrashBin class="bin absolute right-2 bottom-2 p-3 w-12 h-12 fill-text" />
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
  }
}
