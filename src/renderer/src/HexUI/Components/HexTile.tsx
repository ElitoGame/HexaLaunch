import { JSX } from 'solid-js/jsx-runtime';
import { getHexMargin, getHexSize } from '../../renderer';

const HexTile = (props: {
  x: number;
  y: number;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> | undefined;
  zIndex?: number;
  color?: string;
  title?: string;
}) => {
  return (
    <div
      class={'absolute bg-transparent cursor-pointer inline-block'}
      style={{
        left: `${
          props.x * (getHexSize() + getHexMargin()) -
          (props.y % 2 === 0 ? 0 : (getHexSize() + getHexMargin()) / 2) +
          getHexSize() / 2
        }px`,
        bottom: `${props.y * (getHexSize() * 0.86 + getHexMargin()) - (getHexSize() / 13) * 8}px`,
        width: `${getHexSize() + getHexMargin()}px`,
        margin: `${getHexMargin()}px`,
        height: `${(getHexSize() + getHexMargin()) * 1.169}px`,
        'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
        'z-index': props.zIndex ?? 0,
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
