import {
  updateFormField,
  setForm,
  restrictValue,
  updateBorderStyle,
  searchAppDB,
  getSearchResults,
  addApp,
  getRelevantApps,
  updateSettingData,
  form,
  changeWindow,
  getNewTheme,
  handleHotkeyEvent,
} from '../settings';
import {
  SimpleSelect,
  SimpleOption,
  Box,
  Grid,
  GridItem,
  Divider,
  css,
  Radio,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  Switch,
  createDisclosure,
  Center,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  VStack,
} from '@hope-ui/solid';

import { createSignal, For, Show } from 'solid-js';

import '../../assets/settings.css';

import { render } from 'solid-js/web';
import {
  getCurrentRadiant,
  getHexUiData,
  openApp,
  runAction,
  isHexUiVisible,
  isSearchVisible,
  setIsSearchVisible,
  getShowPosition,
} from '../renderer';

//import '../../assets/index.css';
import HexTile from '../HexUI/Components/HexTile';
import HexTileData from '../DataModel/HexTileData';

const NewThemeTab = () => {
  return (
    <>
      <Input size="xs" placeholder="Custom Theme"></Input>
      <h2>Main Hexagon</h2>
      <p>Choose Colors for the main six Hexagons.</p>
      <Grid h="100%" templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Corner Radius</p>
          <InputGroup size="xs">
            <Input
              type="number"
              max="50"
              min="0"
              onInput={(e: Event) => {
                restrictValue(e), updateFormField('borderRadius')(e);
              }}
              placeholder="0"
            />
            <InputRightElement pointerEvents="none">px</InputRightElement>
          </InputGroup>

          <p>Border Width</p>
          <InputGroup size="xs">
            <Input
              type="number"
              max="50"
              min="0"
              onInput={(e: Event) => {
                restrictValue(e), updateFormField('borderWidth')(e);
              }}
              placeholder="0"
            />
            <InputRightElement pointerEvents="none">px</InputRightElement>
          </InputGroup>

          <p>Border Style</p>
          <SimpleSelect
            size="xs"
            id="borderStyle"
            placeholder="none"
            onChange={(e: Event) => {
              updateBorderStyle(e);
            }}
          >
            <SimpleOption value="solid">solid</SimpleOption>
            <SimpleOption value="double">double</SimpleOption>
          </SimpleSelect>
        </GridItem>
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1} h="100%">
          <p>Background</p>
          <ColorInput name="MainHexBackground"></ColorInput>
          <p>Default Icon/Text</p>
          <ColorInput name="MainHexIcon"></ColorInput>
          <p>Border</p>
          <ColorInput name="MainHexBorder"></ColorInput>
        </GridItem>
      </Grid>

      <h2>Sub Hexagon</h2>
      <p>Choose Colors for the other sub Hexagons.</p>
      <p>Background</p>

      <Grid h="100%" templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Corner Radius</p>
          <InputGroup size="xs">
            <Input
              type="number"
              max="50"
              min="0"
              onInput={(e: Event) => {
                restrictValue(e), updateFormField('borderRadius')(e);
              }}
              placeholder="0"
            />
            <InputRightElement pointerEvents="none">px</InputRightElement>
          </InputGroup>

          <p>Border Width</p>
          <InputGroup size="xs">
            <Input
              type="number"
              max="50"
              min="0"
              onInput={(e: Event) => {
                restrictValue(e), updateFormField('borderWidth')(e);
              }}
              placeholder="0"
            />
            <InputRightElement pointerEvents="none">px</InputRightElement>
          </InputGroup>

          <p>Border Style</p>
          <SimpleSelect
            size="xs"
            id="borderStyle"
            placeholder="none"
            onChange={(e: Event) => {
              updateBorderStyle(e);
            }}
          >
            <SimpleOption value="solid">solid</SimpleOption>
            <SimpleOption value="double">double</SimpleOption>
          </SimpleSelect>
        </GridItem>
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1} h="100%">
          <p>Background</p>
          <ColorInput name="MainHexBackground"></ColorInput>
          <p>Default Icon/Text</p>
          <ColorInput name="MainHexIcon"></ColorInput>
          <p>Border</p>
          <ColorInput name="MainHexBorder"></ColorInput>
        </GridItem>
      </Grid>
      <h2>Hover Effect</h2>
      <p>Choose Colors for the hover Effect.</p>
      <p>Background</p>

      <Grid h="100%" templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Corner Radius</p>
          <InputGroup size="xs">
            <Input
              type="number"
              max="50"
              min="0"
              onInput={(e: Event) => {
                restrictValue(e), updateFormField('borderRadius')(e);
              }}
              placeholder="0"
            />
            <InputRightElement pointerEvents="none">px</InputRightElement>
          </InputGroup>

          <p>Border Width</p>
          <InputGroup size="xs">
            <Input
              type="number"
              max="50"
              min="0"
              onInput={(e: Event) => {
                restrictValue(e), updateFormField('borderWidth')(e);
              }}
              placeholder="0"
            />
            <InputRightElement pointerEvents="none">px</InputRightElement>
          </InputGroup>

          <p>Border Style</p>
          <SimpleSelect
            size="xs"
            id="borderStyle"
            placeholder="none"
            onChange={(e: Event) => {
              updateBorderStyle(e);
            }}
          >
            <SimpleOption value="solid">solid</SimpleOption>
            <SimpleOption value="double">double</SimpleOption>
          </SimpleSelect>
        </GridItem>
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1} h="100%">
          <p>Background</p>
          <ColorInput name="MainHexBackground"></ColorInput>
          <p>Default Icon/Text</p>
          <ColorInput name="MainHexIcon"></ColorInput>
          <p>Border</p>
          <ColorInput name="MainHexBorder"></ColorInput>
        </GridItem>
      </Grid>
      <Grid h="100%" templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2}>
          <Button class="bg-accent mr-5" size="xs" onClick={changeWindow}>
            Save
          </Button>
        </GridItem>
        <GridItem
          class="justify-end flex items-end"
          rowStart={2}
          rowEnd={2}
          colStart={1}
          colEnd={1}
          h="100%"
        >
          <Button class="bg-accent " size="xs" onClick={changeWindow}>
            Cancel
          </Button>{' '}
        </GridItem>
      </Grid>
    </>
  );
};

