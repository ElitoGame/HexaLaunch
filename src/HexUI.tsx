import HexTile from './HexUI/Components/HexTile';
import HexTileData from './DataModel/HexTileData';
import { Box, Center, HStack, Input, InputGroup, InputLeftElement } from '@hope-ui/solid';

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
  isKeyBoardNavigationEnabled,
  selectedHexTile,
  setSelectedHexTile,
} from './main';
import { BsSearch } from 'solid-icons/bs';
import { externalAppManager } from './externalAppManager';
const HexUI = () => {
  let searchBar: HTMLInputElement | undefined;
  const [getPage, setPage] = createSignal<number>(0);

  let changeTile = (x: number, y: number) => {
    // no tile is selected
    if (selectedHexTile().x === -99 || selectedHexTile().y === -99) {
      if (getCurrentRadiant() === -1) {
        setCurrentRadiant(0);
      }
      // set the current core tile to the first tile
      setSelectedHexTile({
        x: getHexUiData().getCoreTiles()[getCurrentRadiant()]?.getX() ?? 1,
        y: getHexUiData().getCoreTiles()[getCurrentRadiant()]?.getY() ?? 0,
      });
    } else {
      let currentTile = getHexUiData()
        .getTiles()
        .find((t) => t.getX() === selectedHexTile().x && t.getY() === selectedHexTile().y);
      let newX = selectedHexTile().x + x;
      let newY = selectedHexTile().y + y;
      let newTile = getHexUiData()
        .getTiles()
        .find((t) => t.getX() === newX && t.getY() === newY);
      // check if the new tile is valid
      if (!newTile) {
        let testX = newX - 1;
        let testTile = getHexUiData()
          .getTiles()
          .find((t) => t.getX() === newX && t.getY() === newY);
        if (
          currentTile?.getRadiant() === testTile?.getRadiant() ||
          currentTile?.getRadiant() === 0
        ) {
          newX = testX;
          newTile = testTile;
        }
      }
      if (!newTile) {
        if (
          currentTile?.getRadiant() === newTile?.getRadiant() ||
          currentTile?.getRadiant() === 0
        ) {
          let testX = newX + 2;
          let testTile = getHexUiData()
            .getTiles()
            .find((t) => t.getX() === newX && t.getY() === newY);
          if (currentTile?.getRadiant() === testTile?.getRadiant()) {
            newX = testX;
            newTile = testTile;
          }
        }
      }
      if (newTile) {
        if (newTile.getRadiant() === 0) {
          // get the index of the current core tile
          let index = getHexUiData()
            .getCoreTiles()
            .findIndex((t) => t.getX() === newX && t.getY() === newY);
          if (index !== -1 && index !== getCurrentRadiant()) {
            setCurrentRadiant(index + 1);
          }
        } else if (newTile.getRadiant() !== getCurrentRadiant()) {
          setCurrentRadiant(newTile.getRadiant());
        }
        setSelectedHexTile({ x: newX, y: newY });
      }
    }
    console.log(selectedHexTile());
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setIsSearchVisible(false);
    }
    // open the search bar only if the input is one character long and not a space.
    // if the keyboard navigation is enabled, then only open the search bar if the input is not a number.
    if (
      !isSearchVisible() &&
      e.key !== ' ' &&
      e.key.length === 1 &&
      ((isKeyBoardNavigationEnabled() && !e.key.match(/^[0-9]$/)) || !isKeyBoardNavigationEnabled())
    ) {
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
    if (isKeyBoardNavigationEnabled() && !isSearchVisible()) {
      if (e.key.match(/^[1-6]$/)) {
        setCurrentRadiant(parseInt(e.key));
      } else if (e.key.match(/^[0,7-9]$/)) {
        setCurrentRadiant(-1);
      } else if (e.key === 'ArrowUp') {
        changeTile(0, 1);
      } else if (e.key === 'ArrowDown') {
        changeTile(0, -1);
      } else if (e.key === 'ArrowLeft') {
        changeTile(-1, 0);
      } else if (e.key === 'ArrowRight') {
        changeTile(1, 0);
      } else if (e.key === 'Enter') {
        let tile = getHexUiData()
          ?.getTiles()
          .find((t) => t.getX() === selectedHexTile().x && t.getY() === selectedHexTile().y);
        if (tile) {
          if (tile.getAction() === 'App') {
            openApp(tile.getApp(), tile.getUrl());
          } else if (tile.getAction() === 'PaperBin') {
            runAction('PaperBin');
          }
        }
      }
    }
  });

  const [getSelectedSearchResult, setSelectedSearchResult] = createSignal(0);

  let searchResult: HTMLDivElement | null = null;

  return (
    <div
      class={`${isSearchVisible() ? 'h-screen bg-zinc-800 bg-opacity-50' : 'h-0'}`}
      onFocusOut={() => {
        setTimeout(() => {
          setIsSearchVisible(false);
          setSelectedSearchResult(0);
        }, 100);
      }}
    >
      <div
        class={`${
          isSearchVisible() ? 'block' : 'hidden'
        } h-full z-40 relative py-10 left-1/2 -translate-x-1/2 w-1/4  min-w-[640px]`}
        style={{ 'font-size': '16px' }}
      >
        <InputGroup class="h-10">
          <InputLeftElement class="text-neutral-300">
            <BsSearch class="fill-mainHexagonIcon" />
          </InputLeftElement>
          <Input
            type="text"
            ref={searchBar}
            class="p-2 rounded-md pl-12 bg-mainHexagonBg text-mainHexagonIcon"
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp') {
                if (getSelectedSearchResult() > 0) {
                  setSelectedSearchResult(getSelectedSearchResult() - 1);
                  searchResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                e.preventDefault();
                console.log('arrow up');
              } else if (e.key === 'ArrowDown') {
                if (getSelectedSearchResult() < getSearchResults()?.hits.length - 1) {
                  setSelectedSearchResult(getSelectedSearchResult() + 1);
                  searchResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                e.preventDefault();
                console.log('arrow down');
              } else if (e.key === 'Enter') {
                e.preventDefault();
                let res = getSearchResults()?.hits[getSelectedSearchResult()];
                externalAppManager.incrementAppScore(res.document.executable);
                openApp('', res.document.executable);
                setIsSearchVisible(false);
              }
            }}
            onInput={(e) => {
              searchAppDB((e.target as HTMLInputElement).value);
              setPage(0);
              setSelectedSearchResult(0);
              if (searchBar?.value === '') {
                setIsSearchVisible(false);
              }
            }}
          />
        </InputGroup>

        <ul
          class="cursor-pointer overflow-y-auto my-4"
          style={{
            height: 'calc(100% - 7rem)',
          }}
        >
          <For
            each={getSearchResults()?.hits ?? []}
            fallback={
              <li>
                <Box class="my-2 p-2 bg-mainHexagonBg text-mainHexagonIcon" borderRadius="$lg">
                  <Center>Search something to see results!</Center>
                </Box>
              </li>
            }
          >
            {(res, i) => (
              <li>
                <Box
                  class={`my-2 p-2 overflow-x-hidden text-mainHexagonIcon ${
                    i() === getSelectedSearchResult() ? 'bg-hoverHexagonBg' : 'bg-mainHexagonBg'
                  }`}
                  ref={(el) => {
                    if (i() === getSelectedSearchResult()) {
                      searchResult = el;
                    }
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
                        externalAppManager.incrementAppScore(res.document.executable);
                        openApp('', res.document.executable);
                        setIsSearchVisible(false);
                      }
                    }
                  }}
                >
                  <HStack>
                    <img src={res.document.icon} class="w-10 pr-2 text-mainHexagonIcon"></img>
                    <div>
                      <span>{res.document.name}</span>
                      <br />
                      <em class="brightness-75">{res.document.executable}</em>{' '}
                    </div>
                  </HStack>
                </Box>
              </li>
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
                app={tile.getApp()}
                url={tile.getUrl()}
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
                app={tile.getApp()}
                url={tile.getUrl()}
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
