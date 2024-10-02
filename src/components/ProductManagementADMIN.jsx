import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductsService from '../services/products-service';
import CategoriesService from '../services/categories-service'; // Import the CategoriesService
import AdminSidebar from './AdminSidebar';
import Swal from 'sweetalert2';
import withAdminAuth from './withAdminAuth';

const ProductManagementADMIN = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Product state
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('list'); // 'list', 'edit', 'create'
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({}); // Unified state for form inputs
    const [imageFile, setImageFile] = useState(null);
    const [categories, setCategories] = useState([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // Adjust this value as needed
    const [totalProducts, setTotalProducts] = useState(0);

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    // Category state
    const [categoryMode, setCategoryMode] = useState('list'); // 'list', 'edit', 'create'
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categoryFormData, setCategoryFormData] = useState({}); // Unified state for category form inputs

    const productService = new ProductsService();
    const categoriesService = new CategoriesService();

    // Fetch products
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts();
            setProducts(data);
            setTotalProducts(data.length); // Set total products for pagination
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const categoryData = await categoriesService.getCategories();
            setCategories(categoryData);
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredProducts = products.filter(product =>
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch individual product data when in edit mode    
    const fetchProductById = async (productId) => {
        try {
            const data = await productService.getProductById(productId);
            setCurrentProduct(data);
            setFormData({
                ProductName: data.productName,
                Description: data.description,
                Price: data.price,
                Stock: data.stock,
                CategoryId: data.categoryId,
                ImageUrl: data.imageUrl

            });
            setMode('edit');
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProductById(id);
        }
    }, [id]);

    // Delete product
    const handleDeleteProduct = async (productId) => {
        const result = await Swal.fire({
            title: 'Are you sure you want to delete this product?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        });

        if (result.isConfirmed) {
            try {
                await productService.deleteProduct(productId);
                setProducts(products.filter(product => product.productId !== productId));
                setTotalProducts(totalProducts - 1); // Update total products
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Product deleted successfully!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                setError('Could not delete product. Please try again later.');
            }
        }
    };

    // Handle product form submission
    const handleSubmitProduct = async (e) => {
        e.preventDefault();

        const form = new FormData();
        form.append('ProductName', formData.ProductName);
        form.append('Description', formData.Description || '');
        form.append('Price', formData.Price);
        form.append('Stock', formData.Stock);
        form.append('CategoryId', formData.CategoryId);
        if (imageFile) {
            form.append('Image', imageFile);
        }

        try {
            if (mode === 'edit') {
                await productService.updateProduct(currentProduct.productId, form);
                fetchProducts();
                Swal.fire({
                    title: 'Product Updated Successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                const createdProduct = await productService.createProduct(form);
                setProducts([...products, createdProduct]);
                setTotalProducts(totalProducts + 1); // Update total products
                fetchProducts();
                Swal.fire({
                    title: 'Product Created Successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            fetchProducts();
            setMode('list');
            setFormData({});
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle input change for product form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle category form submissions
    const handleSubmitCategory = async () => {
        const formData = new FormData();
        formData.append('CategoryName', categoryFormData.CategoryName);

        try {
            if (categoryMode === 'edit') {
                await categoriesService.updateCategory(currentCategory.categoryId, formData);
                fetchCategories();
                Swal.fire({
                    title: 'Category Updated Successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                await categoriesService.createCategory(formData);
                fetchCategories();
                Swal.fire({
                    title: 'Category Created Successfully',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            setCategoryMode('list');
            setCategoryFormData({});
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCategoryInputChange = (e) => {
        const { name, value } = e.target;
        setCategoryFormData({ ...categoryFormData, [name]: value });
    };

    // Delete category
    const handleDeleteCategory = async (categoryId) => {
        const result = await Swal.fire({
            title: 'Are you sure you want to delete this category?',
            text: "This action cannot be undone!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        });

        if (result.isConfirmed) {
            try {
                await categoriesService.deleteCategory(categoryId);
                setCategories(categories.filter(category => category.categoryId !== categoryId));
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Category deleted successfully!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                Swal.fire({
                    title: 'Could not delete this category',
                    text: 'Please delete any products in this category first!',
                    icon: 'error',
                    timer: 4000,
                    showConfirmButton: false
                });
            }
        }
    };

    // Handle category editing
    const fetchCategoryById = async (categoryId) => {
        try {
            const data = await categoriesService.getCategory(categoryId);
            setCurrentCategory(data);
            setCategoryFormData({
                CategoryName: data.categoryName
            });
            setCategoryMode('edit');
        } catch (err) {
            setError(err.message);
        }
    };

    // Calculate current products for pagination
    const indexOfLastProduct = currentPage * itemsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

    // Handle page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Create pagination buttons
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(filteredProducts.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-danger text-center">{error}</div>;

    return (
        <div className="row">
            <AdminSidebar />
            <div className="col">
                <h1 className="text-center">Product Management</h1>

                

                <div>
                    {mode === 'list' ? (
                        <div>
                            <button onClick={() => setMode('create')} className="btn btn-primary">Create New Product</button>

                            <div className="mb-3 mt-3">
                                <input
                                    type="text"
                                    placeholder="Search Products..."
                                    className="form-control"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="mt-3">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Product Image</th>
                                            <th>Product Name</th>
                                            <th>Category</th>
                                            <th>Description</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentProducts.map(product => (
                                            <tr key={product.productId}>
                                                <td>
                                                    <img 
                                                        src={product.imageUrl ? `https://localhost:7104/uploads/${product.imageUrl}` : '/path/to/placeholder-image.jpg'} 
                                                        style={{ width: '50px', height: 'auto' }} // Set custom width
                                                        alt={product.productName}
                                                        className="img-thumbnail" // Optional: for styling
                                                    />
                                                </td>

                                                <td>{product.productName}</td>

                                                <td>
                                                    {categories.find(category => category.categoryId === product.categoryId)?.categoryName || 'N/A'}
                                                </td>
                                                <td>{product.description}</td>
                                                <td>{product.price}</td>
                                                <td>{product.stock}</td>
                                                <td>
                                                    <button onClick={() => { fetchProductById(product.productId); }} className="btn btn-warning">Edit</button>
                                                    <button onClick={() => handleDeleteProduct(product.productId)} className="btn btn-danger">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <nav>
                                    <ul className="pagination">
                                        {pageNumbers.map(number => (
                                            <li key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
                                                <button onClick={() => handlePageChange(number)} className="page-link">
                                                    {number}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitProduct}>
                            <div className="mb-3">
                                <label htmlFor="ProductName" className="form-label">Product Name</label>
                                <input type="text" className="form-control" name="ProductName" value={formData.ProductName || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="Description" className="form-label">Description</label>
                                <textarea className="form-control" name="Description" value={formData.Description || ''} onChange={handleInputChange}></textarea>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="Price" className="form-label">Price</label>
                                <input type="number" className="form-control" name="Price" value={formData.Price || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="Stock" className="form-label">Stock</label>
                                <input type="number" className="form-control" name="Stock" value={formData.Stock || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="CategoryId" className="form-label">Category</label>
                                <select className="form-select" name="CategoryId" value={formData.CategoryId || ''} onChange={handleInputChange} required>
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="Image" className="form-label">Product Image</label>
                                
                                {/* Display the current image if editing and imageUrl exists */}
                                {formData.ImageUrl && (
                                    <div className="mb-3">
                                        <img 
                                            src={`https://localhost:7104/uploads/${formData.ImageUrl}`} 
                                            alt="Current Product Image" 
                                            style={{ width: '100px', height: 'auto' }} 
                                            className="img-thumbnail"
                                        />
                                    </div>
                                )}
                                
                                {/* File input for uploading a new image */}
                                <input type="file" className="form-control" onChange={(e) => setImageFile(e.target.files[0])} />
                            </div>
                            <button type="submit" className="btn btn-success">{mode === 'edit' ? 'Update' : 'Create'}</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setMode('list')}>Cancel</button>
                        </form>
                    )}
                </div>

                <h1 className="text-center mt-5">Category Management</h1>
                <div>
                    {categoryMode === 'list' ? (
                        <div>
                            <button onClick={() => setCategoryMode('create')} className="btn btn-primary">Create New Category</button>
                            <div className="mt-3">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Category Name</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(category => (
                                            <tr key={category.categoryId}>
                                                <td>{category.categoryName}</td>
                                                <td>
                                                    <button onClick={() => { fetchCategoryById(category.categoryId); }} className="btn btn-warning">Edit</button>
                                                    <button onClick={() => handleDeleteCategory(category.categoryId)} className="btn btn-danger">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmitCategory}>
                            <div className="mb-3">
                                <label htmlFor="CategoryName" className="form-label">Category Name</label>
                                <input type="text" className="form-control" name="CategoryName" value={categoryFormData.CategoryName || ''} onChange={handleCategoryInputChange} required />
                            </div>
                            <button type="submit" className="btn btn-success">{categoryMode === 'edit' ? 'Update' : 'Create'}</button>
                            <button type="button" className="btn btn-secondary" onClick={() => setCategoryMode('list')}>Cancel</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default withAdminAuth(ProductManagementADMIN);
