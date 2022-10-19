import { render } from 'solid-js/web';

import '../assets/index.css';

const Settings = () => {
  return (
    <div
      class="bg-red-500 p-2"
      style={{
        position: 'absolute',
      }}
    >
      <button
        onClick={() => {
          console.log('setting');
        }}
      >
        Settings
      </button>
    </div>
  );
};

render(() => <Settings />, document.getElementById('root') as HTMLElement);
