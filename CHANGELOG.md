# Change Log

## [1.20.38]
- cart qty position fix
- added ability to disable out of stock swatches
- added "disabledSwatches" field to product info
- added "colorCode" field to parsed swatch data
- fixed outdoor heating brand URLs in navigation
- updated fire glass image in fire pit calculator
- fixed atc modal image issue
- added phone number formatting for checkout
- added new shipping time indicators to cart, pdp and my account
- updated option drawer with new UX - square swatch, removed product image, moved text, show selected swatch unrepeated at top
- fixed issue with checkout page going to 500 by merging down 1.20.37 to this branch
- updated UI for hide swatch feature
- added swatch search back to PDP option drawer
- fixed issue where disabled swatches were not disabled during filtering or searching
- added logic to hide "Customize" messaging on PDP when there are no options to show
- fixed issue in swatch tpl that caused exception when colorCode wasn't in swatch data
- Added White Glove Delivery Messaging on PDP and Cart
- Added White Glove Icons
- added feature on cart page that will: A regular non special order – lead time 1 is showing and lead time 2 is hidden. A special order – lead time 1 is hidden and lead time 2 is showing.
- added way to hide white glove messaging for certain product ids
- fixed pdp swatch filter issue where TGEX filters and a grade wouldn't return swatch results
- added module not found fix for flyout not showing on category landing pages
- updated heating spelling
- merge for JUNE page updates
- decodeURIComponent fix for all swatch images in graphql

## [1.20.37]
- changed button border radius
- changed default button to new color standards
- changed default border radius for form controls
- removed unused javascript from builds
- removed unused CSS from theme.scss
- added fail safe to cart js for undefined response
- made all button text capital case
- homepage css updates
- Updated footer icons
- fixed strike through price bug where it would disappear on page load
- home page updates
- removed orange button from buttons.scss

## [1.20.36]
- New Footer
- Fixed issue with header that cause it to jump to top when engaging flyout
- removed legacy css
- updated brands in flyout
- added new VDS variables 
- fixed issue with badge
- update footer list id for newsletter signup form
- removed search panel, mini-cart and mobile nav embeds

## [1.20.35]
- New Header App (Desktop, Mobile, Tablet)
- fixed yotpo error for reviews and questions when sending sku instead of product id
- removed prop 65 from cart
- March Homepage updates (merges)
- fixed header aux nav cut off issue
- added outdoor back to the furniture main nav.
- added outdoor decor to accessories tab
- fixed search bar issue in header
- added my list ajax post call on PDP
- fixed header/content spacing issues
- fixed issue were the flyout text was to large, thus being cutoff for 1020 devices
- fixed issue where promo banner was not showing up on mobile devices
- Refactored component conditions in Collections PDP App
- fixed a slider bug where the slick dots showed on mobile
- fixed scroll lock issue causing the browser page to reflow when we lock the page for main nav
- added promo banner back for trade users
- updated logo on cart/checkout, main header
- fixed issue causing the search not to work correctly.
- added fall back for pencil banner when firebase is down

## [1.20.34]
- added filter support for pdp swatch drawer
- adding pdp collections click-n-buy application
- added nosto fix for atc modal defect
- added fix for loader still spinning when atc modal is shown
- added more preconnect and prefetch lookups to base.html
- fixed duplicate options when the filter option remains checked when the option drawer is closed
- collections PDP complete
- added pintrest rich pins
- added prop 65 on pdp
- home page updates
- new classes
- yotpo fix sending skus vs product ids

## [1.20.33]
- Removed Bolt and added Custom checkout button
- Added Signifyd support
- added css to hide not_an_option
- merged css from pull requests
- removed hide from blog post pagination
- fixed issue for not_an_option noValue that caused the price to not change
- removed not_an_option from the UI for mini-cart, min-cart side, request a swatch, pdp, and cart
- Jan 2021 home page updates
- order confirmation page fix for heap and other analytics
- reverted site logo
- added nosto search results div to search page in page.html
- added dns-prefetch and preconnect to base.html for performance
- added touchstart passive event for jquery
- PDP Collections updates Click-N-Buy and Build-N-Buy

## [1.20.32]
- ReactJS Collections PDP
- Cart delete link fix
- pdp tabs not working fix
- global javascript break out for various apps
- fixed tool tip tabs issue with alignment and scroll
- fixed android issue for options overflow for smaller screen sizes
- added json-tdl to pdp collections
- renamed pdp collections to build-n-buy and click-n-buy
- refactored personalization to be more universal and self contained
- adding step indicators to build and buy configuration app
- Added Nosto recommendations container divs
- added additional generic classes
- added countdown timer for home page
- added switch for dynamic in base.html if template is custom or not
- fixed ui issues in header and card for tablet
- added placeholder lazyload option
- changed countdown to only update ui for clock not all other items
- updated clock to end at midnight on the day of expiry
- merge alert updates
- added checkout options back with css updates for mobile
- updates plural labels for count down clock
- updated white to #fff
- remove Recently Viewed due to Nosto Integration
- fixed an empty cart JS bug when there is an empty cart array
- fixed a bug when looking for an empty div on PDP 
- updated nosto font size and and PDP spacing
- added hero update for countdown clock
- added nosto slick reInit for ATC Modal
- updated 2020 bf countdown times


## [1.20.31]
- new cart layout and cart functionality
- fix for trade flag show

## [1.20.30]
- added clyde script to cart footer
- Added home page hero
- added clyde add/remove/update contracts
- added clyde widget
- added message for non trade qualified products
- added feature to remove MSRP for trade users
- button to show FAQ on page takeover modal in cart
- updated trade badge text
- added clyde icons in cart
- Trade discount bug fixes
- landing page class for vertical align images

## [1.20.29.001]
- added payment info text to footer
- installed authenteak.com GeoTrust SSL certificate to BigCommerce and added badge to footer

