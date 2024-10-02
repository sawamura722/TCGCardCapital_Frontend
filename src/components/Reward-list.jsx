import React, { useEffect, useState } from 'react';
import RewardsService from '../services/rewards-service';
import { Link, useLocation } from 'react-router-dom';

const RewardList = ({ limit }) => {
    const [rewards, setRewards] = useState([]);
    const [claimedRewards, setClaimedRewards] = useState([]); // State to store claimed rewards
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const rewardsService = new RewardsService();
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();

    // Assuming userId is stored in localStorage
    const userId = localStorage.getItem('userId');

    // Pagination state
    const itemsPerPage = 9; // Show 9 items per page
    const [currentPage, setCurrentPage] = useState(1);

    const fetchRewards = async () => {
        try {
            const data = await rewardsService.getRewards(); // Fetch rewards
            setRewards(limit ? data.slice(0, limit) : data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchClaimedRewards = async () => {
        if (userId) {
            try {
                const claimedRewardsData = await rewardsService.getClaimedRewardsByUserId(userId);
                // Extract only the reward IDs
                setClaimedRewards(claimedRewardsData.map(reward => reward.rewardId));
            } catch (err) {
                console.error('Failed to fetch claimed rewards:', err);
            }
        }
    };

    useEffect(() => {
        Promise.all([fetchRewards(), fetchClaimedRewards()]).finally(() => {
            setLoading(false);
        });
    }, [userId]);

    const filteredRewards = rewards.filter(reward =>
        reward.rewardName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate total pages
    const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);

    // Get current rewards to display
    const indexOfLastReward = currentPage * itemsPerPage;
    const indexOfFirstReward = indexOfLastReward - itemsPerPage;
    const currentRewards = filteredRewards.slice(indexOfFirstReward, indexOfLastReward);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <div className="container">
            <h2 className="my-4">Rewards</h2>

            {/* Show search bar only on /rewards */}
            {location.pathname === '/rewards' && (
                <div className="input-group mb-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search for rewards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            <div className="row">
                {currentRewards.length > 0 ? (
                    currentRewards.map(reward => (
                        <div key={reward.rewardId} className="col-md-4 mb-3">
                            <div className={`card shadow ${claimedRewards.includes(reward.rewardId) ? 'border-success' : ''}`}>
                                <img
                                    src={reward.imageUrl ? `https://localhost:7104/uploads/${reward.imageUrl}` : '/path/to/placeholder-image.jpg'}
                                    className="card-img-top"
                                    alt={reward.rewardName}
                                />
                                <div className="card-body">
                                    <h5 className="card-title">{reward.rewardName}</h5>
                                    <p className="card-text">{reward.description || 'No description available'}</p>
                                    <p className="card-text">Points Required: {reward.pointsRequired}</p>
                                     {/* Display if the reward is an extra reward for subscribers */}
                                    <p className="card-text">
                                        For Subscriber? : 
                                        <span className={reward.isExtraReward ? "text-success" : "text-muted"}>
                                            {reward.isExtraReward ? "Yes" : "No"}
                                        </span>
                                    </p>
                                    {claimedRewards.includes(reward.rewardId) && (
                                        <span className="badge bg-success">Claimed</span> // Indicate that the reward is claimed
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="alert alert-info">No rewards found</div>
                    </div>
                )}
            </div>

            {/* Pagination controls */}
            {location.pathname === '/rewards' && (
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

export default RewardList;
