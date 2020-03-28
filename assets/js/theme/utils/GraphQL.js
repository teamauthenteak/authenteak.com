/** -----------------------------------------
 * GraphQL Service
 * Fetches the BC GraphOL API Endpoint
 * - may move this into app.js - not sure if this is needed externally
 * ------------------------------------------ */

export default class GraphQL {
    constructor(){
        this.graphEndpoint = 'https://authenteak.com/graphql';

        this.settings = {
            method: 'POST',
            credentials: 'include',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ TEAK.Utils.isLocal() ? TEAK.Globals.graphQl_dev : TEAK.Globals.graphQl }`
            }
        };

    }



    /**
     * Fetches Data from BigCommerce GraphQL Service
     * @param {Object} queryObj - custom graphql contract 
     */
    get(queryObj){
        return fetch(this.graphEndpoint, Object.assign(this.settings, {
                body: JSON.stringify({
                    query: queryObj
                })
            }))
            .then(res => res.json())
            .then(res => res.data);
    } 




    /**
     * Querty to get basic single product information
     * Used on Product Recommendations
     * @param {Array} arr - Array of product ids 
     */

    getProductInfo(arr){
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
     * Fetch a given Category Products
     * @param {string} args.path - URL path of current category
     * @param {number} args.qty - number of products to get = currently limited to 8 due to complexity
     */
    getCategoryByUrl(args){
        return `query getCategoryByUrl{
                    site{
                        route(path: ${args.path}){
                            node{
                                ... on Category{
                                    name
                                    products (first: ${args.qty}){
                                        pageInfo {
                                            startCursor
                                            endCursor
                                        }
                                        edges{
                                            cursor
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
                    minPurchaseQuantity
                    maxPurchaseQuantity
                
                    customFields (names: ["Highlight 1", "Highlight 2", "Highlight 3", "Lead-Time", "Lead-Time 2", "Promo Text"]){
                        edges{
                            node{
                                name
                                value
                                entityId
                            }
                        }
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
                    }
                }
                
                fragment PriceFields on Money {
                    value
                }`;
    }



    /**
     * Fetch product options
     * @param {Array} arr - product id array 
     */
    getProductOptions(arr){
        return `query getProductOptionInfo{
                    pageInfo {
                        startCursor
                        endCursor
                    }
                    site{
                        products(entityIds:[${arr}]){
                            edges{
                                node{
                                    entityId
                                    options{
                                        edges{
                                            node{
                                                displayName
                                                isRequired
                                                values{
                                                    edges{
                                                        node{
                                                            label
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
                }`;
    }




}