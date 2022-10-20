import { JSX } from 'solid-js/jsx-runtime';

const HexTile = (props: {
  x: number;
  y: number;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> | undefined;
}) => {
  const s = 66;
  const m = 4;
  return (
    <div
      class="absolute bg-indigo-400 cursor-pointer inline-block"
      style={{
        left: `${props.x * (s + m) - (props.y % 2 === 0 ? 0 : (s + m) / 2) + s / 2}px`,
        bottom: `${props.y * (s * 0.86 + m) - (s / 13) * 8}px`,
        width: `${s}px`,
        margin: `${m}px`,
        height: `${s * 1.1547}px`,
        'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
      }}
      onClick={props.onClick}
    ></div>
  );
};

export default HexTile;
