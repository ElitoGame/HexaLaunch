/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';

import HexUI from './HexUI';
import { HopeProvider } from '@hope-ui/solid';

render(
  () => (
    <HopeProvider>
      <HexUI />
    </HopeProvider>
  ),
  document.getElementById('root') as HTMLElement
);
