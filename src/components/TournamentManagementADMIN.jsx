import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TournamentsService from '../services/tournaments-service';
import AdminSidebar from './AdminSidebar';
import withAdminAuth from './withAdminAuth';
import Swal from 'sweetalert2';

const TournamentManagementADMIN = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('list'); // 'list', 'edit', 'create'
    const [currentTournament, setCurrentTournament] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        location: '',
    });

    // Pagination and Search State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Number of tournaments per page
    const [searchQuery, setSearchQuery] = useState('');

    const tournamentService = new TournamentsService();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    // Filter tournaments based on search query
    const filteredTournaments = tournaments.filter(tournament => 
        tournament.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get current tournaments for pagination
    const indexOfLastTournament = currentPage * itemsPerPage;
    const indexOfFirstTournament = indexOfLastTournament - itemsPerPage;
    const currentTournaments = filteredTournaments.slice(indexOfFirstTournament, indexOfLastTournament);

    // Calculate total pages
    const totalPages = Math.ceil(filteredTournaments.length / itemsPerPage);

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const data = await tournamentService.getTournaments();
            setTournaments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTournaments(); 
    }, []);

    const fetchTournamentById = async (tournamentId) => {
        try {
            const data = await tournamentService.getTournamentById(tournamentId);
            setCurrentTournament(data);

            const dateString = data.date;
            const formattedDate = dateString.split('T')[0];

            setFormData({
                name: data.name,
                description: data.description,
                date: formattedDate,
                location: data.location,
            });
            setMode('edit');
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (id) {
            fetchTournamentById(id);
        }
    }, [id]);

    const handleDeleteTournament = async (tournamentId) => {
        Swal.fire({
            title: `Are you sure you want to delete this tournament?`,
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await tournamentService.deleteTournament(tournamentId);
                    setTournaments(tournaments.filter(tournament => tournament.tournamentId !== tournamentId));
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'Tournament deleted!',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                } catch (err) {
                    setError('Could not delete tournament. Please try again later.');
                }
            }
        });
    };

    const handleSubmitTournament = async () => {
        const form = new FormData();
        form.append('Name', formData.name);
        form.append('Description', formData.description || '');
        form.append('Location', formData.location);

        if (formData.date) {
            const dateParts = formData.date.split('-');
            if (dateParts.length === 3) {
                const year = dateParts[0]; 
                const month = dateParts[1].padStart(2, '0');   
                const day = dateParts[2].padStart(2, '0');  
                const formattedDate = `${year}-${month}-${day}`; 
                form.append('Date', formattedDate);
            } else {
                setError('Date format is invalid. Please use YYYY-MM-DD.');
                return;
            }
        } else {
            setError('Date is required.');
            return;
        }

        try {
            if (mode === 'edit') {
                await tournamentService.updateTournament(currentTournament.tournamentId, form);
                Swal.fire({
                    title: 'Updated!',
                    text: 'Tournament updated!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                const createdTournament = await tournamentService.createTournament(form);
                setTournaments([...tournaments, createdTournament]);
                Swal.fire({
                    title: 'Created!',
                    text: 'Tournament created!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
            fetchTournaments();
            setMode('list');
            setFormData({
                name: '',
                description: '',
                date: '',
                location: '',
            });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <AdminSidebar />
                <div className="col-10">
                    <h1>Tournament Management</h1>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {loading ? (
                        <p>Loading tournaments...</p>
                    ) : (
                        <>
                            {mode === 'create' || mode === 'edit' ? (
                                <div className="mb-3">
                                    <h2>{mode === 'edit' ? 'Edit Tournament' : 'Create Tournament'}</h2>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Tournament Name"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <textarea
                                        name="description"
                                        placeholder="Description"
                                        className="form-control mt-2"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                    <input
                                        type="date"
                                        name="date"
                                        className="form-control mt-2"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="Location"
                                        className="form-control mt-2"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <button className="btn btn-success mt-3" onClick={handleSubmitTournament}>
                                        {mode === 'edit' ? 'Update Tournament' : 'Create Tournament'}
                                    </button>
                                    <button className="btn btn-secondary mt-3 ms-2" onClick={() => setMode('list')}>
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button className="btn btn-primary" onClick={() => setMode('create')}>Create Tournament</button>
                                    <div className="d-flex justify-content-between align-items-center mb-3 mt-3">
                                        <input 
                                            type="text" 
                                            placeholder="Search Tournaments" 
                                            className="form-control" 
                                            value={searchQuery} 
                                            onChange={(e) => setSearchQuery(e.target.value)} 
                                        />
                                    </div>
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Date</th>
                                                <th>Location</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentTournaments.map(tournament => (
                                                <tr key={tournament.tournamentId}>
                                                    <td>{tournament.name}</td>
                                                    <td>{formatDate(tournament.date)}</td>
                                                    <td>{tournament.location}</td>
                                                    <td>
                                                        <button className="btn btn-primary" onClick={() => fetchTournamentById(tournament.tournamentId)}>Edit</button>
                                                        <button className="btn btn-danger" onClick={() => handleDeleteTournament(tournament.tournamentId)}>Delete</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <nav>
                                        <ul className="pagination">
                                            {Array.from({ length: totalPages }, (_, index) => (
                                                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                    <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                                                        {index + 1}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default withAdminAuth(TournamentManagementADMIN);
