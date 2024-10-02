import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RewardsService from '../services/rewards-service';
import AdminSidebar from './AdminSidebar';
import Swal from 'sweetalert2';
import withAdminAuth from './withAdminAuth';

const RewardManagementADMIN = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('list'); // 'list', 'edit', 'create'
    const [currentReward, setCurrentReward] = useState(null);
    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rewardsPerPage] = useState(5); // Adjust how many rewards to show per page

    const rewardsService = new RewardsService();

    const fetchRewards = async () => {
        setLoading(true);
        try {
            const data = await rewardsService.getRewards();
            setRewards(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewardById = async (rewardId) => {
        try {
            const data = await rewardsService.getRewardById(rewardId);
            setCurrentReward(data);
            setFormData({
                RewardName: data.rewardName,
                Description: data.description,
                PointsRequired: data.pointsRequired,
                IsExtraReward: data.isExtraReward
            });
            setMode('edit');
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (id) {
            fetchRewardById(id);
        }
    }, [id]);

    const handleDeleteReward = async (rewardId) => {
        const result = await Swal.fire({
            title: 'Are you sure you want to delete this reward?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it',
        });

        if (result.isConfirmed) {
            try {
                await rewardsService.deleteReward(rewardId);
                setRewards(rewards.filter(reward => reward.rewardId !== rewardId));
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Reward deleted successfully!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (err) {
                setError('Could not delete reward. Please try again later.');
            }
        }
    };

    const handleSubmitReward = async () => {
        const form = new FormData();
        form.append('RewardName', formData.RewardName);
        form.append('Description', formData.Description || '');
        form.append('PointsRequired', formData.PointsRequired);
        form.append('IsExtraReward', formData.IsExtraReward);
        if (imageFile) {
            form.append('Image', imageFile);
        }

        try {
            if (mode === 'edit') {
                await rewardsService.updateReward(currentReward.rewardId, form);
                fetchRewards();
                Swal.fire({
                    title: 'Reward Updated Successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            } else {
                const createdReward = await rewardsService.createReward(form);
                setRewards([...rewards, createdReward]);
                fetchRewards();
                Swal.fire({
                    title: 'Reward Created Successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
            setMode('list');
            setFormData({});
        } catch (err) {
            setError(err.message);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    // Search functionality
    const filteredRewards = rewards.filter(reward =>
        reward && reward.rewardName && reward.rewardName.toLowerCase().includes(searchTerm.toLowerCase())
    );


    // Pagination logic
    const indexOfLastReward = currentPage * rewardsPerPage;
    const indexOfFirstReward = indexOfLastReward - rewardsPerPage;
    const currentRewards = filteredRewards.slice(indexOfFirstReward, indexOfLastReward);
    const totalPages = Math.ceil(filteredRewards.length / rewardsPerPage);

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <div style={{ display: 'flex', height: 'auto' }}>
            <AdminSidebar />
            <div className="main-content" style={{ flex: 1, padding: '20px' }}>
                <div>
                    
                    {mode === 'list' ? (
                        <>
                            <h2>Reward Managerment</h2>
                            <button className="btn btn-primary mt-3 mb-3" onClick={() => setMode('create')}>Add Reward</button>
                            <input
                                type="text"
                                placeholder="Search rewards..."
                                className="form-control mt-2"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Reward Image</th>
                                        <th>Reward Name</th>
                                        <th>Points Required</th>
                                        <th>Extra Reward?</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRewards.map(reward => (
                                        <tr key={reward.rewardId}>
                                            <td>
                                            <img 
                                                    src={reward.imageUrl ? `https://localhost:7104/uploads/${reward.imageUrl}` : '/path/to/placeholder-image.jpg'} 
                                                    style={{ width: '50px', height: 'auto' }} // Set custom width
                                                    alt={reward.rewardName}
                                                    className="img-thumbnail" // Optional: for styling
                                                />
                                            </td>
                                            <td>{reward.rewardName}</td>
                                            <td>{reward.pointsRequired}</td>
                                            <td>{reward.isExtraReward ? 'Yes' : 'No'}</td>
                                            <td>
                                                <button className="btn btn-primary" onClick={() => fetchRewardById(reward.rewardId)}>Edit</button>
                                                <button className="btn btn-danger" onClick={() => handleDeleteReward(reward.rewardId)}>Delete</button>
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
                    ) : (
                        <div className="container" style={{ paddingTop: '56px' }}>
                            <div className="card">
                                <div className="card-body">
                                    <h5>{mode === 'edit' ? 'Update Reward' : 'Create Reward'}</h5>
                                    <div className="form-group">
                                        <label>Reward Name</label>
                                        <input
                                            type="text"
                                            name="RewardName"
                                            className="form-control"
                                            value={formData.RewardName || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            name="Description"
                                            className="form-control"
                                            value={formData.Description || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Points Required</label>
                                        <input
                                            type="number"
                                            name="PointsRequired"
                                            className="form-control"
                                            value={formData.PointsRequired || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Extra Reward for Subscriber?</label>
                                        <input
                                            type="checkbox"
                                            name="IsExtraReward"
                                            className="form-check-input"
                                            checked={!!formData.IsExtraReward}  // Use checked for checkboxes
                                            onChange={(e) => setFormData({ ...formData, IsExtraReward: e.target.checked })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Image</label>
                                        {mode === 'edit' && currentReward && currentReward.imageUrl && (
                                            <img
                                                src={`https://localhost:7104/uploads/${currentReward.imageUrl}`}
                                                alt="Current Reward"
                                                style={{ maxWidth: '100%', marginBottom: '10px' }}
                                            />
                                        )}
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    <button className="btn btn-success" onClick={handleSubmitReward}>
                                        {mode === 'edit' ? 'Update' : 'Create'}
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setMode('list')}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default withAdminAuth(RewardManagementADMIN);
