import * as Form from './modules/Form.js';
import * as Voucher from './modules/Voucher.js';
import * as Order from './modules/Order.js';

const { createApp, ref } = Vue;

const voucherApp = createApp({
    data() {
        return {
            type: "",
            ajaxUrl: null,
            _nonce: null,
            deliveryOptionsUrl:'',
            bsModal: [],
            formErrors: [],
            calculating: false,
            order:{
                type:"",
                paymentMethod: 'cardOnline',                
                customer:{},
                vouchers: []                     
            }            
        }
    },
    methods: {  
        storeSession(){

            sessionStorage.setItem(this.order.type + '-order', JSON.stringify(this.order));

        },
        selectVoucher(event){

            Voucher.select(event);

        },  
        addVoucher(event){
            
            this.formErrors = [];
            let isValidForm = Form.isValid(document.getElementById('voucher-form')); // !valid returns array of errors 

            if (!Array.isArray(isValidForm) && isValidForm) {
                
                Voucher.add(this);
                Order.updateTotals(this);
                this.notify(true, `Voucher added to order`);
                this.bsModal.hide();                
                return;

            }

            this.formErrors = isValidForm;            

        },
        removeVoucher(event, index){
            
            this.order.vouchers.splice(index,1);
            Order.updateTotals(this);
            this.notify(true, `Removed Voucher`);

        },
        resetForm(){

            Form.reset(document.getElementById('voucher-form'));
            this.bsModal.hide();
            this.formErrors = [];
            document.getElementById('additional-product-variant').value = '';
            document.getElementById('voucher-select').value = '';

        },
        proceedToDeliveryOptions(event){

            if(this.order.vouchers.length == 0){

                this.notify(false, 'Please add a voucher to your order');            
                return;

            }

            Order.proceedToDelivery(this, event);            

        },
        initOrder(){

            this.order.type = this.type;

        },
        initModal(modalId) {            

            this.bsModal = new bootstrap.Modal(document.getElementById(modalId));            

            document.getElementById(modalId).addEventListener('hidden.bs.modal', event => {

                this.resetForm();

            })

        },
        notify(success = true, message, info = false) {

            let toastElement = !success ? 'error-toast' : (!info ? 'success-toast' : 'info-toast');

            document.getElementById(`${toastElement}-body`).innerHTML = message;
            let toast = new bootstrap.Toast(document.getElementById(toastElement));
            toast.show();

        }
    },
    mounted() {

        this.ajaxUrl = document.getElementById('voucher-app').getAttribute('data-ajax-admin-url');
        this._nonce = document.getElementById('voucher-app').getAttribute('data-wp-nonce');
        this.deliveryOptionsUrl = document.getElementById('voucher-app').getAttribute('data-delivery-options-url');
        this.type = document.getElementById('voucher-app').getAttribute('data-order-type');       
        
        this.initOrder();

        const modals = document.getElementsByClassName('modal');        

        if(modals.length > 0){            

           this.initModal(modals[0].getAttribute('id'));

        }       

    }
})

voucherApp.mount('#voucher-app');