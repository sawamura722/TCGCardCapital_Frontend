import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import CartItemsService from '../services/carts-service';
import ProductsService from '../services/products-service';

const ProductList = ({ limit }) => { 
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const cartService = new CartItemsService();
    const navigate = useNavigate();
    const [success, setSuccess] = useState(null);
    const productService = new ProductsService();
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    
    // Pagination state
    const itemsPerPage = 9; // Show 9 items per page
    const [currentPage, setCurrentPage] = useState(1);
    
    const fetchProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(limit ? data.slice(0, limit) : data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [limit]);

    const filteredProducts = products.filter(product =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Calculate total pages
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Get current products to display
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    const handleAddToCart = async (productId) => {
        const token = localStorage.getItem('token');
    
        if (!token) {
            navigate('/login');
            return;
        }
    
        const userId = parseInt(localStorage.getItem('userId'), 10);
    
        try {
            const formData = new FormData();
            formData.append('UserId', userId);
            formData.append('ProductId', productId);
            formData.append('Quantity', 1);

            await cartService.addCartItem(formData);
            setSuccess('Added to cart.');
            fetchProducts();
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <div className="container">
            <h2 className="my-4">Products</h2>

            {/* Show search bar only on /products */}
            {location.pathname === '/products' && (
                <div className="input-group mb-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            <div className="row">
                {currentProducts.length > 0 ? (
                    currentProducts.map(product => (
                    <div key={product.productId} className="col-md-4 mb-3">
                        <div className="card shadow">
                            <img 
                                src={product.imageUrl ? `https://localhost:7104/uploads/${product.imageUrl}` : '/path/to/placeholder-image.jpg'} 
                                className="card-img-top" 
                                alt={product.productName}
                            />
                            <div className="card-body">
                                <h5 className="card-title">{product.productName}</h5>
                                <p className="card-text">{product.description || 'No description available'}</p>
                                <p className="card-text">Stock : {product.stock}</p>
                                <p className="card-text">{product.price} ฿</p>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={() => handleAddToCart(product.productId)}>
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-12">
                    <div className="alert alert-info">No products found</div>
                </div>
            )}
            </div>

            {/* Pagination controls */}
            {location.pathname === '/products' && (
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

ProductList.propTypes = {
    onAddToCart: PropTypes.func.isRequired,
};

export default ProductList;
