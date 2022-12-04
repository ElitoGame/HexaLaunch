import {
  addApp,
  getNewTheme,
  getCurrentRadiant,
  openApp,
  runAction,
  getShowPosition,
} from '../settings';
import { Grid, GridItem, Divider, Tabs, TabList, Tab, TabPanel, VStack } from '@hope-ui/solid';

import { For, Show } from 'solid-js';

import '../../assets/settings.css';

//import '../../assets/index.css';
import HexTile from '../HexUI/Components/HexTile';
import HexTileData from '../DataModel/HexTileData';
import HexUiData from '../DataModel/HexUiData';
import { getHexUiData, setHexUiData } from '../renderer';
import { NewThemeTab } from './newThemeTab';
import { AppearanceTab } from './appearanceTab';
import { LayoutTab } from './layoutTab';
import { PreferencesTab } from './preferencesTab';
import { setCurrentTab, getCurrentTab } from '../settings';

const HexUIGrid = () => {
  window.electronAPI.getHexUiData((_event: Event, value: any) => {
    value = HexUiData.fromJSON(value as any);
    setHexUiData(value);
  });

  return (
    <>
      <div class="relative w-full h-screen">
        <div
          style={{
            position: 'absolute',
            top: `${getShowPosition()?.y}%`,
            left: `${getShowPosition()?.x}%`,
            'font-size': '0',
          }}
        >
          <For each={getHexUiData()!.getCoreTiles()}>
            {(tile: HexTileData) => (
              <HexTile
                x={tile.getX()}
                y={tile.getY()}
                radiant={0}
                onClick={() => {
                  if (tile.getAction() === 'App') {
                    openApp(tile.getApp(), tile.getUrl());
                  } else if (tile.getAction() === 'PaperBin') {
                    runAction('PaperBin');
                  }
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
              ></HexTile>
            )}
          </For>

          <For each={getHexUiData()!.getTiles()}>
            {(tile: HexTileData, i) => (
              <Show when={i() !== 0}>
                <For each={getHexUiData()!.getRadiantTiles(i())}>
                  {(tile: HexTileData) => (
                    <HexTile
                      zIndex={10}
                      x={tile.getX()}
                      y={tile.getY()}
                      radiant={tile.getRadiant()}
                      onClick={() => {
                        if (tile.getAction() === 'App') {
                          openApp(tile.getApp(), tile.getUrl());
                        } else if (tile.getAction() === 'PaperBin') {
                          runAction('PaperBin');
                        }
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
                      color={'bg-green-400'}
                    ></HexTile>
                  )}
                </For>
              </Show>
            )}
          </For>
        </div>
      </div>
    </>
  );
};

const HexUIPreview = () => {
  return (
    <>
      <div class="relative w-full h-screen">
        <div
          style={{
            position: 'absolute',
            top: `${getShowPosition()?.y}%`,
            left: `${getShowPosition()?.x}%`,
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
                  if (tile.getAction() === 'App') {
                    openApp(tile.getApp(), tile.getUrl());
                  } else if (tile.getAction() === 'PaperBin') {
                    runAction('PaperBin');
                  }
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
              ></HexTile>
            )}
          </For>

          <Show when={getCurrentRadiant() !== -1}>
            <For each={getHexUiData()?.getRadiantTiles(getCurrentRadiant())}>
              {(tile: HexTileData) => (
                <HexTile
                  zIndex={10}
                  x={tile.getX()}
                  y={tile.getY()}
                  radiant={tile.getRadiant()}
                  onClick={() => {
                    if (tile.getAction() === 'App') {
                      openApp(tile.getApp(), tile.getUrl());
                    } else if (tile.getAction() === 'PaperBin') {
                      runAction('PaperBin');
                    }
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
                  color={'bg-green-400'}
                ></HexTile>
              )}
            </For>
          </Show>
        </div>
      </div>
    </>
  );
};
const SettingsMenu = () => {
  // console.log(getHexUiData()?.getCoreTiles());
  const tabstyle =
    'w-100 text-text h-30 focus:bg-accent focus:hover:brightness-125 focus:text-white aria-selected:hover:bg-accent aria-selected:bg-accent aria-selected:text-white hover:bg-accent select:text-gray select:bg-accent';
  return (
    <>
      <Grid
        h="100%"
        templateColumns="repeat(3, 1fr)"
        onDrop={async (e: DragEvent) => {
          e.preventDefault();
          if (e?.dataTransfer?.files[0]?.path) {
            console.log(await addApp(e.dataTransfer.files[0].path));
          }
          // console.log(e.dataTransfer.files[0].path);
        }}
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          if (e?.dataTransfer?.dropEffect) {
            e.dataTransfer.dropEffect = 'copy';
          }
          return false;
        }}
      >
        <GridItem class="bg-background" id="leftPanelWindow">
          <VStack alignItems="left" spacing="$4">
            <Tabs keepAlive variant="pills" defaultIndex={0}>
              <TabList borderWidth="1px">
                <h1 class="pl-3">Settings</h1>
                <Tab
                  class={tabstyle}
                  onClick={() => {
                    setCurrentTab('Appearance');
                    console.log(getCurrentTab());
                  }}
                >
                  Appearance
                </Tab>
                <Tab
                  class={tabstyle}
                  onClick={() => {
                    setCurrentTab('Layout');
                    console.log(getCurrentTab());
                  }}
                >
                  Layout
                </Tab>
                <Tab
                  class={tabstyle}
                  onClick={() => {
                    setCurrentTab('Preferences');
                    console.log(getCurrentTab());
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
                style="width:400px"
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
        <GridItem rowSpan={1} colSpan={2} bg="#EAEAEA" h="100%">
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
