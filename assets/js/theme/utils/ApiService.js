
export default class ApiService{
    constructor(args){
        this.settings = {
            environment: "production"
        }
    }


    /**
     * Fetch data from BC
     * @param {string} method - fetch method to api
     * @param {object} args - args object to past to api 
     */
    get = (method, args) => {
        let query = "";

        for (const key in args) {
            if(args[key]){
                query += `&${key}=${args[key]}`;
            }
        }

        return fetch(`https://api.authenteak.io/bigcommerce/${method}?env=${this.settings.environment}${query}`)
                .then(response => response.json())
                .catch((err) => { console.log(err) });
    }

}