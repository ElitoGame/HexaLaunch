import { JSX } from 'solid-js/jsx-runtime';
import { getHexMargin, getHexSize } from '../../renderer';

const HexTile = (props: {
  x: number;
  y: number;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> | undefined;
  zIndex?: number;
  color?: string;
}) => {
  return (
    <div
      class={'absolute bg-indigo-400 cursor-pointer inline-block z-' + (props.zIndex ?? 0)}
      style={{
        left: `${
          props.x * (getHexSize() + getHexMargin()) -
          (props.y % 2 === 0 ? 0 : (getHexSize() + getHexMargin()) / 2) +
          getHexSize() / 2
        }px`,
        bottom: `${props.y * (getHexSize() * 0.86 + getHexMargin()) - (getHexSize() / 13) * 8}px`,
        width: `${getHexSize()}px`,
        margin: `${getHexMargin()}px`,
        height: `${getHexSize() * 1.1547}px`,
        'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
      }}
      onClick={props.onClick}
    ></div>
  );
};

export default HexTile;
