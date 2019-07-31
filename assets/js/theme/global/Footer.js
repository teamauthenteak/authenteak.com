export default class Footer {
    constructor(el) {
        this.$el = $(el);
        this.$footer = $('footer');
        this.$footerCol =$('.footer-col.footer-accordion .footer-title');

        this._bindEvents();
        this._setFooterDate();
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
}
