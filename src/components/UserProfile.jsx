import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProfilesService from '../services/profiles-service';
import RewardsService from '../services/rewards-service';
import Swal from 'sweetalert2';

const UserProfile = () => {
    const { id } = useParams(); // Get userId from URL
    const [profile, setProfile] = useState(null);
    const [claimedRewards, setClaimedRewards] = useState([]);
    const [rewards, setRewards] = useState([]); // State to hold all rewards
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const profilesService = new ProfilesService();
    const rewardsService = new RewardsService();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const userProfile = await profilesService.getUserById(id);
                setProfile(userProfile);

                // Fetch claimed rewards for the user
                const userRewards = await rewardsService.getClaimedRewardsByUserId(id);
                setClaimedRewards(userRewards);

                // Fetch all rewards
                const allRewards = await rewardsService.getRewards();
                setRewards(allRewards); // Store all rewards
            } catch (err) {
                console.error(err);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [id]);

    const handleBuySubscription = async () => {
        try {
            await profilesService.buySub(id);
            Swal.fire({
                title: 'Subscription Activated!',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            // Update profile after successful subscription
            const updatedProfile = await profilesService.getUserById(id);
            setProfile(updatedProfile);
        } catch (err) {
            setError('Failed to activate subscription');
        }
    };

    // Function to format date
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <div className="container">
            <h2>User Profile</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <div>
                <h5>Username: {profile.username}</h5>
                <h5>Location: {profile.location}</h5>
                <h5>Email: {profile.email}</h5>
                <h5>Points: {profile.point}</h5>
                <h5>Subscription Status: {profile.subscriptionStatus ? 'Active' : 'Inactive'}</h5>
                <h5>Joined on: {formatDate(profile.createdAt)}</h5> {/* Use formatDate here */}
                <h5>Last updated: {formatDate(profile.updatedAt)}</h5> {/* Use formatDate here */}

                {claimedRewards.length > 0 ? (
                    <div className='mt-5'>
                        <h5>Claimed Rewards:</h5>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Reward Name</th>
                                    <th>Claimed Date</th>
                                    <th>Extra Reward For Subscriber?</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claimedRewards.map((reward) => {
                                    const rewardDetails = rewards.find(r => r.rewardId === reward.rewardId); // Find reward name
                                    return (
                                        <tr key={reward.userRewardId}>
                                            <td>{rewardDetails ? rewardDetails.rewardName : 'Unknown Reward'}</td>
                                            <td>{formatDate(reward.claimedDate)}</td> {/* Use formatDate here */}
                                            <td>{rewardDetails ? (rewardDetails.isExtraReward ? 'Yes' : 'No') : 'Unknown'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <h5>No rewards claimed yet.</h5>
                )}
                
                {profile.subscriptionStatus === false && (
                    <button className="btn btn-warning mt-3" onClick={handleBuySubscription}>
                        Buy Subscription
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
