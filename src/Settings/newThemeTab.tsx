import { updateFormField, restrictValue, updateBorderStyle, changeWindow } from '../settings';
import {
  SimpleSelect,
  SimpleOption,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputRightElement,
  Button,
} from '@hope-ui/solid';

import { ColorInput } from './ColorInput';

export const NewThemeTab = () => {
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
          <Button class="mr-5 bg-accent" size="xs" onClick={changeWindow}>
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
          <Button class="bg-accent" size="xs" onClick={changeWindow}>
            Cancel
          </Button>{' '}
        </GridItem>
      </Grid>
    </>
  );
};
