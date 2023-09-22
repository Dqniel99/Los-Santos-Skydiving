export function log(app, error, action = '') {

    let formData = new FormData;
    formData.append('action', 'gsd_log_error_ajax');
    formData.append('_nonce', app._nonce);
    formData.append('data', JSON.stringify({
        order: app.booking,
        error: error,
        url: window.location.href,
        action: action
    }));

    axios.post(app.ajaxUrl, formData);

}