import * as Booking from './Booking.js';
import * as Logger from './Logger.js';

export function proceed(event, app, Booking, Checkout) {

    event.target.children[0].classList.remove('d-none');
    event.target.disabled = true;

    if (Booking.isValid(app)) {

        app.storeBookingSession();
        window.location.href = app.paymentOptionsUrl;

    }else{

        let message = app.booking.type == 'charity-skydive' ? 'Please add your charity and select a location and date' : 'Please select a location and date';
        message = app.booking.customers.length > 0 ? message : 'Please add at least one skydiver to your booking!';

        app.notify(false, message);
        event.target.children[0].classList.add('d-none');
        event.target.disabled = false;

    }    

}

export function pay(event, app, Form) {

    event.target.children[0].classList.remove('d-none');
    event.target.disabled = true;

    let payeeForm = document.getElementById('payee-details');
    let isValidForm = Form.isValid(payeeForm); // !valid returns array of errors 

    if (!Array.isArray(isValidForm) && isValidForm) {

        Booking.setPayee(app, payeeForm);
        Booking.pay(event, app, app.booking.type);

    } else {

        app.notify(false, 'Please add billing details');
        event.target.children[0].classList.add('d-none');
        event.target.disabled = false;

    }

}

export function select(event, app) {

    const elements = document.querySelectorAll('.payment-option');

    elements.forEach((element) => {
        element.classList.remove('payment-option--selected');
    });

    if (event.target.tagName == 'INPUT' || event.target.tagName !== 'DIV') {

        event.target.parentNode.classList.add('payment-option--selected');
        document.getElementById(event.target.parentNode.getAttribute('data-type')).checked = true;

        app.booking.selectedPaymentOption = event.target.parentNode.getAttribute('data-type');

    } else {

        document.getElementById(event.target.getAttribute('data-type')).checked = true;
        event.target.classList.add('payment-option--selected');

        app.booking.selectedPaymentOption = event.target.getAttribute('data-type');

    }

}