const AppearanceTab = () => {
  const { isOpen, onOpen, onClose } = createDisclosure();
  return (
    <>
      <h2>Theme Selection</h2>
      <Box w="100%" pt="50px" pb="50px">
        {' '}
        <HStack spacing="$4">
          <Radio defaultChecked colorScheme="primary" />
          <Radio defaultChecked colorScheme="accent" />
          <Radio defaultChecked colorScheme="neutral" />
        </HStack>
      </Box>

      <Grid h="100%" templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={1} rowEnd={1} colStart={1} colEnd={1} style="align-self: flex-end;">
          {' '}
          <h2>Custom Themes</h2>
        </GridItem>
        <GridItem style="align-self: flex;" class="flex justify-end">
          <Button class="text-gray-600 bg-gray mr-2" size="xs" onClick={onOpen}>
            Import
          </Button>
          <Modal opened={isOpen()} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalHeader>Modal Title</ModalHeader>
              <ModalBody>
                <p>Some contents...</p>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose}>Close</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Button onClick={changeWindow} class="bg-accent" size="xs">
            + New
          </Button>
        </GridItem>
      </Grid>
      <p>Create your own Themes. You can use existing Themes as your basis.</p>
      <h2>Hexagon</h2>

      <Grid h="100%" templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem
          rowStart={1}
          rowEnd={1}
          colStart={1}
          colEnd={1}
          style="align-self: flex-end;"
          class="flex-coljustify-end"
        >
          <p>Size</p>
          <input
            class=" w-full bg-accent accent"
            type="range"
            id="hexagon-size"
            name="hexagon-size"
            min="0"
            max="50"
            value="10"
            step="1"
          />
        </GridItem>
        <GridItem style="align-self: flex;" class="flex-col justify-end">
          <p>Margin</p>
          <input
            class=" w-full bg-accent"
            type="range"
            id="hexagon-size"
            name="hexagon-size"
            min="0"
            max="50"
            value="10"
            step="1"
          />
        </GridItem>
      </Grid>

      <Grid h="100%" templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Text</p>

          <ColorInput name="settingsTextColor" />
        </GridItem>
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1} h="100%">
          <h2>Settings</h2>
          <p>Background</p>
          <ColorInput name="settingsBgColor" />
          <p>Accent Color</p>
          <ColorInput name="settingsAccentColor" />
        </GridItem>
      </Grid>
    </>
  );
};

