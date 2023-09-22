/***************************   
   search
   

***************************/

export function search(app){

    let name = document.getElementById('charity-search').value;            
    let btn = document.getElementById('button-charity-search');
    let spinner =  document.getElementById('button-charity-search-spinner');

    if(name !== ''){

        app.noResults = false;

        spinner.classList.remove('d-none');
        btn.disabled = true;            

        let charitySearch = searchByName(name, app);
        
        charitySearch
        .then(function (response) {                        

            if(response.data.success){                        
                
                app.results = response.data.data;
                
                if(response.data.data.length === 0){

                    app.noResults = true;

                }

            } 
            
            spinner.classList.add('d-none');
            btn.disabled = false;            

        })
        .catch(function (error) {

            console.log(error);
            spinner.classList.add('d-none');
            btn.disabled = false;            

        });

    }  

}

export function fetchByName( charityName, app){    
    
    let formData = new FormData;
    formData.append('action', 'gsd_fetch_charity_by_slug_ajax');
    formData.append('_nonce', app._nonce);
    formData.append('data', JSON.stringify({
        name: charityName        
    }));
    
    return axios.post(app.ajaxUrl, formData);   

}


export function searchByName( name, app){    

    let formData = new FormData;
    formData.append('action', 'gsd_search_posts');
    formData.append('_nonce', app._nonce);
    formData.append('data', JSON.stringify({
        type: 'charity',
        search: name        
    }));
    
    return axios.post(app.ajaxUrl, formData);   

}

export function selectReservation(event, index, app)
{

    app.removeElementClassList('charity-single__day__wrapper','active'); 

    if(event.target.tagName !== 'DIV'){

        event.target.closest("div").classList.add('active');                

    }else{

        event.target.classList.add('active');

    }
    
    app.booking.reservation = app.booking.charity.reservations[index];
    app.booking.date = app.booking.reservation.date;
    app.booking.dropZoneId = app.booking.reservation.dropZoneId;

}

export function events( app, date = '', datesOnly){

    let formData = new FormData;
    formData.append('action', 'gsd_get_reservations_ajax');
    formData.append('_nonce', app._nonce);
    formData.append('data', JSON.stringify({
        date: date,
        datesOnly : datesOnly
    }));
    
    return axios.post(app.ajaxUrl, formData);   

}

export function all( app, categories = []){

    let formData = new FormData;
    formData.append('action', 'gsd_get_charities_ajax');
    formData.append('_nonce', app._nonce);
    formData.append('data', JSON.stringify({
        categories: categories        
    }));
    
    return axios.post(app.ajaxUrl, formData);   

}

export function jumpForFreeOptions(app, charityId){

    let formData = new FormData;
    formData.append('action', 'gsd_get_charity_jump_options_ajax');
    formData.append('_nonce', app._nonce);
    formData.append('data', JSON.stringify({
        id: charityId
    }));
    
    return axios.post(app.ajaxUrl, formData);   

}