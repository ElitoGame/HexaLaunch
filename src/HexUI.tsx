import HexTile from './HexUI/Components/HexTile';
import HexTileData from './DataModel/HexTileData';
import { Box, Center, HStack, Input, InputGroup, InputLeftElement } from '@hope-ui/solid';

import { appWindow } from '@tauri-apps/api/window';
import { createSignal, For, Show } from 'solid-js';
import { openApp, runAction } from './hexUImain';
import {
  isSearchVisible,
  setIsSearchVisible,
  getShowPosition,
  searchAppDB,
  getSearchResults,
  getHexUiData,
  getCurrentRadiant,
  isHexUiVisible,
  setCurrentRadiant,
} from './main';
import { BsSearch } from 'solid-icons/bs';
import { externalAppManager } from './externalAppManager';
const HexUI = () => {
  let searchBar: HTMLInputElement | undefined;
  const [getPage, setPage] = createSignal<number>(0);

  window.addEventListener('keydown', (e) => {
    if (!isSearchVisible() && e.key !== ' ' && e.key.length === 1) {
      setIsSearchVisible(true);
      setCurrentRadiant(-1);
      if (searchBar) {
        setTimeout(() => {
          searchBar.focus();
          searchBar.value = e.key;
          searchAppDB(searchBar.value);
          setPage(0);
          if (searchBar?.value === '') {
            setIsSearchVisible(false);
          }
          console.log('search bar is visible', searchBar);
        }, 100);
      }
    }
  });

  return (
    <div class={`${isSearchVisible() ? 'h-full bg-neutral-800 bg-opacity-50' : 'h-0'}`}>
      <div
        class={`${
          isSearchVisible() ? 'block' : 'hidden'
        } z-40 absolute top-10 left-1/2 -translate-x-1/2 w-1/4`}
        style={{ 'font-size': '16px' }}
      >
        <InputGroup>
          <InputLeftElement class="text-neutral-300">
            <BsSearch />
          </InputLeftElement>
          <Input
            type="text"
            ref={searchBar}
            class="p-2 rounded-md "
            style={{ 'background-color': '#595959', color: '#C3C2C2' }}
            onInput={(e) => {
              searchAppDB((e.target as HTMLInputElement).value);
              setPage(0);
              if (searchBar?.value === '') {
                setIsSearchVisible(false);
              }
            }}
          />
        </InputGroup>

        {/* <input
          type="text"
          ref={searchBar}
          class="z-40 w-full p-2 rounded-md "
          style={{ 'background-color': '#595959' }}
          onInput={(e) => {
            searchAppDB((e.target as HTMLInputElement).value);
            setPage(0);
            if (searchBar?.value === '') {
              setIsSearchVisible(false);
            }
          }}
        /> */}
        <ul>
          <For
            each={getSearchResults()?.hits ?? []}
            fallback={
              <Box
                class="my-2 p-2"
                style={{
                  'background-color': '#343434',
                  color: '#FFFFFF',
                }}
                borderRadius="$lg"
              >
                <Center>Search something to see results!</Center>
              </Box>
            }
          >
            {(res) => (
              <>
                <Box
                  class="my-2 p-2"
                  style={{
                    'background-color': '#343434',
                    color: '#FFFFFF',
                  }}
                  borderRadius="$lg"
                  onClick={() => {
                    if (searchBar) {
                      if (searchBar.value.match(/^([a-z]:)?(\/|\\).*/gi)) {
                        if (res.document.type !== 'Folder') {
                          openApp('', res.document.executable);
                          setIsSearchVisible(false);
                        }
                        const newPath =
                          res.document.executable.replaceAll('\\', '/') +
                          (res.document.type === 'Folder' ? '/' : '');
                        searchBar.value = newPath;

                        searchAppDB(newPath);
                        setPage(0);
                        searchBar.focus();
                      } else {
                        openApp('', res.document.executable);
                        setIsSearchVisible(false);
                      }
                    }
                  }}
                >
                  <li>
                    <HStack>
                      <img src={res.document.icon} class="w-10 pr-2"></img>
                      <div>
                        <span>{res.document.name}</span>
                        <br />
                        <em
                          style={{
                            color: '#C3C2C2',
                          }}
                        >
                          {res.document.executable}
                        </em>{' '}
                      </div>
                    </HStack>
                  </li>
                </Box>
              </>
            )}
          </For>
        </ul>
      </div>
      <div
        style={{
          position: 'absolute',
          top: `${getShowPosition()?.y}px`,
          left: `${getShowPosition()?.x}px`,
          'font-size': '0',
        }}
      >
        <Show when={isHexUiVisible()}>
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
                action={tile.getAction()}
                icon={tile.getApp()}
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
        </Show>
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
                action={tile.getAction()}
                icon={tile.getApp()}
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
                // color={"bg-green-400"}
              ></HexTile>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
};

export default HexUI;