const LayoutTab = () => {
  const [getPage, setPage] = createSignal<number>(0);
  let searchBar: HTMLInputElement | undefined;

  return (
    <>
      <p>Drag & drop assets to your layout.</p>
      <h2>Search Assets</h2>
      <Input
        bg="#C3C2C2"
        ref={searchBar}
        onInput={(e) => {
          searchAppDB((e.target as HTMLInputElement).value);
          setPage(0);
        }}
      ></Input>
      <br></br>
      <br></br>

      <Box class="bg-gray mb-5" minH="100px" borderRadius="$lg">
        <Show when={!((getSearchResults()?.hits?.length ?? 0) > 0)}>
          <p class="text-base flex justify-center p-3 flex align-center justify-center">
            {' '}
            Search something to see results!
          </p>
        </Show>
        <ul class="p-1">
          <For each={getSearchResults()?.hits ?? []}>
            {(res) => (
              <>
                <Box
                  borderRadius="$lg"
                  onClick={() => {
                    if (searchBar) {
                      if (searchBar.value.match(/^([a-z]:)?(\/|\\).*/gi)) {
                        const newPath =
                          res.document.executable.replaceAll('\\', '/') +
                          (res.document.type === 'Folder' ? '/' : '');
                        searchBar.value = newPath;

                        searchAppDB(newPath);
                        setPage(0);
                        searchBar.focus();
                      }
                    }
                  }}
                >
                  <li>
                    <HStack>
                      <Box class="my-2 bg-background p-3.5" borderRadius="$lg">
                        <div class="w-25">
                          <img src={res.document.icon} class="w-7"></img>
                        </div>
                      </Box>
                      <div>
                        <Box
                          class="my-2 ml-3 p-2 bg-background whitespace-nowrap"
                          maxW="280px"
                          minW="280px"
                          borderRadius="$lg"
                        >
                          <p class="truncate ...">{res.document.name}</p>
                          <p class="truncate ...">{res.document.executable}</p>{' '}
                        </Box>
                      </div>
                    </HStack>
                  </li>
                </Box>
              </>
            )}
          </For>
        </ul>
      </Box>
      <Show when={(getSearchResults()?.hits?.length ?? 0) > 0}>
        <Center>
          <button
            class="bg-blue-300 rounded-sm px-2 py-1 m-2"
            onClick={() => {
              if (searchBar?.value !== '' && getPage() > 0) {
                setPage((page) => page - 1);
                searchAppDB(searchBar?.value ?? '', getPage() * 10);
              }
            }}
          >
            Prev
          </button>
          <span>{getPage() + 1}</span>
          <button
            class="bg-blue-300 rounded-sm px-2 py-1 m-2"
            onClick={() => {
              console.log(getSearchResults()?.count);
              if (
                searchBar?.value !== '' &&
                (getSearchResults()?.count ?? 0) > (getPage() + 1) * 10
              ) {
                setPage((page) => page + 1);
                searchAppDB(searchBar?.value ?? '', getPage() * 10);
              }
            }}
          >
            Next
          </button>
        </Center>

        <h2>Apps</h2>
        <p>
          This list only contains the most important Apps. If you do not find the App you are
          looking for you can use the search function above.{' '}
        </p>
      </Show>
      <Box class="bg-gray" minH="100px" borderRadius="$lg">
        <ul class="p-1">
          <For each={getRelevantApps() ?? []}>
            {(res) => (
              <>
                <li>
                  <HStack>
                    <Box class="my-2 p-3.5 bg-background" borderRadius="$lg">
                      <div class="w-25">
                        <img src={res.icon} class="w-7"></img>
                      </div>
                    </Box>
                    <div>
                      <Box
                        class="my-2 ml-3 p-2 bg-background whitespace-nowrap"
                        maxW="280px"
                        minW="280px"
                        borderRadius="$lg"
                      >
                        <p class="truncate ...">{res.name}</p>
                        <p class="truncate ...">{res.executable}</p>{' '}
                      </Box>
                    </div>
                  </HStack>
                </li>
              </>
            )}
          </For>
        </ul>
      </Box>
      <p>Actions</p>
      <Box bg="#C3C2C2" h="200px" borderRadius="$lg"></Box>
    </>
  );
};

