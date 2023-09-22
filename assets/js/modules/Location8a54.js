export function change(event, app, Booking, Calendar) {

    Calendar.reset(app);
    Calendar.resetAvailability(app);
    app.booking.dropZoneId = event.target.value;

    if( app.booking.type == 'charity-skydive' ){

        app.booking.reservation = '';
        app.removeElementClassList('charity-single__day__wrapper','active'); 

    }

    if( app.datePicker !== null ){

        app.datePicker.close();
        app.datePicker.clear();
        app.datePicker.set('clickOpens', false);
    
        if (app.booking.dropZoneId !== "") {
    
            Calendar.getAvailability(app);
    
        }

    }else{

        Calendar.init(app);        

    } 

}

export function reset(app)
{

    app.booking.dropZoneId = '',
    document.getElementById('location').value = "";

}