## [1.20.29]
- Trade Cart fixes
- Trade Flag fixes on PDP
- Trade Flag custom field addition
- update footer link arrangements
- added new live chat icons in header/footer for desktop and mobile
- added new heap tag: pdp_view_tooltip
- added new icons to icon definitions
- made mobile search bar show
- Mobile: remove search icon, added my account icon
- Minor Footer design realignment changes


## [1.20.28.003]
- maxed header width at 1600px;
- updated checkout confirmation message
- fixed header spacing/whitespace issue

## [1.20.28.002]
- fixed issue were header marketing data was not pulling correctly from the cloud
- added localstorage expiration for header content to make sure we get updated flyout in a 24 hours

## [1.20.28.001]
- added filter to remove discontinued swatches on PDP
- fixed issue where discount message was not showing on mobile
- removed footer link to testimonials page

## [1.20.28]
- moved the header.json and product.json to firebase
- Built ReactJS/PHP BigCommerce App to manage header and product data from control panel
- Add Custom field for product dimensions
- added price adjust to selected product swatch option
- updated free shipping text
- updated promo color text and button icon
- added no assembly required verbiage and icon
- fixed header issue where the excess l/r space on the header logo
- merged Bolt fix for coupon code issue in to cart totals.js
- fixed issue to show both the price adjusted value on selected product options

## [1.20.27.005]
- fixed an issue where there was an extra " for the order id causing a mismatch for the lead time

## [1.20.27.004]
- fixed option drawer filtering issue. 
- removed fb pixel TEAK calls from inline js

## [1.20.27.003]
- pull out custom facebook pixel code

## [1.20.27.002]
- added custom filters to product options
- added feature for default image for a "No Something" product option swatch
- Slight refactor of CartTotals.js
- Added feature to count brands and show "multiple shipping message"

## [1.20.27]
- Collection page v2 updates
- moved CTA positions on collections page
- moved analytics inline code to external script files
  - Remove Affirm from Script Manager -> moved to base.html
  - Remove Affirm jQuery version form Script Manager -> not necessary
  - Remove Anti-Flicker for Google -> not necessary
  - Removed Pingdom Page Load tracker -> not necessary
- hide coupon code on checkout page if a trade user is logged in
- created a search spring filter comp for possible UI update
- reduced white space on collections page
- fixed and updated a number of heap events for the PDP Options
- added checkbox to my account sign-up form
- updated promo text color
- created Selenium IDE Smoke and Regression Tests
- refactored image zoom js to work more efficiently on the PDP
- Added verified reviewer for yotpo with SHA-256 encryption
- Fixed the major 508 ADA known problems on: Home, PLP, PDP, Cart, Category Pages, Header
- Fixed an issue in the product options drawer where if you search by keyword, then clear the keyword using the clear button, then click any filter, no search results come up.
- Moved inline global SVG to fetched XHR SVG for performance
- refactored save to localstorage to be more universal
- added feature to save lead time to storage to show on my account orders page
- Added firebase as a front-end source to store external data
- removed billing address from my account order page and print invoice page
- fixed tablet checkout UI display issues
- added custom lead time messaging to invoice email and order confirmation page
- fixed issue on order confirmation page where there was a race condition for the showing of the feedback modal link
- fixed trade coupon issue on cart & checkout page
- removed > from footer header links that were appearing in breadcrumbs on tablet
- fixed issue where _learnq was throwing exception
- fixed issue with my account and an exception thrown for the top promo banner
- added BC Mustache tags to get cart data points to JS and reff back to carttotals.js
- reverted new option filter in teak js
- reverted GA, Bing, Pintrest in analytics js as it wasn't reporting correctly.
- added pollyfills from teak to IE only
- fixed issue where firebase wasn't adding new users to the db

## [1.20.26]
- Updated lead time ui on PDP
- Added lead time to cart page
- added "trade price" badge to PDP next to Price
- Changed horizontal tabs to vertical accordion tabs on PDP
- added new yotpo api integrated Questions
- added new yotpo api integrated Reviews
- Integrated new Questions and Reviews yotpo driven form
- added fix for duplicate swatches
- Created 2 responsive table variations for Specs on PDP
- Added heap events in Heap console
- added function to remove featured offers if a trade user is logged in
- Updated trade shipping pricing for checkout per new %
- added feature to hide resources if there are no resources for a given product
- added check if warranty data is available on pdp to hide its tab
- added custom code to cart to add custom coupon code for trade customers
- fixed cart edit button alignment issue on cart page
- fixed UI issues on Questions and Reviews Mobile
- Fixed UI issue on question no question CTA
- hide lead time 2 on mobile on pdp
- mobile Question and Reviews UI fixes

## [1.20.25]
- Collections page
- added qty on collections page
- fixed form validation on collections page
- fixed atc modal to have selected product options on collections page
- added release version number query parameter to bundle.js
- fixed product swatch modal last row size issue
- fixed facebook pixel issue on totals/cart page
- made tablet main nave flyout width smaller
- added feature to save selected swatch when filtering
- adjusted filter control icons and text for mobile
- made ui updates for the filter controls & headings in the drawer flyout
- added new sticky atc bottom modal that has link to cart
- added UI to match normal pdp options for # of options + icon
- added Analytics to collections page
- fixed issue for hamburger menu being too small
- made tablet main nav menu smaller
- added lead time to collections page
- added lead time tool tip to collections page
- added tool tip for product options to collections page
- added brand field to product graphql response 

## [1.20.24]
- removed * from select-box options
- added new tabbed tool tip option
- Move breadcrumbs above title on mobile devices
- Hide video tabs on PDP
- Create Catalogs Landing Page Template
- Create Category Landing Page Templates
- Fix remove icon on cart page
- fixed an issue where the negative price regex wasn't working for the priceAdjust object in product options
- fixed mobile header issue where the search icon was hard to click
- added modifier classes for landing.css to fine tune for device sizes
- added easy css touch scroll for ios devices
- Fixed issue where the regex for the atc modal price was calculating incorrectly
- added additional ui updates for the product swatch drawer
- fixed an issue for the negative pricing rule not calculating correctly because it was picking up the wrong value
- added IE 10 & 11 backwards compatibility for product options
- implemented Implemented LazyLoad JS in to templates starting with Product Swatches, RV and Recomm Products
- fixed issue on the cart where the edit form wasn't working. reverted to use legacy options for cart page
- added loading icon to cart edit modal button
- fixed issue with legacy fall back that would not allow an atc to happen
- fixed lazy load of atc modal recomm product images

