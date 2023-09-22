import * as Calendar from './Calendar.js';
import * as Product from './Product.js';
import * as Logger from './Logger.js';
import * as Charity  from './Charity.js';

export function init(app) {

    let timestamp = Date.now();
    let savedBooking = sessionStorage.getItem(app.type + '-booking');
    
    app.booking = savedBooking !== null ? JSON.parse(savedBooking) : initObject(app);

    if (savedBooking !== null && app.booking.dropZoneId !== '' && document.getElementById('date-picker')) {        

        document.getElementById('location').value = app.booking.dropZoneId;        
        Calendar.reset(app);
        Calendar.init(app);
        
    }

    if (savedBooking !== null && app.booking.email !== '' && document.getElementById('your-email')) {

        document.getElementById('your-email').value = app.booking.email;

    }

    if(app.booking.type == 'charity-skydive' && document.getElementById('charity-slug').getAttribute('data-slug') !== ''){           

        app.loadingSelectedCharity = true;

        let charityName = document.getElementById('charity-slug').getAttribute('data-slug');        
        let findCharity = Charity.fetchByName(charityName,app);

        findCharity
            .then(function (response) {

                if(Array.isArray(response.data.data)){

                    if(app.booking.charity.name !== ''){

                        app.undoCharitySelection();

                    }
                    
                    app.booking.charity = response.data.data[0];
                    app.getCharityJumpOptions();
                    app.loadingSelectedCharity = false;

                }
    
            })
            .catch(function (error) {
    
                console.log(error);
                app.notify(false, error.message);  
                app.loadingSelectedCharity = false;  
    
            });

    }

}

export function initObject(app)
{   
    return {
        id:"",        
        type: app.type,
        dropZoneId: "",
        total: {},
        date: null,
        displayDate: null,
        selectedDayIndex: null,        
        email: "",
        payee:{
            givenName: '',
            familyName:'',
            contactEmail: '',
            isJumping:false,
            isPayee:true
        },
        customers: [],
        upgrades: [],
        selectedPaymentOption:'',
        paymentMethod: 'cardOnline',        
        charity:{
            name:'',
            majorTomId:'',
            isPartner: false
        },
        reservation:''
    }    
}

export function isValid(app = {})
{

    let isValidBooking = false;

    if(app.booking.type == 'skydive'){

        if((app.booking.dropZoneId !== '' && app.booking.date !== null)){

            isValidBooking = true;

        }    

    }

    if(app.booking.type == 'charity-skydive'){
        
        if( app.booking.charity.hasOwnProperty('name') && app.booking.charity.name !== ''){

            isValidBooking = true;

        }

        if(app.booking.date == null || app.booking.date == ''){

            isValidBooking = false;

        }

        if(app.booking.reservation == '' && app.booking.dropZoneId == ''){

            isValidBooking = false;

        }

    }            

    if(app.booking.customers.length === 0){

        return false;

    }

    return isValidBooking;

}

/***************************   
 * payeeInCustomersArray
 * check whether the payee is jumping i.e in customers array
 * Major Tom requires a paying customer id when creating payment record
 * 
   @param {object}payee Vue JS instance
   @param {array} customers
   @return {boolean | int} False if nto in array or index if they are

***************************/

export function payeeInCustomersArray(payee, customers) {

    let payeeIsInCustomersArray = false;

    for (let i = 0; i < customers.length; i++) {
    
        if( customers[i].givenName === payee.givenName && customers[i].familyName === payee.familyName && customers[i].contactEmail === payee.contactEmail ){

            return i;

        }

    }

    return payeeIsInCustomersArray;

}

export function setPayee(app, payeeForm) {
    
    const inputs = payeeForm.getElementsByTagName('input');

    for (let i = 0; i < inputs.length; i++) {

        app.booking.payee[inputs[i].getAttribute('name')] = inputs[i].value;

    }

    let payeeCustomerIndex = payeeInCustomersArray(app.booking.payee, app.booking.customers);

    if( payeeCustomerIndex !== false){
        
        app.booking.customers[payeeCustomerIndex].isPayee = true;
        app.booking.payee.isJumping = true;

    }

}

export function updateTotals(app) {

    app.calculating = true;
    let getTotals = calculate(app);

    getTotals
        .then(function (response) {

            console.log(response);

            if (response.data.success) {

                app.booking.total = response.data.data;
                app.storeBookingSession();

            }

            app.calculating = false;

        })
        .catch(function (error) {

            console.log(error);
            self.notify(false, error.message);
            app.calculating = false;

        });

}

export function calculate(app) {

    let formData = new FormData;
    formData.append('action', 'gsd_calculate_totals_ajax');
    formData.append('_nonce', app._nonce);
    formData.append('data', JSON.stringify({
        type: app.booking.type,
        booking: app.booking
    }));

    return axios.post(app.ajaxUrl, formData);
}

export function hasUpgrades(customers) {

    let hasUpgrades = false;

    for (let i = 0; i < customers.length; i++) {

        if (Array.isArray(customers[i].jump.upgrades) && customers[i].jump.length) {

            hasUpgrades = true;
            break;

        }

    }

    return hasUpgrades;

}

export function pay(event, app, bookingType) {

    app.booking.paymentType = document.querySelector('input[name="payment-options"]:checked').getAttribute('id');
    app.booking.paymentAmount = parseFloat(document.querySelector('input[name="payment-options"]:checked').getAttribute('data-amount'));
    app.booking.allocationType = document.querySelector('input[name="payment-options"]:checked').getAttribute('data-allocation');

    let formData = new FormData;
    formData.append('action', 'gsd_pay_for_order_ajax');
    formData.append('_nonce', app._nonce);
    formData.append('data', JSON.stringify({
        order: app.booking,
        type: bookingType
    }));

    let createPaymentRecord = axios.post(app.ajaxUrl, formData);

    createPaymentRecord
        .then(function (response) {
            
            if (response.data.success) {
                
                app.storeBookingSession();
                window.location.href = `${response.data.data.paymentUrl}/?paymentId=${response.data.data.paymentId}`;
                return;                

            }            

            app.notify(false, 'Unable to process your order! Please try again or contact our helpdesk');            

            event.target.children[0].classList.add('d-none');
            event.target.disabled = false;

            Logger.log(app,{message : `Error occured with ${app.booking.id}`}, 'Click Pay Now');

        })
        .catch(function (error) {

            console.log('Create Payment Record Error');
            console.log(error);

            app.notify(false, error.message);               
            
            event.target.children[0].classList.add('d-none');
            event.target.disabled = false;

            Logger.log(app,error, 'Click Pay Now');

        });

}