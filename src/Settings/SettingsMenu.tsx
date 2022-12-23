import { getNewTheme} from '../settings';
import { Grid, GridItem, Divider, Tabs, TabList, Tab, TabPanel, VStack } from '@hope-ui/solid';

import { batch, createResource, For, lazy, Show } from 'solid-js';

//import '../../assets/index.css';
import HexTile from '../HexUI/Components/HexTile';
import HexTileData from '../DataModel/HexTileData';
import { getCurrentRadiant, getHexUiData, getShowPosition, setSearchResults } from '../main';
import { NewThemeTab } from './newThemeTab';
import { AppearanceTab } from './appearanceTab';
import { LayoutTab } from './layoutTab';
import { PreferencesTab } from './preferencesTab';
import { setCurrentTab, getCurrentTab } from '../settings';
import { RetrievedDoc, search, SearchResult } from '@lyrasearch/lyra';
import {
  DragDropProvider,
  DragDropSensors,
  DragEventHandler,
  createDraggable,
  createDroppable,
  SortableProvider,
  createSortable,
} from "@thisbeyond/solid-dnd";
import { createSignal} from "solid-js";
import { createStore } from 'solid-js/store';
import { getSearchResults } from '../main';
import {
  DragOverlay,
  closestCenter,
} from "@thisbeyond/solid-dnd";
import HexUiData from '../DataModel/HexUiData';
//import { MultipleListsExample } from './App';


declare module 'solid-js' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface Directives {
      draggable: boolean;
      droppable: boolean;
      sortable: boolean;
    }
  }
}
export const Sortable = (props) => {
  const sortable = createSortable(props.item);
  return (
    <div
      use:sortable
      class="sortable"
      classList={{ "opacity-25": sortable.isActiveDraggable }}
    > 
      1
    </div>
  );
};


export const Column = (props) => {
  const droppable = createDroppable(props.id);
  console.log(JSON.stringify(props.id));
  // const map1 = props.items.map(x => x.document.icon);
  // console.log(JSON.stringify(map1 )+ "map");
  console.log(JSON.stringify(props))
  return (
    <div use:droppable >
      <SortableProvider ids={props.items}>
        
        <For each={props.items}>{(item : string) => <div class ="bg-gray w-10 h-10"><Sortable item={item} /> <img src={item}/></div>}</For>
      </SortableProvider>
    </div>
  );
};

export const MultipleListsExample = () => {
 
 const [containers, setContainers] = createStore<Record<string, any[]>>({
  A: getSearchResults()?.hits.map(x => x.document.executable) ?? [],
  });
  const containerIds = () =>  Object.keys(containers);

  const isContainer = (id) => containerIds().includes(id);

  const getContainer = (id) => {
    for (const [key, items] of Object.entries(containers)) {
      if (items.includes(id)) {
        return key;
      }
    }
  };

  const closestContainerOrItem = (draggable, droppables, context) => {
    console.log(JSON.stringify(droppables));
    const closestContainer = closestCenter(
      draggable,
      droppables.filter((droppable) => isContainer(droppable.id)),
      context
    );
    if (closestContainer) {
      const containerItemIds = containers[closestContainer.id];
      console.log(JSON.stringify(containerItemIds));
      console.log(JSON.stringify(Object.keys(containers)));
      console.log(JSON.stringify(droppables));
       
      const closestItem = closestCenter(
        draggable,
        droppables.filter((droppable) =>
          containerItemIds.includes(droppable.id)
        ),
        context
      );
      if (!closestItem) {
        return closestContainer;
      }

      if (getContainer(draggable.id) !== closestContainer.id) {
        const isLastItem =
          containerItemIds.indexOf(closestItem.id as Object) ===
          containerItemIds.length - 1;

        if (isLastItem) {
          const belowLastItem =
            draggable.transformed.center.y > closestItem.transformed.center.y;

          if (belowLastItem) {
            return closestContainer;
          }
        }
      }
      return closestItem;
    }
  };

  const move = (draggable, droppable, onlyWhenChangingContainer = true) => {
    const draggableContainer = getContainer(draggable.id);
    const droppableContainer = isContainer(droppable.id)
      ? droppable.id
      : getContainer(droppable.id);

    if (
      draggableContainer != droppableContainer ||
      !onlyWhenChangingContainer
    ) {
      const containerItemIds = containers[droppableContainer];
      let index = containerItemIds.indexOf(droppable.id);
      if (index === -1) index = containerItemIds.length;

      batch(() => {
        setContainers(draggableContainer, (items) =>
          items.filter((item) => item !== draggable.id)
        );
        setContainers(droppableContainer, (items) => [
          ...items.slice(0, index),
          draggable.id,
          ...items.slice(index),
        ]);
      });
    }
  };

 const onDragOver = ({ draggable, droppable }) => {
    if (draggable && droppable) {
      move(draggable, droppable);
    }
  };

  const onDragEnd = ({ draggable, droppable }) => {
    if (draggable && droppable) {
      move(draggable, droppable, false);
    }
  };

  return (
    <div class="flex flex-col flex-1 mt-5 self-stretch">
      <DragDropProvider
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        collisionDetector={closestContainerOrItem}
      >
        <DragDropSensors />
        <div class="columns">
          <For each={containerIds()}>
            {(key) => <Column id={key} items={containers[key]} />}
          </For>
        </div>
        <DragOverlay>
          
        </DragOverlay>
      </DragDropProvider>
    </div>
  );
};








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
        <GridItem rowSpan={1} colSpan={2} bg="#EAEAEA" h="100%">
          <Show when={getCurrentTab() == 'Layout'}>
            <MultipleListsExample></MultipleListsExample>
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