## [1.20.23]
- collections page updates
- removed simple bar for swatch options in favor of ligheter css scroll styling
- changed product swatches to css scroll rather than simplebar
- Added Bolt page error fix
- moved cart RV to show when a cart is empty
- fixed an issue where the button on reqeust swatch checkout form was auto clicking
- fixed issue in top nav where featured offers was triggering a dropdown with only the words "shop all featured"
- integrated new options modal drawer flyout
- updated options on PDP with drawer flyout
- fixed some issues with the tooltip with the new product option fields

## [1.20.22]
- collections page updaes
- fixed pdp thunbial cut off issue
- fixed pdp thunbial pre loading alingment issue
- added logic to search for "ships next day" on lead time to show tool tip
- added TEAK tempalte object for js globals
- Added Recently Viewed to Home page
- changed swatch order from 5 to 3
- graphql for recommended products on pdp
- added check to make sure recommended products are on the page
- changed cart header button to link to cart for graceful dedegration
- added promo text to cart for upgraded delivery for orders > or < 2998
- added reload if on cart to refresh the page messages and values
- updated atc modal selector for new graphql recommended products

## [1.20.21.003]
- removed all free white glove delivery wording and options due to covid-19

## [1.20.21.002]
- fix to allow the tab tool tip to close when the user clicks off tool top or hit esc key
- fixed Question(s) logic for PDP yotpo product qeustions
- Update check-out to checkout on first step of swatch request funnel

## [1.20.21.001]
- adding heap script to order confirmation and checkout pages
- added tax to cart page for trade users
- update swatch checkout verbage

## [1.20.21]
- refactored header mega nav to JSON from inline JS for performance
- added ability to clear blog on click/toggle-off of the active filter
- Added tool tip for next bussiness day lead time field
- Created new PDP Tabs Module and moved the code out of Product.js
- added custom content feature for when a field no assumebly is present it adds content to shipping or any tab
- added Tab JSON to product-single-details page from product.js to get template logic
- added Tool Tip Tab ability
- Trade Conditions to show/hide features
- Trade condition in cart for % shipping
- fixed issue where only one video shows in the top PDP page while there are multiple videos
- Added top PDP arrows back to product thumbnails

## [1.20.20.002]
- fixed yotpo https error
- fixed width issue on swatch checkout
- removed legacy localstorage RV for TEAK namesspaced object
- initalize slider in page.js only if the rv is avalaible
- added the total_review field durring udpate/save and when the product object is fetched in product.js

## [1.20.20]
- New product swatch order checkout flow
- order total snapshot
- survey monkey modal at order confirmation
- review stars
- mega menu carrots
- rich article snipets for blogs
- lead time 2 on PDP
- spaceing fix on blog
- updateing pencil banner css
- remove home from blog breadcrumbs
- update the zend desk logo
- product reviews condition when 0 reviews are present
- added blog filter and post(s) logic

## [1.20.19.001]
- fixed further exceptions for missing cart in teak.js

## [1.20.19]
- added survey monkey to order confirmaiton page
- Added a check to see if the old form data is different thant he new form data, if not then dont submit an unchanged edit options form to the server
- added padding to search bar to keep it from being cut off
- added cutom heap fields for myaccount to determine customer order history

## [1.20.18.005]
- fixed an issue where heap load is conflicting with the load event in teak.js
- removed manual heap load event
- updated footer alt tag for free deisng services
- wrapped heap call

## [1.20.18.004]
- note: prevous versions were for merging
- heap analyitcs fixes per call today
- added promo banner dismission
- added free design link in footer
- fixed warantees page brand order

## [1.20.18]
- Heap Analytics tracking defect fixes
- QA js exception fixes
- added RV to cart page
- fixed an issue with the selectbox option values still showing dollar amounts
- made the logo smaller on mobile
- fixed issue where one has to click an option value twice before it can be selected
- fixed issue were at window sizes larger than table 1080 but smaller than 1300px larger main nav menus were being cutoff

## [1.20.17.001]
- added unique UID for google analitcs as well as updated the uid in heap to use unified code

## [1.20.17]
- Fixed issue where swatch was showing incorrect dicount amount due to class change from form-field-title to form-field-title-cntr
- Updated the main logo
- Change warantes page layout

## [1.20.16.003]
- Fixed issue with product rec where the wrong products where pulling out of order

## [1.20.16.002]
- fixed an issue where only a few rec. products in the atc modal show due to an ui exception

## [1.20.16.001]
- fixed issue where utility functions in TEAK were undefined
- fixed tabs issue where they were not initalizing on doc ready
- fixed issue where the stored cart may be empty can cause an exception when trying to count cart items
- fixed an exeption in pintrest when trying to read the cart when none is saved.
- fixed an issue where only a few rec. products in the atc modal show due to an ui exception

## [1.20.16]
- added heap analytics code
- fixed an ATC issue that was a race issue

## [1.20.15]
- Google Strucutred data fix
- Pintrest Strucutred data
- Yotpo UI color changes
- Custom Pintrest analytics events ATC, Checkout, Page View
- Footer tablet UI update
- Blog release
- Tool tip functional fix
- ATC adding product recomendations
- Move mobile breadcrumbs
- Custom Brand warantee page UI
- Create Recently viewed Module and RV UI for PDP

## [1.20.14]
- Blog index and article page Redesign
- Print on PDP Fix
- Added Product recomendations on ATC Modal
- Added shipping 0.00 text to cart
- Fixed ATC modal UI
- fixed Google Search structured dta
- PDP Product Tabs
- YOTPO widget color updates
- background color from footer removed
- custom PDP heap event setup
- Tablet footer adjustment
- removed "shop all" categories from shop by brand flyout

