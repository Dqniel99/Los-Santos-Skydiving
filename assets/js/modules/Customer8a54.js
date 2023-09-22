import * as Booking from './Booking.js';

export function add(form, app, isJumping = true, isPayee = false) {

    let customer = { 
        id: Date.now(),
        isJumping: isJumping,
        isPayee: isPayee
    };

    app.booking.customers.push(setDetails(form, customer, app));

}

export function update(form, index, app) {
    
    let customer = app.booking.customers[index];
    app.booking.customers.splice(index, 1, setDetails(form, customer, app));

}

export function setDetails(form, customer, app) {

    const inputs = form.getElementsByTagName('input');
    const selects = form.getElementsByTagName('select');
    const formElements = [...inputs, ...selects] //merge together (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)         

    for (let i = 0; i < formElements.length; i++) {

        let property = formElements[i].getAttribute('name');

        if (formElements[i].type == 'select-one') { //select - our products are in a select

            let selectedOption = formElements[i].options[formElements[i].selectedIndex];                        
            customer[property] = setProductSelection(customer, selectedOption, property, app);

        } else { //text input            

            customer[property] = property == "contactMobile" ? formatPhoneNumber(formElements[i].value) : formElements[i].value;

        }

    }

    return customer;

}

export function setProductSelection( customer, selectedOption, productType, app ) {
    
    let postId = selectedOption.getAttribute('data-post-id');
    let price = selectedOption.getAttribute('data-price');
    let isBundle = selectedOption.hasAttribute('data-is-bundle') && selectedOption.getAttribute('data-is-bundle') === 'yes' ? true : false;
    
    let product = {
        customerId: customer.id,
        name: selectedOption.getAttribute('data-display-name'),
        id: selectedOption.value,
        postId: postId !== '' ? parseInt(postId) : postId,
        price: price !== '' ? parseFloat(price) : 0,
        isBundle: isBundle,
        bundleId: selectedOption.hasAttribute('data-bundle-id') ? selectedOption.getAttribute('data-bundle-id') : '',                
        bundlePostIds: isBundle ? selectedOption.getAttribute('data-bundle-products').split(',') : []
    };    

    if(productType === 'jump'){

        return setJumpProduct(selectedOption, product, app);

    }

    return product;
    
}

export function setJumpProduct(selectedOption, product, app){

    if(app.booking.type =='charity-skydive'){

        product.isCharityJump = 'yes';
        product.minimumRaised = selectedOption.hasAttribute('data-minimum-raised') ? parseFloat(selectedOption.getAttribute('data-minimum-raised')) : 0;
        product.isCharityPartner = app.booking.charity.hasOwnProperty('majorTomId') && app.booking.charity.majorTomId !== '' ? 'yes' : 'no';
        product.charityPartnerId = app.booking.charity.hasOwnProperty('majorTomId') ? app.booking.charity.majorTomId : '';
        product.isCharityPayable = selectedOption.getAttribute('data-is-charity-payable');
        
        if(product.isCharityPartner == 'yes' && selectedOption.hasAttribute('data-minimum-raised')){ //has offers

            product.charityPayableInvoiceValue = parseFloat(selectedOption.getAttribute('data-invoice-value'));
            product.charityPayableDiscount = parseFloat(selectedOption.getAttribute('data-discount'));
            
        }

    }else{

        product.isCharityJump = 'no';
        let strDays = selectedOption.getAttribute('data-days');
        let days = strDays.split(',');

        let strMonths = selectedOption.getAttribute('data-months');
        let months = strMonths.split(',');

        product.days = days.map(item => parseInt(item.trim()));
        product.months = months.map(item => parseInt(item.trim()));      
        
        let locations = selectedOption.getAttribute('data-locations').split(',').map(item => item.trim());
        product.locations = locations;

    }
    
    product.deposit = parseFloat(selectedOption.getAttribute('data-deposit'));
    product.jumpAltitude = parseInt(selectedOption.getAttribute('data-altitude'));    
        
    return product;
    
}

export function formatPhoneNumber(number){
    
    return number.replace(/[^\d]/g,'').replace(/^0+/,'0').replace(/^0(?=[1-9])/,'44');

}