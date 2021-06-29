import GraphQL from "../graphql/GraphQL";

export default class CartApp{
    constructor(){
        this.graphQL = new GraphQL();

		this.productQuery = this.graphQL.getCartProductInfo("7240, 2864, 2389, 2477, 7907, 7669");

		this.graphQL.get(this.productQuery).then((data) => {
			console.log(data)
		})
    }
}