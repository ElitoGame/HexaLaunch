import { getRelevantApps, isDraggingTiles, setIsDraggingTiles } from '../settings';
import { Box, Input, Center, HStack } from '@hope-ui/solid';

import { createSignal, For, onMount, Show } from 'solid-js';
import { getHexUiData, getSearchResults, searchAppDB, setHexUiData } from '../main';
import HexTile from '../HexUI/Components/HexTile';
import HexTileData, { actionType } from '../DataModel/HexTileData';
import { externalApp } from '../externalAppManager';
import { UserSettings } from '../datastore';
import { setSettingsGridTiles, setOptionsVisible } from './SettingsMenu';

export const LayoutTab = () => {
  const [getPage, setPage] = createSignal<number>(0);
  let searchBar: HTMLInputElement | undefined;
  let dragElement: HTMLImageElement | undefined;

  const [isDraggingFromSidebar, setIsDraggingFromSidebar] = createSignal<boolean>(false);

  const [getHexTileData, setHexTileData] = createSignal<dragData | null>(null);

  window.addEventListener('mouseup', (e) => {
    setIsDraggingTiles(false);
    setIsDraggingFromSidebar(false);
    const element = document
      .elementsFromPoint(e.clientX, e.clientY)
      .filter((x) => x.classList.contains('hexTile'))[0] as HTMLDivElement;
    if (element) {
      const data: any = JSON.parse(element.id);
      if (data.action === 'Unset') {
        const newData = getHexTileData() ?? new dragData('Unset', '', '', '');
        const newTile = new HexTileData(
          parseInt(data.x),
          parseInt(data.y),
          parseInt(data.radiant),
          newData.type,
          newData.executable,
          newData.url
        );
        UserSettings.setHexTileData(newTile);
        let tiles = getHexUiData()
          ?.getTiles()
          .map((x) => {
            if (
              x.getX() === newTile.getX() &&
              x.getY() === newTile.getY() &&
              x.getRadiant() === newTile.getRadiant()
            ) {
              return newTile;
            }
            return x;
          });
        setSettingsGridTiles(tiles);
        getHexUiData()?.setTiles(tiles);
        setOptionsVisible({ visible: false, x: newTile.getX(), y: newTile.getY() });
      }
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

  return (
    <>
      <p>Drag & drop assets to your layout.</p>
      <h2>Search Assets</h2>
      <Input
        bg="#C3C2C2"
        ref={searchBar}
        class="text-text"
        onInput={(e) => {
          searchAppDB((e.target as HTMLInputElement).value);
          setPage(0);
        }}
      ></Input>
      <br></br>
      <br></br>

      <Box class="bg-gray mb-5" minH="100px" borderRadius="$lg">
        <Show when={!((getSearchResults()?.hits?.length ?? 0) > 0)}>
          <p class="text-base flex p-3 align-center justify-center">
            {' '}
            Search something to see results!
          </p>
        </Show>
        <ul class="p-1">
          <For each={getSearchResults()?.hits ?? []}>
            {(res) => (
              <>
                <Box
                  borderRadius="$lg"
                  onClick={() => {
                    if (searchBar) {
                      if (searchBar.value.match(/^([a-z]:)?(\/|\\).*/gi)) {
                        const newPath =
                          res.document.executable.replaceAll('\\', '/') +
                          (res.document.type === 'Folder' ? '/' : '');
                        searchBar.value = newPath;

                        searchAppDB(newPath);
                        setPage(0);
                        searchBar.focus();
                      }
                    }
                  }}
                >
                  <li>
                    <HStack>
                      <Box class="my-2 bg-background p-3.5" borderRadius="$lg">
                        <div class="w-25">
                          <img src={res.document.icon} class="w-7"></img>
                        </div>
                      </Box>
                      <div>
                        <Box
                          class="my-2 ml-3 p-2 bg-background whitespace-nowrap"
                          maxW="280px"
                          minW="280px"
                          borderRadius="$lg"
                        >
                          <p class="truncate ...">{res.document.name}</p>
                          <p class="truncate ...">{res.document.executable}</p>{' '}
                        </Box>
                      </div>
                    </HStack>
                  </li>
                </Box>
              </>
            )}
          </For>
        </ul>
      </Box>
      <Show when={(getSearchResults()?.hits?.length ?? 0) > 0}>
        <Center>
          <button
            class="bg-blue-300 rounded-sm px-2 py-1 m-2"
            onClick={() => {
              if (searchBar?.value !== '' && getPage() > 0) {
                setPage((page) => page - 1);
                searchAppDB(searchBar?.value ?? '', getPage() * 10);
              }
            }}
          >
            Prev
          </button>
          <span>{getPage() + 1}</span>
          <button
            class="bg-blue-300 rounded-sm px-2 py-1 m-2"
            onClick={() => {
              console.log(getSearchResults()?.count);
              if (
                searchBar?.value !== '' &&
                (getSearchResults()?.count ?? 0) > (getPage() + 1) * 10
              ) {
                setPage((page) => page + 1);
                searchAppDB(searchBar?.value ?? '', getPage() * 10);
              }
            }}
          >
            Next
          </button>
        </Center>

        <h2>Apps</h2>
        <p>
          This list only contains the most important Apps. If you do not find the App you are
          looking for you can use the search function above.{' '}
        </p>
      </Show>
      <Box class="bg-gray overflow-auto" maxH="60vh" minH="100px" borderRadius="$lg">
        <ul class="p-1">
          <For each={getRelevantApps() ?? []}>
            {(res) => (
              <li
                onMouseDown={(e) => {
                  console.log('mouse down');
                  setIsDraggingTiles(true);
                  setIsDraggingFromSidebar(true);
                  setHexTileData(dragData.fromExternalApp(res));
                  e.preventDefault();
                  dragElement.style.left = e.clientX - dragElement.clientWidth / 2 + 'px';
                  dragElement.style.top = e.clientY - dragElement.clientHeight / 2 + 'px';
                }}
                draggable={false}
              >
                <HStack>
                  <Box class="my-2 p-3.5 bg-background" borderRadius="$lg">
                    <div class="w-25">
                      <img src={res.icon} class="w-7"></img>
                    </div>
                  </Box>
                  <div>
                    <Box
                      class="my-2 ml-3 p-2 bg-background whitespace-nowrap"
                      maxW="280px"
                      minW="280px"
                      borderRadius="$lg"
                    >
                      <p class="truncate ...">{res.name}</p>
                      <p class="truncate ...">{res.executable}</p>{' '}
                    </Box>
                  </div>
                </HStack>
              </li>
            )}
          </For>
        </ul>
      </Box>
      <p>Actions</p>
      <Box bg="#C3C2C2" h="200px" borderRadius="$lg"></Box>
      <Show when={isDraggingTiles() && isDraggingFromSidebar()}>
        <img
          class="w-8 h-8 absolute z-40 cursor-pointer"
          ref={dragElement}
          src={getHexTileData()?.icon ?? ''}
        ></img>
      </Show>
    </>
  );
};

class dragData {
  // include the type, executable (app), url and icon
  type: actionType;
  executable: string;
  url: string;
  icon: string;
  constructor(type: actionType, executable: string, url: string, icon: string) {
    this.type = type;
    this.executable = executable;
    this.url = url;
    this.icon = icon;
  }

  static fromExternalApp(app: externalApp, url: string = ''): dragData {
    return new dragData(app.type as actionType, app.executable, url, app.icon);
  }
}