## [1.20.13.002]
- moved new/sale flags back
- changed subtotal when discount is in cart

## [1.20.13]
- Relocate all banners (cart level eligability, cart level congratulations, etc.) from below the product information to above
- Change the font size to 1rem
- Remove background of 'shopping cart' area
- Add border-bottom 1px below shopping cart to match the other horizontal divider
- Pencil banner colors
- recomended products width fix
- custom yotpo reviews stars
- remove underline from pdp text
- Updated readme notes
- redesign sale and new flags
- display cart discount messaging

## [1.20.12.01]
- New mega menu that is not full width
- remvoed arrows
- amp page changes
- made tablet header same for both portrate and landscape


## [1.20.11]
- AMP Product Pages (not 100% complete)
- Added updated tool tips types for product options
- improved transiion area from nav elemnt to dropdown
- improved mega menu colum widths
- added sku exclusioni for free wg and free shipping
- added featured offers for mobile nav
- fixed search button
- removed shop all children

## [1.20.10]
- added new nav component
- rounded search bar
- navigation fixes
- moved -or- text on cart page
- search input placeholder text update
- made section headers on mobile nav cliclable

## [1.20.9]
- Returns Tab to product json for ease of editing
- update the trad verbage
- change the color for the newsletter button to grey
- remove the background color from category description
- aded blank templates for pages and categories
- fixed return tab form mobile

## [1.20.8]
- Added under lines for p text
- added new calculator options and step progress
- adjusted header margin to not use JS
- New Email signup module to lazy load 3rd party
- finalized shop all brand page tempalte
- make "you may also like" in all caps
- fixed breadcrumbs. see header fix above
- added trade visability under atc button
- makde yotpo widget the same width as the page
- removed second shipping lead time
- updated search text
- added returns tab information

## [1.20.7.005]
- merge testing for file upload issue

## [1.20.7]
- Heap Analitics tracking
- Added infinate scroll to PLP pages as well as rel=nofollow
- New Brands Page
- CTA and ATC Buton Changes
- checkout buttons, mini cart, modal buttons updates
- fixed white glove shipping logic

## [1.20.6]
- custom.sass SASS refactor 
- add IntelliSuggest to cart and order confirmation
- Tool tip modal updates
- fixed header json so that formatting will work for pages
- reduce affirm box height
- added function to fix links in the plp set by search spring that are absolute to authenteak.com to work localy
- added work around for searchspring giving product lisitng images a fixed width.
- made 2 colums for plp pages and fixed straggler product for non 2 image ending
- fixed IE11 issues, namely ES6 modules in .html files causing exceptions
- moved product tab functionality into product.js
- IE11 PLP column fix
- IE11 Cart fix
- IE11 cart modal fix
- IE11 PIP UI fix

## [1.20.5]
- custom.sass SASS refactor 
- Fireplace Calculator updates
- Tool tip modal
- Tool tip color udpates
- Tool tip free shipping text change
- add search spring IntelliSuggest

## [1.20.4]
- removed featured offers from mobile nav
- added free white glove shipping text
- Updated footer carots on click to rotate
- increased font size of bullet points
- changed site from Lato to Karla font type
- Increase space above “you may also like” for mobile
- Increase space between yotpo and email sign up on mobile
- prevent keyboard from opending on click of +/- icons
- add rel next/prev for pagination
- added click on body to close tooltip modal

## [1.20.3]
- added arrows to bottom product scroll
- updated arrows for footer links
- added affirm link in footer
- updated to trade url
- changed tool tip icon color and icon
- made round swatches in request a swatch
- fixed scroll button icon and height from bottom for mobile
- fixed header padding height to show breadcrumbs on mobile

## [1.20.2.001]
- fixed cdn issue for affirm logo in header
- fixed atc issue where price was malformated
- fixed issue for order confirmation page causing 404

## [1.20.2]
- added isVisable to global header json to control promo banner
- added ability to have both promo banner and header inline promo
- renamed mega menu json to header json so we can use it for the whole header
- fixed duplicate ids for search field
- added affirm live key and js
- added product tool tip and json
- fixed dup h1 on product page
- moved ajax loader gif to fix 404

## [1.20.1]
- removed footer year inline document.write and added it to footer.js
- added header promo script from header.html to header.js and refacored
- added custom pages feature for header json
- bolt - removed reloadBigCommerceCart() and boolean value
- added atl and title attributes to some links
- updated footer links
- refactored confirmation page "pay by check" function
- script async and order change for performance

## [1.20.0] - 2019-07-23
#### Enhanced
- New Dynamic Enhanced Mega Menu (all devices)
- Add dot nav to product recom slider for mobile
- add scroll bar for swatches
- add alt text to swatches


## [1.19.14] - 2019-07-10
#### Fixed
- Circle swatches
- full width site, header, plp and pip
- ATC fix for free product swatches flicker
- ALT tags for flyout menu (mobile & desktop)
- swatch fix on click to keep label
- ATC modal to reflect free swatch
- added back pdp div for affirm
- fix ui issues for inline swatch and yopto
- added correct alt tag words for flouts

## [1.19.13] - 2019-06-28
#### Fixed
- PDP changes
- Bolt checkout
- AFfirm
- Price flicker
- localstorage cart data save
- ATC

## [1.19.12] - 2019-06-19
#### Fixed
- Reverted Bolt Checktou button


## [1.19.11.002] - 2019-06-19
#### Fixed
- issue with price being in the incorrect place


## [1.19.11] - 2019-06-18
#### Fixed
- Pixel tracking
- Prop 65 on cart
- Mega menu update
- Search box
- SEO structured data fix
- PDP product sizes recomendation slider
- removed the product price from recomendation slider



## [1.19.7] - 2019-04-18
#### Fixed
- Fixed an issue with the scroll not working on the swatch order modal when swatches are selected.

- Rolled back version 1.19.7 from 1.19.10


## [1.19.6] - 2019-04-17
#### Fixed
- Font fixes and adjustments for the PIP pages
- Replacement of messaging
- Button size fixes


