import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import ProductList from './components/product-list';
import Cart from './components/cart';
import AlertWindow from './alert-window';
import Header from './components/Header';
import Footer from './Footer';
import ProductsService from './services/products-service';
import CartItemsService from './services/carts-service';
import TournamentsService from './services/tournaments-service';
import Contact from './Contact';
import Login from './components/Login';
import Register from './components/Register';
import { UserProvider } from './components/UserContext';
import ProductManagementADMIN from './components/ProductManagementADMIN';
import Checkout from './components/Checkout';
import Order from './components/Order';
import TournamentsList from './components/Tournament-list';
import Tournament from './components/Tournament';
import TournamentManagementADMIN from './components/TournamentManagementADMIN';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import OrderManagementADMIN from './components/OrderManagementADMIN';
import RewardManagementADMIN from './components/RewardManagementADMIN';
import RewardList from './components/Reward-list';

const App = () => {
    const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart') || '{}'));
    const [products, setProducts] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const productService = new ProductsService(); 
    const tournamentService = new TournamentsService();
    const userId = parseInt(localStorage.getItem('userId'), 10);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await productService.getProducts();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [productService]);


    const getTotalItemsInCart = () => {
        return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
    };

    const handleCartClick = () => {
        
        setIsCartOpen(!isCartOpen);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <UserProvider>
            <Router>
                <div className="wrapper">
                <Header totalitem={getTotalItemsInCart()} onCartClick={handleCartClick} />
                    <main className="main">
                        <Routes>
                            <Route path="/products" element={<ProductList />} />
                            <Route path="/cart" element={<Cart 
                                cart={cart} 
                                userId={userId} />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/" element={<Main />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />                         
                            <Route path="/admin/products" element={<ProductManagementADMIN />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/order/:id" element={<Order />} />
                            <Route path="/tournaments" element={<TournamentsList />} />
                            <Route path="/tournament/:tournamentId" element={<Tournament />} />
                            <Route path="/admin/tournaments" element={<TournamentManagementADMIN />} />
                            <Route path="/profile/:id" element={<UserProfile />} />
                            <Route path="/admin/admindashboard" element={<AdminDashboard />} />
                            <Route path="/admin/orders" element={<OrderManagementADMIN />} />
                            <Route path="/admin/rewards" element={<RewardManagementADMIN />} />
                            <Route path="/rewards" element={<RewardList />} />

                        </Routes>
                    </main>
                    <Footer />
                    <AlertWindow message={alertMessage} onClose={() => setAlertMessage('')} />
                    {isCartOpen && (
                        <div className="cart-modal">
                            <Cart 
                                cart={cart} 
                                userId={userId}
                                onCloseCart={handleCartClick} 
                            />
                        </div>
                    )}
                </div>
            </Router>
        </UserProvider>
    );
};

const Main = ({ onAddToCart }) => {
    return (
        <main className="container" style={{ paddingTop: '56px' }}>
            <Jumbotron />
            <ProductList onAddToCart={onAddToCart} limit={3} />
            <div className="d-flex justify-content-center">
                <Link to="/products" className="btn btn-success">View All Products</Link> {/* View All button for Products */}
            </div>
            <br />
            <TournamentsList limit={3} />
            <div className="d-flex justify-content-center">
                <Link to="/tournaments" className="btn btn-success">View All Tournaments</Link> {/* View All button for Tournaments */}
            </div>
            <br />
            <RewardList limit={3} />
            <div className="d-flex justify-content-center">
                <Link to="/rewards" className="btn btn-success">View All Rewards</Link> {/* View All button for Rewards */}
            </div>
        </main>
    );
};



const Jumbotron = () => {
    return (
        <div className="jumbotron">
            <h1 className="display-4">Welcome to TCG Card Capital</h1>
            <p className="lead">Best Trading Card Games shop in the World!</p>
            <hr className="my-4" />
            <p>Buy please</p>
            
        </div>
    );
};

export default App;