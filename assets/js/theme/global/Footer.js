export default class Footer {
    constructor(el) {
        this.$el = $(el);
        this.$footer = $('footer');
        // this.$footerCol =$('.footer-col.footer-accordion .footer-title');

        this._bindEvents();
        this._setFooterDate();
        this._initKlavio();
    }

    _bindEvents() {
        $(document.body).on("click", "li.footer__item--heading", this.toggleFooterItems)
    }
    
    
    toggleFooterItems = (e) => {
        $(e.target).parents("ul.footer__list").toggleClass("footer__list--active")
    }


    _setFooterDate(){
        let year =  new Date().getFullYear();
        document.getElementById("footerCurrentYear").innerHTML = year;
    }


    _initKlavio(){
        // fetch 3rd party klavio ONLY when the newsletter input receives focus
        if( !window.KlaviyoSubscribe && document.emailSignup){
            document.querySelector(".newsletter__input").addEventListener('focusin', getKlavioScript, true);

            function getKlavioScript(){
                $.getScript("//www.klaviyo.com/media/js/public/klaviyo_subscribe.js", init);
                document.querySelector(".newsletter__input").removeEventListener('focusin', getKlavioScript, true);
            }
        }

        // reference form to klavio instance
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
