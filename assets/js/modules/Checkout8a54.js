export function store( app, type, status = 'started' ){
    
    let formData = new FormData;
    formData.append('action', 'gsd_store_checkout_ajax');
    formData.append('_nonce', app._nonce);
    formData.append('data', JSON.stringify({
        status: status,
        checkout: type == 'voucher' ? app.order : app.booking,
        type: type
    }));

    return axios.post(app.ajaxUrl, formData);
}