## [1.19.5] - 2019-04-11
#### Fixed
- Modified font styles for PDP text
- added logic to hid/show pricing based on apperance of configuration options
- Fixed "chat with us" and ^ positioning conflicts


## [1.18.6] - 2009-02-25
#### Changed
- The login overlay was just not working right all the time so we removed it and
  now when the account link is clicked shoppers are taken directly to the account
  login pages
- No longer do your merchants have to click a link to update their cart if they
  change the quantity, it does it automatically, hurray for less clicks!

#### Fixed
- Promo messages are really only useful if they are accurate, ours weren't when
  the cart contents were changed, but we fixed that so shoppers will get the
  correct information while editing their cart (fixed THEME-1643)
- Weight is weight not any other dimension, so when shoppers choose a product
  option, they shouldn't see the weight in the height space. We uncrossed those
  wires (fixes THEME-1649)

## [1.18.5] - 2018-08-09
#### Fixed
- We are overzealous in some of our JS and it was blocking a certain type of
  product with just the right settings from being added to the cart. We took a
  deep breathe and a step back and corrected the issue, now all products should
  add to cart as expected (fixes THEME-1647)

## [1.18.4] - 2018-08-02
#### Fixed
- If you want to allow shoppers to ship to multiple addresses, now you can! We
  made sure Peak supports the control panel setting that allows you to do just
  that (fixes THEME-1207)

## [1.18.3] - 2018-07-26
#### Fixed
- If your logo was to the left or right, your discount banners would overlap on
  discount, that means people couldn't read them, that's no good! But we fixed
  it now (fixes THEME-1600)

## [1.18.2] - 2018-07-12
#### Fixed
- File uploads were causing problems form iOS device users, so we fixed it up
  and there are issues no more (fixes THEME-1605)

## [1.18.1] - 2018-06-14
#### Changed
- What's that? It doesn't look like we did anything? Good. It shouldn't we just
  updated a few links in the ol' package.json file to keep everything up-to-date

## [1.18.0] - 2018-05-31
#### Added
- For GDPR BC added a newsletter summary field so you can tell your subscribers
  a little bit more about your newsletter and how you will use it. Peak now
  supports showing that summary on the theme

## [1.17.0] - 2018-05-10
#### Added
- You asked we listened support for AMP product pages is now in Peak

## [1.16.7] - 2018-04-26
### Fixed
- The Search query was getting messed up when a price range filter was applied,
  now it applies seamlessly and you get the expected results (fixes THEME-1580)

### [1.16.6] - 2018-04-19
### Fixed
- Seems Google made two verification pages that don't quite agree. So we removed
  the script in the footer that they can't agree on

### [1.16.5] - 2018-04-012
### Changed
- The featured and best selling product images were being a little too lazy on
  the homepage, we straightened them out and load right away now
  (fixes THEME-1558)

### Fixed
- The nav was hogging all the space on the theme header when there was more then
  one row of nav items we have fixed that so the logo always shows
  (fixes THEME-1193)
- The brand images on the brands page have been wrangled into place, now more
  will the roam and look off on the page

### [1.16.4] - 2018-03-29
### Added
- Header and footer scripts can now be used on checkout and order confirmation
  pages just in case you have an app that needs them

### Changed
- Cart suggested products was confusing in the theme features list because Peak
  doesn't have it yet, so it was removed much to the relief of our support team

### [1.16.3] - 2018-03-22
### Fixed
- The AMP page colors just weren't setting right so we changed up the variables
  and it should match the parent sight more closely no matter what your theme
  colors are

### [1.16.2] - 2018-03-15
### Fixed
- AMP Nav close in now dainty lady finger approved

### [1.16.1] - 2018-03-08
### Fixed
- If your products use configurable fields to help users get exactly what they
  want, now those values show up in the cart and mini-cart so they know what they
  are getting

### Changed
- Like the way your theme looks? We do too, that's why AMP now hooks into your
  themes color settings

### Added
- Being able to reach the cart no mater what is important, that's why we included
  it in AMP pages now
- Get followed when you are found through AMP too, social links now included on
  the AMP footer

### [1.16.0] - 2018-03-01
### Added
- No longer do you need to use the footer script area of your theme, GeoTrust
  seals have been added to the themes footer and theme settings

### [1.15.0] - 2018-02-28
### Added
- Google AMP is the next wave in mobile optimization for your shop, Peak now
  contains AMP verified Category pages for use when users find your categories
  through a search, happy accelerated browsing

### [1.14.0] - 2018-02-15
### Changed
- We have the future in our sights so have updated webpack to version 3 so we
  can continue to efficiently improve this theme

### [1.13.5] - 2018-02-01
### Changed
- We made it easier for users to click on your products, yay!
- Reviews were displayed as one big block and that just made them hard to read.
  Now if your users write in nice paragraphs it will display that way too.

### [1.13.4] - 2018-01-25
### Fixed
- If your facets per chance have special characters, they were not working as a
  second filter for your items, now they are *phew*
- There was some funny business on the mobile menu with the back button crowding
  the menu button, they have now been given their own space.
- iOS Safari made the mobile menu close breaking its nice look. The transition
  has been sped up so we hope it behaves now. Silly Safari

### [1.13.3] - 2018-01-18
### Fixed
- We found a way to hide the hidden sold out options on all browsers, rejoice in
  less confusion
- Empty containers just clutter things up, so we removed them from the carousel
  to keep mobile layouts nice and tidy
- Product pick list images were getting cut off on Firefox, so we gave them more
  room to breathe

### [1.13.2] - 2018-01-11
### Fixed
- Now the empty cart/bag text matches the language selection in the theme settings

### [1.13.1] - 2018-01-04
#### Added
- Optimized for Pixlepop is added to the feature list for display on the
  marketplace, nothing has changed in the theme

#### Fixed
- Recent updates left the product carousels looking a bit off, we've sorted it
  out and they are ship shape once again

### [1.13.0] - 2017-12-7
#### Added
- Your images are now lazy. No wait! That's a good thing, it will help increase
  page load speeds so users see your content more quickly.

