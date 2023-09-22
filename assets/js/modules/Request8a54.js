export function send(url, action, _nonce, data = null){

    let formData = new FormData;
    formData.append('action', action);
    formData.append('_nonce', _nonce);

    if (data !== null){

        formData.append('data', JSON.stringify(data));

    }    

    return axios.post(url, formData);
}