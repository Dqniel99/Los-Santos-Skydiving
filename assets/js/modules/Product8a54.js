/***************************   
   enable / disable product selections based on selected day
   @param {object}app Vue JS instance   

***************************/
export function setAvailable(app) {

    let options = document.getElementById('jump-option').options;

    if(app.booking.selectedDayIndex !== null && app.booking.selectedMonthIndex !== null){        
     
        for (let i = 0; i < options.length; i++) {

            let days = options[i].getAttribute('data-days').split(',').map(item => parseInt(item.trim()));        
            let months = options[i].getAttribute('data-months').split(',').map(item => parseInt(item.trim()));        
            let locations = options[i].getAttribute('data-locations').split(',').map(item => item.trim());
            
            if(!days.includes(app.booking.selectedDayIndex) || !months.includes(app.booking.selectedMonthIndex) || !locations.includes(app.booking.dropZoneId) ){ //disable option

                document.getElementById('jump-option').options[i].setAttribute('disabled', 'true');

            }else{

                document.getElementById('jump-option').options[i].removeAttribute('disabled');

            }

        }

    }

}

export function details(product, form){

    const inputs = form.getElementsByTagName('input');
    const selects = form.getElementsByTagName('select');
    const formElements = [...inputs, ...selects] //merge together (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)         

    for (let i = 0; i < formElements.length; i++) {
        
        let property = formElements[i].getAttribute('name');
        let element = formElements[i].type == 'select-one' ? formElements[i].options[formElements[i].selectedIndex] : formElements[i];

        for (const attr of element.attributes) {            
            
            let propPrefix = 'data-prop-';
            let propArrayPrefix = 'data-prop-array-';
            let isArray = attr.name.indexOf(propArrayPrefix) !== -1 ? true : false;
            let strIndex = isArray ? attr.name.indexOf(propArrayPrefix) : attr.name.indexOf(propPrefix);  
            let propPrefixLength = isArray ? propArrayPrefix.length : propPrefix.length;          

            if(strIndex !== -1){
                                
                let propName = attr.name.substring(strIndex + propPrefixLength);                
                let value = isArray ? attr.value.split(",") : attr.value;

                if(propName.indexOf('-') !== -1){ //has a hyphen after data-prop
                    
                    //split and make into cameCase to send to backend, object properties can then be assiend to class in constructor
                    let propNameCamel = propName.split('-').map((element, index) => {                         
                        return index == 0 ? element : element.charAt(0).toUpperCase() + element.slice(1); //not index 0 then upper case first char
                    }).join('');                    

                    product[propNameCamel] = value;

                }else{

                    product[propName] = value;

                }

            }

        }
        
        product[property] = formElements[i].value;//for text inputs and default value proeprty

    }

    return product;

}