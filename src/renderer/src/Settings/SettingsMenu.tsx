import {
  updateFormField,
  toggleSwitch,
  change,
  value,
  setValue,
  searchAppDB,
  getSearchResults,
  addApp,
} from '../settings';
import {
  Box,
  Grid,
  GridItem,
  Divider,
  css,
  Radio,
  Select,
  SelectTrigger,
  SelectPlaceholder,
  SelectValue,
  SelectIcon,
  SelectContent,
  SelectListbox,
  SelectOption,
  SelectOptionText,
  SelectOptionIndicator,
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
} from '@hope-ui/solid';

import { HStack, Tabs, TabList, Tab, TabPanel, VStack } from '@hope-ui/solid';
import { For } from 'solid-js';

import '../../assets/settings.css';

const SettingsMenu = () => {
  const tabStyles = css({
    width: '100px',
    height: '30px',
    marginTop: '7px',
    '&:hover': {
      hover: '#C5CBFE !important',
      boxShadow: '#C5CBFE !important',
      outlineColor: '#C5CBFE !important',
      color: '#414141 !important',
    },
    '&:focus': {
      background: '#C5CBFE !important',
      hover: '#C5CBFE !important',
      boxShadow: '#C5CBFE !important',
      outlineColor: '#C5CBFE !important',
      color: '#414141 !important',
    },
    '&[aria-selected=true]': {
      background: '#C5CBFE !important',
      boxShadow: '#C5CBFE !important',
      hover: '#C5CBFE !important',
      outlineColor: '#C5CBFE !important',
      color: '#414141 !important',
    },
  });

  const { isOpen, onOpen, onClose } = createDisclosure();

  return (
    <>
      <Grid
        h="100%"
        templateRows="repeat(, 1fr)"
        templateColumns="repeat(3, 1fr)"
        gap="$4"
        onDrop={async (e: any) => {
          e.preventDefault();
          // console.log(e.dataTransfer.files[0].path);
          console.log(await addApp(e.dataTransfer.files[0].path));
        }}
        onDragOver={(e: any) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
          return false;
        }}
      >
        <GridItem>
          <VStack alignItems="left" spacing="$4">
            <Tabs keepAlive variant="pills" defaultIndex={1}>
              <TabList borderWidth="1px" borderColor="$neutral6">
                <h1 class="pl-3">Settings</h1>
                <Tab class={tabStyles()}>Appearance</Tab>
                <Tab class={tabStyles()}>Layout</Tab>
                <Tab class={tabStyles()}>Preferences</Tab>
              </TabList>
              <Divider class="pb-2" />

              <TabPanel id="tp_appearance">
                <p>Theme Selection</p>
                <Box w="100%" pt="50px" pb="50px">
                  {' '}
                  <HStack spacing="$4">
                    <Radio defaultChecked colorScheme="primary" />
                    <Radio defaultChecked colorScheme="accent" />
                    <Radio defaultChecked colorScheme="neutral" />
                  </HStack>
                </Box>
                <Grid
                  h="100%"
                  templateRows="repeat(2, 1fr)"
                  templateColumns="repeat(2, 1fr)"
                  gap="$4"
                >
                  <GridItem>
                    <p>Custom Themes</p>
                    <p>Create your own Theme</p>
                  </GridItem>
                  <GridItem
                    class="justify-end flex items-end"
                    rowStart={1}
                    rowEnd={1}
                    colStart={2}
                    colEnd={2}
                  >
                    <Button bg="lightgray !important" onClick={onOpen}>
                      +
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
                  </GridItem>
                  <GridItem
                    rowStart={2}
                    rowEnd={2}
                    colStart={2}
                    colEnd={2}
                    style="align-self: flex-end;"
                  >
                    <p>Border Width</p>
                    <InputGroup size="xs">
                      <Input
                        onInput={(e: Event) => {
                          updateFormField('borderWidth')(e);
                        }}
                        placeholder="0"
                      />
                      <InputRightElement pointerEvents="none">px</InputRightElement>
                    </InputGroup>
                    <p>{value()}</p>
                    <Select value={value()} onChange={setValue} size="xs">
                      <SelectTrigger>
                        <SelectPlaceholder>None</SelectPlaceholder>
                        <SelectValue />
                        <SelectIcon />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectListbox>
                          <SelectOption value="solid">
                            <SelectOptionText>solid</SelectOptionText>
                            <SelectOptionIndicator />
                          </SelectOption>
                          <SelectOption value="double">
                            <SelectOptionText>double</SelectOptionText>
                            <SelectOptionIndicator />
                          </SelectOption>
                        </SelectListbox>
                      </SelectContent>
                    </Select>
                  </GridItem>
                  <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1} h="100%">
                    <p>Hexagon</p>
                    <p>Width</p>
                    <InputGroup size="xs">
                      <Input
                        type="number"
                        max="50"
                        onInput={(e: Event) => {
                          updateFormField('width')(e);
                        }}
                        placeholder="0"
                      />
                      <InputRightElement pointerEvents="none">px</InputRightElement>
                    </InputGroup>
                    <p>Border Radius</p>
                    <InputGroup size="xs">
                      <Input
                        type="number"
                        onInput={(e: Event) => {
                          updateFormField('borderRadius')(e);
                        }}
                        placeholder="0"
                      />
                      <InputRightElement pointerEvents="none">px</InputRightElement>
                    </InputGroup>
                  </GridItem>
                </Grid>
              </TabPanel>

              <TabPanel id="tp_layout">
                <p>Assets</p>
                <p>Drag & drop</p>

                <Input
                  bg="#C3C2C2"
                  onInput={(e) => searchAppDB((e.target as HTMLInputElement).value)}
                ></Input>
                <br></br>
                <br></br>

                <p>Apps</p>
                <ul>
                  <For each={getSearchResults()?.hits ?? []}>
                    {(res) => (
                      <>
                        <Box class="my-2 p-2 bg-slate-300" borderRadius="$lg">
                          <li>
                            <HStack>
                              <img src={res.document.icon} class="w-10 pr-2"></img>
                              <div>
                                <strong>{res.document.name}</strong>
                                <br />
                                <em>{res.document.executable}</em>{' '}
                              </div>
                            </HStack>
                          </li>
                        </Box>
                      </>
                    )}
                  </For>
                </ul>
                <Box bg="#C3C2C2" h="200px" borderRadius="$lg"></Box>
                <p>Actions</p>
                <Box bg="#C3C2C2" h="200px" borderRadius="$lg"></Box>
              </TabPanel>

              <TabPanel id="tp_preferences">
                <p>Start Hotkey</p>

                <InputGroup class="w-40">
                  <Input size="xs" placeholder="STRG" />
                  <Input size="xs" placeholder="K" />
                </InputGroup>
                <br></br>
                <Grid
                  h="100%"
                  templateRows="repeat(, 1fr)"
                  templateColumns="repeat(2, 1fr)"
                  gap="$1"
                >
                  <p>Navigation via keyboard</p>{' '}
                  <GridItem class="flex justify-end">
                    <Switch
                      onChange={(e: Event) => {
                        toggleSwitch(!change());
                        updateFormField('keyboardNavigation')(e);
                      }}
                      value={change() ? 'on' : 'off'}
                      class="flex-end"
                      defaultChecked
                    ></Switch>
                  </GridItem>
                </Grid>
                <p>Navigation through the Application with your Keyboard</p>
                <br></br>
                <Grid
                  h="100%"
                  templateRows="repeat(, 1fr)"
                  templateColumns="repeat(2, 1fr)"
                  gap="$1"
                >
                  <p>Full Layout</p>
                  <GridItem class="flex justify-end">
                    <Switch
                      onChange={(e: Event) => {
                        toggleSwitch(!change());
                        updateFormField('fullLayout')(e);
                      }}
                      value={change() ? 'on' : 'off'}
                      class="flex-end"
                      defaultChecked
                    ></Switch>
                  </GridItem>
                </Grid>
                <p>
                  Always show all the available Hexagons, even when they are empty Filled Hexagons
                  don't need to be attached to another anymore
                </p>
                <br></br>
                <Grid
                  h="100%"
                  templateRows="repeat(, 1fr)"
                  templateColumns="repeat(2, 1fr)"
                  gap="$1"
                >
                  <h2>Move to Cursor</h2>
                  <GridItem class="flex justify-end">
                    <Switch
                      onChange={(e: Event) => {
                        toggleSwitch(!change());
                        updateFormField('moveToCursor')(e);
                      }}
                      value={change() ? 'on' : 'off'}
                      class="flex-end"
                      defaultChecked
                    ></Switch>
                  </GridItem>
                </Grid>
                <p>
                  The Layout will open where your mouse is located when you open the Application
                </p>
              </TabPanel>
            </Tabs>
          </VStack>
        </GridItem>
        <GridItem rowSpan={2} colSpan={2} bg="#EAEAEA" h="100%"></GridItem>
      </Grid>
    </>
  );
};

export default SettingsMenu;
