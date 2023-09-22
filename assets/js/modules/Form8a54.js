export function isValid(form) {

    const inputs = form.getElementsByTagName('input');
    const selects = form.getElementsByTagName('select');
    const text = form.getElementsByTagName('textarea');    

    const formElements = [...inputs, ...selects, ...text] //merge together (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)

    let messages = [];

    for (let i = 0; i < formElements.length; i++) {

        if (formElements[i].hasAttribute('required') && formElements[i].value == '') {

            let label = formElements[i].getAttribute('data-label');
            messages.push(`Please complete required field: ${label}`);

        }

        if(formElements[i].type == 'email' && formElements[i].value != '' && !isValidEmail(formElements[i].value)){

            messages.push(`${formElements[i].value} is not a valid email`);

        }

    }

    return messages.length > 0 ? messages : true;

}

export function reset(form){
    
    const inputs = form.getElementsByTagName('input');

    for (let i = 0; i < inputs.length; i++) {        

        if(inputs[i].type == 'email' || inputs[i].type == 'text' ){

            inputs[i].value = '';

        }

    }

}

export function populateFromObject(objectToPopulateFrom){

    for (const [key, value] of Object.entries(objectToPopulateFrom)) {

        let input = document.getElementById(key); //our object key should be same as input id

        if( typeof value !== 'object' && input !== null ){                   

            input.value = value;

        }
    }

}

export function isValidEmail (email) {
    return /\S+@\S+\.\S+/.test(email)
}