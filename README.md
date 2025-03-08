# Tech Test 2025 - WEGA

This repository contains the answers to the tech test - please enjoy!

## Requirements

Write your code in TypeScript and use pixi.js (v7) for rendering.

* Each task should be accessed via an in-game menu.
* Render responsively for both mobile and desktop devices.
* Display the fps in the top left corner.
* Run the application in full screen.

## Details

The following extra packages were used for this project:

* Pixi.JS UI
  * Helps add quick UI for prototyping
* Pixi.JS Layout
  * Helps keep some elements relatively positioned
* tweedle.js
  * For tweening between states

## Structure

For this test, I split the project up into separate [scenes](src/scenes)., with a lightweight scene switching functionality for navigation. For the basic game implementation, please see [src/game.ts](src/game.ts). In [components](src/components) I keep the elements that are potentially reusable, or which for ease of reading make sense to split out from the rest of the code. 

I chose to keep a separate [src/main.ts](src/main.ts) file to later be able to have a clear separation between game parts (Pixi.js rendered content) and DOM content that might be needed (login forms, third-party integrations).

### Header

The main menu switches between the different available scenes, and the FPS is shown in the top right corner. For the FPS, I just render HTMLText, while for the menu, I attempted to use Pixi.JS UI.

For positioning these, I used Pixi.js Layout, which does a decent job with statically positioning these elements to their respective corners. Sadly it seems to not support the layouting from Pixi.JS Layout when it comes to sizing, forcing us to do manual sizes and positions. If time permits, replacing this with a custom menu built using Pixi.JS Layout would be interesting!

### Ace of Shadows

After some testing, it seemed like Pixi.JS Layout does not handle well when the elements are animated (aka, we are manually positioning them). Therefore, I added some basic centering of the card stacks by manipulating their container.

The animations are driven by tweens going from one position to another, conveniently changing the zIndex of the element once we've reached the zenith of the movement. This helps avoid weird flickering (overlap with other cards) if we were to animate the zIndex at the same time as the position.

### Magic Words

In this example, we are letting the added callback animate each text window in, while we manually animate it out before removing and adding the next one. By clicking with the mouse on the text window, we switch to the next text window.

There seems to be an issue that sometimes, the first emoji will not follow the layout and will be too big. It seems going back later to this scene corrects it, so perhaps has something to do with the timing of adding the element to the stage?

For now, if there is an unsupported emoji listed in the text, it will not be rendered and a warning will be logged.
