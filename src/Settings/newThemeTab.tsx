import { updateFormField, restrictValue, updateBorderStyle, changeWindow, updateSettingData, useMainHexagonInput, setUseMainHexagonInput } from '../settings';
import {
  SimpleSelect,
  SimpleOption,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Switch,
  Stack
} from '@hope-ui/solid';

import { ColorInput } from './ColorInput';
import Themes from '../Themes/Themes';
import { createSignal, Show } from 'solid-js';
import  { themes,setTheme, setThemes } from '../themes';
import { produce } from 'solid-js/store';
let theme = new Themes( 
'',
  '#414141',
  '#DFDFDF',
  '',
  '',
  '3px',
  'none',
  '#414141',
  '#DFDFDF',
  '',
  '',
  '3px',
  'none',
  '#31247B',
  '#DFDFDF',
  '',
  '',
  '3px',
  'none'
);

let tempSubHexData=theme;
export const  [newThemes, setNewThemes] = createSignal(theme)

export const NewThemeTab = () => {
  return (
    <>
     <Stack><Input size="xs" class="text-text mr-2" placeholder={`Custom Theme `+ `${themes.themes.length-2}`}  
     onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                newThemes()?.setThemeName(inputElement.value);
                setTheme(newThemes());
                updateSettingData();
              }}></Input>
     <div class="bg-neutral flex rounded-sm"><div class="w-5 h-5 m-1 bg-mainHexagonBg rounded-sm"></div>
     <div class="w-5 h-5 m-1 bg-mainHexagonIcon rounded-sm "></div>
     <div class="w-5 h-5 m-1 bg-subHexagonBg rounded-sm">
      </div><div class="w-5 h-5 m-1 bg-hoverHexagonBg"></div></div></Stack> 
      <h2>Main Hexagon</h2>
      <p>Choose Colors for the main six Hexagons.</p>
      <Grid  templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Corner Radius</p>
          <InputGroup size="xs">
            <Input
              class="text-text"
              type="number"
              max="20"
              min="0"
              value={newThemes()?.getMainHexagonRadius()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                newThemes()?.setMainHexagonRadius(inputElement.value);
                setTheme(newThemes());
                updateSettingData();
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
              value={newThemes()?.getMainHexagonWidth()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                newThemes()?.setMainHexagonWidth(inputElement.value);
                setTheme(newThemes());
                updateSettingData();
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
            value={newThemes()?.getMainHexagonBorderStyle()}
            onChange={(e: Event) => {
              if(e.toString() != "none" && newThemes()?.getMainHexagonBorder() === "" ){
                newThemes()?.setMainHexagonBorder("#000000")
              }
              if(e.toString() =="none"){
                newThemes()?.setMainHexagonBorder("")
              }
              console.log(e.toString());
              newThemes()?.setMainHexagonBorderStyle(e.toString());
              setTheme(newThemes());
              updateSettingData();

            }}
          >
            <SimpleOption value="none">none</SimpleOption>
            <SimpleOption value="solid">solid</SimpleOption>
            <SimpleOption value="shadow">shadow</SimpleOption>
          </SimpleSelect>
        </GridItem>
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1} >
          <p>Background</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                   value={newThemes()?.getMainHexagonBg()}
                   onChange={(e: Event) => {
                     const inputElement = e.currentTarget as HTMLInputElement;
                     newThemes()?.setMainHexagonBg(inputElement.value);
                     setTheme(newThemes());
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
                    value={newThemes()?.getMainHexagonBg()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      newThemes()?.setMainHexagonBg(inputElement.value);
                      setTheme(newThemes());
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
          <p>Default Icon/Text</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                   value={newThemes()?.getMainHexagonIcon()}
                   onChange={(e: Event) => {
                     const inputElement = e.currentTarget as HTMLInputElement;
                     newThemes()?.setMainHexagonIcon(inputElement.value);
                     setTheme(newThemes());
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
                    value={newThemes()?.getMainHexagonIcon()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      newThemes()?.setMainHexagonIcon(inputElement.value);
                      setTheme(newThemes());
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
          <p>Border</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                   value={newThemes()?.getMainHexagonBorder()}
                   onChange={(e: Event) => {
                     const inputElement = e.currentTarget as HTMLInputElement;
                     newThemes()?.setMainHexagonBorder(inputElement.value);
                     setTheme(newThemes());
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
                    value={newThemes()?.getMainHexagonBorder()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      newThemes()?.setMainHexagonBorder(inputElement.value);
                      setTheme(newThemes());
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

      <h2>Sub Hexagon</h2>
      <p>Choose Colors for the other sub Hexagons.</p>
      <Stack class="flex justify-end">
      <p >Use main Hexagon Input</p>
      <Switch
            class="checked:accent active:accent"
            checked={useMainHexagonInput()}
            onChange={() => {
            if(!useMainHexagonInput()) {
            tempSubHexData= newThemes();
             setUseMainHexagonInput(!useMainHexagonInput());
             newThemes()?.setSubHexagonBg(newThemes()?.getMainHexagonBg());
             newThemes()?.setSubHexagonIcon(newThemes()?.getMainHexagonIcon());
             newThemes()?.setSubHexagonBorder(newThemes()?.getMainHexagonBorder());
             newThemes()?.setSubHexagonRadius(newThemes()?.getMainHexagonRadius());
             newThemes()?.setSubHexagonBorderStyle(newThemes()?.getMainHexagonBorderStyle());
             newThemes()?.setSubHexagonWidth(newThemes()?.getMainHexagonWidth());
             setTheme(newThemes());
             updateSettingData()
            }else{
              setUseMainHexagonInput(!useMainHexagonInput());
              console.log(tempSubHexData.toString());
              newThemes()?.setSubHexagonBg(tempSubHexData.getSubHexagonBg());
              newThemes()?.setSubHexagonIcon(tempSubHexData.getSubHexagonIcon());
              newThemes()?.setSubHexagonBorder(tempSubHexData.getSubHexagonBorder());
              newThemes()?.setSubHexagonRadius(tempSubHexData.getSubHexagonRadius());
              newThemes()?.setSubHexagonBorderStyle(tempSubHexData.getSubHexagonBorderStyle());
              newThemes()?.setSubHexagonWidth(tempSubHexData.getSubHexagonWidth());
              setTheme(newThemes());
              updateSettingData()
            }
             // updateSettingData();
            }}
          ></Switch></Stack>
<Show when={!useMainHexagonInput()}>
      <Grid  templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Corner Radius</p>
          <InputGroup size="xs">
            <Input
              class="text-text"
              type="number"
              max="20"
              min="0"
              value={newThemes()?.getSubHexagonRadius()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                newThemes()?.setSubHexagonRadius(inputElement.value);
                setTheme(newThemes());
                updateSettingData();
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
              value={newThemes()?.getSubHexagonWidth()}
              onChange={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                newThemes()?.setSubHexagonWidth(inputElement.value);
                setTheme(newThemes());
                updateSettingData();
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
            value={newThemes()?.getSubHexagonBorderStyle()}
            onChange={(e: Event) => {
              if(e.toString() != "none" && newThemes()?.getSubHexagonBorder() === "" ){
                newThemes()?.setSubHexagonBorder("#000000")
              }
              if(e.toString() =="none"){
                newThemes()?.setSubHexagonBorder("")
              }
              console.log(e.toString());
              newThemes()?.setSubHexagonBorderStyle(e.toString());
              setTheme(newThemes());
              updateSettingData();
            }}
          >
             <SimpleOption value="none">none</SimpleOption>
            <SimpleOption value="solid">solid</SimpleOption>
            <SimpleOption value="shadow">shadow</SimpleOption>
          </SimpleSelect>
        </GridItem>
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1} >
          <p>Background</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                   value={newThemes()?.getSubHexagonBg()}
                   onChange={(e: Event) => {
                     const inputElement = e.currentTarget as HTMLInputElement;
                     newThemes()?.setSubHexagonBg(inputElement.value);
                     setTheme(newThemes());
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
                    value={newThemes()?.getSubHexagonBg()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      newThemes()?.setSubHexagonBg(inputElement.value);
                      setTheme(newThemes());
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
          <p>Default Icon/Text</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                   value={newThemes()?.getSubHexagonIcon()}
                   onChange={(e: Event) => {
                     const inputElement = e.currentTarget as HTMLInputElement;
                     newThemes()?.setSubHexagonIcon(inputElement.value);
                     setTheme(newThemes());
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
                    value={newThemes()?.getSubHexagonIcon()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      newThemes()?.setSubHexagonIcon(inputElement.value);
                      setTheme(newThemes());
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
          <p>Border</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                   value={newThemes()?.getSubHexagonBorder()}
                   onChange={(e: Event) => {
                     const inputElement = e.currentTarget as HTMLInputElement;
                     newThemes()?.setSubHexagonBorder(inputElement.value);
                     setTheme(newThemes());
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
                    value={newThemes()?.getSubHexagonBorder()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      newThemes()?.setSubHexagonBorder(inputElement.value);
                      setTheme(newThemes());
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
      </Show>
      <h2>Hover Effect</h2>
      <p>Choose Colors for the hover Effect.</p>

      <Grid  templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2} style="align-self: flex-end;">
          <p>Corner Radius</p>
          <InputGroup size="xs">
            <Input
              class="text-text"
              type="number"
              max="20"
              min="0"
              value={newThemes()?.getHoverHexagonRadius()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                newThemes()?.setHoverexagonRadius(inputElement.value);
                setTheme(newThemes());
                updateSettingData();
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
              value={newThemes()?.getHoverHexagonWidth()}
              onInput={(e: Event) => {
                const inputElement = e.currentTarget as HTMLInputElement;
                newThemes()?.setHoverHexagonWidth(inputElement.value);
                setTheme(theme);
                updateSettingData();
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
            value={newThemes()?.getHoverHexagonBorderStyle()}
            onChange={(e: Event) => {
              if(e.toString() != "none" && newThemes()?.getHoverHexagonBorder() === "" ){
                newThemes()?.setHoverHexagonBorder("#000000")
              }
              if(e.toString() =="none"){
                newThemes()?.setHoverHexagonBorder("")
              }
              console.log(e.toString());
              newThemes()?.setHoverHexagonBorderStyle(e.toString());
              setTheme(newThemes());
              updateSettingData();
            }}
          >
          <SimpleOption value="none">none</SimpleOption>
            <SimpleOption value="solid">solid</SimpleOption>
            <SimpleOption value="shadow">shadow</SimpleOption>
          </SimpleSelect>
        </GridItem>
        <GridItem rowStart={2} rowEnd={2} colStart={1} colEnd={1} >
          <p>Background</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                   value={newThemes()?.getHoverHexagonBg()}
                   onChange={(e: Event) => {
                     const inputElement = e.currentTarget as HTMLInputElement;
                     newThemes()?.setHoverHexagonBg(inputElement.value);
                     setTheme(newThemes());
                    
                     console.log(JSON.stringify(newThemes()?.toJSON));
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
                    value={newThemes()?.getHoverHexagonBg()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      newThemes()?.setHoverHexagonBg(inputElement.value);
                      setTheme(newThemes());
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
          <p>Default Icon/Text</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                   value={newThemes()?.getHoverHexagonIcon()}
                   onChange={(e: Event) => {
                     const inputElement = e.currentTarget as HTMLInputElement;
                     newThemes()?.setHoverHexagonIcon(inputElement.value);
                     setTheme(newThemes());
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
                    value={newThemes()?.getHoverHexagonIcon()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      newThemes()?.setHoverHexagonIcon(inputElement.value);
                      setTheme(newThemes());
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
          <p>Border</p>
          <div class="form-group row">
            <label for="theme-color" class="col-sm-2 col-form-label font-weight-bold"></label>
            <div class="col-sm">
              <div id="demo">
                <input
                   value={newThemes()?.getHoverHexagonBorder()}
                   onChange={(e: Event) => {
                     const inputElement = e.currentTarget as HTMLInputElement;
                     newThemes()?.setHoverHexagonBorder(inputElement.value);
                     setTheme(newThemes());
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
                    value={newThemes()?.getHoverHexagonBorder()}
                    onChange={(e: Event) => {
                      const inputElement = e.currentTarget as HTMLInputElement;
                      newThemes()?.setHoverHexagonBorder(inputElement.value);
                      setTheme(newThemes());
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
      <Grid templateRows="repeat(1, 1fr)" templateColumns="repeat(2, 1fr)" gap="$4">
        <GridItem rowStart={2} rowEnd={2} colStart={2} colEnd={2}>
          <Button class="mr-5 bg-accent" size="xs" onClick={()=>{changeWindow();
          if(newThemes()?.getThemeName() ==""){
            newThemes()?.setThemeName(`Custom Theme `+ `${themes.themes.length-2}`);}
          setThemes(produce(store => store.themes.push(newThemes())));
          let theme = new Themes( 
            '',
              '#414141',
              '#DFDFDF',
              '',
              '',
              '3px',
              'none',
              '#414141',
              '#DFDFDF',
              '',
              '',
              '3px',
              'none',
              '#31247B',
              '#DFDFDF',
              '',
              '',
              '3px',
              'none'
            );
          setNewThemes(theme);
          setTheme(newThemes());
          updateSettingData();
          }}>
            Save
          </Button>
        </GridItem>
        <GridItem
          class="justify-end flex items-end"
          rowStart={2}
          rowEnd={2}
          colStart={1}
          colEnd={1}
        >
          <Button class="bg-accent" size="xs"  onClick={()=>{changeWindow();
          let theme = new Themes( 
            '',
              '#414141',
              '#DFDFDF',
              '',
              '',
              '3px',
              'none',
              '#414141',
              '#DFDFDF',
              '',
              '',
              '3px',
              'none',
              '#31247B',
              '#DFDFDF',
              '',
              '',
              '3px',
              'none'
            );
          setNewThemes(theme);
          setTheme(newThemes());
          updateSettingData();
          }}>
            Cancel
          </Button>{' '}
        </GridItem>
      </Grid>
    </>
  );
};
