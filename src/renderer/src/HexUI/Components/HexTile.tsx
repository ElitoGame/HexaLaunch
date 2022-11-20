import { createSignal } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';
import { getHexMargin, getHexSize } from '../../renderer';

const HexTile = (props: {
  x: number;
  y: number;
  radiant: number;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> | undefined;
  zIndex?: number;
  color?: string;
  title?: string;
}) => {
  const [getScale, setScale] = createSignal(0);
  let delay = 0;
  // give a delay according to these coordinates
  // 1, 0 -> 1
  // 1, 1 -> 2
  // 0, 1 -> 3
  // -1, 0 -> 4
  // 0, -1 -> 5
  // 1, -1 -> 6
  if (props.radiant === 0) {
    if (props.x === 1 && props.y === 0) {
      delay = 1;
    } else if (props.x === 1 && props.y === 1) {
      delay = 2;
    } else if (props.x === 0 && props.y === 1) {
      delay = 3;
    } else if (props.x === -1 && props.y === 0) {
      delay = 4;
    } else if (props.x === 0 && props.y === -1) {
      delay = 5;
    } else if (props.x === 1 && props.y === -1) {
      delay = 6;
    }
  } else {
    delay = Math.sqrt(props.x * props.x + props.y * props.y) * 1.5;
  }

  setTimeout(() => {
    setScale(100);
  }, 100);

  return (
    <div
      class={`absolute bg-transparent cursor-pointer inline-block transition-transform`}
      style={{
        left: `${
          props.x * (getHexSize() + getHexMargin()) -
          (props.y % 2 === 0 ? 0 : (getHexSize() + getHexMargin()) / 2) -
          getHexSize() / 2
        }px`,
        bottom: `${props.y * (getHexSize() * 0.86 + getHexMargin()) - (getHexSize() / 13) * 8}px`,
        width: `${getHexSize() + getHexMargin()}px`,
        margin: `${getHexMargin()}px`,
        height: `${(getHexSize() + getHexMargin()) * 1.169}px`,
        'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
        'z-index': props.zIndex ?? 0,
        'transform-origin': 'center',
        transform: `scale(${getScale() / 100})`,
        'transition-duration': `${delay * 0.075}s`,
      }}
    >
      <div
        class={'absolute ' + (props.color ?? 'bg-red-400') + ' cursor-pointer inline-block'}
        style={{
          left: `${(getHexMargin() / 2) * -1}px`,
          bottom: `${(getHexMargin() / 2) * -1}px`,
          width: `${getHexSize()}px`,
          margin: `${getHexMargin()}px`,
          height: `${getHexSize() * 1.169}px`,
          'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
          'z-index': (props.zIndex ?? 0) + 1,
        }}
        onClick={props.onClick}
      >
        <span class="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {props.title ?? '✨'}
        </span>
      </div>
    </div>
  );
};

export default HexTile;
