# authenteak.com
Core Authenteak website 

## Mega Menu JSON

Used to generate additional non SEO critical pages, categories, sub-categories in the main navigation menu.

### Notes

**Affirm**

Trigger Affirm modal: add the custom class: `affirm-site-modal` to the `header_promo_class` property AND leave `header_promo_link` as an empty string `""`.

### Structure
```
.
├── marketing_content           # (Optional) Extra header marking promotion content
│   ├── global					# 
│   	├── header_promo 		# (Required) - Promo Text
│   	├── header_promo_link 	# (Optional) - Link the promo to a given page
│   	├── header_promo_color 	# (Optional) - Currently supports "green" or "blue" values
│   	├── header_promo_class 	# (Optional) - if you need a custom class on the promo banner

├── category_xxxx				# <xxxx> Given category ID
│   ├── makeShort				# Boolean - makes the content area shorter to create columns
│   ├── shop_by_Brand			# (Optional)
│   	├── title 				# Title of the Shop By Brand Section
│   	├── url 				# (Required) URL of the section
│   	├── items: [] 			# Array - contains each sub page object under this category
│   		├── title 			# Sub category page title
│   		├── url 			# (Required) URL of the sub category page
│   		├── highlight 		# (Optional) adds a class to make the text highlight red
│   		├── emphasis 		# (Optional) makes the sub category text italic
│   ├── shop_by_collection 		# (Optional) 
│   	├── title 				# Title of the Shop By Collection
│   	├── url 				# (Required) URL of the section
│   	├── items: [] 			# Array - contains each sub page object under this category
│   		├── title 			# Sub category page title
│   		├── url 			# (Required) URL of the sub category page
│   		├── highlight 		# (Optional) adds a class to make the text highlight red
│   		├── emphasis 		# (Optional) makes the sub category text italic
│   ├── pages: [] 				# (Optional) Array - of top level page objects
│   		├── title 			# (Required) Page title
│   		├── url 			# (Required) URL of the page
│   		├── highlight 		# (Optional) adds a class to make the text highlight red
│   		├── emphasis 		# (Optional) makes the sub category text italic
├
├── category_xxxx
├		...
```

