class ProductsService {
    constructor() {
        if (!ProductsService._instance) {
            ProductsService._instance = this;
            this.products = null; // Initialize products as null to load only once
        }
        return ProductsService._instance;
    }

    // Fetch all products
    async getProducts() {
        try {
            const response = await fetch('https://localhost:7104/api/Products', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch products');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Could not load products. Please try again later.');
        }
    }

    async getProductById(id) {
        try {
            const response = await fetch(`https://localhost:7104/api/Products/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch products');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Could not load products. Please try again later.');
        }
    }

    async createProduct(formData) { // Accept formData directly
        const apiUrl = `https://localhost:7104/api/Products`;

        const token = localStorage.getItem('token'); // Get the token from localStorage

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': token, // Include the token for authorization
                    'Accept': 'application/json',
                },
                body: formData, // Send FormData directly
            });

            if (!response.ok) {
                throw new Error('Failed to create the product.');
            }

            const newProduct = await response.json();
            return newProduct;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }    

    async updateProduct(id, formData) {
        const token = localStorage.getItem('token'); // Get the token from localStorage

        const response = await fetch(`https://localhost:7104/api/Products/${id}`, {
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
            throw new Error('Failed to update product');
        }
    }     

    async deleteProduct(id) {
        const token = localStorage.getItem('token');

        const response = await fetch(`https://localhost:7104/api/Products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token, // Send the token as is (already includes 'Bearer ')
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get response text for better error messages
            console.error('Delete failed:', errorText);
            throw new Error('Failed to delete product');
        }
    }

    async getCategories() {
        const apiUrl = `https://localhost:7104/api/Categories`; 

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const categories = await response.json();
            return categories;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }
}

export default ProductsService;
