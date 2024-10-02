class CartItemsService {
    constructor() {
        this.baseUrl = 'https://localhost:7104/api/CartItems'; // Your actual API endpoint
    }

    async addCartItem(formData) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${this.baseUrl}`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error details:', errorData);
                throw new Error('Failed to add cart item');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    }

    async updateCartItem(userId, productId, formData) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}/${userId}/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get response text for better error messages
            console.error('Update failed:', errorText);
            throw new Error('Failed to update cart item');
        }
    }

    async deleteCartItem(userId, productId) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}/${userId}/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete cart item');
        }
    }

    async deleteAllCartItem(userId) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete cart item');
        }
    }

    async getCartItems(userId) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch cart items');
        }

        return await response.json();
    }

    async getProductById(id) {
        const apiUrl = `https://localhost:7104/api/Products/${id}`;

        try {
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`Product with ID ${id} not found.`);
            }

            const product = await response.json();
            return product;
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }
}

export default CartItemsService;
