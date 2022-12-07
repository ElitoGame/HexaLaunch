/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';

import HexUI from './HexUI';

render(() => <HexUI />, document.getElementById('root') as HTMLElement);
