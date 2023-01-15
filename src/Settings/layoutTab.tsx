import { getAllApps, getRelevantApps, isDraggingTiles, setIsDraggingTiles } from '../settings';
import {
  Box,
  Input,
  HStack,
  InputGroup,
  InputLeftElement,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
} from '@hope-ui/solid';

import { createSignal, For, Match, Show, Switch } from 'solid-js';
import { getHexUiData, getSearchResults, searchAppDB } from '../main';
import HexTileData, { actionType } from '../DataModel/HexTileData';
import { externalApp } from '../externalAppManager';
import { UserSettings } from '../datastore';
import { setSettingsGridTiles, setOptionsVisible, setOverWriteWarning } from './SettingsMenu';
import { BsSearch } from 'solid-icons/bs';
import { FaSolidMusic, FaSolidTrashCan } from 'solid-icons/fa';

export const LayoutTab = () => {
  let searchBar: HTMLInputElement | undefined;
  let dragElement: HTMLImageElement | undefined;

  const [isDraggingFromSidebar, setIsDraggingFromSidebar] = createSignal<boolean>(false);

  const [getHexTileData, setHexTileData] = createSignal<dragData | null>(null);

  window.addEventListener('mouseup', (e) => {
    if (isDraggingFromSidebar()) {
      setIsDraggingTiles(false);
      setIsDraggingFromSidebar(false);
      const element = document
        .elementsFromPoint(e.clientX, e.clientY)
        .filter((x) => x.classList.contains('hexTile'))[0] as HTMLDivElement;
      if (element) {
        const data: any = JSON.parse(element.id.replaceAll('\n', '').replace('        ', ''));
        const newData = getHexTileData() ?? new dragData('Unset', '', '', '');
        const newTile = new HexTileData(
          parseInt(data.x),
          parseInt(data.y),
          parseInt(data.radiant),
          newData.type,
          newData.executable,
          newData.url
        );
        // Only place tiles on an empty tile, otherwise show a warning to overwrite, except if shift is pressed.
        if (data.action === 'Unset' || e.shiftKey) {
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
        } else {
          const targetTile = new HexTileData(
            parseInt(data.x),
            parseInt(data.y),
            parseInt(data.radiant),
            data.action,
            data.app,
            data.url
          );
          setOverWriteWarning({ visible: true, targetTile: targetTile, newTile: newTile });
        }
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

  return (
    <div class="flex flex-col h-full">
      <p>Drag & drop assets to your layout.</p>
      <h2>Search Assets</h2>
      <InputGroup>
        <InputLeftElement>
          <BsSearch />
        </InputLeftElement>
        <Input
          bg="#C3C2C2"
          ref={searchBar}
          class="text-text placeholder-text rounded-md"
          onInput={(e) => {
            searchAppDB((e.target as HTMLInputElement).value);
          }}
          placeholder={`Search all available apps (${getAllApps()?.length ?? 0})`}
        />
      </InputGroup>
      <br />

      <Show
        when={!((getSearchResults()?.hits?.length ?? 0) > 0)}
        fallback={
          <>
            <Box
              class="bg-neutral mb-5"
              minH="100px"
              borderRadius="$lg"
              style={{
                'max-height': '60vh',
                'overflow-y': 'auto',
              }}
            >
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
                              searchBar.focus();
                            }
                          }
                        }}
                      >
                        <li
                          onMouseDown={(e) => {
                            console.log('mouse down');
                            setIsDraggingTiles(true);
                            setIsDraggingFromSidebar(true);
                            setHexTileData(
                              new dragData('App', res.document.executable, '', res.document.icon)
                            );
                            e.preventDefault();
                            dragElement.style.left = e.clientX - dragElement.clientWidth / 2 + 'px';
                            dragElement.style.top = e.clientY - dragElement.clientHeight / 2 + 'px';
                          }}
                          draggable={false}
                        >
                          <HStack>
                            <Box class="my-2 bg-background p-3.5" borderRadius="$lg">
                              <div class="w-25">
                                <img src={res.document.icon} class="w-7"></img>
                              </div>
                            </Box>
                            <Box
                              class="my-2 mx-3 p-2 bg-background whitespace-nowrap overflow-hidden w-full"
                              borderRadius="$lg"
                            >
                              <p class="truncate ...">{res.document.name}</p>
                              <p class="truncate ...">{res.document.executable}</p>{' '}
                            </Box>
                          </HStack>
                        </li>
                      </Box>
                    </>
                  )}
                </For>
              </ul>
            </Box>
          </>
        }
      >
        <h2>
          Apps <span class="text-neutral">({(getRelevantApps() ?? []).length} Relevant)</span>
        </h2>
        <p>
          This list only contains the most important Apps. If you do not find the App you are
          looking for you can use the search function above or drop it's executable here.
        </p>
        <br />
        <Box
          class="bg-neutral mb-5"
          minH="100px"
          borderRadius="$lg"
          style={{
            'overflow-y': 'auto',
          }}
        >
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
                    <Box
                      class="my-2 mx-3 p-2 bg-background whitespace-nowrap overflow-hidden w-full"
                      borderRadius="$lg"
                    >
                      <p class="truncate ...">{res.name}</p>
                      <p class="truncate ...">{res.executable}</p>{' '}
                    </Box>
                  </HStack>
                </li>
              )}
            </For>
          </ul>
        </Box>
      </Show>

      {/* <Box class="bg-neutral overflow-auto" maxH="60vh" minH="100px" borderRadius="$lg">
        
      </Box> */}
      <p>Actions</p>
      <Box borderRadius="$lg" class="p-2 py-2 bg-neutral">
        <HStack gap={'$2'}>
          <Popover triggerMode="hover">
            <PopoverTrigger>
              <Box
                class="p-3.5 bg-background cursor-pointer"
                borderRadius="$lg"
                onMouseDown={(e) => {
                  console.log('mouse down');
                  setIsDraggingTiles(true);
                  setIsDraggingFromSidebar(true);
                  setHexTileData(new dragData('MediaPlayer', '', '', ''));
                  e.preventDefault();
                  dragElement.style.left = e.clientX - dragElement.clientWidth / 2 + 'px';
                  dragElement.style.top = e.clientY - dragElement.clientHeight / 2 + 'px';
                }}
                draggable={false}
              >
                <div class="w-25">
                  <FaSolidMusic class="w-4 h-4 text-text" />
                </div>
              </Box>
            </PopoverTrigger>
            <PopoverContent class="bg-neutral border-background text-text">
              <PopoverArrow />
              <PopoverHeader>Media Action</PopoverHeader>
              <PopoverBody>
                This Action allows you to play/pause your current playing Media. Wether it's a
                spotify, youtube or some other form of playing Media. Some Media also allows
                skipping to the next/previous Media.
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Popover triggerMode="hover">
            <PopoverTrigger>
              <Box
                class="p-3.5 bg-background cursor-pointer"
                borderRadius="$lg"
                onMouseDown={(e) => {
                  console.log('mouse down');
                  setIsDraggingTiles(true);
                  setIsDraggingFromSidebar(true);
                  setHexTileData(new dragData('PaperBin', '', '', ''));
                  e.preventDefault();
                  dragElement.style.left = e.clientX - dragElement.clientWidth / 2 + 'px';
                  dragElement.style.top = e.clientY - dragElement.clientHeight / 2 + 'px';
                }}
                draggable={false}
              >
                <div class="w-25">
                  <FaSolidTrashCan class="w-4 h-4 text-text" />
                </div>
              </Box>
            </PopoverTrigger>
            <PopoverContent class="bg-neutral border-background text-text">
              <PopoverArrow />
              <PopoverHeader>Paperbin Action</PopoverHeader>
              <PopoverBody>
                This Action is a shortcut to your paper bin. It allows you to delete all files with
                just one click!
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </HStack>
      </Box>
      <Show when={isDraggingTiles() && isDraggingFromSidebar()}>
        <Switch
          fallback={
            <img
              class="w-8 h-8 absolute z-40 cursor-pointer"
              ref={dragElement}
              src={getHexTileData()?.icon ?? ''}
            ></img>
          }
        >
          <Match when={getHexTileData()?.type === 'MediaPlayer'}>
            <span class="w-5 h-5 absolute z-40 cursor-pointer" ref={dragElement}>
              <FaSolidMusic class="w-5 h-5 text-text" />
            </span>
          </Match>
          <Match when={getHexTileData()?.type === 'PaperBin'}>
            <span class="w-5 h-5 absolute z-40 cursor-pointer" ref={dragElement}>
              <FaSolidTrashCan class="w-5 h-5 text-text" />
            </span>
          </Match>
        </Switch>
      </Show>
    </div>
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
