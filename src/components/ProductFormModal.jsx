import { useRef, useState } from 'react';
import api, { apiError } from '../api/client';

function toForm(product) {
  return {
    name: product?.name ?? '',
    category: product?.category ?? '',
    quantity: product?.quantity ?? 0,
    price: product?.price ?? '',
    imageUrl: product?.imageUrl ?? '',
  };
}

export default function ProductFormModal({ product, onClose, onSaved }) {
  const [form, setForm] = useState(toForm(product));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);
  const editing = Boolean(product);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const uploadImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setError('');
    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      const response = await api.post('/uploads', data);
      setForm((current) => ({ ...current, imageUrl: response.data.url }));
    } catch (err) {
      setError(apiError(err, 'Unable to upload image'));
    } finally {
      setUploading(false);
      if (fileInput.current) {
        fileInput.current.value = '';
      }
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price),
      imageUrl: form.imageUrl || null,
    };
    try {
      if (editing) {
        await api.put(`/products/${product.id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSaved();
    } catch (err) {
      setError(apiError(err, 'Unable to save product'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <h2>{editing ? 'Edit product' : 'New product'}</h2>
        <form onSubmit={submit} className="stack">
          <div className="field">
            <span>Image</span>
            <div className="image-upload">
              <div className="image-preview">
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt={form.name || 'Product'} />
                ) : (
                  <span className="muted">No image</span>
                )}
              </div>
              <div className="stack">
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={uploadImage}
                  hidden
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : form.imageUrl ? 'Replace image' : 'Upload image'}
                </button>
                {form.imageUrl && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setForm({ ...form, imageUrl: '' })}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <label className="field">
            <span>Name</span>
            <input className="input" value={form.name} onChange={update('name')} autoFocus required />
          </label>
          <label className="field">
            <span>Category</span>
            <input className="input" value={form.category} onChange={update('category')} placeholder="Optional" />
          </label>
          <div className="grid-2">
            <label className="field">
              <span>Quantity</span>
              <input className="input" type="number" min="0" value={form.quantity} onChange={update('quantity')} required />
            </label>
            <label className="field">
              <span>Price</span>
              <input className="input" type="number" min="0" step="0.01" value={form.price} onChange={update('price')} required />
            </label>
          </div>
          {error && <div className="alert">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={busy || uploading}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
