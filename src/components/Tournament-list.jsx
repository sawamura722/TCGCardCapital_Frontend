import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import TournamentService from '../services/tournaments-service';

const TournamentsList = ({ limit }) => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    const tournamentService = new TournamentService();

    // Pagination state
    const itemsPerPage = 9; // Show 9 items per page
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const data = await tournamentService.getTournaments();
                setTournaments(limit ? data.slice(0, limit) : data); // Show limited or all tournaments
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
    }, [limit]);

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    // Filter tournaments based on the search query
    const filteredTournaments = tournaments.filter(tournament =>
        tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate total pages
    const totalPages = Math.ceil(filteredTournaments.length / itemsPerPage);

    // Get current tournaments to display
    const indexOfLastTournament = currentPage * itemsPerPage;
    const indexOfFirstTournament = indexOfLastTournament - itemsPerPage;
    const currentTournaments = filteredTournaments.slice(indexOfFirstTournament, indexOfLastTournament);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <div className="container">
            <h2 className="my-4">Tournaments</h2>

            {/* Show search bar only on /tournaments */}
            {location.pathname === '/tournaments' && (
                <div className="input-group mb-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search for tournaments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            <div className="row">
                {currentTournaments.length > 0 ? (
                    currentTournaments.map(tournament => (
                        <div key={tournament.tournamentId} className="col-md-4 mb-3">
                            <div className="card shadow">
                                <div className="card-body">
                                    <h5 className="card-title">{tournament.name}</h5>
                                    <p className="card-text">Date: {formatDate(tournament.date)}</p>
                                    <p className="card-text">Location: {tournament.location}</p>
                                    <Link to={`/tournament/${tournament.tournamentId}`} className="btn btn-primary">
                                        View Tournament
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="alert alert-info">No tournaments found</div>
                    </div>
                )}
            </div>

            {/* Pagination controls */}
            {location.pathname === '/tournaments' && (
                <nav aria-label="Page navigation">
                    <ul className="pagination justify-content-center">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                                    {index + 1}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default TournamentsList;
