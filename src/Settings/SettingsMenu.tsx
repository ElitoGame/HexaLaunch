import { getNewTheme } from '../settings';
import { Grid, GridItem, Divider, Tabs, TabList, Tab, TabPanel, VStack } from '@hope-ui/solid';

import { For, Show } from 'solid-js';

//import '../../assets/index.css';
import HexTile from '../HexUI/Components/HexTile';
import HexTileData from '../DataModel/HexTileData';
import { getCurrentRadiant, getHexUiData, getShowPosition } from '../main';
import { NewThemeTab } from './newThemeTab';
import { AppearanceTab } from './appearanceTab';
import { LayoutTab } from './layoutTab';
import { PreferencesTab } from './preferencesTab';
import { setCurrentTab, getCurrentTab } from '../settings';

const HexUIGrid = () => {
  console.log('found hexUIData: ', getHexUiData());
  return (
    <>
      <div class="relative w-full h-screen">
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
                hasAnimation={false}
              ></HexTile>
            )}
          </For>

          <For each={getHexUiData()?.getTiles() ?? []}>
            {(tile: HexTileData, i) => (
              <Show when={i() !== 0}>
                <For each={getHexUiData()?.getRadiantTiles(i())}>
                  {(tile: HexTileData) => (
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
                      hasAnimation={false}
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
                hasAnimation={false}
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
  const tabStyle =
    'w-100 text-text h-30 focus:bg-accent focus:hover:brightness-125 focus:text-white aria-selected:hover:bg-accent aria-selected:bg-accent aria-selected:text-white hover:bg-accent select:text-gray select:bg-accent';
  return (
    <>
      <Grid
        h="100%"
        templateColumns="repeat(3, 1fr)"
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
