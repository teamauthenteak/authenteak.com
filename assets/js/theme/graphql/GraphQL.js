/** -----------------------------------------------------------------------
 * GraphQL Service
 * Fetches the BC GraphOL API Endpoint
 * - may move this into app.js - not sure if this is needed externally
 * 
 *  * GraphQL Token works on http://local.authenteak.com:3300 - to prevent CORS update your hosts file
 * ------------------------------------------------------------------------ */

export default class GraphQL {
    constructor() {
        this.graphEndpoint = `${window.location.hostname === "authenteak.com" || window.location.hostname === "local.authenteak.com" ? "https://authenteak.com/" : "/"}graphql`;

        this.settings = {
            method: 'POST',
            credentials: 'include',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEAK.Utils.isLocal() ? TEAK.Globals.graphQl_dev : TEAK.Globals.graphQl}`
            }
        };

    }


    /**
     * Fetches Data from BigCommerce GraphQL Service
     * @param {Object} queryObj - custom graphql contract 
     */

    get(queryObj) {
        return fetch(this.graphEndpoint, Object.assign(this.settings, {
            body: JSON.stringify({
                query: queryObj
            })
        }))
            .then(res => res.json())
            .then(res => res.data);
    }



    /**
     * Get Product Price
     * Use to get dynamic product price
     * @param {Array} arr - Array of product ids 
     */

    getProductPrice(arr) {
        return `query getProductPrice{
                    site{
                        products(entityIds:[${arr}]){
                            edges{
                                node{
                                    entityId                                    
                                    prices {
                                        price {
                                            ...PriceFields
                                        }
                                        salePrice {
                                            ...PriceFields
                                        }
                                        retailPrice {
                                            ...PriceFields
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                fragment PriceFields on Money {
                    value
                }`;
    }





    /**
     * Get basic single product information
     * Used on Product Recommendations
     * @param {Array} arr - Array of product ids 
     */

    getProductInfo(arr) {
        return `query getProductInfo{
                    site{
                        products(entityIds:[${arr}]){
                            edges{
                                node{
                                    entityId
                                    name
                                    path
                
                                    defaultImage {
                                        url(width: 500, height: 500)
                                    }
                                    
                                    prices {
                                        price {
                                            ...PriceFields
                                        }
                                        salePrice {
                                            ...PriceFields
                                        }
                                        retailPrice {
                                            ...PriceFields
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                fragment PriceFields on Money {
                    value
                }`;
    }



    /**
     * Get detailed single product information
     * @param {Array} arr - Array of product ids 
     * @param {string} args.after - endcursor from the previous response
     */

    getProductDetailInfo(args) {
        return `query getProductDetailInfo{
                    site{
                        products(
                            entityIds:[${args.arr}]
                            ${args.hasOwnProperty("after") ? `, after: "${args.after}"` : ''}
                        ){
                            pageInfo {
                                startCursor
                                endCursor
                            }
                            edges{
                                node{
                                    ... productFields
                                }
                            }
                        }
                    }
                }

                fragment productFields on Product{
                    entityId
                    name
                    path
                    sku
                
                    customFields (names: ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4", "Lead-Time", "Lead-Time 2", "Promo Text", "Featured Highlight", "Specs Highlight"]){
                        edges{
                            node{
                                name
                                value
                            }
                        }
                    }

                    brand {
                        name
                    }
                
                    defaultImage {
                        url(width: 500, height: 500)
                    }
                
                    prices {
                        price {
                            ...PriceFields
                        }
                        salePrice {
                            ...PriceFields
                        }
                        retailPrice {
                            ...PriceFields
                        }
                    }
                }
                
                fragment PriceFields on Money {
                    value
                }`;
    }



    /**
     * Fetch a given Category Products
     * @param {string} args.path - URL path of current category
     * @param {number} args.qty - number of products to get = currently limited to 8 due to complexity
     * @param {string} args.after - endcursor from the previous response
     */

    getCategoryByUrl(args) {
        return `query getCategoryByUrl{
                    site{
                        route(path: "${args.path}" ){
                            node{
                                ... on Category{
                                    name
                                    products (first: ${args.qty} ${args.hasOwnProperty("after") ? `, after: "${args.after}"` : ''}){
                                        pageInfo {
                                            startCursor
                                            endCursor
                                        }
                                        edges{
                                            node{
                                                ... productFields
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                fragment productFields on Product{
                    entityId
                    name
                    path
                    sku
                
                    customFields (names: ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4", "Lead-Time", "Lead-Time 2", "Promo Text", "Featured Highlight", "Specs Highlight"]){
                        edges{
                            node{
                                name
                                value
                            }
                        }
                    }

                    brand {
                        name
                    }
                
                    defaultImage {
                        url(width: 500, height: 500)
                    }
                
                    prices {
                        price {
                            ...PriceFields
                        }
                        salePrice {
                            ...PriceFields
                        }
                        retailPrice {
                            ...PriceFields
                        }
                    }
                }
                
                fragment PriceFields on Money {
                    value
                }`;
    }




    /**
     * Fetch product options
     * @param {Number} productid - product id array 
     */

    getProductOptions(productid) {
        return `query getProductOptions{
                    site{
                        products(entityIds:[${productid}]){
                            edges{
                                node{
                                    entityId
                                    productOptions{
                                        edges{
                                            node{
                                                displayName
                                                entityId
                                                    ... on CheckboxOption{
                                                        checkedByDefault
                                                        entityId
                                                    }
                                                    ... on MultipleChoiceOption{
                                                        isRequired
                                                        displayStyle
                                                        values{
                                                            edges{
                                                                node{
                                                                    label
                                                                    entityId
                                                                    ...on SwatchOptionValue{
                                                                        label
                                                                        isDefault
                                                                        imageUrl(width: 500, height: 500)
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }`;
    }



    getVariantData(productId) {
        return `query VariantData {
                site {
                    product(entityId: 124) {
                        options {
                            edges {
                                node {
                                    displayName 
                                    entityId
                                }
                            }
                        }
                        variants(entityIds: 458) {
                            edges {
                                node {
                                    options {
                                        edges {
                                            node {
                                                displayName 
                                                entityId 
                                                values {
                                                    edges {
                                                        node {
                                                            entityId
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }`
    }





    getCategoryData() {
        return `query CategoryTree3LevelsDeep {
                    site {
                        categoryTree {
                        ...CategoryFields
                            children {
                        ...CategoryFields
                                children {
                            ...CategoryFields
                                }
                            }
                        }
                    }
                }

                fragment CategoryFields on CategoryTreeItem {
                    name
                    path
                    entityId
                } `
    }



}