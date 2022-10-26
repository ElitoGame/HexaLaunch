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
                openApp(tile.getUrl());
              }
            }}
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
                  openApp(tile.getUrl());
                }
              }}
              color={'bg-green-400'}
            ></HexTile>
          )}
        </For>
      </Show>
    </div>
  );
};

render(() => <HexUI />, document.getElementById('root') as HTMLElement);
