import * as Form from './modules/Form.js';
import * as Calendar from './modules/Calendar.js';
import * as Checkout from './modules/Checkout.js';
import * as Booking from './modules/Booking.js';
import * as Customer from './modules/Customer.js';
import * as Product from './modules/Product.js';
import * as Charity from './modules/Charity.js';
import * as Payment from './modules/Payment.js';
import * as Location from './modules/Location.js';

const { createApp, ref } = Vue;

const bookingApp = createApp({
    data() {
        return {
            type: "",
            ajaxUrl: null,
            _nonce: null,
            paymentOptionsUrl: '',
            fetchingDates: false,
            loadingSelectedCharity:false,
            invalidJumpDaySelected: false,
            message: '',
            useCheckoutEmail: false,
            editing: false,
            calculating: false,
            customerIndex: 0, //used when editing            
            hasPreSelectedAltitude: false,
            bsModal: [],
            formErrors: [],
            availability: {
                days: [],
                dates: [],
                seen: []
            },
            datePicker: null,
            booking: { //this is initialised in Booking.js, we're just adding prpties from templates for now so VUE template doesn't bomb                
                customers: [],
                charity:{
                    name:'',
                    majorTomId:''
                }
            },
            results:[], //charity search
            noResults:false            
        }
    },
    methods: {
        updateContactEmail(event) {

            if (this.useCheckoutEmail && event.target.value !== this.booking.email) {

                this.useCheckoutEmail = false;

            }

        },
        toggleUseCheckoutEmail() {

            this.useCheckoutEmail = this.useCheckoutEmail ? false : true;

            if (this.useCheckoutEmail) {

                document.getElementById('contactEmail').value = this.booking.email;

            } else {

                document.getElementById('contactEmail').value = '';

            }

        },
        storeCheckoutEmail(event) {
                      
            if (Form.isValidEmail(event.target.value)) {

                this.booking.email = event.target.value;                

                let storeEmail = Checkout.store(this, this.type, 'started');

                let self = this;

                storeEmail.then(function (response) {
                  
                  if(response.data.success){

                    self.booking.id = response.data.data.id;
                    self.booking.type = response.data.data.type;
                    self.storeBookingSession();

                  }

                })                

            }

        },
        storeBookingSession() {

            sessionStorage.setItem(this.type + '-booking', JSON.stringify(this.booking));

        },
        addCustomer(event) {

            this.formErrors = [];
            let isValidForm = Form.isValid(document.getElementById('customer-form')); // !valid returns array of errors 

            if (!Array.isArray(isValidForm) && isValidForm) {

                Customer.add(document.getElementById('customer-form'), this);
                Booking.updateTotals(this);
                this.resetCustomerForm();
                this.notify(true, `Added ${this.booking.customers[this.booking.customers.length - 1].givenName}`)
                this.storeBookingSession();
                return;

            }

            this.formErrors = isValidForm;

        },
        updateCustomer(event, index) {

            this.formErrors = [];
            let isValidForm = Form.isValid(document.getElementById('customer-form')); // !valid returns array of errors 

            if (!Array.isArray(isValidForm) && isValidForm) {

                Customer.update(document.getElementById('customer-form'), index, this);
                Booking.updateTotals(this);
                this.resetCustomerForm();
                this.notify(true, `Updated ${this.booking.customers[this.booking.customers.length - 1].givenName}`)
                this.storeBookingSession();
                return;

            }

            this.formErrors = isValidForm;

        },
        removeCustomer(event, index) {

            let name = this.booking.customers[index].givenName;
            this.booking.customers.splice(index, 1);
            Booking.updateTotals(this);
            this.storeBookingSession();
            this.notify(true, `Removed ${name}`);

        },
        editOrAddCustomer(event, index) {

            if (typeof index !== "undefined") {

                this.editing = true;
                this.customerIndex = index;
                Form.populateFromObject(this.booking.customers[index]);
                document.getElementById('jump-option').value = this.booking.customers[index].jump.id;
                document.getElementById('camera-option').value = this.booking.customers[index].camera.id;

            } else {

                this.editing = false;

            }

            this.bsModal.show();

        },
        resetCustomerForm() {

            this.useCheckoutEmail = false; //turn off
            Form.reset(document.getElementById('customer-form'));
            this.bsModal.hide();
            this.formErrors = [];

        },
        calculate() {

            Booking.calculate(this);

        },
        changeLocation(event) {        

            Location.change(event, this, Booking, Calendar);
            //this.storeBookingSession();

        },        
        initBooking() {

            Booking.init(this);

        },
        initModal(modalId) {            

            this.bsModal = new bootstrap.Modal(document.getElementById(modalId));            

            document.getElementById(modalId).addEventListener('hidden.bs.modal', event => {

                this.editing = false;
                this.resetCustomerForm();

            })

        },
        setAvailableProducts() {

            Product.setAvailable(this);

        },
        notify(success = true, message, info = false) {

            let toastElement = !success ? 'error-toast' : (!info ? 'success-toast' : 'info-toast');

            document.getElementById(`${toastElement}-body`).innerHTML = message;
            let toast = new bootstrap.Toast(document.getElementById(toastElement));
            toast.show();

        },        
        proceedToPaymentOptions(event) {

            Payment.proceed(event, this, Booking, Checkout);

        },
        selectPaymentOption(event){            

            Payment.select(event, this);

        },
        pay(event){
            
           Payment.pay(event, this, Form);            

        },
        clearDate(event){

            this.datePicker.clear();
            Calendar.reset(this);

        },
        /***************************
   
        Charity Booking functions
        
        ***************************/        
        setNonPartnerCharity(event){

            this.booking.charity = {
                name: event.target.value,
                majorTomId: '',
                isPartner: false
            };            

        },
        removeElementClassList(elementClass, classList ){

            const elements = document.querySelectorAll('.' + elementClass);

            elements.forEach((element) => {
                element.classList.remove(classList);
            });  

        },
        search(event){

            Charity.search(this, true);

        },        
        undoCharitySelection(event){

            if(this.booking.customers.length > 0){

                if (confirm("Charities have different fundraising targets based on your your selected altitude. You will need to re-add your skydivers.") !== true) { //cancel

                    return;                    

                }

                this.resetSkydivers();

            }

            this.booking.charity = '';
            this.booking.reservation = '';
            this.removeElementClassList('charity-single__day__wrapper','active');
            this.removeElementClassList('charity-result-option','charity-result-option--selected');
            this.storeBookingSession();                

        },
        resetSkydivers(){
            
            this.booking.customers = [];
            this.storeBookingSession();                    

        },
        selectCharity(event, index){                
            
            this.undoCharitySelection();
            this.booking.charity = this.results[index];                        
            event.target.parentNode.classList.add('charity-result-option--selected');

            this.getCharityJumpOptions();

        },
        getCharityJumpOptions(){

            let getJumpOptions = Charity.jumpForFreeOptions(this, this.booking.charity.majorTomId);            
            let self = this;

            getJumpOptions.then(function (response) {
                                
                if (response.data.success) {                        

                    self.booking.charity.offers = response.data.data;
                    self.storeBookingSession();                    
                    return;

                }

                self.notify(false, 'Unable to load jump options');

            }).catch(function (error) {
                self.notify(false, error.message);                
            });

        },
        selectReservation(event, index){            
            
            Location.reset(this);
            Calendar.reset(this, true);
            Charity.selectReservation(event, index, this);
            this.storeBookingSession();

        }

    },
    mounted() {

        this.$nextTick(() => {            

            this.ajaxUrl = document.getElementById('booking-app').getAttribute('data-ajax-admin-url');
            this._nonce = document.getElementById('booking-app').getAttribute('data-wp-nonce');
            this.paymentOptionsUrl = document.getElementById('booking-app').getAttribute('data-payment-options-url');
            this.type = document.getElementById('booking-app').getAttribute('data-booking-type');

            this.initBooking();

            const modals = document.getElementsByClassName('modal');        

            if(modals.length > 0){            

                this.initModal(modals[0].getAttribute('id'));

            }

        })            

    }
})

bookingApp.mount('#booking-app')    