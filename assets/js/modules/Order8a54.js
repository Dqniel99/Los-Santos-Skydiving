import * as Logger from './Logger.js';
import * as Request from './Request.js';
import * as Form from './Form.js';
import * as Customer from './Customer.js';
import * as Checkout from './Checkout.js';

export function updateTotals(app) {
    
    app.calculating = true;
    let getTotals = calculate(app);

    getTotals
        .then(function (response) {            

            if (response.data.success) {
                
                app.order.total = response.data.data;
                // app.storeSession();

            }

            app.calculating = false;

        })
        .catch(function (error) {

            console.log(error);
            app.notify(false, error.message);
            app.calculating = false;

        });

}

export function calculate(app) {

    let type = app.order !== undefined ? app.order.type : app.booking.type;
    let order = app.order !== undefined ? app.order : app.booking;
    
    return Request.send(app.ajaxUrl,'gsd_calculate_totals_ajax', app._nonce , {type: type,order: order});

}

export function proceedToDelivery(app, event){

    event.target.children[0].classList.remove('d-none');
    event.target.disabled = true;

    let isValidForm = Form.isValid(document.getElementById('payee-details')); // !valid returns array of errors 
    
    if (!Array.isArray(isValidForm) && isValidForm) {
        
        app.order.customer = Customer.setDetails(document.getElementById('payee-details'), {}, app );
        app.storeSession();
        window.location.href = app.deliveryOptionsUrl;                

    }else{

        app.notify(false, isValidForm[0]);
        event.target.children[0].classList.add('d-none');
        event.target.disabled = false;    

    }   

}