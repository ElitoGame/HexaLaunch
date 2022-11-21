import { For, render, Show } from 'solid-js/web';
import {
  getCurrentRadiant,
  getHexUiData,
  getSearchResults,
  getShowPosition,
  isHexUiVisible,
  isSearchVisible,
  openApp,
  runAction,
  searchAppDB,
  setIsSearchVisible,
} from './renderer';

import '../assets/index.css';
import HexTile from './HexUI/Components/HexTile';
import HexTileData from './DataModel/HexTileData';
import { createSignal } from 'solid-js';
import { Box, HStack } from '@hope-ui/solid';

const HexUI = () => {
  let searchBar: HTMLInputElement | undefined;
  const [getPage, setPage] = createSignal<number>(0);

  window.addEventListener('keydown', (e) => {
    console.log(e);
    if (!isSearchVisible() && e.key !== ' ' && e.key !== 'Control' && e.key !== 'Shift') {
      setIsSearchVisible(true);
      if (searchBar) {
        searchBar.focus();
        searchBar.select();
        console.log('search bar is visible');
      }
    }
  });
  return (
    <div
      class=""
      style={{
        position: 'absolute',
        top: `${getShowPosition()?.y}px`,
        left: `${getShowPosition()?.x}px`,
        'font-size': '0',
      }}
    >
      <div class={`${isSearchVisible() ? 'block' : 'hidden'} z-40`} style={{ 'font-size': '16px' }}>
        <input
          type="text"
          ref={searchBar}
          class="z-40"
          onInput={(e) => {
            searchAppDB((e.target as HTMLInputElement).value);
            setPage(0);
            if (searchBar?.value === '') {
              setIsSearchVisible(false);
            }
          }}
        />
        <ul>
          <For each={getSearchResults()?.hits ?? []}>
            {(res) => (
              <>
                <Box
                  class="my-2 p-2 bg-slate-300"
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
                        <strong>{res.document.name}</strong>
                        <br />
                        <em>{res.document.executable}</em>{' '}
                      </div>
                    </HStack>
                  </li>
                </Box>
              </>
            )}
          </For>
        </ul>
      </div>
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
  );
};

render(() => <HexUI />, document.getElementById('root') as HTMLElement);
