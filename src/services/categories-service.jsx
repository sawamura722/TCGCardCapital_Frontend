class CategoriesService {
    constructor() {
        this.baseUrl = 'https://localhost:7104/api/Categories'; // Your actual API endpoint
    }

    async getCategories() {
        try {
            const response = await fetch(`${this.baseUrl}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch categories');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw new Error('Could not load categories. Please try again later.');
        }
    }

    async getCategory(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch category');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching category:', error);
            throw new Error('Could not load category. Please try again later.');
        }
    }

    async createCategory(formData) { 
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
                throw new Error('Failed to create the category.');
            }

        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    async updateCategory(id, formData) {
        const token = localStorage.getItem('token'); 

        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token, 
                'Accept': 'application/json',
                
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text(); 
            console.error('Update failed:', errorText);
            throw new Error('Failed to update product');
        }
    }    
    
    async deleteCategory(id) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token, 
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); 
            console.error('Delete failed:', errorText);
            throw new Error('Failed to delete category');
        }
    }
}

export default CategoriesService;