const PreferencesTab = () => {
  return (
    <>
      <p class="font-medium">Start Hotkey</p>

      <Input
        size="md"
        class="w-60"
        id="hello"
        onKeyDown={handleHotkeyEvent}
        value=""
        placeholder="Press any Key(s)"
      />

      <br></br>
      <Grid h="100%" templateRows="repeat(, 1fr)" templateColumns="repeat(2, 1fr)" gap="$1">
        <p class="font-medium">Navigation via keyboard</p>{' '}
        <GridItem class="flex justify-end">
          <Switch
            class="checked:accent active:accent flex-end"
            onChange={() => {
              setForm({
                keyboardNavigation: !form.keyboardNavigation,
              }),
                updateSettingData();
            }}
            defaultChecked
          ></Switch>
        </GridItem>
      </Grid>
      <p>Navigation through the Application with your Keyboard</p>
      <br></br>
      <Grid h="100%" templateRows="repeat(, 1fr)" templateColumns="repeat(2, 1fr)" gap="$1">
        <p class="font-medium">Full Layout</p>
        <GridItem class="flex justify-end">
          <Switch
            onChange={() => {
              setForm({
                fullLayout: !form.fullLayout,
              }),
                updateSettingData();
            }}
            class="flex-end"
            defaultChecked
          ></Switch>
        </GridItem>
      </Grid>
      <p>
        Always show all the available Hexagons, even when they are empty Filled Hexagons don't need
        to be attached to another anymore
      </p>
      <br></br>
      <Grid h="100%" templateRows="repeat(, 1fr)" templateColumns="repeat(2, 1fr)" gap="$1">
        <p class="font-medium">Move to Cursor</p>
        <GridItem class="flex justify-end">
          <Switch
            onChange={() => {
              setForm({
                moveToCursor: !form.moveToCursor,
              }),
                updateSettingData();
            }}
            class="flex-end"
            defaultChecked
          ></Switch>
        </GridItem>
      </Grid>
      <p>The Layout will open where your mouse is located when you open the Application</p>
    </>
  );
};

const ColorInput = (formfield: { name: string }) => {
  const name = formfield.name;
  return (
    <div class="form-group row">
      <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
      <div class="col-sm">
        <div id="demo">
          <input
            onChange={(e: Event) => {
              updateFormField(name)(e);
            }}
            value={form[name]}
            class="colorPick"
            type="color"
            placeholder="#FFFFFF"
          ></input>
          <InputGroup size="xs">
            <Input
              type="text"
              id="theme-color"
              class="form-control @error('theme-color') is-invalid @enderror text-text"
              name="theme-color"
              value={form[name]}
              onInput={(e: Event) => {
                updateFormField(name)(e);
              }}
            />
            <InputRightElement pointerEvents="none">hex</InputRightElement>
          </InputGroup>
        </div>
      </div>
    </div>
  );
};

