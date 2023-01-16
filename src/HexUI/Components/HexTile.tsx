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

import {
  FaSolidPlay,
  FaSolidForwardStep,
  FaSolidPause,
  FaSolidTrashCan,
  FaSolidMusic,
} from 'solid-icons/fa';
import { invoke } from '@tauri-apps/api';
import { externalAppManager } from '../../externalAppManager';
import { getSettingsData } from '../../settings';
import Theme, { ThemePart } from '../../Themes/Theme';

const HexIcon = async (app: string) => await externalAppManager.getIconOfActionExe(app);

const getHexagonPathData = (
  radius: any = 3,
  scale = 1,
  heightChange = 0,
  heightOffset = 0,
  scaleWithHexSize = true
) => {
  const sin = (deg) => Math.sin((deg * Math.PI) / 180);
  const cos = (deg) => Math.cos((deg * Math.PI) / 180);

  // Modify this border radius via the themes.
  const borderRadius = parseFloat(radius === '' ? '0' : radius);
  const sideLength = ((38.5 * (scaleWithHexSize ? getHexSize() : 66)) / 66) * scale;
  const x0 = 0;
  const y0 = 0;

  const x1 = sideLength * cos(30);
  const y1 = sideLength * sin(30) - heightOffset;

  const xc1 = x1 - borderRadius * cos(30);
  const yc0 = borderRadius * sin(30);
  const xc2 = x1 + borderRadius * cos(30);

  const x2 = 2 * x1;
  const y2 = y1 + sideLength - heightChange;

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
  class?: string;
  customTheme?: Theme;
  scale?: number;
  scaleWithHexSize?: boolean;
}) => {
  const merged = mergeProps(
    {
      x: 0,
      y: 0,
      radiant: 0,
      onClick: () => {},
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
      class: '',
      customTheme: null,
      scale: 100,
      scaleWithHexSize: 66,
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
  const [getScale, setScale] = createSignal(merged.hasAnimation ? 0 : merged.scale);
  const customSize = merged.scaleWithHexSize ? getHexSize() : 66;
  const customMargin = merged.scaleWithHexSize ? getHexMargin() : 4;
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
      setScale(merged.scale);
    }, 100);
  }

  const [isBrokenImage, setBrokenImage] = createSignal(false);

  return (
    <Show
      when={(!isFullLayout() && merged.action !== 'Unset') || isFullLayout() || merged.isSettings}
    >
      <div
        class={`hexTile absolute bg-transparent  cursor-pointer inline-block ` + merged.class}
        id={`{"x":"${merged.x}", "y":"${merged.y}", "radiant":"${merged.radiant}", "action":"${
          merged.action
        }", "app":"${merged.app.replaceAll('\\', '\\\\')}", "url":"${merged.url
          .trim()
          .replaceAll('\\', '\\\\')}
        ", "title":"${merged.title.replaceAll('\\', '')}"}`}
        style={{
          left: `${
            merged.x * (customSize + customMargin) - // maybe hexsize  * 0.98
            (merged.y % 2 === 0 ? 0 : (customSize + customMargin) / 2) -
            customSize / 2 -
            (customMargin / 8) * 11.75
          }px`,
          bottom: `${
            merged.y * (customSize * 0.86 + customMargin) - // maybe hexsize  * 0.85
            (customSize / 13) * 8 -
            (customMargin / 8) * 11.75
          }px`,
          width: `${customSize + customMargin}px`,
          margin: `${customMargin}px`,
          height: `${(customSize + customMargin) * 1.169}px`,
          'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
          'z-index': merged.zIndex ?? 0,
          'transform-origin': 'center',
          'transition-property': 'transform',
          transform: `scale(${getScale() / 100})`,
          'transition-duration': `${delay * 0.075}s`,
        }}
      >
        <div
          class={'group absolute hover:scale-97'}
          id={`radiant:${merged.radiant}`}
          style={{
            left: `${(customMargin / 2) * -1}px`,
            bottom: `${(customMargin / 2) * -1}px`,
            width: `${customSize}px`,
            margin: `${customMargin}px`,
            height: `${customSize * 1.169}px`,
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
          <svg width={customSize + customMargin * 2} height={customSize * 1.169}>
            <Show when={merged.hasHoverEffect}>
              <HexPaths
                part={
                  merged.customTheme?.getHoverPart() ??
                  getSettingsData().getCurrentTheme().getHoverPart()
                }
                class="group-hover:block hidden"
                scaleWithHexSize={merged.scaleWithHexSize}
              ></HexPaths>
            </Show>
            <Show
              when={props.radiant === 0}
              fallback={
                <HexPaths
                  part={
                    merged.customTheme?.getSubPart() ??
                    getSettingsData().getCurrentTheme().getSubPart()
                  }
                  class={`${merged.hasHoverEffect ? 'group-hover:hidden' : ''}`}
                  scaleWithHexSize={merged.scaleWithHexSize}
                ></HexPaths>
              }
            >
              <HexPaths
                part={
                  merged.customTheme?.getMainPart() ??
                  getSettingsData().getCurrentTheme().getMainPart()
                }
                class={`${merged.hasHoverEffect ? 'group-hover:hidden' : ''}`}
                scaleWithHexSize={merged.scaleWithHexSize}
              ></HexPaths>
            </Show>
          </svg>

          <Switch
            fallback={
              <span class="text-xl text-mainHexagonIcon absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
                          width: `${customSize / 66}rem`,
                          height: `${customSize / 66}rem`,
                          top: `${customSize / 66}rem`,
                          left: `${(customSize * 1.3) / 66}rem`,
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
                      <FaSolidMusic class="w-5 h-5 text-mainHexagonIcon" />
                    </span>
                  }
                >
                  <span
                    class="absolute"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: `${customSize - merged.border}px`,
                      height: `${(customSize - merged.border) * 1.169}px`,
                      'clip-path': 'polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%)',
                    }}
                  >
                    <img
                      src={'data:image/png;base64,' + getCurrentMedia()?.thumbnail}
                      class={`absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 ${
                        getHovered() ? 'brightness-50' : ''
                      }`}
                      style={{
                        height: `${(customSize - merged.border) * 1.169}px`,
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
                        <FaSolidMusic class="w-5 h-5 text-mainHexagonIcon" />
                      </span>
                    </Show>
                    <Show when={getHovered() && getCurrentMedia() && getCurrentMedia().title}>
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
              <FaSolidTrashCan class="bin fill-mainHexagonIcon w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none" />
            </Match>
          </Switch>
        </div>
      </div>
    </Show>
  );
};

export default HexTile;

const HexPaths = (props: { part: ThemePart; class?: string; scaleWithHexSize?: boolean }) => {
  console.log('Reading props part: ', props.part);
  // if (!props.part) return <></>;
  return (
    <g class={props.class ?? ''}>
      {/* Path to only show the bottom border */}
      <Switch>
        <Match when={props.part?.getHexagonBorderStyle() === 'shadow'}>
          <path
            d={`${getHexagonPathData(
              props.part.getHexagonRadius(),
              0.985,
              0,
              -1.3,
              props.scaleWithHexSize
            )}`}
            style={{
              fill: props.part.getHexagonBorder(),
              transform: `translate(0.5%, 0%)`,
            }}
          />
          <path
            d={`${getHexagonPathData(
              props.part.getHexagonRadius(),
              1,
              parseInt(props.part?.getHexagonBorderWidth() ?? '10') / 2.3,
              -1,
              props.scaleWithHexSize
            )}`}
            style={{
              fill: props.part.getHexagonBg(),
              transform: `translate(0%, 0%)`,
            }}
          />
        </Match>
        <Match when={props.part?.getHexagonBorderStyle() === 'solid'}>
          <path
            d={`${getHexagonPathData(
              props.part.getHexagonRadius(),
              0.99,
              0,
              0,
              props.scaleWithHexSize
            )}`}
            style={{
              fill: props.part.getHexagonBorder(),
              transform: `translate(0.5%, 0.5%)`,
            }}
          />
          {/* The main hexagon content if a border is present*/}
          <path
            d={`${getHexagonPathData(
              props.part.getHexagonRadius(),
              1 - parseInt(props.part?.getHexagonBorderWidth() ?? '10') / 100,
              0,
              0,
              props.scaleWithHexSize
            )}`}
            style={{
              fill: props.part.getHexagonBg(),
              transform: `translate(${
                parseInt(props.part?.getHexagonBorderWidth() ?? '10') / 2
              }%, ${parseInt(props.part?.getHexagonBorderWidth() ?? '10') / 2}%)`,
            }}
          />
        </Match>
        <Match when={props.part?.getHexagonBorderStyle() === 'none'}>
          <path
            d={`${getHexagonPathData(
              props.part.getHexagonRadius(),
              1,
              0,
              0,
              props.scaleWithHexSize
            )}`}
            style={{
              fill: props.part.getHexagonBg(),
              transform: `translate(0%, 0%)`,
            }}
          />
        </Match>
      </Switch>
    </g>
  );
};
