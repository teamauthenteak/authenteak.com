/**
 * Graph QL Legacy Option Templates
 */

export default class GraphQL_Legacy_Options {

	getLegacySwatches(option){
		return `<div class="form-field form-field-options form-field-swatch ${option.isRequired ? 'form-required' : '' }" data-swatch-selector data-product-attribute="swatch">
					<div class="form-field-title-cntr" data-option-title="${option.displayName}">
						<span class="form-field-title">${option.displayName}:</span> &nbsp;
						<span class="swatch-value" data-swatch-value></span>
						${option.isRequired ? '<span class="required-text">*</span>' : '' }
					</div>
				
					<div class="form-field-control-wrapper">
						<div class="form-field-control">

				${Object.keys(option.values.edges).map((key) => {
					let swatch = option.values.edges[key].node;
					let parsedLabel = TEAK.Utils.parseOptionLabel(swatch.label.toString());

					swatch = Object.assign(swatch, parsedLabel);

					if( swatch.label === "not_an_option" ){ return; }

					return `<label class="swatch-wrap" for="attribute-${swatch.entityId}" data-swatch-value="${swatch.label}" data-product-attribute-value="${swatch.entityId}">
								<input class="form-input swatch-radio" id="attribute-${swatch.entityId}" type="radio" name="attribute[${option.entityId}]" value="${swatch.entityId}" data-label="${swatch.label}" data-parsed-label="${swatch.text}" ${swatch.isDefault ? 'checked' : ''} required aria-required="true">
								<span class="swatch">
									<span class="swatch-color swatch-pattern" style="background-image: url('https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${swatch.entityId}.preview.jpg');">
										<img class="swatch-pattern-image" src="https://cdn11.bigcommerce.com/s-r14v4z7cjw/images/stencil/256x256/attribute_value_images/${swatch.entityId}.preview.jpg" alt="${swatch.label}">
									</span>
								</span>
								<span class="form-label-text">${swatch.label}</span>
							</label>`;
				}).join("")}

						</div>
					</div>
				</div>`;
	}


	getLegacySelectBox(select){
		return `<div class="form-field form-field-options form-field-select ${select.isRequired ? 'form-required' : ''}" data-product-attribute="set-select">
					<label class="form-label">
						<span class="form-field-title-cntr" data-option-title="${select.displayName}">				
							<span class="form-field-title">${select.displayName}:</span> &nbsp;
							${select.isRequired ? '<span class="required-text">*</span>' : '' }				
						</span>

						<span class="form-field-control">
							<div class="form-select-wrapper">
								<select class="form-input form-select" id="attribute-${select.entityId}" name="attribute[${select.entityId}]" required aria-required="true">
									
									<option value="" selected disabled>Pick One...</option>
						${Object.keys(select.values.edges).map((key) => {
							let option = select.values.edges[key].node;
							return `<option value="${option.entityId}" ${option.isDefault ? 'selected' : ''} data-product-attribute-value="${option.entityId}">${option.label}</option>`;
						}).join("")}

								</select>
							</div>
						</span>
					</label>
				</div>`;
	}

}