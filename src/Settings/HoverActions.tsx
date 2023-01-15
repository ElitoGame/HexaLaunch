import { updateSettingData, getSettingsData, removeThemeWithName, changeWindow } from '../settings';
import { Input, InputGroup, InputRightElement } from '@hope-ui/solid';
import { FaSolidPlus } from 'solid-icons/fa';
import { FaSolidTrash } from 'solid-icons/fa';
import { FaSolidPen } from 'solid-icons/fa';
import {
  Tooltip,
} from '@hope-ui/solid';
import Theme from '../Themes/Themes';
import { setThemes, themes } from '../themes';

import { produce } from 'solid-js/store';
import Themes from '../Themes/Themes';
import { mergeProps, Show } from 'solid-js';
import SettingsData from './SettingsData';
import { setEditingTheme } from './newThemeTab';



/* Hover Actions for the Themes */

export const HoverActions =( props: {
themesVar: Themes;
index:number;
editEnabled:boolean;

})=> {
  const merged = mergeProps(
    {
      themesVar:[],
      index:0,
      editEnabled:false
    },
    props
  );

  const newTheme = merged.themesVar.clone();

  return (
    <>
  
  
      <Tooltip label="Use as basis for a new Theme" placement="top-start">
        <button style=" right:2px; position:absolute; display:flex; top:4px"
                class=" invisible group-hover:visible flex z-50 group-hover:visible scale-[0.7] p-4 bg-text rounded-full "
                onClick={()=>{

                  
                  newTheme.setThemeName('');
                  getSettingsData()?.setNewTheme(newTheme);
                  getSettingsData()?.setCurrentTheme(newTheme);
                  // setThemes(produce((store) => store.themes = getSettingsData().getThemes()));
                  updateSettingData();
                  changeWindow();
                  
                }}>
                  
          <span style="left:9px;top:8px; position:absolute; display:flex;"><FaSolidPlus class="fill-background"></FaSolidPlus></span>
        </button></Tooltip>
        <Show when={merged.editEnabled}>
        <div  style=" right:0px; position:absolute; display:flex; top:5px"  class="invisible group-hover:visible bg-text w-20 h-200 flex z-20 top-1 scale-90 p-4 bg-text  rounded-full ">
      
      
      <Tooltip label="Delete this Theme" placement="top">
        <button style=" right:20px; position:absolute; display:flex; top:0px" 
                class="flex z-20 scale-90 p-2"
                 onClick={()=>{
                  
                if (merged.index > -1) { 
                  setThemes({themes: getSettingsData().getThemes()})
                   let newThemesArray = removeThemeWithName(themes.themes, merged.themesVar.getThemeName());
                   setThemes(produce((store) => removeThemeWithName(store.themes, merged.themesVar.getThemeName())));
                   getSettingsData()?.setThemes(newThemesArray);
                }
                updateSettingData();}
              }
               ><FaSolidTrash class="fill-background scale-90" ></FaSolidTrash></button></Tooltip>


               <Tooltip label="Edit this Theme" placement="top-end">
        <button style=" right:43px; position:absolute; display:flex; top:1px" 
                class="flex z-20 scale-95 p-2"
                 onClick={()=>{
                getSettingsData().setCurrentTheme(merged.themesVar);
                changeWindow();
                setEditingTheme(true);
                updateSettingData();}
              }
               ><FaSolidPen class="fill-background scale-90" ></FaSolidPen></button></Tooltip>
               
               
               </div></Show>

               
    </>);
};
