import * as Product from './Product.js';

/***************************
   
   Make ajax call using Axios to get availability from Major Tom   
   @param {object} dates pass in date object with start date to query (finish date is currently calculated server side)
   @param {string} dropZoneId
   @param {object} app Vue js instance
   @return {object} axios promise

***************************/
export function getAvailability(app, startDate) {
   
   app.fetchingDates = true;
   app.notify(true, 'Loading dates, please wait', true);

   console.log('Loading dates for ' + app.booking.dropZoneId);

   let formData = new FormData;
   formData.append('action', 'gsd_get_availability');
   formData.append('_nonce', app._nonce);
   formData.append('data', JSON.stringify({
      startDate: startDate,
      dropZoneId: app.booking.dropZoneId,
      seen: app.availability.seen
   }));

   let requestAvailability = axios.post(app.ajaxUrl, formData);

   requestAvailability.then(function (response) 
   {
      
      if(response.data.success){

         update(app, response.data.data);

      }else{

         app.notify(false, 'Unable to load dates');
         app.fetchingDates = false;

      }
      

   }).catch(function (error) 
   {
      
      app.fetchingDates = false;
      app.notify(false, error.message);

   });


}

export function reset(app, disable = false)
{

   app.booking.date = null;
   app.booking.displayDate = null;
   app.booking.selectedDayIndex = null;
   app.booking.selectedMonthIndex = null;

   if( typeof app.datePicker === 'object' && app.datePicker !== null ){

      app.datePicker.clear();

      if(disable){

         app.datePicker.set('clickOpens', false);

      }
      

   }

   if(app.booking.type == 'skydive'){

      Product.setAvailable(app);

   }    

}

export function resetAvailability(app) {

   app.availability = {
      days: [],
      dates: [],
      seen: []
   }

}

/***************************
   
   Checks whether we've seen selected month / year on month or year change via date picker
   @param {object} seenYearsAndMonths 
   @param {object} datePicker instance of flatpickr
   @param {boolean} checkYear just checking year
   @return {boolean}     

***************************/
export function seenMonthOrYear(seenYearsAndMonths, datePicker, checkYear = false) {

   let seen = false;

   if (checkYear) {

      for (const [year, months] of Object.entries(seenYearsAndMonths)) {

         if (year == datePicker.currentYear) {

            return true;

         }
      }

      return seen;

   }

   for (const [year, months] of Object.entries(seenYearsAndMonths)) {

      if (year == datePicker.currentYear) { //seen that year, check months         

         for (let i = 0; i < months.length; i++) {

            if (parseInt(months[i]) == datePicker.currentMonth + 1) {

               return true;

            }

         }

      }

   }

   return seen;

}


/***************************
   
   update availability object and date picker   
   @param {object}app Vue JS instance   

***************************/

export function update(app, availabilityData) 
{

   let allDays = app.availability.days.concat(availabilityData.days);
   app.availability.days = allDays;

   let allDates = app.availability.dates.concat(availabilityData.dates);
   app.availability.dates = allDates;

   app.datePicker.set('enable', allDays);
   app.datePicker.set('clickOpens', true);

   for (const [key, value] of Object.entries(availabilityData)) {

      if (key != 'days' && key != 'dates') {

         app.availability[key] = value;

      }

   }

   app.notify(true, 'Available dates loaded')
   app.fetchingDates = false;
   return false;

}

/***************************   
   init date picker
   @param {object}app Vue JS instance
   @param {object} datePickerElement HTML object
   @param {array} dates

***************************/

export function init(app) {         
   
   app.datePicker = flatpickr(document.getElementById('date-picker'), datePickerConfig(app));

}

export function datePickerConfig(app) {
   
   return {
      clickOpens: false,
      altInput: true,
      altFormat: "D d/m/Y",
      dateFormat: "Ymd",
      disableMobile: "true",      
      minDate: new Date(),      
      onReady: function(){
         
        getAvailability(app);

      },
      onClose: function (selectedDates, dateStr, instance) {

         if (selectedDates.length > 0) {

            select(app,selectedDates, dateStr);
      
         }

      },
      onMonthChange: function (selectedDates, dateStr, instance) {         

         if (seenMonthOrYear(app.availability.seen, instance, true)) { //check years

            if (!seenMonthOrYear(app.availability.seen, instance, false)) { //see years so check months

               getAvailability(app, app.availability.finishDate);
               app.notify(true, 'Loading more dates, please wait', true);

            }
         }

      },
      onYearChange: function (selectedDates, dateStr, instance) {

         if (!seenMonthOrYear(app.availability.seen, instance, true)) { //check years

            getAvailability(app, app.availability.finishDate);
            app.notify(true, 'Loading more dates, please wait', true);

         }

      }
   };

}

export function select( app, selectedDates, dateStr )
{   

   let isValidJumpDay = true;  
   let isValidProduct = true;

   var dayOfTheWeekIndex = selectedDates[0].getDay();
   var monthIndex = selectedDates[0].getMonth(); 

   if (app.type == 'skydive') {

      isValidJumpDay = validDay(app, selectedDates, dayOfTheWeekIndex, monthIndex);
      isValidProduct - validProductForLocation(app);
      Product.setAvailable(app);

   }

   if (isValidJumpDay && isValidProduct) {

      setSelected(app, dateStr, dayOfTheWeekIndex, monthIndex);

   } else {

      app.datePicker.clear();
      app.invalidJumpDaySelected = true;      

   }
}

export function setSelected( app, dateStr, dayOfTheWeekIndex, monthIndex )
{

   app.booking.date = dateStr;
   app.booking.displayDate = document.getElementById('date-picker').nextElementSibling.value;
   app.invalidJumpDaySelected = false;

   if (app.type == 'skydive') {

      app.booking.selectedDayIndex = dayOfTheWeekIndex;
      app.booking.selectedMonthIndex = monthIndex;
      app.setAvailableProducts(); // disable / enable product selections based on days

   }  

   if (app.type == 'charity-skydive' && app.booking.reservation !== '') {
      
      app.booking.reservation = '';
      app.removeElementClassList('charity-single__day__wrapper','active'); 

   }

}

export function validProductForLocation(app){

   let isValidProduct = true;
   let message = '';   

   for (let i = 0; i < app.booking.customers.length; i++) {

      if (!app.booking.customers[i].jump.locations.includes(app.booking.dropZoneId) ) { //customer jump is not available at that location

         message = `${app.booking.customers[i].jump.name} is not available at this location. Please select another location or change your skydive choice`;
         isValidProduct = false;
         break;

      };

   }

   app.message = message;

   return isValidProduct;

}

export function validDay(app, selectedDates, dayOfTheWeekIndex, monthIndex){

   let isValidJumpDay = true;
   let message = '';   

   for (let i = 0; i < app.booking.customers.length; i++) {

      if (!app.booking.customers[i].jump.days.includes(dayOfTheWeekIndex) || !app.booking.customers[i].jump.months.includes(monthIndex)) { //customer jump is not available on that day or month

         message = `${app.booking.customers[i].jump.name} is not available on this day. Please select a different day or change your skydive choice`;
         isValidJumpDay = false;
         break;

      };

   }

   app.message = message;

   return isValidJumpDay;

}