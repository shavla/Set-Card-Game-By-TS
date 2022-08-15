import { CardEntity } from "../deck/cardEntity";
import { Deck } from "../deck/deck";
import { Globals } from "../globals";
import { View } from "../view/view";

export class Game {
    view = new View();
    deck = new Deck();
    openCards: { [id: number]: CardEntity } = {};
    openCardsClone: { [id: number]: CardEntity } = {};
    selectedCards: CardEntity[] = [];
    gameFinished: boolean;

    hintSetIndexes: number[] = [];

    constructor() {
        this.view.init(() => { this.restartGame() }, () => { this.showHintSet() });

        let cards = this.deck.takeRandomCards(Globals.openCardsCount);
        cards.forEach((card, index) => this.openCards[index] = card);
        this.checkPossibilityAndDrawCards();
    }

    restartGame() {
        this.view.resetTimer();
        this.deck.restart();
        this.openCards = {};
        this.selectedCards = [];
        let cards = this.deck.takeRandomCards(Globals.openCardsCount);
        cards.forEach((card, index) => this.openCards[index] = card);
        this.checkPossibilityAndDrawCards();
    }

    showHintSet() {
        this.view.showHintSet(this.hintSetIndexes);
        let length = Object.keys(this.openCards).length;
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < this.selectedCards.length; j++) {
                if (this.openCards[i] == this.selectedCards[j]) {
                    this.view.unSelectCard(i);
                }
            }
        }
        this.selectedCards = [];
    }

    checkPossibilityAndDrawCards() {
        this.checkSetPossibility();
        this.view.changeCardsLeftText(this.deck.cards.length);
        if (!this.gameFinished) {
            this.view.openCards(this.openCards, (index: number, isSelected: boolean) => {
                this.cardClicked(index, isSelected);
            });
        }
    }

    checkSetPossibility() {
        let noSet = !this.containsSet(this.openCards);
        if (noSet) {
            if (this.deck.cards.length > 0) {
                let newCards = this.deck.takeRandomCards(Globals.setCount);
                let length = Object.keys(this.openCards).length;
                for (let i = length; i < length + Globals.setCount; i++) {
                    this.openCards[i] = newCards[i - Globals.openCardsCount];
                }
                this.checkSetPossibility();
                return;
            } else {
                this.gameFinished = true;
                this.gameFinish();
                return;
            }
        }
    }

    containsSet(cards: { [id: number]: CardEntity }): boolean {
        let cardsCombinations: Array<CardEntity[]> = [];
        let cardsValuesArr = Object.keys(cards).map(x => cards[parseInt(x)]);

        //todo
        for (let i = 0; i < cardsValuesArr.length - 2; i++) {
            for (let j = i + 1; j < cardsValuesArr.length - 1; j++) {
                for (let k = j + 1; k < cardsValuesArr.length; k++) {
                    let combine: CardEntity[] = [];
                    combine.push(cardsValuesArr[i], cardsValuesArr[j], cardsValuesArr[k]);
                    cardsCombinations.push(combine);
                }
            }
        }

        let hasSet = cardsCombinations.some(cards => this.isSet(cards));
        // this.Test(cardsCombinations);
        this.findFirstHintSet(cardsCombinations);
        return hasSet;
    }

    isSet(cards: CardEntity[]): boolean {
        let quantitiesArray = [];

        let uniqueColor = [...new Set(cards.map(item => item.color))];
        let uniqueQuantity = [...new Set(cards.map(item => item.quantity))];
        let uniqueShape = [...new Set(cards.map(item => item.shape))];
        let uniqueShading = [...new Set(cards.map(item => item.shading))];

        quantitiesArray.push(uniqueColor, uniqueQuantity, uniqueShading, uniqueShape);
        return quantitiesArray.every(x => x.length != 2);
    }

    // private Test(cardsCombinations: CardEntity[][]) {
    //     let length = Object.keys(this.openCards).length >= 12 ? Object.keys(this.openCards).length : 12
    //     let set = cardsCombinations.findIndex(x => this.isSet(x));
    //     if (set >= 0) {
    //         for (let m = 0; m < length; m++) {
    //             if (this.openCards[m] == cardsCombinations[set][0] || this.openCards[m] == cardsCombinations[set][1] || this.openCards[m] == cardsCombinations[set][2]) {
    //                 console.log(m);
    //             }
    //         }
    //     }
    // }

    findFirstHintSet(cardsCombinations: CardEntity[][]) {
        this.hintSetIndexes = [];
        let length = Object.keys(this.openCards).length >= 12 ? Object.keys(this.openCards).length : 12
        let set = cardsCombinations.findIndex(x => this.isSet(x));
        if (set >= 0) {
            for (let m = 0; m < length; m++) {
                if (this.openCards[m] == cardsCombinations[set][0] || this.openCards[m] == cardsCombinations[set][1] || this.openCards[m] == cardsCombinations[set][2]) {
                    this.hintSetIndexes.push(m);
                }
            }
        }
    }

    gameFinish() {
        this.view.gameFinished();
    }

    continueGame() {
        this.selectedCards = [];
        if (Object.keys(this.openCards).length >= Globals.minCardsAmount) {
            this.renumberPositions();
            this.checkPossibilityAndDrawCards();
            return;
        }

        if (this.deck.cards.length == 0) {
            this.checkPossibilityAndDrawCards();
        } else {
            let newCards = this.deck.takeRandomCards(Globals.setCount);
            let length = Object.keys(this.openCards).length + Globals.setCount;
            for (let i = 0; i < length; i++) {
                if (this.openCards[i] == undefined) {
                    this.openCards[i] = <any>newCards.shift();
                }
            }
            this.checkPossibilityAndDrawCards();
        }
    }

    deleteSetCards() {
        this.openCardsClone = JSON.parse(JSON.stringify(this.openCards));
        let length = Object.keys(this.openCards).length;
        for (let i = 0; i < length; i++) {
            for (let j = 0; j < this.selectedCards.length; j++) {
                if (this.openCards[i] == this.selectedCards[j]) {
                    delete this.openCards[i];
                    this.view.deleteCard(i);
                }
            }
        }
    }

    checkGameState() {
        if (this.deck.cards.length == 0) {
            if (!this.containsSet(this.openCards)) {
                this.gameFinished = true;
            }
        }
    }

    selectCard(index: number) {
        // this.gameFinish();
        this.selectedCards.push(this.openCards[index]);
        if (this.selectedCards.length == 3) {
            if (this.isSet(this.selectedCards)) {
                this.deleteSetCards();
                this.checkGameState();
                if (this.gameFinished) {
                    this.gameFinish();
                } else {
                    this.continueGame();
                }
            }
        } else if (this.selectedCards.length > 3) {
            let lastCard = this.selectedCards.shift();
            this.view.unSelectCard(Object.keys(this.openCards).findIndex(key => this.openCards[<any>key] == lastCard));
            if (this.isSet(this.selectedCards)) {
                this.deleteSetCards();
                this.checkGameState();
                if (this.gameFinished) {
                    this.gameFinish();
                } else {
                    this.continueGame();
                }
            }
        }
    }

    unSelectCard(index: number) {
        let itemIndex = this.selectedCards.indexOf(this.openCards[index]);
        this.selectedCards.splice(itemIndex, 1);
    }

    cardClicked(index: number, isSelect: boolean) {
        isSelect ? this.selectCard(index) : this.unSelectCard(index);
    }

    renumberPositions() {
        let openCardsLength = Object.keys(this.openCardsClone).length;
        let indexArray = Array.from(Array(openCardsLength).keys());

        let minArr: number[] = [];
        for (let i = 0; i < openCardsLength; i++) {
            if (this.openCards[i] == undefined) {
                minArr.push(i);
            }
        }

        indexArray = indexArray.filter(i => !minArr.includes(i))

        for (let i = 0; i < openCardsLength - Globals.setCount; i++) {
            this.openCards[i] = this.openCardsClone[indexArray[i]];
        }

        for (let i = openCardsLength - Globals.setCount; i < openCardsLength; i++) {
            delete this.openCards[i];
        }
    }
}