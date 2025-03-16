import { ensureElement, createElement } from '../../utils/utils';
import { Component } from './component';
import { EventEmitter } from './events';

export interface IBasketView {
    items: HTMLElement[];
    total: number;
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container)
        this._list = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = this.container.querySelector('.basket__price');
        this._button = this.container.querySelector('.basket__button');

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }
        this.items = [];
    }

    disableButton(value: string){
        this._button.setAttribute('disabled', value)
    }

    set items(items: HTMLElement[]) {
        if (items.length) {
            this._list.replaceChildren(...items);
            this.setDisable(this._button, false);
        } else {
            this._list.replaceChildren(
                createElement<HTMLParagraphElement>('p', {
                textContent: 'Корзина пуста'
            }));
            this.disableButton('true');
        }
    }

    set total(total: number) {
        this.setText(this._total, `${total.toString()}` + ' синапсов');
    }
}
