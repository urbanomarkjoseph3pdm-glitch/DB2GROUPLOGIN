// ============================================
// public/js/inventory.js
// Lahat ng fetch() calls papunta sa /api/categories, /api/suppliers,
// /api/products, /api/transactions. Ito ang "gumagawa" na sa browser
// kapag nag-submit ng form o nag-click ng edit/delete.
// ============================================

// ---------- Maliit na helper ----------
async function apiCall(url, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'May error na nangyari.');
  return data;
}

function showMsg(elId, text, type) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  el.className = 'inv-message ' + type;
  setTimeout(() => { el.textContent = ''; el.className = 'inv-message'; }, 3500);
}

// ==================================================
// CATEGORIES
// ==================================================
const categoryForm = document.getElementById('categoryForm');

async function loadCategories() {
  const categories = await apiCall('/api/categories');

  // Table
  const tbody = document.querySelector('#categoryTable tbody');
  tbody.innerHTML = categories.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${c.description || '-'}</td>
      <td>
        <button onclick="editCategory('${c._id}','${c.name}','${(c.description || '').replace(/'/g, "\\'")}')">Edit</button>
        <button onclick="deleteCategory('${c._id}')" class="btn-danger">Delete</button>
      </td>
    </tr>`).join('');

  // Dropdown sa Products form
  const select = document.getElementById('productCategory');
  const current = select.value;
  select.innerHTML = '<option value="">Select category</option>' +
    categories.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
  select.value = current;

  return categories;
}

window.editCategory = (id, name, description) => {
  document.getElementById('categoryId').value = id;
  document.getElementById('categoryName').value = name;
  document.getElementById('categoryDescription').value = description;
};

window.deleteCategory = async (id) => {
  if (!confirm('Sigurado ka bang burahin ang category na ito?')) return;
  try {
    await apiCall(`/api/categories/${id}`, 'DELETE');
    showMsg('categoryMessage', 'Na-delete ang category.', 'success');
    loadCategories();
  } catch (err) {
    showMsg('categoryMessage', err.message, 'error');
  }
};

categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('categoryId').value;
  const name = document.getElementById('categoryName').value;
  const description = document.getElementById('categoryDescription').value;
  try {
    if (id) {
      await apiCall(`/api/categories/${id}`, 'PUT', { name, description });
      showMsg('categoryMessage', 'Na-update ang category.', 'success');
    } else {
      await apiCall('/api/categories', 'POST', { name, description });
      showMsg('categoryMessage', 'Nadagdag ang bagong category.', 'success');
    }
    categoryForm.reset();
    document.getElementById('categoryId').value = '';
    loadCategories();
  } catch (err) {
    showMsg('categoryMessage', err.message, 'error');
  }
});

document.getElementById('categoryCancel').addEventListener('click', () => {
  categoryForm.reset();
  document.getElementById('categoryId').value = '';
});

// ==================================================
// SUPPLIERS
// ==================================================
const supplierForm = document.getElementById('supplierForm');

async function loadSuppliers() {
  const suppliers = await apiCall('/api/suppliers');

  const tbody = document.querySelector('#supplierTable tbody');
  tbody.innerHTML = suppliers.map(s => `
    <tr>
      <td>${s.name}</td>
      <td>${s.contactPerson || '-'}</td>
      <td>${s.email || '-'}</td>
      <td>${s.phone || '-'}</td>
      <td>
        <button onclick='editSupplier(${JSON.stringify(s)})'>Edit</button>
        <button onclick="deleteSupplier('${s._id}')" class="btn-danger">Delete</button>
      </td>
    </tr>`).join('');

  const select = document.getElementById('productSupplier');
  const current = select.value;
  select.innerHTML = '<option value="">Select supplier</option>' +
    suppliers.map(s => `<option value="${s._id}">${s.name}</option>`).join('');
  select.value = current;

  return suppliers;
}

window.editSupplier = (s) => {
  document.getElementById('supplierId').value = s._id;
  document.getElementById('supplierName').value = s.name;
  document.getElementById('supplierContact').value = s.contactPerson || '';
  document.getElementById('supplierEmail').value = s.email || '';
  document.getElementById('supplierPhone').value = s.phone || '';
  document.getElementById('supplierAddress').value = s.address || '';
};

window.deleteSupplier = async (id) => {
  if (!confirm('Sigurado ka bang burahin ang supplier na ito?')) return;
  try {
    await apiCall(`/api/suppliers/${id}`, 'DELETE');
    showMsg('supplierMessage', 'Na-delete ang supplier.', 'success');
    loadSuppliers();
  } catch (err) {
    showMsg('supplierMessage', err.message, 'error');
  }
};

supplierForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('supplierId').value;
  const payload = {
    name: document.getElementById('supplierName').value,
    contactPerson: document.getElementById('supplierContact').value,
    email: document.getElementById('supplierEmail').value,
    phone: document.getElementById('supplierPhone').value,
    address: document.getElementById('supplierAddress').value
  };
  try {
    if (id) {
      await apiCall(`/api/suppliers/${id}`, 'PUT', payload);
      showMsg('supplierMessage', 'Na-update ang supplier.', 'success');
    } else {
      await apiCall('/api/suppliers', 'POST', payload);
      showMsg('supplierMessage', 'Nadagdag ang bagong supplier.', 'success');
    }
    supplierForm.reset();
    document.getElementById('supplierId').value = '';
    loadSuppliers();
  } catch (err) {
    showMsg('supplierMessage', err.message, 'error');
  }
});

document.getElementById('supplierCancel').addEventListener('click', () => {
  supplierForm.reset();
  document.getElementById('supplierId').value = '';
});

// ==================================================
// PRODUCTS
// ==================================================
const productForm = document.getElementById('productForm');

async function loadProducts() {
  const products = await apiCall('/api/products');

  const tbody = document.querySelector('#productTable tbody');
  tbody.innerHTML = products.map(p => `
    <tr>
      <td>${p.sku}</td>
      <td>${p.name}</td>
      <td>${p.category ? p.category.name : '-'}</td>
      <td>${p.supplier ? p.supplier.name : '-'}</td>
      <td>${p.quantity}</td>
      <td>₱${Number(p.unitPrice).toFixed(2)}</td>
      <td>
        <button onclick='editProduct(${JSON.stringify({
          _id: p._id, name: p.name, sku: p.sku,
          category: p.category ? p.category._id : '',
          supplier: p.supplier ? p.supplier._id : '',
          quantity: p.quantity, unitPrice: p.unitPrice, reorderLevel: p.reorderLevel
        })})'>Edit</button>
        <button onclick="deleteProduct('${p._id}')" class="btn-danger">Delete</button>
      </td>
    </tr>`).join('');

  // Dropdown sa Transactions form
  const select = document.getElementById('transactionProduct');
  const current = select.value;
  select.innerHTML = '<option value="">Select product</option>' +
    products.map(p => `<option value="${p._id}">${p.name} (${p.sku}) — stock: ${p.quantity}</option>`).join('');
  select.value = current;

  return products;
}

window.editProduct = (p) => {
  document.getElementById('productId').value = p._id;
  document.getElementById('productName').value = p.name;
  document.getElementById('productSku').value = p.sku;
  document.getElementById('productCategory').value = p.category;
  document.getElementById('productSupplier').value = p.supplier;
  document.getElementById('productQuantity').value = p.quantity;
  document.getElementById('productUnitPrice').value = p.unitPrice;
  document.getElementById('productReorderLevel').value = p.reorderLevel;
};

window.deleteProduct = async (id) => {
  if (!confirm('Sigurado ka bang burahin ang produktong ito?')) return;
  try {
    await apiCall(`/api/products/${id}`, 'DELETE');
    showMsg('productMessage', 'Na-delete ang produkto.', 'success');
    loadProducts();
    loadLowStock();
  } catch (err) {
    showMsg('productMessage', err.message, 'error');
  }
};

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('productId').value;
  const payload = {
    name: document.getElementById('productName').value,
    sku: document.getElementById('productSku').value,
    category: document.getElementById('productCategory').value,
    supplier: document.getElementById('productSupplier').value,
    quantity: Number(document.getElementById('productQuantity').value),
    unitPrice: Number(document.getElementById('productUnitPrice').value),
    reorderLevel: Number(document.getElementById('productReorderLevel').value) || 10
  };
  try {
    if (id) {
      await apiCall(`/api/products/${id}`, 'PUT', payload);
      showMsg('productMessage', 'Na-update ang produkto.', 'success');
    } else {
      await apiCall('/api/products', 'POST', payload);
      showMsg('productMessage', 'Nadagdag ang bagong produkto.', 'success');
    }
    productForm.reset();
    document.getElementById('productId').value = '';
    loadProducts();
    loadLowStock();
  } catch (err) {
    showMsg('productMessage', err.message, 'error');
  }
});

document.getElementById('productCancel').addEventListener('click', () => {
  productForm.reset();
  document.getElementById('productId').value = '';
});

// ==================================================
// LOW STOCK REPORT (useful query example)
// ==================================================
async function loadLowStock() {
  const lowStock = await apiCall('/api/products/low-stock');
  const container = document.getElementById('lowStockList');
  if (lowStock.length === 0) {
    container.innerHTML = '<p class="inv-empty">Walang produktong kulang sa stock. 👍</p>';
    return;
  }
  container.innerHTML = `
    <table>
      <thead><tr><th>SKU</th><th>Name</th><th>Current Qty</th><th>Reorder Level</th></tr></thead>
      <tbody>
        ${lowStock.map(p => `
          <tr>
            <td>${p.sku}</td>
            <td>${p.name}</td>
            <td>${p.quantity}</td>
            <td>${p.reorderLevel}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

// ==================================================
// STOCK TRANSACTIONS
// ==================================================
const transactionForm = document.getElementById('transactionForm');

async function loadTransactions() {
  const transactions = await apiCall('/api/transactions');

  const tbody = document.querySelector('#transactionTable tbody');
  tbody.innerHTML = transactions.map(t => `
    <tr>
      <td>${new Date(t.createdAt).toLocaleString()}</td>
      <td>${t.product ? `${t.product.name} (${t.product.sku})` : '-'}</td>
      <td>${t.type === 'stock-in' ? '⬆️ Stock In' : '⬇️ Stock Out'}</td>
      <td>${t.quantity}</td>
      <td>${t.note || '-'}</td>
      <td>${t.performedBy ? t.performedBy.username : '-'}</td>
      <td><button onclick="deleteTransaction('${t._id}')" class="btn-danger">Delete</button></td>
    </tr>`).join('');
}

window.deleteTransaction = async (id) => {
  if (!confirm('Sigurado ka bang burahin ang transaction record na ito? (Hindi na babalik ang stock)')) return;
  try {
    await apiCall(`/api/transactions/${id}`, 'DELETE');
    showMsg('transactionMessage', 'Na-delete ang transaction.', 'success');
    loadTransactions();
  } catch (err) {
    showMsg('transactionMessage', err.message, 'error');
  }
};

transactionForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    product: document.getElementById('transactionProduct').value,
    type: document.getElementById('transactionType').value,
    quantity: Number(document.getElementById('transactionQuantity').value),
    note: document.getElementById('transactionNote').value
  };
  try {
    await apiCall('/api/transactions', 'POST', payload);
    showMsg('transactionMessage', 'Na-record ang transaction.', 'success');
    transactionForm.reset();
    loadTransactions();
    loadProducts();   // kasi nagbago ang quantity ng product
    loadLowStock();
  } catch (err) {
    showMsg('transactionMessage', err.message, 'error');
  }
});

// ==================================================
// INITIAL LOAD — tumatakbo lang ito kapag naka-load ang inventory.html
// (may element ba na #categoryTable? kung meron, andito tayo sa tamang page)
// ==================================================
if (document.getElementById('categoryTable')) {
  loadCategories();
  loadSuppliers();
  loadProducts().then(() => loadLowStock());
  loadTransactions();
}
