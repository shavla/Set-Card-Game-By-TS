import * as PIXI from "pixi.js";
import { Lobby } from "./scenes/lobby";
// import { Game } from "./scenes/game";


export const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: false,
  antialias: true,
});

document.body.appendChild(app.view);

window.onload = () => {
  new Lobby(app);
  // new Game()
};