### [1.12.17] - 2017-11-30
#### Fixed
- The account address form always looks nice now
- Those account address state fields were playing tricks and the required marker
  wasn't associating correctly with the country, now it does
- Add links to your custom fields for products and they will get the respect
  they deserve (fixes THEME-1444)
- Your store name probably isn't 'undefined', now it wont show up as such in the
  gift card instructions (fixes THEME-1455)
- No more changing button text when a product is added to the cart, if you chose
  the bag language you will get all bag all the time
- Facet titles should be simple, they don't really need special characters, but
  if you insist they will now no longer break the show more toggle

#### Changed
- Added title to customized checkbox field to display consistently like other
  checkbox fields on the product page
- Move contact form errors to outside of contact form avoiding form layout
  breaking when an error occurs on forms with flexbox layouts

### [1.12.16] - 2017-11-22
#### Changed
- States no longer required for users with accounts who live in places that don't
  have states. I love the smell of logic in the morning.
- If you have one required checkbox for users when they are creating accounts,
  that doesn't mean you want all of them to be required, now they aren't.

### [1.12.15] - 2017-11-16
#### Changed
- An ounce of prevention is worth a pound of cure. That's why we updated stencil-utils
  to v1.0.9

### [1.12.14] - 2017-10-26
#### Added
- You can choose the icon that speaks to your customers best for the mini cart
  now, just go to theme settings and checkout the 'Header cart icon' setting
- Now None is a valid option for your non-required product options rejoice!
- User think they have an account and just forgot their password, well now they
  will get feedback when they submit their email for a reset link

#### Fixed
- Syndicated content now makes sense, well the layout does, the news may not
- Let them say what they want now, well at least for gift certificate codes.
  Your custom gift certificates will no longer be rejected.

### [1.12.13] - 2017-09-28
#### Fixed
- Added a little incantation to trick IE out of compatibility mode.

### [1.12.12] - 2017-09-28
#### Fixed
- Now you can get that navigation out of your way by clicking anywhere outside
  of the navigation or on the parent nav item

### [1.12.11] - 2017-09-14
#### Added
- Added error message to forgot password form

#### Fixed
- Logos blocking up the scenery breaking my mind, no more! On small screen sizes
  the logo no longer overlaps with the cart and navigation icons
  (fixes THEME-1130)
- Access granted. Subcategories now accessible again on mobile
- Reset to factory default initialized, beewp beewp beewp default product
  options now remain selected on product add to cart (fixes THEME-1417)

#### Changed
- "From where we stand the rain seems random. If we could stand somewhere else,
  we would see the order in it.” - Tony Hillerman, Coyote Waits (Your banners
  are actually random now no matter where you stand)

### [1.12.10] - 2017-08-21
#### Added
- Taxes line item added in cart totals
- Added show less link and loading animation to faceted search

#### Fixed
- Facets with spaces in the name now work with filters show more link
- Correct mobile navigation to display pages when categories are hidden
- Price facet correctly show/hides

#### Changed
- Tappable area increased on faceted search facets for better UI on mobile

### [1.12.9] - 2017-08-10
#### Fixed
- Faceted search facets now respond correctly to their + and - being clicked on
  mobile
- Review throttler alert message stays open for longer then 1 second
- AdaptiveHeight of product images js corrected to work as expected no mater
  image dimensions

### [1.12.8] - 2017-08-03
#### Added
- Logout link added to mobile navigation

#### Fixed
- Mobile currency converter styles corrected

#### Changed
- Decreased size of image being pulled in for product thumbnails

### [1.12.7] - 2017-07-27
#### Fixed
- Product review tab title shows correct number of reviews
- Fixed logo display center shows on desktop again
- Added disabled attribute to product options so when users choose hide sold
  out options in the cp, they are disabled

### [1.12.6] - 2017-07-20
#### Fixed
- Cart discount banners show on all screen sizes with all logo positions
- When additional details are visible but weight is hidden product variant
  images now display correctly (fixes THEME-1350)
- Corrected styles for search overlay to display correctly on iOS 8 phones
  (fixes THEME-1355)

### [1.12.5] - 2017-07-06
#### Added
- Shop by brand added to category sidebar when faceted search disabled

#### Fixed
- Other facet filter now displays in facet list when enabled in Control Panel
  (fixes THEME-1340)
- Search overlay now displays correctly for iOS 9 on iPads

### [1.12.4] - 2017-06-08
#### Fixed
- Date range in date field now shows if date range is within one year
  (fixes THEME-1331)

#### Changed
- Font fallback is Sans-serif now
- Form validation completed by validetta no errors no longer use browser default

### [1.12.3] - 2017-05-19

#### Changed
- Reference in config.json for checkout updated to customized_checkout from
  optimized_checkout

### [1.12.2] - 2017-05-18
#### Added
- Support added for multiple wishlists on product page
- Theme setting to allow display of breadcrumbs on category pages
- Theme setting to allow users to choose if the product description is above or
  below the add to cart form
- Optimized checkout to list of features in config.json

#### Fixed
- Color swatch value now listed with color swatch selected on product page
- Blog post padding on small screen sizes to increase readability

#### Changed
- Featured blog image size increased for blog article page
- Added smoothscrolling and offset to anchor links to account for sticky header
  (fixes THEME-1297)

### [1.12.1] - 2017-05-10
#### Added
- Optimized checkout order confirmation page now available

### [1.12.0] - 2017-05-10
#### Added
- Optimized checkout theme settings and markup added

### [1.11.6] - 2017-05-04
#### Added
- Unsubscribe page for when users remove themselves from mailing lists
  (fixes THEME-1269)

#### Fixed
- Adjusted padding on logo to prevent it from overflowing into the navigation
  (fixes THEME-1285)
- Adjusted logic to make sure gift wrapping line item is hidden in subtotals on
  cart when disabled in the CP (fixes THEME-1276)
- Corrected layout of promo messages when logo position set to center to avoid
  overlap

