# authenteak.com
Core Authenteak website documentation about special modules and features.


## Product JSON
Product Pages (PDP) extra elements.
* Tool Tips
  * Product option tips
  * Specific Element tips
* Custom Tab Content

### Structure
```
├── tool-tips           	# 
│   ├── brands				# 
│   	├── Specific Brand  		# Brand field must match what is in the BC Backend
│   ├── elements				# 
│   	├── Elements by ID 		# The ID of the elemnet you want to add a tool tip too
├── tabs           	# 
│   ├── Tab ID				# The ID of the tab you want to add content too

```

---

## Calculators
To add a calculator to a page call the `TEAK.Modules.calculator.init()` for a given caculator type with a set of paramerters.

| Parameter | Value                                                |
|-----------|------------------------------------------------------|
| id        | id of the element container to render the calculator |
| type      | the calculator type to rednder                       |

### Firepit
Renders the firepit fireglass/lava rock calculator in a given div container

*Example*
```
<div class="calculator" id="firepitCalculator">
    <script>
        document.addEventListener('DOMContentLoaded', function(){
            TEAK.Modules.calculator.init({
                id: "firepitCalculator",
                type: "firepit"
            });
        });
    </script>
</div>
```

---

## Header JSON
Used to generate additional non SEO critical pages, categories, sub-categories in the main navigation menu. Also used to control other header objects requiring dyanmic udpates from content editors


### Promo Banner
`header_promo_color` avlaible:
- green
- blue
- grey
- black
- red
- maroon

| Parameter               | Description                                          |
|-------------------------|------------------------------------------------------|
| header_promo_link       | Add the URL to link the banner too                   |
| header_promo_color      | Add the custom color name listed above               |
| header_custom_class     | For affirm or any js trigger                         |


### Affirm
Trigger Affirm modal: add the custom class: `affirm-site-modal` to the `header_promo_class` property AND leave `header_promo_link` as an empty string `""`.

*Sample Affirm JSON Structure*

```
"global": {
    "isVisable": true,
    "header_promo": "Pay over time with financing from <span class='promoBanner__affirmLogo'></span> <strong class='promoBanner__psedoLink'><u>Learn more &rsaquo;</u></strong>",
    "header_promo_link": "",
    "header_promo_color": "grey",
    "header_custom_class": "affirm-site-modal"
}
```

### Header JSON Structure
```
.
├── marketing_content           	# (Optional) Extra header marking promotion content
│   ├── global				# 
│   	├── isVisable 		# (Required) - Boolean to show/hide promo banner
│   	├── header_promo 		# (Required) - Promo Text
│   	├── header_promo_link 		# (Optional) - Link the promo to a given page
│   	├── header_promo_color 		# (Optional) - Currently supports "green" or "blue" values
│   	├── header_promo_class 		# (Optional) - if you need a custom class on the promo banner

├── category_xxxx			# <xxxx> Given category ID
│   ├── makeShort			# Boolean - makes the content area shorter to create columns
│   ├── shop_by_Brand			# (Optional)
│   	├── title 			# Title of the Shop By Brand Section
│   	├── url 			# (Required) URL of the section
│   	├── items: [] 			# Array - contains each sub page object under this category
│   		├── title 		# Sub category page title
│   		├── url 		# (Required) URL of the sub category page
│   		├── highlight 		# (Optional) adds a class to make the text highlight red
│   		├── emphasis 		# (Optional) makes the sub category text italic
│   ├── shop_by_collection 		# (Optional) 
│   	├── title 			# Title of the Shop By Collection
│   	├── url 			# (Required) URL of the section
│   	├── items: [] 			# Array - contains each sub page object under this category
│   		├── title 		# Sub category page title
│   		├── url 		# (Required) URL of the sub category page
│   		├── highlight 		# (Optional) adds a class to make the text highlight red
│   		├── emphasis 		# (Optional) makes the sub category text italic
│   ├── pages: [] 			# (Optional) Array - of top level page objects
│   		├── title 		# (Required) Page title
│   		├── url 		# (Required) URL of the page
│   		├── highlight 		# (Optional) adds a class to make the text highlight red
│   		├── emphasis 		# (Optional) makes the sub category text italic
├
├── category_xxxx
├		...
```


## Heap Analytics
Developer Documenation for Heap Analityics.

### Heap Analitcs Events

| Event                   | Location                                             |
|-------------------------|------------------------------------------------------|
| pdp_view                | User view on PDP                                     |
| plp_view                | User view on PLP                                     |
| proceed_to_cart         | ATC Confirmation Modals                              |
| add_to_cart             | ATC Modals                                           |
| order_completed         | Order Confirmaiton Pages                             |
| created_account         | My Account Order Registration Page                   |


### Custom tracking events for heap analitics

```
        {
            method: "",     track, identify, addUser
            id: "",         Typically the current website users id
            event: "",      add_to_cart, proceed_to_cart, etc.
            ... other properties or a custom object
        }
```

### Example

```
        // used to identify a website user
          TEAK.thirdParty.heap.init({
            method: 'identify',
            id: '{{customer.id}}'
          });
          
        // use to track an event
          TEAK.thirdParty.heap.init({
            method: 'track',
            event: 'order_completed',
            location: 'OrderConfirmation'
          });
          
        // creates a new users in heap
          TEAK.thirdParty.heap.init({
            method: 'addUser',
            email: '{{customer.email}}',
            name: '{{customer.name}}',
            city: '{{customer.shipping_address.city}}',
            state: '{{customer.shipping_address.state}}',
            firstPurchaseDate: '',
            createdAt: '',
            purchaseCount: '',
            purchaseTotalValue: ''
          });
```