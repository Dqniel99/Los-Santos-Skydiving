window.addEventListener('DOMContentLoaded', function () {
  
  window.cookieconsent.initialise({
    "palette": {
      "popup": {
        "background": "#252e39"
      },
      "button": {
        "background": "#14a7d0"
      }
    },
    "content": {
      "href": "/privacy"
    },
    "position": "bottom-left"
  })

  function initSliders(sliderElements) {

    let config = {
      type: 'slider',
      peek: {
        before: 0,
        after: 100
      },
      animationDuration: 500
    }

    for (let iSlider = 0; iSlider < sliderElements.length; iSlider++) {

      if (sliderElements[iSlider].getAttribute('id') == 'review-slider') {

        config.gap = 30,
          config.perView = 3;
        config.focusAt = '1';
        config.startAt = '1';
        config.breakpoints = {
          2100: {
            perView: 2
          },
          1650: {
            perView: 2
          },
          600: {
            perView: 1,
            peek: {
              before: 50,
              after: 50
            },
          }
        }

      }

      if (sliderElements[iSlider].getAttribute('id') == 'experience-slider') {

        config.gap = 30,
        config.perView = 4;
        config.focusAt = 'center';
        config.type = 'slider';
        config.breakpoints = {
          2100: {
            perView: 4
          },
          1650: {
            perView: 3
          },
          600: {
            perView: 1,
            peek: {
              before: 50,
              after: 50
            },
          }
        }
      }

      if (sliderElements[iSlider].getAttribute('id') == 'guides-slider') {

        config.gap = 30,        
        config.startAt = '0';
        config.breakpoints = {
          2100: {
            perView: 3
          },
          1650: {
            perView: 3
          },
          600: {
            perView: 1,
            peek: {
              before: 50,
              after: 50
            },
          }
        }

      }

      let slider = new Glide(sliderElements[iSlider], config);
      slider.mount();

    }

  }

  initSliders(document.querySelectorAll(".glide"));

  //charity partners page
  if (document.getElementById('charity-categories-select')) {

    document.getElementById('charity-categories-select').addEventListener(
      'change',
      function () {

        window.location.href = document.getElementById('charity-categories-select').value;

      },
      false
    );

  }

  //our locations
  if (this.document.getElementById('locations-map')) {   
        
    // Create the script tag, set the appropriate attributes
    var script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyA-Pd0QyRjBNechFn2RZgvl52dVIcuYsPQ&callback=initMap';
    script.async = true;
    
    initMap = function () {

      //get locations from data attributes or via ajax request?
      let latlngsString = this.document.getElementById('locations-map').getAttribute('data-lat-lng');
      let markers = [];

      if(latlngsString.includes(";") ){ //more than one = ; delimetted

        markers = latlngsString.split(';').map(function(element){

          let latlng = element.split(',');

          return {
            lat: parseFloat(latlng[0]),
            lng: parseFloat(latlng[1])
          }
          
        })

      }else{

        latlng = latlngsString.split(',');
        markers.push({
          lat: parseFloat(latlng[0]),
          lng: parseFloat(latlng[1])
        })

      }      
      
      const map = new google.maps.Map(document.getElementById("locations-map"), {
        zoom: parseInt(document.getElementById("locations-map").getAttribute('data-zoom')),
        center: markers[0],
      });      

      for (let i = 0; i < markers.length; i++) {              
        
        let marker = new google.maps.Marker({
          position: markers[i],
          map: map,
        });
        
      }

      
    };

    // Append the 'script' element to 'head'
    document.head.appendChild(script);    

  }

  if (this.document.getElementById('order-confirmation')) {   

    sessionStorage.clear();
    let ajaxUrl = document.getElementById('order-confirmation').getAttribute('data-ajax-admin-url');
    let wpToken = document.getElementById('order-confirmation').getAttribute('data-wp-nonce');
    let type = document.getElementById('order-confirmation').getAttribute('data-type');
    let paymentId = document.getElementById('order-confirmation').getAttribute('data-payment-id');

    if(type !== '' && paymentId !== ''){

      let formData = new FormData;
      formData.append('action', 'gsd_get_order_ajax');
      formData.append('_nonce', wpToken);
      formData.append('data', JSON.stringify({
          orderType: type,
          paymentId : paymentId
      }));        

      //make async call to get order
      axios.post(ajaxUrl, formData).then(function (response) {

        console.log(response.data);
                                    
        if (response.data.success) {                        

          trackOrder(response.data.data);

        }        

      }).catch(function (error) {
          //console.log(error);
      });

    }

  }

  trackOrder = function ( order) {   
    
    console.log(order);

    // dataLayer.push({ ecommerce: null });  // Clear the previous ecommerce object.
    // dataLayer.push(order);
    gtag("event", order.event, order.ecommerce);

  }

});


