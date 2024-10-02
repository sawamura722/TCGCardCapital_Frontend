class RewardsService {
    constructor() {
        this.baseUrl = 'https://localhost:7104/api/Rewards'; // Your actual API endpoint
        this.userReward = 'https://localhost:7104/api/UserRewards';
    }

    async getRewards() {
        try {
            const response = await fetch(`${this.baseUrl}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch rewards');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching rewards:', error);
            throw new Error('Could not load rewards. Please try again later.');
        }
    }

    async getRewardById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch reward');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching reward:', error);
            throw new Error('Could not load reward. Please try again later.');
        }
    }

    async createReward(formData) {
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
                throw new Error('Failed to create reward');
            }
        } catch (error) {
            console.error('Error create reward', error);
            throw error;
        }
    }

    async updateReward(id, formData) {
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
            throw new Error('Failed to update reward');
        }
    }    

    async deleteReward(id) {
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
            throw new Error('Failed to delete reward');
        }
    }

    async getClaimedRewardsByUserId(userId) {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${this.userReward}/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch rewards');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching rewards:', error);
            throw new Error('Could not load rewards. Please try again later.');
        }
    }

    async getClaimedRewardByUserId(userId, rewardId) {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${this.userReward}/${userId}/${rewardId}`, {
                method: 'GET',
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch reward');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching reward:', error);
            throw new Error('Could not load reward. Please try again later.');
        }
    }

    async createClaimedReward(formData) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${this.userReward}`, {
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
                throw new Error('Failed to create user claimed reward');
            }
        } catch (error) {
            console.error('Error create user claimed reward', error);
            throw error;
        }
    }

    async deleteClaimedReward(userId, rewardId) {
        const token = localStorage.getItem('token');

        const response = await fetch(`${this.userReward}/${userId}/${rewardId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': token,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete claimed reward');
        }
    }
}

export default RewardsService;