import * as PIXI from "pixi.js";
import { Card } from "../deck/card";
import { CardEntity } from "../deck/cardEntity";
import { Globals } from "../globals";
import { Layout } from "../layout";
import { app } from "../main";
import { GameFinishDialog } from "../dialogs/gameFinishDialog";
import { Lobby } from "../scenes/lobby";

export class View {
    constructor() {
    }

    cards: { [id: number]: Card } = {};
    cardsContainer: PIXI.Container = new PIXI.Container();
    headerContainer: PIXI.Container = new PIXI.Container();
    bottomContainer: PIXI.Container = new PIXI.Container();

    cardsInDeckContainer: PIXI.Container;
    cardsLeftText: PIXI.Text;

    ticker: PIXI.Ticker;
    timeInSeconds: number = 0;
    timeContainer: PIXI.Container;
    timeText: PIXI.Text;

    init(restart: () => void, showSet: () => void) {
        this.headerContainer = new PIXI.Container();
        this.bottomContainer = new PIXI.Container();
        this.drawRestartButton(restart);
        this.drawShowSet(showSet);
        this.drawCardsLeftText();
        this.drawTimer();
        this.drawGoHome();
    }

    openCards(incomeCards: { [id: number]: CardEntity }, cardClick: (index: number, isSelect: boolean) => void) {
        let cardsLength = Object.keys(incomeCards).length;
        let divider = cardsLength / Globals.setCount >= 4 ? cardsLength / Globals.setCount : 4;

        this.cardsContainer.destroy();
        this.cards = [];
        this.cardsContainer = new PIXI.Container();

        for (let card in incomeCards) {
            let index = +card;
            let cardClass = new Card(incomeCards[card]);
            this.cards[card] = cardClass;
            let quotient = Math.floor(index / divider);
            let remainder = index % divider;

            cardClass.setPosition(quotient * (Layout.cardLayout.width + Layout.cardLayout.marginBetween),
                remainder * (Layout.cardLayout.height + Layout.cardLayout.marginBetween));
            this.cardsContainer.addChild(cardClass.card);

            cardClass.card.interactive = true;
            cardClass.card.buttonMode = true;

            cardClass.card.on("click", () => {
                let isSelected = this.handleClick(index);
                cardClick(index, isSelected);
            });
        }
        this.cardsContainer.scale.set(0.6);
        this.cardsContainer.position.set(window.innerWidth / 2 - this.cardsContainer.width / 2, window.innerHeight / 2 - this.cardsContainer.height / 2)
        app.stage.addChild(this.cardsContainer);
    }


    drawRestartButton(restartFunction: () => void) {
        const restart = new PIXI.Text("RESTART", <PIXI.TextStyle>Layout.restartTextStyle);
        restart.anchor.set(1, 1);
        restart.position.set(window.innerWidth / 2 - Layout.restartButton.marginRight, window.innerHeight - Layout.restartButton.marginBottom);
        this.bottomContainer.addChild(restart);

        restart.interactive = true;
        restart.buttonMode = true;
        restart.on("click", () => {
            restartFunction();
        })
        app.stage.addChild(this.bottomContainer);
    }

    drawShowSet(showSetFunction: () => void) {
        const show = new PIXI.Text("SHOW SET", <PIXI.TextStyle>Layout.showSetButton.textStyle);
        show.anchor.set(0, 1);
        show.position.set(window.innerWidth / 2 + Layout.showSetButton.marginLeft, window.innerHeight - Layout.showSetButton.marginBottom);
        this.bottomContainer.addChild(show);

        show.interactive = true;
        show.buttonMode = true;
        show.on("click", () => {
            showSetFunction();
        })
    }

    drawCardsLeftText() {
        this.cardsInDeckContainer = new PIXI.Container();
        let cardsInDeckText = new PIXI.Text("Cards In Deck :", <PIXI.TextStyle>Layout.cardsInDeckTextStyle);
        this.cardsInDeckContainer.addChild(cardsInDeckText);

        this.cardsLeftText = new PIXI.Text("", <PIXI.TextStyle>Layout.cardsInDeckNumberStyle.textStyle);
        this.cardsLeftText.position.set(cardsInDeckText.width + Layout.cardsInDeckNumberStyle.marginLeft, cardsInDeckText.height / 2 - this.cardsLeftText.height / 2)
        this.cardsInDeckContainer.addChild(this.cardsLeftText);
        this.cardsInDeckContainer.position.set(Layout.cardsInDeckStyle.marginTop, Layout.cardsInDeckStyle.marginLeft)
        this.headerContainer.addChild(this.cardsInDeckContainer);

        app.stage.addChild(this.headerContainer)
    }

    drawTimer() {
        this.timeContainer = new PIXI.Container();

        let time = new Date(this.timeInSeconds * 1000).toISOString().substr(14, 5);
        this.timeText = new PIXI.Text(time.toString(), <PIXI.TextStyle>Layout.timeText.textStyle);
        this.timeContainer.addChild(this.timeText);

        this.timeText.position.set(window.innerWidth - Layout.timeText.marginRight, Layout.timeText.marginTop)

        this.ticker = new PIXI.Ticker();
        this.ticker.minFPS = 1;
        this.ticker.maxFPS = 1;

        this.ticker.add(delta => {
            this.timeInSeconds += (1 / 60) * delta;
            this.timeText.text = new Date(Math.floor(this.timeInSeconds) * 1000).toISOString().substr(14, 5);
        })
        this.ticker.start();
        this.headerContainer.addChild(this.timeContainer);
    }
 
    drawGoHome(){
       
        const goHome = new PIXI.Text("GO HOME", <PIXI.TextStyle>Layout.goHomeButton.textStyle);
        goHome.anchor.set(0, 1);
        goHome.position.set(window.innerWidth  - Layout.goHomeButton.marginLeft, window.innerHeight - Layout.goHomeButton.marginBottom);
        this.bottomContainer.addChild(goHome);

        goHome.interactive = true;
        goHome.buttonMode = true;
        goHome.on("click", () => {
            this.stopTimer();
            this.cardsContainer.destroy();
            this.headerContainer.destroy();
            this.bottomContainer.destroy();
            new Lobby(app);
        })
    }

    resetTimer() {
        this.ticker.stop();
        this.timeText.text = "";
        this.timeInSeconds = 0;
        this.drawTimer();
    }

    stopTimer() {
        this.ticker.stop();
    }

    changeCardsLeftText(number: number) {
        this.cardsLeftText.text = number.toString();
    }

    unSelectCard(index: number) {
        this.cards[index].toggleSelect();
    }

    deleteCard(index: number) {
        this.cards[index].deleteCard();
    }

    handleClick(index: number): boolean {
        return this.cards[index].toggleSelect();
    }

    showHintSet(cardsIndexes: number[]) {
        cardsIndexes.forEach(index => this.cards[index].showHint());
    }

    gameFinished() {
        this.stopTimer();
        this.cardsContainer.destroy();
        this.headerContainer.destroy();
        this.bottomContainer.destroy();
        new GameFinishDialog(this.timeInSeconds);
    }
}