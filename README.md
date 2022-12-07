# RadialHexUI

A radial hexagon menu to boost productivity

## Features

### Essentials

- [x] Launching Apps
- [x] Auto Start with Windows(/Mac)
- [ ] Settings Menu for essential settings like:
  - [ ] Themes
  - [ ] Hotkey
  - [ ] App layout customization
- [x] Essential Extensions
  - [x] Browser Launcher
  - [x] Empty Paper bin
- [ ] Auto Updating (Windows 100%, Mac potentially harder due to notarizing)
- [x] Add a possibility to add Apps to the Launcher without pasting the Apps install location. This can be one or multiple of these:
  - [x] Uninstall Registy
  - [x] Apps linked in the startMenu
  - [x] Detecting steam games
  - [x] Detecting epic games
  - [x] Finding executables in the program files folders
  - [x] Finding linked files on the (public & useres) desktop
  - [x] Via Drap & Drop
  - [x] Via detecting active processes

### Optional

- [ ] Non-Essential Settings
  - [ ] Icon Picker for the App layout customization
- [ ] Non-Essential Extensions
  - [ ] ~~Bluetooth Connector~~
  - [ ] Windows Media Player Extension (or Spotify alternatively)
  - [ ] System Stats (RAM, CPU, Storage, GPU)
  - [x] Searchbar (Depends highly on App detection)
  - [ ] Browser Bookmarks (Chrome & Firefox for now)
- [ ] Animations in the Hex UI
  - [ ] ~~Opening~~ and Closing the UI
  - [x] Moving the Mouse to show different hexagons fields
  - [ ] Opening special fields like the Searchbar
- [ ] Mac Support (Not required since no Mac Users in the team, so nice to have) - many extensions don't work on linux, so sadly no support there...

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

The Tauri prerequisites need to be fulfilled: https://tauri.app/v1/guides/getting-started/prerequisites

```bash
$ npm install
```

### Development

```bash
$ npm run tauri dev
```

### Build

Builds a executable for your current platform. Additional build platforms can be added via Github Actions. See: https://tauri.app/v1/guides/building/cross-platform

```bash
$ npm run tauri build
```