#### Changed
- Update @bigcommerce/stencil-utils to allow for platforms new tracking features

### [1.11.5] - 2017-04-28

#### Fixed
- Fixed an issue where image pagination would stop working if image variation
  rules were set up and there were more than five images

#### Added
- Pagination arrows are now automatically added to the product image slideshow
  if there are more than five images

#### Changed
- When a variant is selected that has an image rule, the page always scrolls
  to the top

### [1.11.4] - 2017-04-20
#### Fixed
- When all product options are sold out and CP setting is set to hide sold out
  options, ACT button is now disabled
- None is not an option on required pick lists any more
- None is not the default option when set in CP for non-required pick lists
- Fixed issue where mini cart won't scroll
- Fixed an issue where options set to show a new image stopped working after
  being changed several times

#### Changed
- Captcha to V2

### [1.11.3] - 2017-04-06
#### Added
- Product event date field

#### Fixed
- Natural Aspect ratio for home slide show actually uses images native size
- Removed active class from tier panel when  dropdown closed
- Rearranged order of items in Cart totals so discounts we below the sub-total
  rather then above

#### Changed
- Removed 'All' Category link from Shop mega nav as is was redundant
- Removed discounts from mini-cart to avoid confusion over price

### [1.11.2] - 2017-03-30

#### Added
- Add "Show More" button for product filters that have more than initially
  displayed (fixes THEME-1244)

#### Fixed
- Centered logo to site rather than div when logo position setting set to center

#### Changed
- Swapped out custom product forms for core product forms
  (fixes THEME-1211, THEME-1241)

### [1.11.1] - 2017-03-09

#### Fixed
- Currency selector now hidden when store only uses one currency
- Spelling error in schema.json
- Made compare widget scrollable on short screens
- Position of slick dots on natural aspect ratio slides
- Out of stock options hidden on quick shop

#### Added
- Cart item discounts to cart page and mini cart (fixes THEME-1217)

### [1.11.0] - 2017-03-02

#### Fixed
- Dropdown closing when dropdown background clicked on

#### Changed
- How dropdown's function for pages, now link name and carrot open dropdown's
  and a link is included in the dropdown to access the parent link
- Mobile navigation now slides through all sub-pages and sub categories

#### Added
- Option to show/hide pages in main nav
- Option to show/hide categories in main nav
- Three different display options for categories in main nav including shop
  dropdown, mega-nav and categories in main nav


### [1.10.1] - 2017-02-23

#### Fixed
- Variant images would sometimes show incorrectly when changing product options
- Product swatches previews would display below the checkbox

### [1.10.0] - 2017-02-02

#### Changed
- Product option photos are now added to the product slideshow

#### Added
- Support for 'As low as' pricing on layout pages

#### Fixed
- Quick view adding incorrect amount to cart (THEME-1195)
- Video display on product pages

### [1.7.1] - 2017-01-19

#### Fixed
- Stylesheets now compile fully on Windows
- Carousel loading invalid image URLs
- Products without images now show the correct default image
- Homepage blog posts were not being resized correctly

### [1.7.0] - 2017-01-11

#### Changed
- Switched from jspm to npm for dependency management
- Hide the brand image list from the homepage for now, since the image data is
  no longer available
- If product is on sale and out of stock, on show out of stock message on grid

#### Added
- Brands pagination
- Theme setting for default product listing view mode
- Apple pay to footer payment icons list
- Display cart level discounts in minicart and cart page
- Category list in product search results sidebar when faceted search is off

#### Fixed
- Issue causing shipping estimate in cart to be not editable after 1st attempt
- Carousel arrows not visible in Firefox
- Remove store name from newsletter signup header
- Make sure compare works on all listings
- Make sure carousel slides are the same height with / without slide link
  (fixes THEME-1155)
- Error notice position on gift card page
- Issue causing product details in tab area to not update dynamically on
  option change

### [1.6.1] - 2016-12-08

#### Fixed
- Issue causing image slider in related product quick-shop modals to break
- Missing price on out-of-stock products with no options

### [1.6.0] - 2016-11-17

#### Added
- Add support for Apple Pay
- Add better language support with the HTML lang attribute

#### Fixed
- Fix bug causing page to scroll to the top when clearing the compare widget
- Fix bug causing multiple copies of a product to be adding to the compare widget
- Fix issue causing product images to not display in the Quick Shop modal

### [1.5.6] - 2016-10-13

#### Changed
- Remove Gift Certificate from cart page when gift certificates turned off in
  the control panel, (fixes THEME-1121)
- Fixed product reviews displaying when reviews were turned off in the control
  panel, (fixes THEME-1122)
- Allow brands to display in footer, and view all link to work correctly
  (fixes THEME-1126)
- Remove inconsistent highlight on product form when using the quantity selector

### [1.5.5] - 2016-08-30

### Added
- Added review throttler hidden input for review throttler setting
  (fixes THEME-1071)
- Added timeout to alert banners to fix wonky transition

### [1.5.4] - 2016-08-16

### Added
- Added Show All link to Sitemap for categories and brands (fixes THEME-1092)

#### Changed
- Fixed swatches having a default option selected upon page load
  (fixes THEME-1096)
- "Make it unavailable for purchase" rule message now renders correctly on
  product page

### [1.5.3] - 2016-08-09

### Added
- Added classes to additional info sections and custom fields

#### Changed
- Fixed main navigation item spacing theme setting not working
- Made product image carousel background transparent, added Slick adaptive
  height setting to product image carousel
- Changed search results page title to no longer display total search results

### [1.5.2] - 2016-08-02

### Added
- Added nofollow to the BigCommerce link in the footer (fixes THEME-972)
- Added nofollow to the faceted search links

### Changed
- Changed 'Add to Cart' button to display 'Sold Out' when product is out of stock
- Fixed blank filters appearing on category, search and brand pages.

### [1.5.1] - 2016-07-19

### Added
- Added store copyright

### Changed
- Fixed issue where content tab would take precedence over product tab
- Removed 'view all' redundant category link
- Changed header JS to handle window resizing and scrolling in a more
  elegant fashion
