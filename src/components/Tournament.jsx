import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TournamentService from '../services/tournaments-service';
import Swal from 'sweetalert2';

const Tournament = () => {
    const { tournamentId } = useParams();
    const [tournament, setTournament] = useState(null);
    const [rankings, setRankings] = useState([]); // State for rankings
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false); // Track registration state
    const navigate = useNavigate();
    const userId = parseInt(localStorage.getItem('userId'), 10);
    const tournamentService = new TournamentService();

    const fetchRankings = async () => {
        try {
            const rankingsData = await tournamentService.getRankings(tournamentId);
            setRankings(rankingsData);
            // Check if the current user is already registered
            const userIsRegistered = rankingsData.some(ranking => ranking.userId === userId);
            setIsRegistered(userIsRegistered);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        const fetchTournament = async () => {
            try {
                const data = await tournamentService.getTournamentById(tournamentId);
                setTournament(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
        fetchRankings();
    }, [tournamentId, userId]);

    const handleRegister = async () => {
        try {
            const formData = new FormData();
            formData.append('TournamentId', tournamentId);
            formData.append('UserId', userId);
    
            const response = await tournamentService.registerTournament(formData);
    
            if (response.ok) {
                Swal.fire({
                    title: 'Registered successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                setIsRegistered(true);
                fetchRankings(); // Call fetchRankings to update the rankings after registration
            } else {
                const responseBody = await response.text();
                const errorData = responseBody ? JSON.parse(responseBody) : {};
                throw new Error(errorData.message || 'You are already registered');
            }
        } catch (err) {
            Swal.fire({
                title: err.message || 'Registration failed',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
            });
            console.error('Register Error:', err.message); // Log error message
        }
    };
    
    const handleUnregister = async () => {
        try {
            const response = await tournamentService.deleteUserRanking(tournamentId, userId);
    
            if (response.ok) {
                Swal.fire({
                    title: 'Unregistered successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                setIsRegistered(false);
                fetchRankings(); // Call fetchRankings to update the rankings after unregistration
            } else {
                const responseBody = await response.text();
                const errorData = responseBody ? JSON.parse(responseBody) : {};
                throw new Error(errorData.message || 'Failed to unregister');
            }
        } catch (err) {
            Swal.fire({
                title: err.message || 'Unregistration failed',
                icon: 'error',
                timer: 2000,
                showConfirmButton: false
            });
            console.error('Unregister Error:', err.message); // Log error message
        }
    };
    
    
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <div className="container">
            {tournament && (
                <div>
                    <h2>{tournament.name}</h2>
                    <p>Date: {formatDate(tournament.date)}</p> {/* Format date */}
                    <p>Location: {tournament.location}</p>
                    <p>Description: {tournament.description}</p>
                    
                    {/* Disable button if already registered */}
                    <button 
                        className="btn btn-success" 
                        onClick={handleRegister} 
                        disabled={isRegistered}
                    >
                        {isRegistered ? 'Registered' : 'Register for Tournament'}
                    </button>

                    {/* Rankings Section */}
                    <div className="mt-4">
                        <h3>Tournament Participant with Rank</h3>
                        {rankings.length > 0 ? (
                            <ul className="list-group">
                                {rankings.map((rank, index) => (
                                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                        <span>
                                            <strong>Rank {rank.rank || 'Unknown'}:</strong> {rank.userName}
                                        </span>
                                        {/* Show cancel button if the userId matches */}
                                        {rank.userId === userId && (
                                            <button 
                                                className="btn btn-danger btn-sm" 
                                                onClick={handleUnregister}
                                            >
                                                Unregister
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No rankings available yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tournament;
