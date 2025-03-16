import { FormErrors, IAppData, IContactForm, IOrder, IProduct, TPayment } from "../../types";
import { Model } from "./model";
import { IEvents } from "./events";

export type CatalogChangeEvent = {
    catalog: IProduct[];
}

export class AppData extends Model<IAppData> {
    products: IProduct[];
    preview: string | null;
    order: IOrder = {
        payment: '',
        items: [],
        total: 0,
        email: '',
        phone: '',
        address: ''
    };
    basket: IProduct[] = [];
    events: IEvents;
    formErrors: FormErrors = {};

    setProducts(items: IProduct[]) {
        this.products = items;
        this.emitChanges('items:changed', { products: this.products });
    }

    setPreview(item: IProduct) {
        this.preview = item.id;
        this.emitChanges('preview:changed', item);
    }

    addToBasket(item: IProduct) {
        this.basket.push(item);
        this.emitChanges('counter:changed', this.basket);
        this.emitChanges('basket:changed', this.basket);
    }

    removeFromBasket(id: string) {
        const index = this.basket.findIndex((item) => item.id === id);
        if (index !== -1) {
            this.basket.splice(index, 1);
            this.emitChanges('basket:changed');
        }
    }

    clearBasket() {
        this.basket = [];
        this.emitChanges('counter:changed', this.basket);
        this.emitChanges('basket:changed', this.basket);
    }

    clearOrder() {
        this.order = {
            payment: '',
            items: [],
            total: 0,
            email: '',
            phone: '',
            address: ''
        }
    }

    getTotalPrice(): number {
        return this.order.items.reduce((total, item) => 
        total + this.products.find(it => it.id === item).price, 0);
    }

    getOrderProducts(): IProduct[] {
		return this.basket;
	}

    productOrder(item: IProduct): boolean {
        return this.basket.includes(item);
    } 

    setPaymentMethod(method: string) {
        this.order.payment = method as TPayment;
        this.validateDelivery();
    }

    setOrderDeliveryField(value: string) {
        this.order.address = value;
        this.validateDelivery();
    }

    setOrderContactField(field: keyof IContactForm, value: string) {
        this.order[field] = value;
        this.validateContact();
    }

    validateDelivery() {
        const errors: typeof this.formErrors = {};
        if (!this.order.payment) {
			errors.payment = 'Необходимо указать способ оплаты';
		}
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('deliveryFormError:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateContact() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('contactFormError:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}