- Changed how carousel works. Now allows user to select between four ratio
  options

### [1.5.0] - 2016-06-30

### Added
- Added enhanced navigation and logo alignment options

### [1.4.0] - 2016-06-09

### Added
- Added quantity modifiers to product page
- Added theme setting to enable or disable product image zoom

### Changed
- Fixed images being offset when zoomed on hover
- don't show product combination unavailable message when page is loaded


### [1.3.0] - 2016-06-01

### Changed
- Made carousel image a link if there is no button text, and just the button
  text a link if entered in theme settings (fixes THEME-1014)

### Added
- Limited number of brands to 5
- Added theme setting for the Additional Info tab section on product pages
- Added theme setting for product dimensions on product page (fixes THEME-960)
- Added theme setting to disable sidebar

### [ 1.2.5 ] - 2016-05-26
- Added swatch zoom on hover for pattern swatches (fixes THEME-1029)

### [1.2.4] - 2016-05-27

#### Changed

- Fixed a bug with the checkout page throwing a 500 error for the stylesheet
  (fixes THEME-899)
- Ensured the checkout page header background color matches the shop header


### [1.2.3] - 2016-05-12

#### Changed

- Show Category description on category pages (fixes THEME-931)
- Show full size image in swatch
- Enabled proper entity rendering on post summary

### [1.2.2] - 2016-05-10

#### Changed

- Ensure the state dropdown works properly on account creation screen
  (fixes THEME-903)

### [1.2.1] - 2016-05-05
#### Added
- Content results / tabs to search results page (fixes THEME-949)
- Add cart button to mobile header

#### Changed
- Updated thumbnail image navigation on product pages to use variable widths
- Fixed an issue with Braintree payments not handling user info correctly
- Fixed page list width to allow for larger items

### [1.2.0] - 2016-04-21
#### Added
- Added TE option to change the aspect ratio of product category banner

#### Changed
- UPS shipping methods now appear in the shipping calculator

### [1.1.0] - 2016-04-07
#### Changed
- Replaced compare with bc-compare (fixes THEME-976)
- Make pages dropdown link and toggle separate (fixes THEME-965)

### [1.0.10] - 2016-03-31
#### Added
- Add support for product images with alpha channel

#### Changed
- Hide account links via CP setting
- Hide quantity box via CP setting
- Update BC marketing in footer and package

### [1.0.9] - 2016-03-17
#### Added
- Functionality to disable/hide product options based on SKU inventory
  (fixes THEME-908)
- Facebook like button

#### Changed
- Incorrect / missing URLs on share links

### [1.0.8] - 2016-03-08
#### Changed
- Hide giftcart link when giftcards disabled
- Layout of meganav to support stores with many categories

#### Added
- Option to use a simple list in shop menu
- Option to wrap mega-nav columns

### [1.0.7] - 2016-03-03
#### Added
- Bulk pricing information to product page (fixes THEME-926)
- Styling for invoices

#### Changed
- Fixed critical issue with reset password page not displaying correctly
- Hide references to wishlist when wishlist disabled in control panel
  (fixes THEME-881)
- Adjusted thumb image size
- Keep carousel caption hidden if it has no content (fixes THEME-924)

### [1.0.6] - 2016-02-25
#### Added
- Paypal button to cart page (fixes THEME-911)

### [1.0.5] - 2016-02-18
#### Added
- Sitemap link and template

#### Changed
- Condition for wishlist

### [1.0.4] - 2016-02-18
#### Changed
- Correction to Pinterest share button

### [1.0.3] - 2016-02-16
#### Changed
- Refactored mobile text logo
- Changed add to cart reference from 'cart' to 'bag'

### [1.0.2] - 2016-02-05
#### Changed
- Condition for empty shop-by-price

### [1.0.1] - 2016-01-21
#### Added
- Brands list on brand page
- FM for shop by price on category page
- URLs in config.json


### [1.0.0] - 2016-01-21
#### Added
- Screenshots
- README
- Products per page and corresponding faceted search settings

#### Changed
- Update footer so payment icons and credits are hidden separately
- Remove old social feeds section from homepage
- Add check for if a product has variations before running option change callback
- Update bc-modal to v0.0.4
- Removed extra call to productUtils on homepage


### [0.0.10] - 2016-01-20

#### Added
- RSS page support

#### Changed
- Update bc-core
- Update Docs URL
- Minicart BG updates per preset
- Brands links updated design
- product option images
- account padding
- blog images full width
- change transition on grid item hover
- topbar borders
- payment icon layout
- Changed all social icons to svg

### [0.0.9] - 2016-01-13

#### Changed
- UAT feedback changes
- Remaining High priority design review updates


### [0.0.8] - 2016-01-08

#### Changed
- Updated Susy to 2.2.9
- Update Slick to 1.5.9
- Updated cartUtils js / event binding: coupons, gift certificates,
  shipping calculator
- Refined product lisings
- Changed presets to use font-mapping
- High priority design review updates
- Unavailable pages to use Core
- Header icons switched to inline SVG

#### Added
- Snippet helpers


### [0.0.7] - 2015-12-17

#### Added
- Theme editor capabilities

#### Changed
- Sidebar: conditions to show / hide empty facets.


### [0.0.6] - 2015-12-11

#### Added
- dynamic pricing for product options

#### Changed
- Single product view: minor adjustments to css

### [0.0.5] - 2015-11-27

#### Added
- Faceted search ratings
- Enable mobile sort / filter

### [0.0.4] - 2015-11-18

#### Changed
- Update bc-core
- Make thumbnails equal size on compare page

#### Added
- Giftcard page styles

### [0.0.3] - 2015-11-17

#### Changed
- Various fixes from QA 1
- Fallback for product zoom if small images used

### [0.0.2] - 2015-11-13

#### Added
- Validetta form validation
- Alerts module from skeleton

#### Changed
- Changed some minor styling issues on single product views


### [0.0.1] - 2015-11-06

#### Added
- Inital QA release
