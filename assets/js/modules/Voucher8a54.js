import * as Product from './Product.js';

export function add(app){
    
    let voucher = { 
        id: Date.now()        
    };    
    
    app.order.vouchers.push(Product.details(voucher, document.getElementById('voucher-form')));
    
}

export function select(event){
    
    if(event.target.value !== ''){

        let includedProducts = event.target.options[event.target.selectedIndex].getAttribute('data-prop-array-products');             
        
        if(document.getElementById('additional-product') && includedProducts.indexOf(document.getElementById('additional-product').value) !== -1){

            document.getElementById('additional-product-variant').setAttribute('required', true);
            document.getElementById('additional-product').setAttribute('data-prop-additional-product-is-included', 'yes');

        }else{

            document.getElementById('additional-product-variant').removeAttribute('required');
            document.getElementById('additional-product').setAttribute('data-prop-additional-product-is-included', 'no');

        }

    }

}