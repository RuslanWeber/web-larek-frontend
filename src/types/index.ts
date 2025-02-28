
export interface IProduct {
    id: number;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface IAppData {
    products: IProduct[];
    preview: string | null;
    order: IOrder;
    basket: IProduct[];
    clearBasket(): void;
    addToBasket(item: IProduct): void;
	deleteFromBasket(itemId: number): void;
	isLotInBasket(item: IProduct): boolean;
	getTotalPrice(): number;
	getBasketIds(): number[];
	getBasketLength(): number;
	clearOrder(): void;
	checkValidation(data: Record<keyof IOrder, string>): boolean;
}

export interface IOrderResult {
	id: string;
	total: number;
}

export interface IBasket {
    item: IBasketItem[];
    price: number;
}

export type TCategory = 'софт-скил' | 'хард-скил' | 'кнопка' | 'дополнительное' | 'другое';
export type TPayment =  'card' | 'cash';
export type IOrder = IShippingForm & IContactForm;
export type IBasketItem = Pick<IProduct, 'id' | 'title' | 'price'>;
export type IShippingForm = Pick<IOrder, 'payment' | 'address'>
export type IContactForm = Pick<IOrder, 'email' | 'phone'>