// const HexUIPreview = () => {
//   return (
//     <>
//       <For each={getHexUiData()?.getRadiantTiles(getCurrentRadiant())}>
//         {(tile: HexTileData) => (
//           <HexTile
//             zIndex={10}
//             x={tile.getX()}
//             y={tile.getY()}
//             radiant={tile.getRadiant()}
//             onClick={() => {
//               if (tile.getAction() === 'App') {
//                 openApp(tile.getApp(), tile.getUrl());
//               } else if (tile.getAction() === 'PaperBin') {
//                 runAction('PaperBin');
//               }
//             }}
//             title={
//               tile
//                 .getApp()
//                 ?.split('.')[0]
//                 ?.split('/')
//                 [tile.getApp()?.split('.')[0]?.split('/')?.length - 1]?.slice(0, 3) ??
//               tile
//                 .getUrl()
//                 ?.split('.')[0]
//                 ?.split('/')
//                 [tile.getUrl()?.split('.')[0]?.split('/')?.length - 1]?.slice(0, 3)
//             }
//             color={'bg-green-400'}
//           ></HexTile>
//         )}
//       </For>
//     </>
//   );
// };

// const HexUI = () => {
//   let searchBar: HTMLInputElement | undefined;
//   const [getPage, setPage] = createSignal<number>(0);

//   window.addEventListener('keydown', (e) => {
//     console.log(e);
//     if (!isSearchVisible() && e.key !== ' ' && e.key !== 'Control' && e.key !== 'Shift') {
//       setIsSearchVisible(true);
//       if (searchBar) {
//         searchBar.focus();
//         searchBar.select();
//         console.log('search bar is visible');
//       }
//     }
//   });
//   return (
//     <div
//       class=""
//       style={{
//         position: 'absolute',
//         top: `${getShowPosition()?.y}px`,
//         left: `${getShowPosition()?.x}px`,
//         'font-size': '0',
//       }}
//     >
//       <div class={`${isSearchVisible() ? 'block' : 'hidden'} z-40`} style={{ 'font-size': '16px' }}>
//         <input
//           type="text"
//           ref={searchBar}
//           class="z-40"
//           onInput={(e) => {
//             searchAppDB((e.target as HTMLInputElement).value);
//             setPage(0);
//             if (searchBar?.value === '') {
//               setIsSearchVisible(false);
//             }
//           }}
//         />
//         <ul>
//           <For each={getSearchResults()?.hits ?? []}>
//             {(res) => (
//               <>
//                 <Box
//                   class="my-2 p-2 bg-slate-300"
//                   borderRadius="$lg"
//                   onClick={() => {
//                     if (searchBar) {
//                       if (searchBar.value.match(/^([a-z]:)?(\/|\\).*/gi)) {
//                         if (res.document.type !== 'Folder') {
//                           openApp('', res.document.executable);
//                           setIsSearchVisible(false);
//                         }
//                         const newPath =
//                           res.document.executable.replaceAll('\\', '/') +
//                           (res.document.type === 'Folder' ? '/' : '');
//                         searchBar.value = newPath;

