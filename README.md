# RadialHexUI

A radial hexagon menu to boost productivity

## Features

### Essentials

- [X] Launching Apps
- [x] Auto Start with Windows(/Mac)
- [ ] Settings Menu for essential settings like:
  - [ ] Themes
  - [ ] Hotkey
  - [ ] App layout customization
- [X] Essential Extensions
  - [X] Browser Launcher
  - [X] Empty Paper bin
- [ ] Auto Updating (Windows 100%, Mac potentially harder due to notarizing)
- [X] Add a possibility to add Apps to the Launcher without pasting the Apps install location. This can be one or multiple of these:
  - [X] Uninstall Registy
  - [X] Apps linked in the startMenu
  - [x] Detecting steam games
  - [x] Detecting epic games
  - [x] Finding executables in the program files folders
  - [x] Finding linked files on the (public & useres) desktop
  - [X] Via Drap & Drop
  - [X] Via detecting active processes

### Optional

- [ ] Non-Essential Settings
  - [ ] Icon Picker for the App layout customization
- [ ] Non-Essential Extensions
  - [ ] ~~Bluetooth Connector~~
  - [ ] Windows Media Player Extension (or Spotify alternatively)
  - [ ] System Stats (RAM, CPU, Storage, GPU)
  - [X] Searchbar (Depends highly on App detection)
  - [ ] Browser Bookmarks (Chrome & Firefox for now)
- [ ] Animations in the Hex UI
  - [ ] Opening and Closing the UI
  - [ ] Moving the Mouse to show different hexagons fields
  - [ ] Opening special fields like the Searchbar
- [ ] Mac Support (Not required since no Mac Users in the team, so nice to have) - many extensions don't work on linux, so sadly no support there...

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

Requires at least Node v14.18+

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```
