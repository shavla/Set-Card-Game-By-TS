import { CardEntity, Color, Quantity, Shading, Shape } from "./cardEntity";


export class Deck {
    cards: Array<CardEntity>;

    constructor() {
        this.createCards();
    }

    createCards() {
        this.cards = new Array<CardEntity>();

        const shape = [Shape.diamond, Shape.squiggle, Shape.oval];
        const color = [Color.red, Color.green, Color.purple];
        const quantity = [Quantity.one, Quantity.two, Quantity.three];
        const shading = [Shading.open, Shading.striped, Shading.solid];

        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < color.length; j++) {
                for (let k = 0; k < quantity.length; k++) {
                    for (let n = 0; n < shading.length; n++) {
                        this.cards.push({
                            shape: shape[i],
                            color: color[j],
                            quantity: quantity[k],
                            shading: shading[n],
                        });
                    }
                }
            }
        }
    }

    restart() {
        this.cards = [];
        this.createCards();
    }

    takeRandomCards(cardsNumber: number): CardEntity[] {
        let cards: CardEntity[] = []

        for (let i = 0; i < cardsNumber; i++) {
            let randomIndex = Math.floor(Math.random() * this.cards.length)
            let card = this.cards[randomIndex]
            this.cards.splice(randomIndex, 1)
            cards.push(card)
        }
        return cards;
    }
}