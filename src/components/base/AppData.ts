import { FormErrors, IAppData, IContactForm, IOrder, IProduct, TPayment } from "../../types";
import { Model } from "./model";
import { IEvents } from "./events";

export type CatalogChangeEvent = {
    catalog: IProduct[];
}

export class AppData extends Model<IAppData> {
    products: IProduct[];
    preview: string | null;
    orderData: IOrder = {
        payment: '',
        email: '',
        phone: '',
        address: '',
        items: [],
        total: 0
    } ;
    basket: IProduct[] = [];
    events: IEvents;
    formErrors: FormErrors = {};

    getOrder(): Omit<IOrder, 'items' | 'total'> {
        return { ...this.orderData };
    }

    getOrderData(): IOrder {
        return {
            ...this.orderData,
            total: this.getCoast(),
            items: this.getListIds()
        };
    }

    getCoast(): number {
        return this.orderData.items.reduce((total, item) => 
        total + this.products.find(it => it.id === item).price, 0);
    }

    getListIds(): string[] {
        return this.basket.map(product => product.id);
    }

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
        this.orderData = {
            payment: '',
            email: '',
            phone: '',
            address: '',
            items: [],
            total: 0
        }
    }

    setPaymentMethod(method: string) {
        this.orderData.payment = method as TPayment;
        this.validateDelivery();
    }

    setOrderDeliveryField(value: string) {
        this.orderData.address = value;
        this.validateDelivery();
    }

    setOrderContactField(field: keyof IContactForm, value: string) {
        this.orderData[field] = value;
        this.validateContact();
    }

    validateDelivery() {
        const errors: typeof this.formErrors = {};
        if (!this.orderData.payment) {
			errors.payment = 'Необходимо указать способ оплаты';
		}
        if (!this.orderData.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('deliveryFormError:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }

    validateContact() {
        const errors: typeof this.formErrors = {};
        if (!this.orderData.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.orderData.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        this.formErrors = errors;
        this.events.emit('contactFormError:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}
