class TournamentsService {
    baseUrl = 'https://localhost:7104/api/Tournaments'; 
    registerUrl = 'https://localhost:7104/api/TournamentRegistrations';
    rankingUrl = 'https://localhost:7104/api/TournamentRankings';

    async getTournaments() {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch products');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching tournaments:', error);
            throw new Error('Could not load tournaments. Please try again later.');
        }
    }

    async getTournamentById(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch tournament');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching tournament:', error);
            throw new Error('Could not load tournament. Please try again later.');
        }
    }

    async createTournament(formData) {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json',
                },
                body: formData,
            });
            if (!response.ok) {
                throw new Error('Failed to create tournament');
            }
            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async updateTournament(id, formData) {
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json',
                },
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json(); // Log the error response for debugging
                console.error('Update Error:', errorData);
                throw new Error(errorData.message || 'Failed to update tournament');
            }
    
            // Only parse the response if it's not empty
            const responseBody = await response.text();
            return responseBody ? JSON.parse(responseBody) : {}; // Handle empty response
    
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    async deleteTournament(tournamentId) {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${this.baseUrl}/${tournamentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token, 
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete tournament');
            }
            return true;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async deleteUserRanking(tournamentId, userId) {
        const token = localStorage.getItem('token');
    
        try {
            const response = await fetch(`${this.rankingUrl}/${tournamentId}/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token, 
                    'Accept': 'application/json',
                }
            });
    
            // Check if the response is a success based on status code
            return response;
        } catch (error) {
            throw new Error(error.message);
        }
    }
    

    async registerTournament(formData) {
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`${this.registerUrl}`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            return response;

        } catch (error) {
            throw new Error(error.message);
        }
    }

    async getRankings(tournamentId) {
        try {
            const response = await fetch(`${this.rankingUrl}/${tournamentId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Failed to fetch ranking');

            const data = await response.json();
            return data; // Return the fetched data
        } catch (error) {
            console.error('Error fetching ranking:', error);
            throw new Error('Could not load ranking. Please try again later.');
        }
    }
}

export default TournamentsService;
