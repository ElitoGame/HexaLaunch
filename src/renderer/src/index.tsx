import { For, render, Show } from 'solid-js/web';
import { getCurrentRadiant, getHexUiData, getShowPosition, openApp } from './renderer';

import '../assets/index.css';
import HexTile from './HexUI/Components/HexTile';
import HexTileData from './DataModel/HexTileData';

const HexUI = () => {
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
      <For each={getHexUiData()?.getCoreTiles()}>
        {(tile: HexTileData) => (
          <HexTile
            x={tile.getX()}
            y={tile.getY()}
            onClick={() => {
              if (tile.getAction() === 'App') {
                openApp(tile.getApp(), tile.getUrl());
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
              onClick={() => {
                if (tile.getAction() === 'App') {
                  openApp(tile.getApp(), tile.getUrl());
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
