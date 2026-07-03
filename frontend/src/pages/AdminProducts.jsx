import { useEffect, useState } from 'react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import EmptyState from '../components/EmptyState';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  image: '',
  category: '',
  stock: '',
  rating: '0',
  featured: false,
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/products');
      setProducts(response.data?.data ?? []);
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock,
      rating: product.rating ?? '0',
      featured: product.featured ?? false,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        rating: Number(form.rating),
        featured: Boolean(form.featured),
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload);
        setToast('Product updated successfully');
      } else {
        await api.post('/admin/products', payload);
        setToast('Product created successfully');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (submitError) {
      setToast(submitError?.response?.data?.message || 'Unable to save product');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Delete this product?')) return;

    try {
      await api.delete(`/admin/products/${productId}`);
      setToast('Product deleted successfully');
      fetchProducts();
    } catch (deleteError) {
      setToast(deleteError?.response?.data?.message || 'Unable to delete product');
    }
  };

  return (
    <div className="px-margin-mobile py-stack-xl md:px-margin-desktop">
      <div className="mx-auto max-w-container-max space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">Administration</p>
            <h1 className="text-headline-lg font-headline-lg text-primary">Products Management</h1>
          </div>
          <Button variant="primary" onClick={openCreateModal}>Create Product</Button>
        </div>

        {toast ? <div className="rounded-2xl bg-primary/10 p-4 text-sm text-primary">{toast}</div> : null}

        {loading ? (
          <Card variant="panel" className="p-6"><Loader lines={6} /></Card>
        ) : error ? (
          <EmptyState title="Products unavailable" description={error} icon="inventory_2" />
        ) : !products.length ? (
          <EmptyState title="No products found" description="Create a product to get started." icon="inventory_2" />
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-surface-container-lowest shadow-soft">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-outline-variant/40 text-left">
                <thead className="sticky top-0 z-10 bg-surface-container-low text-sm uppercase tracking-[0.2em] text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-4">Name</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4">Stock</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                  {products.map((product) => (
                    <tr key={product._id} className="odd:bg-surface-container-lowest even:bg-surface-container-low transition-colors hover:bg-surface-container-high">
                      <td className="px-4 py-4">
                        <div className="font-medium text-primary">{product.name}</div>
                        <div className="text-sm text-on-surface-variant">{product.description}</div>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant">{product.category}</td>
                      <td className="px-4 py-4 text-on-surface-variant">${product.price}</td>
                      <td className="px-4 py-4 text-on-surface-variant">{product.stock}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => openEditModal(product)}>Edit</Button>
                          <Button size="sm" variant="primary" onClick={() => handleDelete(product._id)}>Delete</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="space-y-4 p-2" onSubmit={handleSubmit}>
          <h2 className="text-headline-sm font-headline-sm text-primary">{editingProduct ? 'Edit product' : 'Create product'}</h2>
          <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
          <Input label="Price" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
          <Input label="Image URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} required />
          <Input label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
          <Input label="Stock" type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
          <Input label="Rating" type="number" value={form.rating} onChange={(event) => setForm({ ...form, rating: event.target.value })} />
          <label className="flex items-center gap-2 text-sm text-on-surface-variant">
            <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
            Featured product
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminProducts;
