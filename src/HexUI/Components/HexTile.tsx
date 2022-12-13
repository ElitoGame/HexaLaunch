import { x } from '@tauri-apps/api/path-e12e0e34';
import { createSignal, Match, mergeProps, Show, Switch } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';
import { getCurrentMedia, getHexMargin, getHexSize, searchAppDB } from '../../main';
import { FaSolidPlay, FaSolidForwardStep, FaBrandsItunesNote, FaSolidPause } from 'solid-icons/fa';
import { Command } from '@tauri-apps/api/shell';
import { invoke } from '@tauri-apps/api';

const HexTile = (props: {
  x: number;
  y: number;
  radiant: number;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> | undefined;
  zIndex?: number;
  color?: string;
  title?: string;
  action?: string;
  icon?: string;
  hasAnimation?: boolean;
  hasHoverEffect?: boolean;
}) => {
  const merged = mergeProps(
    {
      x: 0,
      y: 0,
      radiant: 0,
      onClick: () => {},
      zIndex: 10,
      color: 'bg-neutral-600',
      title: '✨',
      action: '',
      icon: '',
      hasAnimation: true,
      hasHoverEffect: true,
      border: 5,
    },
    props
  );

  const [getHovered, setHovered] = createSignal(false);

  // console.log(merged.radiant, props.radiant, merged.hasAnimation);
  const [getScale, setScale] = createSignal(merged.hasAnimation ? 0 : 100);
  let delay = 1;
  if (merged.hasAnimation) {
    // give a delay according to these coordinates
    // 1, 0 -> 1
    // 1, 1 -> 2
    // 0, 1 -> 3
    // -1, 0 -> 4
    // 0, -1 -> 5
    // 1, -1 -> 6
    if (merged.radiant === 0) {
      if (merged.x === 1 && merged.y === 0) {
        delay = 1;
      } else if (merged.x === 1 && merged.y === 1) {
        delay = 2;
      } else if (merged.x === 0 && merged.y === 1) {
        delay = 3;
      } else if (merged.x === -1 && merged.y === 0) {
        delay = 4;
      } else if (merged.x === 0 && merged.y === -1) {
        delay = 5;
      } else if (merged.x === 1 && merged.y === -1) {
        delay = 6;
      }
    } else {
      delay = Math.sqrt(merged.x * merged.x + merged.y * merged.y) * 1.5;
    }

    setTimeout(() => {
      setScale(100);
    }, 100);
  }

  return (
    <div
      class={`hexTile absolute bg-transparent cursor-pointer inline-block transition-transform`}
      style={{
        left: `${
          merged.x * (getHexSize() + getHexMargin()) -
          (merged.y % 2 === 0 ? 0 : (getHexSize() + getHexMargin()) / 2) -
          getHexSize() / 2
        }px`,
        bottom: `${merged.y * (getHexSize() * 0.86 + getHexMargin()) - (getHexSize() / 13) * 8}px`,
        width: `${getHexSize() + getHexMargin()}px`,
        margin: `${getHexMargin()}px`,
        height: `${(getHexSize() + getHexMargin()) * 1.169}px`,
        'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
        'z-index': merged.zIndex ?? 0,
        'transform-origin': 'center',
        transform: `scale(${getScale() / 100})`,
        'transition-duration': `${delay * 0.075}s`,
      }}
    >
      <div
        class={
          'absolute ' +
          merged.color +
          ` cursor-pointer inline-block ${
            merged.hasHoverEffect ? 'hover:scale-97 transition-transform hover:brightness-95' : ''
          }`
        }
        style={{
          left: `${(getHexMargin() / 2) * -1}px`,
          bottom: `${(getHexMargin() / 2) * -1}px`,
          width: `${getHexSize()}px`,
          margin: `${getHexMargin()}px`,
          height: `${getHexSize() * 1.169}px`,
          'transform-origin': 'center',
          'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
          'z-index': (merged.zIndex ?? 0) + 1,
        }}
        onMouseOver={(e) => {
          setHovered(true);
        }}
        onMouseLeave={(e) => {
          setHovered(false);
        }}
        onClick={merged.onClick}
      >
        <Switch
          fallback={
            <span class="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {merged.title}
            </span>
          }
        >
          <Match when={merged.action === 'App'}>
            <span class="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {merged.title}
            </span>
          </Match>
          <Match when={merged.action === 'MediaPlayer'}>
            <>
              <span
                class="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: `${getHexSize() - merged.border}px`,
                  height: `${(getHexSize() - merged.border) * 1.169}px`,
                  'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
                }}
              >
                <img
                  src={'data:image/png;base64,' + getCurrentMedia()?.thumbnail}
                  class={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 ${
                    getHovered() ? 'brightness-50' : ''
                  }`}
                  style={{
                    height: `${(getHexSize() - merged.border) * 1.169}px`,
                    'min-width': `min-content`,
                  }}
                />
                <Show when={getHovered()}>
                  <span class="controls absolute text-base text-white flex flex-row top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-max gap-1">
                    <FaSolidForwardStep
                      class="rotate-180"
                      onClick={() => {
                        invoke('prev_media');
                      }}
                    />
                    <Show
                      when={getCurrentMedia()?.isPlaying}
                      fallback={
                        <FaSolidPlay
                          onClick={() => {
                            invoke('toggle_media');
                          }}
                        />
                      }
                    >
                      <FaSolidPause
                        onClick={async () => {
                          invoke('toggle_media');
                        }}
                      />
                    </Show>
                    <FaSolidForwardStep
                      onClick={() => {
                        console.log(invoke('next_media'));
                      }}
                    />
                  </span>
                </Show>
              </span>
            </>
          </Match>
        </Switch>
      </div>
    </div>
  );
};

export default HexTile;