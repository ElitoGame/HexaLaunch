import { updateSettingData, changeWindow, getSettingsData } from '../settings';
import {
  Box,
  Grid,
  GridItem,
  Radio,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
  createDisclosure,
  HStack,
  Tooltip,
} from '@hope-ui/solid';
import { primaryMonitor } from '@tauri-apps/api/window';
import { createSignal } from 'solid-js';

const [getSize, setSize] = createSignal<number>(0);
setSize((await primaryMonitor()).size.height);

export const AppearanceTab = () => {
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
          <Button
            class="text-gray-600 bg-gray mr-2 hover:bg-gray hover:brightness-125 text-text"
            size="xs"
            onClick={onOpen}
          >
            Import
          </Button>
          <Modal centered opened={isOpen()} onClose={onClose}>
            <ModalOverlay />
            <ModalContent class="bg-background">
              <ModalHeader>
                <h2 class="text-center text-gray text-[16px]">Import a new Theme</h2>
              </ModalHeader>
              <ModalBody>
                <p>Path</p>{' '}
                <div class="flex justify-between">
                  <Input size="xs" class="w-3/4 h-8" type="text">
                    {' '}
                  </Input>
                  <Button
                    size="xs"
                    class="h-8 ml-5 w-1/5 text-gray-600 bg-gray mr-2 hover:bg-gray hover:brightness-125 text-text"
                  >
                    Browse
                  </Button>
                </div>
              </ModalBody>
              <ModalFooter class="flex justify-center">
                {' '}
                <div>
                  <Button size="xs">Cancel</Button>
                  <Button
                    onClick={onClose}
                    size="xs"
                    class="bg-accent hover:bg-accent hover:brightness-125 text-text"
                  >
                    Continue
                  </Button>
                </div>
              </ModalFooter>
            </ModalContent>
          </Modal>
          <Button
            onClick={changeWindow}
            class="bg-accent hover:bg-accent hover:brightness-125 text-text"
            size="xs"
          >
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
          <Tooltip label={getSettingsData()?.getHexagonSize() + 'px'} withArrow placement="top">
            <input
              class="slider w-full"
              style={`color:${getSettingsData()?.getSettingsAccentColor()}`}
              type="range"
              id="hexagon-size"
              name="hexagon-size"
              min="20"
              max={Math.floor(getSize() / (9 * 1.169))}
              value={getSettingsData()?.getHexagonSize()}
              step="1"
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                getSettingsData()!.setHexagonSize(inputElement.value);
                updateSettingData();
              }}
            />
          </Tooltip>
        </GridItem>
        <GridItem style="align-self: flex;" class="flex-col justify-end">
          <p>Margin</p>
          <Tooltip label={getSettingsData()?.getHexagonMargin() + 'px'} withArrow placement="top">
            <input
              class="slider w-full"
              style={`color:${getSettingsData()?.getSettingsAccentColor()}`}
              type="range"
              id="hexagon-size"
              name="hexagon-size"
              min="0"
              max="50"
              value={getSettingsData()?.getHexagonMargin()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                getSettingsData()?.setHexagonMargin(inputElement.value);
                updateSettingData();
              }}
              step="1"
            />
          </Tooltip>
        </GridItem>
      </Grid>

      <Grid h="100%" templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Text</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getSettingsTextColor()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.setSettingsTextColor(inputElement.value);
                    updateSettingData();
                  }}
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
                    value={getSettingsData()?.getSettingsTextColor()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.setSettingsTextColor(inputElement.value);
                      updateSettingData();
                    }}
                  />
                  <InputRightElement pointerEvents="none">
                    <p>hex</p>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
        </GridItem>
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1} h="100%">
          <h2>Settings</h2>
          <p>Background</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getSettingsBgColor()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.setSettingsBgColor(inputElement.value);
                    updateSettingData();
                  }}
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
                    value={getSettingsData()?.getSettingsBgColor()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.setSettingsBgColor(inputElement.value);
                      updateSettingData();
                    }}
                  />
                  <InputRightElement pointerEvents="none">
                    <p>hex</p>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
          <p>Accent Color</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                  value={getSettingsData()?.getSettingsAccentColor()}
                  onChange={(e: Event) => {
                    const inputElement = e.currentTarget as HTMLInputElement;
                    getSettingsData()?.setSettingsAccentColor(inputElement.value);
                    updateSettingData();
                  }}
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
                    value={getSettingsData()?.getSettingsAccentColor()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      getSettingsData()?.setSettingsAccentColor(inputElement.value);
                      updateSettingData();
                    }}
                  />
                  <InputRightElement pointerEvents="none">
                    <p>hex</p>
                  </InputRightElement>
                </InputGroup>
              </div>
            </div>
          </div>
        </GridItem>
      </Grid>
    </>
  );
};