//                         searchAppDB(newPath);
//                         setPage(0);
//                         searchBar.focus();
//                       } else {
//                         openApp('', res.document.executable);
//                         setIsSearchVisible(false);
//                       }
//                     }
//                   }}
//                 >
//                   <li>
//                     <HStack>
//                       <img src={res.document.icon} class="w-10 pr-2"></img>
//                       <div>
//                         <strong>{res.document.name}</strong>
//                         <br />
//                         <em>{res.document.executable}</em>{' '}
//                       </div>
//                     </HStack>
//                   </li>
//                 </Box>
//               </>
//             )}
//           </For>
//         </ul>
//       </div>
//       <Show when={isHexUiVisible()}>
//         <For each={getHexUiData()?.getCoreTiles()}>
//           {(tile: HexTileData) => (
//             <HexTile
//               x={tile.getX()}
//               y={tile.getY()}
//               radiant={0}
//               onClick={() => {
//                 if (tile.getAction() === 'App') {
//                   openApp(tile.getApp(), tile.getUrl());
//                 } else if (tile.getAction() === 'PaperBin') {
//                   runAction('PaperBin');
//                 }
//               }}
//               title={
//                 tile
//                   .getApp()
//                   ?.split('.')[0]
//                   ?.split('/')
//                   [tile.getApp()?.split('.')[0]?.split('/')?.length - 1]?.slice(0, 3) ??
//                 tile
//                   .getUrl()
//                   ?.split('.')[0]
//                   ?.split('/')
//                   [tile.getUrl()?.split('.')[0]?.split('/')?.length - 1]?.slice(0, 3)
//               }
//             ></HexTile>
//           )}
//         </For>
//       </Show>
//       <Show when={getCurrentRadiant() !== -1}>
//         <For each={getHexUiData()?.getRadiantTiles(getCurrentRadiant())}>
//           {(tile: HexTileData) => (
//             <HexTile
//               zIndex={10}
//               x={tile.getX()}
//               y={tile.getY()}
//               radiant={tile.getRadiant()}
//               onClick={() => {
//                 if (tile.getAction() === 'App') {
//                   openApp(tile.getApp(), tile.getUrl());
//                 } else if (tile.getAction() === 'PaperBin') {
//                   runAction('PaperBin');
//                 }
//               }}
//               title={
//                 tile
//                   .getApp()
//                   ?.split('.')[0]
//                   ?.split('/')
//                   [tile.getApp()?.split('.')[0]?.split('/')?.length - 1]?.slice(0, 3) ??
//                 tile
//                   .getUrl()
//                   ?.split('.')[0]
//                   ?.split('/')
//                   [tile.getUrl()?.split('.')[0]?.split('/')?.length - 1]?.slice(0, 3)
//               }
//               color={'bg-green-400'}
//             ></HexTile>
//           )}
//         </For>
//       </Show>
//     </div>
//   );
// };

const SettingsMenu = () => {
  const tabStyles = css({
    width: '100px',
    height: '30px',
    marginTop: '7px',
    '&:hover': {
      background: '#939DFF !important',
      hover: '#939DFF !important',
      boxShadow: '#939DFF !important',
      outlineColor: '#939DFF !important',
      color: '#31247B !important',
    },
    '&:focus': {
      background: '#939DFF !important',
      hover: '#939DFF !important',
      boxShadow: '#939DFF !important',
      outlineColor: '#939DFF !important',
      color: '#31247B !important',
    },
    '&[aria-selected=true]': {
      background: '#5A6AFC !important',
      boxShadow: '#C5CBFE !important',
      hover: '#C5CBFE !important',
      outlineColor: '#C5CBFE !important',
      color: '#DFDFDF !important',
    },
  });

  return (
    <>
      <Grid
        h="100%"
        templateColumns="repeat(3, 1fr)"
        onDrop={async (e: DragEvent) => {
          e.preventDefault();
          if (e?.dataTransfer?.files[0]?.path) {
            console.log(await addApp(e.dataTransfer.files[0].path));
          }
          // console.log(e.dataTransfer.files[0].path);
        }}
        onDragOver={(e: DragEvent) => {
          e.preventDefault();
          if (e?.dataTransfer?.dropEffect) {
            e.dataTransfer.dropEffect = 'copy';
          }
          return false;
        }}
      >
        <GridItem id="leftPanelWindow">
          <VStack alignItems="left" spacing="$4">
            <Tabs keepAlive variant="pills" defaultIndex={0}>
              <TabList borderWidth="1px">
                <h1 class="pl-3">Settings</h1>
                <Tab class={tabStyles()}>Appearance</Tab>
                <Tab class={tabStyles()}>Layout</Tab>
                <Tab class={tabStyles()}>Preferences</Tab>
              </TabList>
              <Divider class="pb-2" />
              <TabPanel id="tp_appearance">
                <Show when={getNewTheme()} fallback={<AppearanceTab></AppearanceTab>}>
                  <NewThemeTab></NewThemeTab>
                </Show>
              </TabPanel>
              <TabPanel id="tp_layout" style="width:400px">
                <LayoutTab></LayoutTab>
              </TabPanel>
              <TabPanel id="tp_preferences">
                <PreferencesTab></PreferencesTab>
              </TabPanel>
            </Tabs>
          </VStack>
        </GridItem>
        <GridItem rowSpan={1} colSpan={2} bg="#EAEAEA" h="100%"></GridItem>
      </Grid>
    </>
  );
};

export default SettingsMenu;
