import { useCallback, useEffect, useState } from 'react';
import api, { apiError } from '../api/client';
import ProductFormModal from '../components/ProductFormModal';

const PAGE_SIZE = 8;

const emptyStats = { count: 0, units: 0, value: 0 };

export default function DashboardPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('updatedAt:desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [sortBy, direction] = sort.split(':');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/products', {
        params: { search, category, page, size: PAGE_SIZE, sortBy, direction },
      });
      setItems(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(apiError(err, 'Unable to load products'));
    } finally {
      setLoading(false);
    }
  }, [search, category, page, sortBy, direction]);

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/products/categories');
      setCategories(data);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const stats = items.reduce(
    (acc, item) => ({
      count: totalElements,
      units: acc.units + item.quantity,
      value: acc.value + item.quantity * Number(item.price),
    }),
    emptyStats
  );

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    load();
    loadCategories();
  };

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) {
      return;
    }
    try {
      await api.delete(`/products/${product.id}`);
      load();
      loadCategories();
    } catch (err) {
      setError(apiError(err, 'Unable to delete product'));
    }
  };

  const resetToFirstPage = (setter) => (value) => {
    setPage(0);
    setter(value);
  };

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <p className="muted">{totalElements} item{totalElements === 1 ? '' : 's'} in your inventory</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New product</button>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <span className="stat-label">Products</span>
          <span className="stat-value">{stats.count}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Units on page</span>
          <span className="stat-value">{stats.units}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Page value</span>
          <span className="stat-value">${stats.value.toFixed(2)}</span>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="input"
          placeholder="Search by name…"
          value={search}
          onChange={(event) => resetToFirstPage(setSearch)(event.target.value)}
        />
        <select
          className="input"
          value={category}
          onChange={(event) => resetToFirstPage(setCategory)(event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        <select className="input" value={sort} onChange={(event) => resetToFirstPage(setSort)(event.target.value)}>
          <option value="updatedAt:desc">Newest first</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
          <option value="quantity:desc">Quantity high–low</option>
          <option value="quantity:asc">Quantity low–high</option>
          <option value="price:desc">Price high–low</option>
          <option value="price:asc">Price low–high</option>
        </select>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th className="thumb-col"></th>
              <th>Name</th>
              <th>Category</th>
              <th className="num">Quantity</th>
              <th className="num">Price</th>
              <th className="num">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="empty">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="empty">No products found.</td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="thumb-col">
                    {item.imageUrl ? (
                      <img className="thumb" src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="thumb thumb-empty" />
                    )}
                  </td>
                  <td className="strong">{item.name}</td>
                  <td>{item.category ? <span className="tag">{item.category}</span> : <span className="muted">—</span>}</td>
                  <td className="num">
                    <span className={item.quantity <= 5 ? 'pill pill-warn' : 'pill'}>{item.quantity}</span>
                  </td>
                  <td className="num">${Number(item.price).toFixed(2)}</td>
                  <td className="num actions">
                    <button className="btn btn-ghost" onClick={() => openEdit(item)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => remove(item)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-ghost" disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          <span className="muted">Page {page + 1} of {totalPages}</span>
          <button className="btn btn-ghost" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}

      {modalOpen && (
        <ProductFormModal
          product={editing}
          onClose={() => setModalOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
