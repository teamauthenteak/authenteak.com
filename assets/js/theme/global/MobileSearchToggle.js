export default class MobileSearchToggle {
    constructor(el) {
        this.$el = $(el);
        this.$header = $('header');

        this._bindEvents();
    }

        _bindEvents() {
            $(window).on('resize', (event) => {
                this._mobileStateChk(event);
            });
            
            $('.button-mobile-nav-search').on('click', (event) => {
                this._toggleMobileSearch(event);
            });
        }
        
        _mobileStateChk(event) {
            if ($(window).innerWidth() > 1024) {
                $('.mobile-search-wrapper').hide('fast');
            }
        }

        _toggleMobileSearch(event) {
            if ($(document).width() <= 1024) {
                $('.mobile-search-wrapper').slideToggle('fast');
            }
        }
}
