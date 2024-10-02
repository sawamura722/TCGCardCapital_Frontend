class ProfilesService {
    constructor() {
        this.baseUrl = 'https://localhost:7104/api/UserProfiles'; // Your actual API endpoint
    }

    async getUsers() {
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
                throw new Error(`error fetching users`);
            }

            const users = await response.json();
            return users;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    }

    async getUserById(userId) {
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
                throw new Error(`User with ID ${userId} not found.`);
            }

            const order = await response.json();
            return order;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }

    async updateUser(userId, formData) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}/${userId}`, {
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
            throw new Error('Failed to update user data');
        }
    }

    async buySub(userId) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}/sub/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get response text for better error messages
            console.error('Buy sub failed:', errorText);
            throw new Error('Failed to buy sub');
        }
    }

    async increasePoint(userId, formData) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}/pointInc/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get response text for better error messages
            console.error('Increase point failed:', errorText);
            throw new Error('Failed to increase user point');
        }
    }

    async decreasePoint(userId, formData) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.baseUrl}/pointDec/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get response text for better error messages
            console.error('Decrease point failed:', errorText);
            throw new Error('Failed to decrease user point');
        }
    }
}

export default ProfilesService;
