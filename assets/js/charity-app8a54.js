import * as Charity from './modules/Charity.js';

const { createApp, ref } = Vue;

const charityApp = createApp({
    data() {
        return {
            ajaxUrl: null,
            _nonce: null,
            noResults: false,
            results: [],
            events:[],
            datePicker:{},
            loading:false,
            loadingCharities:false,
            selectedDate:'',
            selectedDisplayDate:'',
            selectedCharity:{
                name:'',
                slug: '',
                colour:'',
                icon:''
            },
            charities:[]
        }
    },
    methods: {
        getCharities(event){

            this.loadingCharities = true;

            let element;
                        
            if(event.target.tagName !== 'LI'){

                element = event.target.closest('li');                

            }else{

                element = event.target;

            }

            this.selectedCharity.name = element.getAttribute('data-category-name');
            this.selectedCharity.slug = element.getAttribute('data-category-slug');
            this.selectedCharity.colour = element.getAttribute('data-category-colour');
            this.selectedCharity.icon = element.getAttribute('data-category-icon');            
            
            let getCharitiesByCategory = Charity.all(this, [this.selectedCharity.slug]);   

            let self = this;

            getCharitiesByCategory
            .then(function (response) {                
    
                if(response.data.success){                                            

                    self.charities = response.data.data;                                        

                }                 

                self.loadingCharities = false;
    
            })
            .catch(function (error) {
    
                console.log(error);  
                self.loadingCharities = false;      
    
            }); 

        },
        getEvents( date = '', datesOnly = true){

            let getEvents = Charity.events(this, date, datesOnly);   
            let self = this;         

            getEvents
            .then(function (response) {                
    
                if(response.data.success){                        
                    
                    if(datesOnly){

                        let dates = response.data.data.map(reservation => String(reservation.date));                        
                        self.datePicker.set('enable', dates); //set (enable) available days on date picker

                    }else{

                       self.events = response.data.data;

                    }                    

                }                 

                self.loading = false;
    
            })
            .catch(function (error) {
    
                console.log(error);  
                self.loading = false;               
    
            }); 

        },
        initDatePicker() {

            let self = this;
            this.loading = true;

            var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

            let config = {
                altInput: true,
                altFormat: "D d/m/Y",
                dateFormat: "Ymd",                
                disableMobile: "true",
                minDate: new Date(),
                onClose: function (selectedDates, dateStr, instance) {                    
                    
                    self.loading = true;
                    self.selectedDate = dateStr,
                    self.selectedDisplayDate = selectedDates[0].toLocaleDateString("en-GB", options);
                    self.getEvents(dateStr, false);                         
       
                }
            }

            this.datePicker = flatpickr(document.getElementById('charity-events-datepicker'), config);

            this.getEvents();   
            
        },
        search(event) {                        

            Charity.search(this);

        }        

    },
    mounted() {

        this.ajaxUrl = document.getElementById('charity-app').getAttribute('data-ajax-admin-url');
        this._nonce = document.getElementById('charity-app').getAttribute('data-wp-nonce');

        if(document.getElementById('charity-events-datepicker')){

            this.initDatePicker();

        }        

    }
})

charityApp.mount('#charity-app')    