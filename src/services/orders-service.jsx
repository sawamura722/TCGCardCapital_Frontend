class OrdersService {
    constructor() {
        this.baseUrl = 'https://localhost:7104/api/Orders'; // Your actual API endpoint
    }

    async createOrder(formData) {
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
                throw new Error('Failed to create order');
            }
    
            const createdOrder = await response.json(); // Get the created order's data
            return createdOrder; // Return the created order
        } catch (error) {
            console.error('Error creating order', error);
            throw error;
        }
    }
    

    async createOrderDetail(formData) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`https://localhost:7104/api/OrderDetails`, {
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
                throw new Error('Failed to create order detail');
            }
        } catch (error) {
            console.error('Error create order detail', error);
            throw error;
        }
    }

    async getOrderById(userId) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${this.baseUrl}/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Order with ID ${userId} not found.`);
            }

            const order = await response.json();
            return order;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    }

    async getOrders() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${this.baseUrl}`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`error fetching orders`);
            }

            const orders = await response.json();
            return orders;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    }

    async getOrderDetails() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`https://localhost:7104/api/OrderDetails`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`error fetching order details`);
            }

            const orders = await response.json();
            return orders;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw error;
        }
    }

    async deleteOrder(id) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token, // Send the token as is (already includes 'Bearer ')
                'Accept': 'application/json',
            }
        });

        const responseText = await response.text();
        console.log('Delete response:', responseText); // Log the response text

        if (!response.ok) {
            const errorText = await response.text(); // Get response text for better error messages
            console.error('Delete failed:', errorText);
            throw new Error('Failed to delete order');
        }
    }

    async updateOrder(id, formData) {
        const token = localStorage.getItem('token'); // Get the token from localStorage

        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token, // Send the token as is (already includes 'Bearer ')
                'Accept': 'application/json',
                
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get response text for better error messages
            console.error('Update failed:', errorText);
            throw new Error('Failed to update order');
        }
    }    
}

export default OrdersService;
