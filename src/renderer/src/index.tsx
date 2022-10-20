import { render } from 'solid-js/web';
import { getShowPosition } from './renderer';
// const { execFile } = require('node:child_process');
import * as child from 'child_process';

import '../assets/index.css';
import HexTile from './HexUI/Components/HexTile';

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
      <HexTile
        x={0}
        y={0}
        onClick={() => {
          // execFile(
          //   'C:/Users/ElitoGame/AppData/Local/Discord/app-0.0.309/Discord.exe',
          //   ['--version'],
          //   (error: any, stdout: any, stderr: any) => {
          //     if (error) {
          //       throw error;
          //     }
          //     console.log(stdout);
          //   }
          // );
          console.log(child.exec);
          child.exec('node', (error, stdout, stderr) => {
            if (error) {
              throw error;
            }
            console.log(stdout);
          });
        }}
      ></HexTile>
      <HexTile x={0} y={1}></HexTile>
      <HexTile x={-1} y={1}></HexTile>
      <HexTile x={-2} y={0}></HexTile>
      <HexTile x={-1} y={-1}></HexTile>
      <HexTile x={0} y={-1}></HexTile>
    </div>
  );
};

render(() => <HexUI />, document.getElementById('root') as HTMLElement);
