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
  Text,
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
  //const { isOpen, onOpen, onClose } = createDisclosure();

  return (
    <>
      <Grid h="100%" templateRows="repeat(, 1fr)" templateColumns="repeat(3, 1fr)" gap="$4">
        <GridItem>
          <VStack alignItems="left" spacing="$4">
            <Tabs keepAlive variant="pills" defaultIndex={1}>
              <TabList borderWidth="1px" borderColor="$neutral6">
                <Tab disabled>
                  <h1>Settings</h1>
                </Tab>

                <Tab class={tabStyles()}>Appearance</Tab>
                <Tab class={tabStyles()}>Layout</Tab>
                <Tab class={tabStyles()}>Preferences</Tab>
              </TabList>
              <Divider class="pb-2" />
              <TabPanel id="tp_settings"></TabPanel>

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
                    <Button color="gray" background-color="gray" colorScheme="neutral">
                      +
                    </Button>
                    <Modal blockScrollOnMount={false} opened={false} onClose={() => {}}>
                      <ModalOverlay />
                      <ModalContent>
                        <ModalCloseButton />
                        <ModalHeader>Modal Title</ModalHeader>
                        <ModalBody>
                          <Text as="em">You can scroll the content behind the modal</Text>
                        </ModalBody>
                        <ModalFooter>
                          <Button>Close</Button>
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
                      <Input placeholder="0" />
                      <InputRightElement pointerEvents="none">px</InputRightElement>
                    </InputGroup>
                    <p>Border Style</p>
                    <Select size="xs">
                      <SelectTrigger>
                        <SelectPlaceholder>None</SelectPlaceholder>
                        <SelectValue />
                        <SelectIcon />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectListbox>
                          <For each={['solid', 'double']}>
                            {(item) => (
                              <SelectOption value={item}>
                                <SelectOptionText>{item}</SelectOptionText>
                                <SelectOptionIndicator />
                              </SelectOption>
                            )}
                          </For>
                        </SelectListbox>
                      </SelectContent>
                    </Select>
                  </GridItem>
                  <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1} h="100%">
                    <p>Hexagon</p>
                    <p>Width</p>
                    <InputGroup size="xs">
                      <Input placeholder="0" />
                      <InputRightElement pointerEvents="none">px</InputRightElement>
                    </InputGroup>
                    <p>Border Radius</p>
                    <InputGroup size="xs">
                      <Input placeholder="0" />
                      <InputRightElement pointerEvents="none">px</InputRightElement>
                    </InputGroup>
                  </GridItem>
                </Grid>
              </TabPanel>

              <TabPanel id="tp_layout">
                <p>Assets</p>
                <p>Drag & drop</p>

                <Input bg="#C3C2C2"></Input>
                <br></br>
                <br></br>

                <p>Apps</p>
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
                    <Switch class="flex-end" defaultChecked></Switch>
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
                    <Switch class="flex-end" defaultChecked></Switch>
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
                    <Switch class="flex-end" defaultChecked></Switch>
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
