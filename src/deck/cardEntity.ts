export class CardEntity {
    shape: Shape;
    color: Color;
    quantity: Quantity;
    shading: Shading;
}

export enum Shape {
    diamond,
    squiggle,
    oval
}

export enum Color {
    red,
    green,
    purple
}

export enum Shading {
    open,
    solid,
    striped
}

export enum Quantity {
    one,
    two,
    three
}