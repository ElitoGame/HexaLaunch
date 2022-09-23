import { render } from 'solid-js/web';
import { getShowPosition } from './renderer';

import '../assets/index.css';

const HelloWorld = () => {
  return (
    <div
      class="bg-red-500 p-2"
      style={{
        position: 'absolute',
        top: `${getShowPosition()?.y}px`,
        left: `${getShowPosition()?.x}px`,
      }}
    >
      <button
        onClick={() => {
          console.log('test');
        }}
      >
        Tests
      </button>
    </div>
  );
};

render(() => <HelloWorld />, document.getElementById('root') as HTMLElement);
