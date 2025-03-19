import './scss/styles.scss';

import './scss/styles.scss';
import { AppApi } from './components/base/AppApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppData, CatalogChangeEvent } from './components/base/AppData';
import { Page } from './components/base/Page';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/base/Modal';
import { BasketItem, ProductCard } from './components/base/ProductCard';
import { Basket } from './components/base/BasketModal';
import { ShippingForm } from './components/base/ShippingForm';
import { Success } from './components/base/Success';
import { Contacts } from './components/base/ContactForm';
import { IContactForm, IShippingForm, IProduct, TPayment } from './types';

const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const deliveryTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const appData = new AppData({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const delivery = new ShippingForm(cloneTemplate(deliveryTemplate), events)
const contact = new Contacts(cloneTemplate(contactTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {
    onClick: () => { modal.close() }
})


events.on<CatalogChangeEvent>('items:changed', () => {
    page.catalog = appData.products.map(item => {
        const productCard = new ProductCard('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return productCard.render({
            title: item.title,
            image: item.image,
            price: item.price,
            category: item.category
        })
    })
})


events.on('basket:open', () => {
    modal.render({
        content: basket.render({})
    })
})


events.on('card:select', (item: IProduct) => {
    appData.setPreview(item);
})


events.on<CatalogChangeEvent>('items:changed', (data) => {
    page.catalog = data.catalog.map(item => {
        const productCard = new ProductCard('card', cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return productCard.render({
            title: item.title,
            image: item.image,
            price: item.price,
            category: item.category
        });
    });
});

events.on('basket:changed', () => {
    page.counter = appData.basket.length; 
    let total = 0;
    basket.items = appData.basket.map((item, index) => {
        const card = new BasketItem(cloneTemplate(cardBasketTemplate), index, {
            onClick: () => {
                appData.removeFromBasket(item.id);
                events.emit('basket:changed');
            }
        });
        total += item.price;
        return card.render({
            title: item.title,
            price: item.price,
        });
    });
    basket.total = total;
});

events.on('counter:changed', () => {
    page.counter = appData.basket.length;
})


events.on('product:add', (item: IProduct) => {
    appData.addToBasket(item);
    // modal.close();   
})


events.on('product:delete', (item: IProduct) => {
    appData.removeFromBasket(item.id);
})

events.on('preview:changed', (item: IProduct) => {
    if (item) {
        const productCard = new ProductCard('card', cloneTemplate(cardPreviewTemplate), {
            onClick: () => {
                events.emit('product:add', item);
                // modal.close();
            }
        });
        const isInBasket = appData.basket.some(product => product.id === item.id);
        const buttonTitle: string = item.price === null 
            ? (isInBasket ? 'Получить ещё один' : 'Получить') 
            : (isInBasket ? 'Купить ещё один' : 'Купить');
        productCard.buttonTitle = buttonTitle;
        modal.render({
            content: productCard.render({
                title: item.title,
                description: item.description,
                image: item.image,
                price: item.price,
                category: item.category,
                button: buttonTitle,
            })
        });
    }
});

events.on('order:open', () => {
    const orderData = appData.getOrder();
    const errors = !appData.formErrors;
    console.log(errors)
    const paymentMethod = orderData.payment || '';
    delivery.setToggleClassPayment(paymentMethod);
    modal.render({
        content: delivery.render({
            payment: orderData.payment,
            address: orderData.address,
            valid: errors,
            errors: [],
        })
    });
});

events.on('order.payment:change', (data: { target: string }) => {
    appData.setPaymentMethod(data.target);
});

events.on('order.address:change', (data: { value: string }) => {
    appData.orderData.address = data.value;
});

events.on('deliveryFormError:change', (errors: Partial<IShippingForm>) => {
    const { payment, address } = errors;
    delivery.valid = !payment && !address
    delivery.errors = Object.values({ payment, address }).filter(i => !!i).join('; ');
})

events.on('order:submit', () => {
    const orderData = appData.orderData;
    const isValid = orderData.phone !== '' && orderData.email !== '';
    modal.render({
        content: contact.render({
            phone: orderData.phone || '',
            email: orderData.email || '',
            valid: isValid,
            errors: [],
        })
    })
})

events.on(/^contacts\..*:change/, (data: {field: keyof IContactForm, value: string}) => {
    appData.setOrderContactField(data.field, data.value);
})

events.on('contactFormError:change', (errors: Partial<IContactForm>) => {
    const { email, phone } = errors;
    contact.valid = !email && !phone;
    contact.errors = Object.values({ phone, email }).filter(i => !!i).join('; ');
})

events.on('contacts:submit', () => {
    const orderData = {
        ...appData.getOrder(),
        items: appData.getListIds(),
        total: appData.getCoast(),
    };
    console.log("Отправка заказа:", orderData);
    
    api.orderProduct(appData.getOrderData()) 
        .then((result) => {
            appData.clearBasket();
            appData.clearOrder();
            // delivery.setToggleClassPayment('');//////////
            modal.render({
                content: success.render({
                    total: result.total,
                })
            });
        })
        .catch(err => {
            console.error(err);
        });
});

events.on('modal:open', () => {
    page.locked = true;
})


events.on('modal:close', () => {
    page.locked = false; 
})


api.getProductList()
    .then(appData.setProducts.bind(appData))
    .catch(err => {
        console.log(err);
    })

