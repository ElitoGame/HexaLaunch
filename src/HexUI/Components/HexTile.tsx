import { createResource, createSignal, Match, mergeProps, onMount, Show, Switch } from 'solid-js';
import { JSX } from 'solid-js/jsx-runtime';
import {
  getCurrentMedia,
  getHexMargin,
  getHexSize,
  isFullLayout,
  isValidUrl,
  selectedHexTile,
} from '../../main';

import { FaSolidPlay, FaSolidForwardStep, FaSolidPause } from 'solid-icons/fa';
import { invoke } from '@tauri-apps/api';
import { externalAppManager } from '../../externalAppManager';
import { IoTrashBin } from 'solid-icons/io';
import { theme, setTheme } from '../../themes';

const HexIcon = async (app: string) => await externalAppManager.getIconOfActionExe(app);

const getHexagonPathData = (radius: any = 3, scale = 1) => {
  const sin = (deg) => Math.sin((deg * Math.PI) / 180);
  const cos = (deg) => Math.cos((deg * Math.PI) / 180);

  // Modify this border radius via the themes.
  const borderRadius = radius as any;
  const sideLength = ((38.5 * getHexSize()) / 66) * scale;
  const x0 = 0;
  const y0 = 0;

  const x1 = sideLength * cos(30);
  const y1 = sideLength * sin(30);

  const xc1 = x1 - borderRadius * cos(30);
  const yc0 = borderRadius * sin(30);
  const xc2 = x1 + borderRadius * cos(30);

  const x2 = 2 * x1;
  const y2 = y1 + sideLength;

  const xc3 = x2 - borderRadius * cos(30);
  const yc1 = y1 - borderRadius * sin(30);
  const yc2 = y1 + borderRadius;

  const y3 = y2 + y1;

  const yc3 = y2 - borderRadius;
  const yc4 = y2 + borderRadius * sin(30);

  const yc5 = y3 - borderRadius * sin(30);
  const xc0 = borderRadius * cos(30);

  return `
        M ${xc1},${yc0}
        Q ${x1},${y0} ${xc2},${yc0}

        L ${xc3},${yc1}
        Q ${x2},${y1} ${x2},${yc2}

        L ${x2},${yc3}
        Q ${x2},${y2} ${xc3},${yc4}

        L ${xc2},${yc5}
        Q ${x1},${y3} ${xc1},${yc5}
        
        L ${xc0},${yc4}
        Q ${x0},${y2} ${x0},${yc3}
        
        L ${x0},${yc2}
        Q ${x0},${y1} ${xc0},${yc1}
        Z
      `;
};

