
export interface IProduct {
    id: string;
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

export interface IOrder extends IOrderFormError {
    items: string[],
    total: number;
    payment: TPayment,
}

export interface IContactForm {
    email: string,
    phone: string,
}

export interface IShippingForm {
    payment: TPayment,
    address: string,
}

export interface IOrderFormError extends IShippingForm, IContactForm {}


export interface IOrderResult {
	id: string;
	total: number;
}

export interface IBasket {
    item: IBasketItem[];
    price: number;
}

export interface IProductCard {
    id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    price: number | null;
    selected: boolean;
    button: string;
}

export type TCategory = 'софт-скил' | 'хард-скил' | 'кнопка' | 'дополнительное' | 'другое';
export type TPayment =  'card' | 'cash' | '';
export type IBasketItem = Pick<IProduct, 'id' | 'title' | 'price'>;
export type FormErrors = Partial<Record<keyof IOrder, string>>;