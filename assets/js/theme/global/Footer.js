export default class Footer {
    constructor(el) {
        this.$el = $(el);
        this.$footer = $('footer');
        this.$footerCol =$('.footer-col.footer-accordion .footer-title');

        this._bindEvents();
        this._setFooterDate();
        this._initKlavio();
    }

    _bindEvents() {
        $(document).ready(function() {
            if ($(window).innerWidth() <= 1024) {
                $('footer').addClass('mobile-footer');
            }
        });

        $(window).on('resize', (event) => {
            this._toggleFooterAccordionState(event);
        });
        
        $('.footer-accordion .footer-title').on('click', (event) => {
            this._toggleFooterNav(event);
        });
    }
    
    _toggleFooterAccordionState(event) {
        if ($(window).width() <= 1008) {
            this.$footer.addClass('mobile-footer');
        } else {
            this.$footer.removeClass('mobile-footer');
            $('.footer-accordion nav').show();
        }
    }

    _toggleFooterNav(event) {
        if ($(document).width() <= 1024) {
            $(event.target).toggleClass('accordion-open')
            $(event.target).parent().find('nav').slideToggle('fast');
        }
    }


    _setFooterDate(){
        let year =  new Date().getFullYear();
        document.getElementById("footerCurrentYear").innerHTML = year;
    }


    _initKlavio(){
        // fetch 3rd party klavio ONLY when the newsletter input recieves focus
        if( !window.KlaviyoSubscribe && document.emailSignup){
            document.querySelector(".newsletter__input").addEventListener('focusin', getKlavioScript, true);

            function getKlavioScript(){
                $.getScript("//www.klaviyo.com/media/js/public/klaviyo_subscribe.js", init);
                document.querySelector(".newsletter__input").removeEventListener('focusin', getKlavioScript, true);
            }
        }

        // refference form to klavio instance
        function init(data, textStatus, jqxhr){
            if( jqxhr.status === 200 ){
                try{
                    window.KlaviyoSubscribe.attachToForms('#emailSignup', {
                        hide_form_on_success: true,
                        success_message: "Thank you for signing up! Your special offer is on its way!",
                        extra_properties: {
                            $source: 'Footer',
                            $method_type: "Newsletter Form",
                            $method_id: 'newsletter',
                            $consent_version: 'Embed default text'
                        }
                    });
                }catch(err){}
            }
        }
    }


}