const HexTile = (props: {
  x: number;
  y: number;
  radiant: number;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> | undefined;
  zIndex?: number;
  color?: string;
  title?: string;
  action?: string;
  app?: string;
  url?: string;
  hasAnimation?: boolean;
  hasHoverEffect?: boolean;
  isSettings?: boolean;
}) => {
  const merged = mergeProps(
    {
      x: 0,
      y: 0,
      radiant: 0,
      onClick: () => { },
      zIndex: 10,
      color: `fill-subHexagonBg`,
      title: '',
      action: '',
      app: '',
      url: '',
      hasAnimation: true,
      hasHoverEffect: true,
      border: 7,
      isSettings: false,
    },
    props
  );

  onMount(() => {
    if (merged.url) {
      console.log('mounted: ', merged.url);
    }
  });
  const [icon] = createResource(merged.app, HexIcon);

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

  const [isBrokenImage, setBrokenImage] = createSignal(false);

  return (
    <Show when={(!isFullLayout() && merged.action !== 'Unset') || isFullLayout()} >
      <div
        class={`hexTile absolute bg-transparent  cursor-pointer inline-block`}
        id={`{"x":"${merged.x}", "y":"${merged.y}", "radiant":"${merged.radiant}", "action":"${merged.action
          }", "app":"${merged.app.replaceAll('\\', '\\\\')}", "url":"${merged.url
            .trim()
            .replaceAll('\\', '\\\\')}
        ", "title":"${merged.title.replace('\\', '')}"}`}
        style={{
          left: `${merged.x * (getHexSize() + getHexMargin()) -
            (merged.y % 2 === 0 ? 0 : (getHexSize() + getHexMargin()) / 2) -
            getHexSize() / 2 -
            (getHexMargin() / 8) * 11.75
            }px`,
          bottom: `${merged.y * (getHexSize() * 0.86 + getHexMargin()) -
            (getHexSize() / 13) * 8 -
            (getHexMargin() / 8) * 11.75
            }px`,
          width: `${getHexSize() + getHexMargin()}px`,
          margin: `${getHexMargin()}px`,
          height: `${(getHexSize() + getHexMargin()) * 1.169}px`,
          'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
          'z-index': merged.zIndex ?? 0,
          'transform-origin': 'center',
          'transition-property': 'transform',
          transform: `scale(${getScale() / 100})`,
          'transition-duration': `${delay * 0.075}s`,
        }}
      >
        <div
          class={
            'absolute ' +
            merged.color +
            ` cursor-pointer inline-block ${getHovered()
              ? ' transition-transform hover:fill-hoverHexagonBg scale-97'
              : merged.radiant === 0
                ? ' fill-mainHexagonBg'
                : ' fill-subHexagonBg'
            }` +
            ` ${selectedHexTile().x === merged.x && selectedHexTile().y === merged.y
              ? 'bg-red-500'
              : ''
            }`
          }
          id={`radiant:${merged.radiant}`}
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
          <svg width={getHexSize() + getHexMargin() * 2} height={getHexSize() * 1.169}>
            <clipPath id="hexClip">
              {<circle cx="40" cy="35" r="35" />}
              <path
                id={`radiant:${merged.radiant}`}
                d={`${getHovered()
                    ? `${getHexagonPathData(theme()?.getHoverHexagonRadius())}`
                    : merged.radiant === 0
                      ? `${getHexagonPathData(theme()?.getMainHexagonRadius())}`
                      : `${getHexagonPathData(theme()?.getSubHexagonRadius())}`
                  }`}
                style={{
                  transform: `translate(-0.1%, 5%)`,
                }}
              />



            </clipPath>
            {/* Hexagon on Hover*/}
            {/* This path will act as the border or if the same color as the main content*/}
            <Show
              when={theme()?.getHoverHexagonBorderStyle()
                === "none" && getHovered()}
            >
              <path

                d={`${getHovered()
                    ? `${getHexagonPathData(theme()?.getHoverHexagonRadius(), 0.99)}`
                    : merged.radiant === 0
                      ? `${getHexagonPathData(theme()?.getMainHexagonRadius(), 0.99)}`
                      : `${getHexagonPathData(theme()?.getSubHexagonRadius(), 0.99)}`
                  }`}
                class={`${getHovered()
                    ? `fill-hoverHexagonBg`
                    : merged.radiant === 0
                      ? `fill-mainHexagonBg`
                      : `fill-subHexagonBg`
                  }`}
                style={{
                  transform: `translate(0.9%, 0.9%)`,
                }}
              /></Show>
            <Show
              when={theme()?.getHoverHexagonBorderStyle()
                !== "none" && getHovered()}
            >

              <path

                d={`${getHovered()
                    ? `${getHexagonPathData(theme()?.getHoverHexagonRadius(), 0.99)}`
                    : merged.radiant === 0
                      ? `${getHexagonPathData(theme()?.getMainHexagonRadius(), 0.99)}`
                      : `${getHexagonPathData(theme()?.getSubHexagonRadius(), 0.99)}`
                  }`}
                class={`${getHovered()
                    ? `fill-hoverHexagonBorder`
                    : merged.radiant === 0
                      ? `fill-mainHexagonBorder`
                      : `fill-subHexagonBorder`
                  }`}
                style={{
                  transform: `translate(0.9%, 0.9%)`,
                }}
              />

              {/* The main hexagon content if a border is present, otherwise hide it via a Show component*/}

              <path

                d={`${getHovered()
                    ? `${getHexagonPathData(theme()?.getHoverHexagonRadius(), 0.9)}`
                    : merged.radiant === 0
                      ? `${getHexagonPathData(theme()?.getMainHexagonRadius(), 0.9)}`
                      : `${getHexagonPathData(theme()?.getSubHexagonRadius(), 0.9)}`
                  }`}
                style={{
                  transform: `translate(5%, 5%)`,
                }}
              />
              {/* Path to only show the bottom border */}
              <Show
                when={theme()?.getHoverHexagonBorderStyle()
                  === "shadow" && getHovered()}>
                <path
                  clip-path="url(#hexClip)"

                  d={`${getHovered()
                      ? `${getHexagonPathData(theme()?.getHoverHexagonRadius())}`
                      : merged.radiant === 0
                        ? `${getHexagonPathData(theme()?.getMainHexagonRadius())}`
                        : `${getHexagonPathData(theme()?.getSubHexagonRadius())}`
                    }`}
                  style={{
                    transform: `translate(-0.1%, -5%)`,
                  }}
                /></Show>
            </Show>

            {/* Sub Hexagon*/}
            {/* This path will act as the border or if the same color as the main content*/}
            <Show
              when={theme()?.getSubHexagonBorderStyle()
                === "none" && merged.radiant !== 0 && !getHovered()}
            >
              <path

                d={`${getHovered()
                    ? `${getHexagonPathData(theme()?.getHoverHexagonRadius(), 0.99)}`
                    : merged.radiant === 0
                      ? `${getHexagonPathData(theme()?.getMainHexagonRadius(), 0.99)}`
                      : `${getHexagonPathData(theme()?.getSubHexagonRadius(), 0.99)}`
                  }`}
                class={`${getHovered()
                    ? `fill-hoverHexagonBg`
                    : merged.radiant === 0
                      ? `fill-mainHexagonBg`
                      : `fill-subHexagonBg`
                  }`}
                style={{
                  transform: `translate(0.9%, 0.9%)`,
                }}
              /></Show>
            <Show
              when={theme()?.getSubHexagonBorderStyle()
                !== "none" && merged.radiant !== 0 && !getHovered()}
            >

              <path

                d={`${getHovered()
                    ? `${getHexagonPathData(theme()?.getHoverHexagonRadius(), 0.99)}`
                    : merged.radiant === 0
                      ? `${getHexagonPathData(theme()?.getMainHexagonRadius(), 0.99)}`
                      : `${getHexagonPathData(theme()?.getSubHexagonRadius(), 0.99)}`
                  }`}
                class={`${getHovered()
                    ? `fill-hoverHexagonBorder`
                    : merged.radiant === 0
                      ? `fill-mainHexagonBorder`
                      : `fill-subHexagonBorder`
                  }`}
                style={{
                  transform: `translate(0.9%, 0.9%)`,
                }}
              />

              {/* The main hexagon content if a border is present, otherwise hide it via a Show component*/}

              <path

                d={`${getHovered()
                    ? `${getHexagonPathData(theme()?.getHoverHexagonRadius(), 0.9)}`
                    : merged.radiant === 0
                      ? `${getHexagonPathData(theme()?.getMainHexagonRadius(), 0.9)}`
                      : `${getHexagonPathData(theme()?.getSubHexagonRadius(), 0.9)}`
                  }`}
                style={{
                  transform: `translate(5%, 5%)`,
                }}
              />
              {/* Path to only show the bottom border */}
              <Show
                when={theme()?.getSubHexagonBorderStyle()
                  === "shadow" && merged.radiant !== 0 && !getHovered()}>
                <path
                  clip-path="url(#hexClip)"

                  d={`${getHovered()
                      ? `${getHexagonPathData(theme()?.getHoverHexagonRadius())}`
                      : merged.radiant === 0
                        ? `${getHexagonPathData(theme()?.getMainHexagonRadius())}`
                        : `${getHexagonPathData(theme()?.getSubHexagonRadius())}`
                    }`}
                  style={{
                    transform: `translate(-0.1%, -5%)`,
                  }}
                /></Show>
            </Show>
            {/* Main Hexagon*/}
            {/* This path will act as the border or if the same color as the main content*/}
            <Show
              when={theme()?.getMainHexagonBorderStyle()
                === "none" && merged.radiant == 0 && !getHovered()}
            >
              <path

                d={`${getHovered()
                    ? `${getHexagonPathData(theme()?.getHoverHexagonRadius(), 0.99)}`
                    : merged.radiant === 0
                      ? `${getHexagonPathData(theme()?.getMainHexagonRadius(), 0.99)}`
                      : `${getHexagonPathData(theme()?.getSubHexagonRadius(), 0.99)}`
                  }`}
                class={`${getHovered()
                    ? `fill-hoverHexagonBg`
                    : (merged.radiant === 0
                      ? `fill-mainHexagonBg`
                      : `fill-subHexagonBg`)
                  }`}
                style={{
                  transform: `translate(0.9%, 0.9%)`,
                }}
              /></Show>
            <Show
              when={theme()?.getMainHexagonBorderStyle()
                !== "none" && merged.radiant == 0 && !getHovered()}
            >

              <path

                d={`${getHovered()
                    ? `${getHexagonPathData(theme()?.getHoverHexagonRadius(), 0.99)}`
                    : (merged.radiant === 0
                      ? `${getHexagonPathData(theme()?.getMainHexagonRadius(), 0.99)}`
                      : `${getHexagonPathData(theme()?.getSubHexagonRadius(), 0.99)}`)
                  }`}
                class={`${getHovered()
                    ? `fill-hoverHexagonBorder`
                    : merged.radiant === 0
                      ? `fill-mainHexagonBorder`
                      : `fill-subHexagonBorder`
                  }`}
                style={{
                  transform: `translate(0.9%, 0.9%)`,
                }}
              />

              {/* The main hexagon content if a border is present, otherwise hide it via a Show component*/}

              <path

                d={`${getHovered()
                    ? `${getHexagonPathData(theme()?.getHoverHexagonRadius(), 0.9)}`
                    : (merged.radiant === 0
                      ? `${getHexagonPathData(theme()?.getMainHexagonRadius(), 0.9)}`
                      : `${getHexagonPathData(theme()?.getSubHexagonRadius(), 0.9)}`)
                  }`}
                style={{
                  transform: `translate(5%, 5%)`,
                }}
              />
              {/* Path to only show the bottom border */}
              <Show
                when={theme()?.getMainHexagonBorderStyle()
                  === "shadow" && merged.radiant == 0 && !getHovered()}>
                <path
                  clip-path="url(#hexClip)"

                  d={`${getHovered()
                      ? `${getHexagonPathData(theme()?.getHoverHexagonRadius())}`
                      : (merged.radiant === 0
                        ? `${getHexagonPathData(theme()?.getMainHexagonRadius())}`
                        : `${getHexagonPathData(theme()?.getSubHexagonRadius())}`)
                    }`}
                  style={{
                    transform: `translate(-0.1%, -5%)`,
                  }}
                /></Show></Show>
          </svg>

          <Switch
            fallback={
              <span class="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {merged.title}
              </span>
            }
          >
            <Match when={merged.action === 'App'}>
              <Show
                when={isValidUrl(merged.url)}
                fallback={
                  // No URL or not http show this:
                  <Show
                    when={icon.loading || icon() === ''}
                    fallback={
                      <img
                        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8"
                        src={icon()}
                      ></img>
                    }
                  >
                    <span class="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      {merged.title}
                    </span>
                  </Show>
                }
              >
                <Show
                  // URL show this:
                  when={icon.loading || icon() === ''}
                  fallback={
                    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${merged.url}&sz=${128}`}
                      ></img>
                      <span class="hidden">{merged.url}</span>
                      <img
                        src={icon()}
                        class={`absolute`}
                        style={{
                          width: `${getHexSize() / 66}rem`,
                          height: `${getHexSize() / 66}rem`,
                          top: `${getHexSize() / 66}rem`,
                          left: `${(getHexSize() * 1.3) / 66}rem`,
                        }}
                      ></img>
                    </div>
                  }
                >
                  <span class="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {merged.title}
                  </span>
                </Show>
              </Show>
            </Match>
            <Match when={merged.action === 'MediaPlayer'}>
              <>
                <Show
                  when={!merged.isSettings || getCurrentMedia()?.title === undefined}
                  fallback={
                    <span class="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      🎵
                    </span>
                  }
                >
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
                      class={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 ${getHovered() ? 'brightness-50' : ''
                        }`}
                      style={{
                        height: `${(getHexSize() - merged.border) * 1.169}px`,
                        'min-width': `min-content`,
                        display: isBrokenImage() ? 'none' : 'block',
                      }}
                      onError={() => {
                        setBrokenImage(true);
                      }}
                      onLoad={() => {
                        setBrokenImage(false);
                      }}
                    />
                    <Show when={isBrokenImage()}>
                      <span class="text-xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        🎵
                      </span>
                    </Show>
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
                            invoke('next_media');
                          }}
                        />
                      </span>
                    </Show>
                  </span>
                </Show>
              </>
            </Match>
            <Match when={merged.action === 'PaperBin'}>
              <IoTrashBin class="bin fill-text text-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none" />
            </Match>
          </Switch>
        </div>
      </div>
    </Show>
  );
};

export default HexTile;
