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
  HStack,
  Button,
  Input,
} from '@hope-ui/solid';

import {
  batch,
  createEffect,
  createResource,
  For,
  lazy,
  Match,
  onMount,
  Show,
  Switch,
} from 'solid-js';

//import '../../assets/index.css';
import HexTile from '../HexUI/Components/HexTile';
import HexTileData, { actionType } from '../DataModel/HexTileData';
import {
  getCurrentRadiant,
  getHexMargin,
  getHexSize,
  getHexUiData,
  getShowPosition,
  isValidUrl,
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
import { IoArrowForward, IoTrashBin } from 'solid-icons/io';
import { invoke } from '@tauri-apps/api';
import { emit, listen } from '@tauri-apps/api/event';
import { BsPen } from 'solid-icons/bs';
import { FaSolidPen } from 'solid-icons/fa';

//import { MultipleListsExample } from './App';
let dragElement: HTMLImageElement | undefined;

const [getHexTileData, setHexTileData] = createSignal<dragHexData | null>(null);

export const [getOverWriteWarning, setOverWriteWarning] = createSignal({
  visible: false,
  targetTile: null,
  newTile: null,
});
const iconGetter = async (app: string) => await externalAppManager.getIconOfActionExe(app);
const [overwriteTargetSignal, setOverwriteTargetSignal] = createSignal<string | null>(null);
const [overwriteNewSignal, setOverwriteNewSignal] = createSignal<string | null>(null);
const [overwriteTargetIcon] = createResource(overwriteTargetSignal, iconGetter);
const [overwriteNewIcon] = createResource(overwriteNewSignal, iconGetter);
createEffect(() => {
  if (getOverWriteWarning().visible) {
    setOverwriteTargetSignal(getOverWriteWarning().targetTile.app);
    setOverwriteNewSignal(getOverWriteWarning().newTile.app);
  }
});

export const [getEditDialog, setEditDialog] = createSignal({
  visible: false,
  targetTile: null,
});
const [editTargetSignal, setEditTargetSignal] = createSignal<string | null>(null);
const [editTargetIcon] = createResource(editTargetSignal, iconGetter);
createEffect(() => {
  if (getEditDialog().visible) {
    setEditTargetSignal(getEditDialog().targetTile.getApp());
  }
});
let urlInput: HTMLInputElement | undefined;

let rightPanelWindow: HTMLDivElement | undefined;

window.addEventListener('mouseup', (e) => {
  if (wasDraggingTiles() && dragElement && isDraggingFromGrid()) {
    // hide the drag element
    setIsDraggingTiles(false);
    setIsDraggingFromGrid(false);
    // get the hexTile at the mouse position
    const element = document
      .elementsFromPoint(e.clientX, e.clientY)
      .filter((x) => x.classList.contains('hexTile'))[0] as HTMLDivElement;

    if (element) {
      // extract the data from the hexTile's id
      const data: any = JSON.parse(element.id.replaceAll('\n', ''));
      const newData = getHexTileData() ?? new dragHexData('Unset', '', '', '', 0, 0, 0);
      // If the tile is the same, don't do anything
      if (data.x == newData.x && data.y == newData.y && data.radiant == newData.radiant) {
        setHexTileData(null);
        return;
      }
      // Create the tiledata of the orginal tile (the one that was dragged)
      const originTile = new HexTileData(
        parseInt(data.x),
        parseInt(data.y),
        parseInt(data.radiant),
        newData.type,
        newData.executable,
        newData.url
      );
      // Create the tiledata of the target tile (the one that was dropped on)
      const targetTile = new HexTileData(
        newData.x,
        newData.y,
        newData.radiant,
        data.action,
        data.app,
        data.url.replace('        ', '')
      );
      // Update the UI
      // create a map of the tiles, and replace the old tile with the new one, and the new one with the old one. (swap)
      let tiles = getHexUiData()
        ?.getTiles()
        .map((x) => {
          // If the tile is the old tile, set it to the current target tile
          if (
            x.getX() === originTile.getX() &&
            x.getY() === originTile.getY() &&
            x.getRadiant() === originTile.getRadiant()
          ) {
            return targetTile;
          }
          // If the tile is the current target tile, set it to the old tile (new now.)
          if (
            x.getX() === targetTile.getX() &&
            x.getY() === targetTile.getY() &&
            x.getRadiant() === targetTile.getRadiant()
          ) {
            return originTile;
          }
          return x;
        });
      // Save the data on the file.
      UserSettings.setHexTileDataArray(tiles);
      // Set the tiles to update the UI
      setSettingsGridTiles(tiles);
      // Set the tiles to update the data model
      getHexUiData()?.setTiles(tiles);
    }
    // Clear the drag data
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
  emit('hexTilesChanged', getSettingsGridTiles());
});

listen('hexUiDataLoaded', () => {
  setSettingsGridTiles(getHexUiData().getTiles());
});

const HexUIGrid = () => {
  console.log('found hexUIData: ', getHexUiData());

  let tileList: HTMLDivElement | undefined;

  const [getGridScale, setGridScale] = createSignal(
    getHexSize() * 9 + getHexMargin() * 7 > rightPanelWindow.clientWidth
      ? rightPanelWindow.clientWidth / (getHexSize() * 9 + getHexMargin() * 7 + 20)
      : 1
  );

  window.onresize = () =>
    setGridScale(() =>
      getHexSize() * 9 + getHexMargin() * 7 > rightPanelWindow.clientWidth
        ? rightPanelWindow.clientWidth / (getHexSize() * 9 + getHexMargin() * 7 + 20)
        : 1
    );

  return (
    <>
      <div class="relative w-full h-full">
        <div
          ref={tileList}
          style={{
            position: 'absolute',
            top: `50%`,
            left: `50%`,
            transform: `translate(-50%, -50%) scale(${getGridScale()})`,
            'font-size': '0',
          }}
        >
          <For each={getSettingsGridTiles()}>
            {(tile: HexTileData, i) => (
              <span
                class="select-none"
                onMouseDown={(e) => {
                  if (
                    e.target.classList.contains('hexOptions') ||
                    e.target.parentElement.classList.contains('hexOptions')
                  ) {
                    return;
                  }
                  console.log('mouse down');
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
                    class={`hexOptions absolute bg-accent rounded-full h-6 w-max p-1 flex items-center justify-center z-50 text-base -translate-x-1/2 translate-y-1/2 gap-1 cursor-pointer`}
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
                      class="hexOptions bin fill-text w-6"
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
                    <Show when={tile.getAction() === 'App'}>
                      <FaSolidPen
                        class="hexOptions bin fill-text"
                        onClick={() => {
                          setEditDialog({ visible: true, targetTile: tile });
                        }}
                      />
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
                  app={tile.getApp()}
                  url={tile.getUrl()?.trim() ?? ''}
                  hasAnimation={false}
                  isSettings={true}
                ></HexTile>
              </span>
            )}
          </For>
        </div>
        <Show when={getEditDialog().visible}>
          <div
            ref={tileList}
            style={{
              position: 'absolute',
              top: `50%`,
              left: `50%`,
              transform: `translate(-50%, -50%)`,
            }}
            class="text-base text-text"
          >
            <div class="bg-background p-4 rounded-md">
              <HStack>
                <VStack class="justify-center mr-4">
                  <span>
                    <Switch
                      fallback={
                        <Show
                          when={
                            editTargetIcon.loading || editTargetIcon() === '' || !editTargetIcon()
                          }
                          fallback={<img src={editTargetIcon()} alt="" class="w-10 h-10" />}
                        >
                          <span class="">{'Image Unavailable'}</span>
                        </Show>
                      }
                    >
                      <Match when={getEditDialog().targetTile.action === 'MediaPlayer'}>
                        <span class="">🎵</span>
                      </Match>
                      <Match when={getEditDialog().targetTile.action === 'PaperBin'}>
                        <span class="">🗑</span>
                      </Match>
                      {/* <Match when={getEditDialog().targetTile.action === 'Web'}>
                      <span class="">🌐</span>
                    </Match> */}
                    </Switch>
                  </span>
                  {/* <Button
                    class="text-accent text-sm underline hover:bg-transparent hover:text-accent hover:brightness-125"
                    onClick={() => setEditDialog({ visible: false, targetTile: null })}
                  >
                    Change Icon
                  </Button> */}
                </VStack>
                <VStack class="justify-end items-end">
                  <div class="flex justify-start flex-col">
                    <label for="urlInput">URL</label>
                    <Input
                      type="text"
                      class="rounded-md text-text w-64"
                      id="urlInput"
                      value={getEditDialog().targetTile.getUrl()}
                      ref={urlInput}
                    ></Input>
                  </div>
                  <HStack class="mt-2">
                    <Button
                      class="text-accent underline bg-transparent hover:bg-transparent hover:text-accent hover:brightness-125"
                      onClick={() => setEditDialog({ visible: false, targetTile: null })}
                    >
                      Cancel
                    </Button>
                    <Button
                      class="bg-accent hover:bg-accent hover:brightness-125 text-text"
                      onClick={() => {
                        // update the tile's url
                        // (need to recreate the tile to update the For loop in the SettingsGrid)
                        let updateTile = new HexTileData(
                          getEditDialog().targetTile.getX(),
                          getEditDialog().targetTile.getY(),
                          getEditDialog().targetTile.getRadiant(),
                          getEditDialog().targetTile.getAction(),
                          getEditDialog().targetTile.getApp(),
                          urlInput.value
                        );
                        UserSettings.setHexTileData(updateTile);
                        let tiles = getHexUiData()
                          ?.getTiles()
                          .map((x) => {
                            if (
                              x.getX() === updateTile.getX() &&
                              x.getY() === updateTile.getY() &&
                              x.getRadiant() === updateTile.getRadiant()
                            ) {
                              return updateTile;
                            }
                            return x;
                          });
                        console.log(tiles);
                        setSettingsGridTiles(tiles);
                        getHexUiData()?.setTiles(tiles);
                        setOptionsVisible({
                          visible: false,
                          x: updateTile.getX(),
                          y: updateTile.getY(),
                        });
                        setEditDialog({ visible: false, targetTile: null });
                      }}
                    >
                      Save
                    </Button>
                  </HStack>
                </VStack>
              </HStack>
            </div>
          </div>
        </Show>
        <Show when={getOverWriteWarning().visible}>
          <div
            ref={tileList}
            style={{
              position: 'absolute',
              top: `50%`,
              left: `50%`,
              transform: `translate(-50%, -50%)`,
            }}
            class="text-base"
          >
            <div class="bg-background p-4 px-8 rounded-md">
              <VStack>
                <HStack>
                  <Switch
                    fallback={
                      <Show
                        when={
                          overwriteTargetIcon.loading ||
                          overwriteTargetIcon() === '' ||
                          !overwriteTargetIcon()
                        }
                        fallback={<img src={overwriteTargetIcon()} alt="" class="w-10 h-10" />}
                      >
                        <span class="">{'Image Unavailable'}</span>
                      </Show>
                    }
                  >
                    <Match when={getOverWriteWarning().targetTile.action === 'MediaPlayer'}>
                      <span class="">🎵</span>
                    </Match>
                    <Match when={getOverWriteWarning().targetTile.action === 'PaperBin'}>
                      <span class="">🗑</span>
                    </Match>
                    {/* <Match when={getOverWriteWarning().targetTile.action === 'Web'}>
                      <span class="">🌐</span>
                    </Match> */}
                  </Switch>
                  <IoArrowForward class="mx-5 fill-text text-text" />
                  <Switch
                    fallback={
                      <Show
                        when={
                          overwriteNewIcon.loading ||
                          overwriteNewIcon() === '' ||
                          !overwriteNewIcon()
                        }
                        fallback={<img src={overwriteNewIcon()} alt="" class="w-10 h-10" />}
                      >
                        <span class="">{'Image Unavailable'}</span>
                      </Show>
                    }
                  >
                    <Match when={getOverWriteWarning().newTile.action === 'MediaPlayer'}>
                      <span class="">🎵</span>
                    </Match>
                    <Match when={getOverWriteWarning().newTile.action === 'PaperBin'}>
                      <span class="">🗑</span>
                    </Match>
                    {/* <Match when={getOverWriteWarning().newTile.action === 'Web'}>
                      <span class="">🌐</span>
                    </Match> */}
                  </Switch>
                </HStack>
                <p>
                  This Hexagon is already filled.
                  <br />
                  If you continue the asset will be replaced!
                </p>
                <HStack>
                  <Button
                    class="text-accent underline bg-transparent hover:bg-transparent hover:text-accent hover:brightness-125"
                    onClick={() =>
                      setOverWriteWarning({ visible: false, targetTile: null, newTile: null })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    class="bg-accent hover:bg-accent hover:brightness-125 text-text"
                    onClick={() => {
                      // overwrite tile
                      UserSettings.setHexTileData(getOverWriteWarning().newTile);
                      let tiles = getHexUiData()
                        ?.getTiles()
                        .map((x) => {
                          if (
                            x.getX() === getOverWriteWarning().newTile.getX() &&
                            x.getY() === getOverWriteWarning().newTile.getY() &&
                            x.getRadiant() === getOverWriteWarning().newTile.getRadiant()
                          ) {
                            return getOverWriteWarning().newTile;
                          }
                          return x;
                        });
                      setSettingsGridTiles(tiles);
                      getHexUiData()?.setTiles(tiles);
                      setOptionsVisible({
                        visible: false,
                        x: getOverWriteWarning().newTile.getX(),
                        y: getOverWriteWarning().newTile.getY(),
                      });
                      setOverWriteWarning({ visible: false, targetTile: null, newTile: null });
                    }}
                  >
                    Continue
                  </Button>
                </HStack>
              </VStack>
            </div>
          </div>
        </Show>
        <Show when={getGridScale() !== 1}>
          <span class="absolute bottom-2 right-2 text-text brightness-50">
            Scaled to {Math.floor(getGridScale() * 100)}%
          </span>
        </Show>
      </div>
      <Show when={isDraggingTiles() && isDraggingFromGrid()}>
        <Switch
          fallback={
            <Show
              when={isValidUrl(getHexTileData()?.url ?? '')}
              fallback={
                // No URL or not http show this:
                <img
                  ref={dragElement}
                  class="w-8 h-8 absolute z-40 cursor-pointer"
                  src={hexIcon()}
                ></img>
              }
            >
              <div class="w-8 h-8 absolute z-40 cursor-pointer" ref={dragElement}>
                <img
                  src={`https://www.google.com/s2/favicons?domain=${
                    getHexTileData()?.url ?? ''
                  }&sz=${128}`}
                ></img>
                <img
                  src={hexIcon()}
                  class={`absolute`}
                  style={{
                    width: `${getHexSize() / 66}rem`,
                    top: `${getHexSize() / 66}rem`,
                    left: `${(getHexSize() * 1.3) / 66}rem`,
                  }}
                ></img>
              </div>
            </Show>
          }
        >
          <Match when={getHexTileData()?.type === 'MediaPlayer'}>
            <span class="w-8 h-8 absolute z-40 cursor-pointer" ref={dragElement}>
              🎵
            </span>
          </Match>
          <Match when={getHexTileData()?.type === 'PaperBin'}>
            <span class="w-8 h-8 absolute z-40 cursor-pointer" ref={dragElement}>
              🗑
            </span>
          </Match>
          {/* <Match when={getHexTileData()?.type === 'Web'}>
            <span class="w-8 h-8 absolute z-40 cursor-pointer" ref={dragElement}>
              🌐
            </span>
          </Match> */}
        </Switch>
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
            transform: `translate(-50%, -50%)`,
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
                app={tile.getApp()}
                url={tile.getUrl()?.trim() ?? ''}
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
                    hover:bg-accent select:text-neutral select:bg-accent`;
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
        <GridItem class="bg-background rounded-r-md pt-5 h-screen" id="leftPanelWindow">
          <VStack alignItems="left" spacing="$4" class="h-full">
            <Tabs keepAlive variant="pills" defaultIndex={0} class="h-full pb-8">
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
                class="overflow-y-auto h-full"
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
                class="overflow-y-auto h-full"
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
        <GridItem rowSpan={1} colSpan={2} h="100%" ref={rightPanelWindow}>
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
