import React, { useState, useEffect } from 'react';
import OrdersService from '../services/orders-service';
import ProductsService from '../services/products-service';
import ProfilesService from '../services/profiles-service';
import TournamentsService from '../services/tournaments-service';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // Required for Chart.js to work
import AdminSidebar from './AdminSidebar';
import withAdminAuth from './withAdminAuth';

const AdminDashboard = () => {
    const [totalOrders, setTotalOrders] = useState(0);
    const [totalProductsSold, setTotalProductsSold] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [last7DaysRevenue, setLast7DaysRevenue] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalSubscribedUsers, setTotalSubscribedUsers] = useState(0);
    const [latestOrders, setLatestOrders] = useState([]);
    const [totalTournaments, setTotalTournaments] = useState(0);
    const [salesByCategory, setSalesByCategory] = useState([]);
    const [bestsellers, setBestsellers] = useState([]);
    const [dailyRevenues, setDailyRevenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);

    const ordersService = new OrdersService();
    const productsService = new ProductsService();
    const profilesService = new ProfilesService();
    const tournamentsService = new TournamentsService();

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await fetchOrdersData();
            await fetchProductsData();
            await fetchUserData();
            await fetchTournamentsData();
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrdersData = async () => {
        try {
            const orders = await ordersService.getOrders();
            setTotalOrders(orders.length);

            const orderDetails = await ordersService.getOrderDetails();
            const productsSold = orderDetails.reduce((acc, detail) => acc + detail.quantity, 0);
            setTotalProductsSold(productsSold);

            const today = new Date().toISOString().split('T')[0];
            const todayOrders = orders.filter(order => order.orderDate.split('T')[0] === today);
            const todayRevenue = todayOrders.reduce((acc, order) => acc + order.totalAmount, 0);
            setTodayRevenue(todayRevenue);

            const last7Days = Array(7).fill(0);
            const todayDate = new Date();
            orders.forEach(order => {
                const orderDate = new Date(order.orderDate);
                const daysDifference = Math.floor((todayDate - orderDate) / (1000 * 3600 * 24));
                if (daysDifference >= 0 && daysDifference < 7) {
                    last7Days[daysDifference] += order.totalAmount;
                }
            });
            setDailyRevenues(last7Days.reverse()); // Reverse before setting state
            const last7DaysRevenue = last7Days.reduce((acc, revenue) => acc + revenue, 0);
            setLast7DaysRevenue(last7DaysRevenue);

            const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
            setTotalRevenue(totalRevenue);

            setLatestOrders(orders.slice(-5));
        } catch (error) {
            console.error('Error fetching order data:', error);
            throw error;
        }
    };

    const fetchProductsData = async () => {
        try {
            const products = await productsService.getProducts();
            setTotalProducts(products.length);

            const categories = await productsService.getCategories();
            setCategories(categories);

            const salesByCategory = categories.map(category => {
                const sales = products.filter(product => product.categoryId === category.categoryId)
                    .reduce((acc, product) => acc + product.stock, 0);
                return { name: category.categoryName, sales };
            });
            setSalesByCategory(salesByCategory);

            const bestsellers = products.sort((a, b) => b.stock - a.stock).slice(0, 5);
            setBestsellers(bestsellers);
        } catch (error) {
            console.error('Error fetching product data:', error);
            throw error;
        }
    };

    const fetchUserData = async () => {
        try {
            const users = await profilesService.getUsers();
            setTotalUsers(users.length);

            const subscribedUsers = users.filter(user => user.subscriptionStatus);
            setTotalSubscribedUsers(subscribedUsers.length);
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw error;
        }
    };

    const fetchTournamentsData = async () => {
        try {
            const tournaments = await tournamentsService.getTournaments();
            setTotalTournaments(tournaments.length);
        } catch (error) {
            console.error('Error fetching tournament data:', error);
            throw error;
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    };

    const chartData = {
        labels: ['Day 7', 'Day 6', 'Day 5', 'Day 4', 'Day 3', 'Day 2', 'Today'],
        datasets: [
            {
                label: 'Revenue (Last 7 Days)',
                data: dailyRevenues,
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.2)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <div style={{ display: 'flex', height: 'auto' }}>
            <AdminSidebar />
            <div className="main-content" style={{ flex: 1, padding: '20px' }}>
                <h1 className="mb-4">Admin Dashboard</h1>
    
                {/* Top row for cards */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card p-4 shadow-sm border">
                            <h2>Sales by Category</h2>
                            <ul>
                                {salesByCategory.map((category, index) => (
                                    <li key={index}>
                                        {category.name}: {category.sales} sold
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="col-md-3">
                        <div className="card p-4 shadow-sm border">
                            <h2>Revenue</h2>
                            <p>Today's Revenue: {todayRevenue} ฿</p>
                            <p>Last 7 Days: {last7DaysRevenue} ฿</p>
                            <p>Total Revenue: {totalRevenue} ฿</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card p-4 shadow-sm border">
                            <h2>Users</h2>
                            <p>Total Users: {totalUsers}</p>
                            <p>Subscribed Users: {totalSubscribedUsers}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card p-4 shadow-sm border">
                            <h2>Products</h2>
                            <p>Total Products: {totalProducts}</p>
                        </div>
                    </div>
                </div>
    
                {/* Middle row for the chart */}
                <div className="row mb-5">
                    <div className="col-12 shadow-sm border">                      
                        <h2 className="p-3">Revenue Chart</h2>
                        <div style={{ height: '50vh', width: '100%' }}>
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Sales by category and best seller */}
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card p-4 shadow-sm border">
                            <h2>Orders</h2>
                            <p>Total Orders: {totalOrders}</p>
                            <p>Products Sold: {totalProductsSold}</p>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card p-4 shadow-sm border">
                            <h2>Bestsellers</h2>
                            <ul>
                                {bestsellers.map((product, index) => (
                                    <li key={index}>
                                        {product.productName}: {product.stock} sold
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
    
                {/* Latest Orders */}
                <h2>Latest Orders</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User</th>
                            <th>Date</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {latestOrders.map(order => (
                            <tr key={order.orderId}>
                                <td>{order.orderId}</td>
                                <td>{order.firstName} {order.lastName}</td>
                                <td>{formatDate(order.orderDate)}</td>
                                <td>{order.totalAmount} ฿</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default withAdminAuth(AdminDashboard);
