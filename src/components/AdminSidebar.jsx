import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = () => {
    return (
        <div className="admin-sidebar" style={{ width: '200px', float: 'left', padding: '20px', backgroundColor: '#000000' }}>
            <h2 style={{ color: '#ffffff' }}>Admin Panel</h2>
            <ul className="list-unstyled">
                <li>
                    <Link to="/admin/admindashboard">Admin Dashboard</Link>
                </li>
                <br />
                <li>
                    <Link to="/admin/products">Manage Products</Link>
                </li>
                <br />
                <li>
                    <Link to="/admin/tournaments">Manage Tournaments</Link>
                </li>
                <br />
                <li>
                    <Link to="/admin/orders">Manage Orders</Link>
                </li>
                <br />
                <li>
                    <Link to="/admin/rewards">Manage Rewards</Link>
                </li>
            </ul>
        </div>
    );
};

export default AdminSidebar;
