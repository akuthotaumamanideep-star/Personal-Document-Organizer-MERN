import axios from 'axios';
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_DOCUMENTS,
  INITIAL_LOGS,
} from './mockData';

// Determine if running in GitHub Pages or static environment
const isStaticHost =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('github.io') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.protocol === 'file:');

// Local storage keys for standalone demo mode
const STORAGE_KEYS = {
  USERS: 'docvault_demo_users',
  CATEGORIES: 'docvault_demo_categories',
  DOCUMENTS: 'docvault_demo_documents',
  LOGS: 'docvault_demo_logs',
};

// Initialize localStorage mock data if empty
const getStored = (key, defaultData) => {
  const existing = localStorage.getItem(key);
  if (!existing) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(existing);
  } catch (e) {
    return defaultData;
  }
};

const setStored = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Helper: Calculate document status and days remaining
const enrichDocument = (doc) => {
  if (doc.hasNoExpiry || !doc.expiryDate) {
    return { ...doc, status: 'lifetime', daysRemaining: null };
  }
  const now = new Date();
  const expiry = new Date(doc.expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let status = 'valid';
  if (diffDays < 0) {
    status = 'expired';
  } else if (diffDays <= (doc.reminderDays || 30)) {
    status = 'expiring_soon';
  }

  return { ...doc, status, daysRemaining: diffDays };
};

// Real Axios API instance
const axiosInstance = axios.create({
  baseURL: '/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('docvault_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock request handler for static / GitHub Pages demo mode
const handleMockRequest = async (method, url, data = null, params = null) => {
  await new Promise((r) => setTimeout(r, 120)); // slight natural network delay
  const cleanUrl = url.split('?')[0];

  const users = getStored(STORAGE_KEYS.USERS, INITIAL_USERS);
  const categories = getStored(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  let documents = getStored(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS).map(enrichDocument);
  const logs = getStored(STORAGE_KEYS.LOGS, INITIAL_LOGS);

  // Health check
  if (cleanUrl === '/health') {
    return { data: { status: 'ok', service: 'Personal Document Organizer (Static/Demo Engine)', timestamp: new Date().toISOString() } };
  }

  // Auth: Login
  if (cleanUrl === '/auth/login' && method === 'post') {
    const { email, password } = data || {};
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      const err = new Error('Invalid email or password');
      err.response = { data: { success: false, message: 'Invalid email or password' }, status: 401 };
      throw err;
    }
    const token = 'mock_jwt_token_' + user.id;
    return {
      data: {
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, organization: user.organization },
      },
    };
  }

  // Auth: Register
  if (cleanUrl === '/auth/register' && method === 'post') {
    const { name, email, password, organization } = data || {};
    const exists = users.find((u) => u.email === email);
    if (exists) {
      const err = new Error('User already exists');
      err.response = { data: { success: false, message: 'A user with this email already exists' }, status: 400 };
      throw err;
    }
    const newUser = {
      id: 'user_' + Date.now(),
      _id: 'user_' + Date.now(),
      name,
      email,
      password,
      role: users.length === 0 ? 'admin' : 'user',
      organization: organization || 'Personal',
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);
    return {
      data: {
        success: true,
        token: 'mock_jwt_token_' + newUser.id,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, organization: newUser.organization },
      },
    };
  }

  // Auth: Me
  if (cleanUrl === '/auth/me') {
    const storedUser = localStorage.getItem('docvault_user');
    if (storedUser) {
      return { data: { success: true, user: JSON.parse(storedUser) } };
    }
    return { data: { success: true, user: users[0] } };
  }

  // Documents: Get list
  if (cleanUrl === '/documents' && method === 'get') {
    let result = [...documents];
    if (params) {
      const search = params.get ? params.get('search') : params.search;
      const category = params.get ? params.get('category') : params.category;
      const status = params.get ? params.get('status') : params.status;
      const sort = params.get ? params.get('sort') : params.sort;

      if (search) {
        const q = search.toLowerCase();
        result = result.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            (d.documentNumber && d.documentNumber.toLowerCase().includes(q)) ||
            (d.notes && d.notes.toLowerCase().includes(q))
        );
      }
      if (category && category !== 'All') {
        result = result.filter((d) => d.category === category);
      }
      if (status && status !== 'all') {
        result = result.filter((d) => d.status === status);
      }
      if (sort === 'expiry_asc') {
        result.sort((a, b) => {
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        });
      } else if (sort === 'newest') {
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }
    return { data: { success: true, count: result.length, data: result } };
  }

  // Documents: Create
  if (cleanUrl === '/documents' && method === 'post') {
    let title = '', documentNumber = '', category = 'General', issueDate = null, expiryDate = null, hasNoExpiry = false, notes = '', issuingAuthority = '', tags = [], reminderDays = 30;
    if (data instanceof FormData) {
      title = data.get('title') || 'Untitled';
      documentNumber = data.get('documentNumber') || '';
      category = data.get('category') || 'General';
      issueDate = data.get('issueDate') || null;
      hasNoExpiry = data.get('hasNoExpiry') === 'true';
      expiryDate = hasNoExpiry ? null : data.get('expiryDate') || null;
      notes = data.get('notes') || '';
      issuingAuthority = data.get('issuingAuthority') || '';
      const rawTags = data.get('tags') || '';
      tags = rawTags ? rawTags.split(',').map((t) => t.trim()) : [];
      reminderDays = Number(data.get('reminderDays') || 30);
    } else if (data) {
      ({ title, documentNumber, category, issueDate, expiryDate, hasNoExpiry, notes, issuingAuthority, tags, reminderDays } = data);
    }

    const newDoc = enrichDocument({
      _id: 'doc_' + Date.now(),
      title,
      documentNumber,
      category,
      issueDate,
      expiryDate,
      hasNoExpiry,
      notes,
      issuingAuthority,
      tags: tags || [],
      reminderDays: reminderDays || 30,
      createdAt: new Date().toISOString(),
      fileName: 'sample-passport-doc.txt',
      fileOriginalName: 'Attached_Document.pdf',
      fileSize: 154000,
    });

    documents.unshift(newDoc);
    setStored(STORAGE_KEYS.DOCUMENTS, documents);

    logs.unshift({
      _id: 'log_' + Date.now(),
      userName: 'Current User',
      action: 'CREATE',
      documentTitle: newDoc.title,
      details: `Created new document in '${newDoc.category}'`,
      createdAt: new Date().toISOString(),
    });
    setStored(STORAGE_KEYS.LOGS, logs);

    return { data: { success: true, data: newDoc } };
  }

  // Documents: Renew
  if (cleanUrl.match(/\/documents\/[^/]+\/renew$/) && method === 'patch') {
    const id = cleanUrl.split('/')[2];
    const docIdx = documents.findIndex((d) => d._id === id);
    if (docIdx !== -1) {
      documents[docIdx].expiryDate = data.newExpiryDate;
      documents[docIdx].hasNoExpiry = false;
      if (data.notes) {
        documents[docIdx].notes = (documents[docIdx].notes ? documents[docIdx].notes + '\n' : '') + `[Renewed: ${data.notes}]`;
      }
      documents[docIdx] = enrichDocument(documents[docIdx]);
      setStored(STORAGE_KEYS.DOCUMENTS, documents);

      logs.unshift({
        _id: 'log_' + Date.now(),
        userName: 'Current User',
        action: 'RENEW',
        documentTitle: documents[docIdx].title,
        details: `Renewed expiry date to ${new Date(data.newExpiryDate).toLocaleDateString()}`,
        createdAt: new Date().toISOString(),
      });
      setStored(STORAGE_KEYS.LOGS, logs);

      return { data: { success: true, data: documents[docIdx] } };
    }
  }

  // Documents: Update
  if (cleanUrl.match(/\/documents\/[^/]+$/) && method === 'put') {
    const id = cleanUrl.split('/')[2];
    const docIdx = documents.findIndex((d) => d._id === id);
    if (docIdx !== -1) {
      let title = documents[docIdx].title;
      let category = documents[docIdx].category;
      let documentNumber = documents[docIdx].documentNumber;
      let expiryDate = documents[docIdx].expiryDate;
      let hasNoExpiry = documents[docIdx].hasNoExpiry;
      let notes = documents[docIdx].notes;

      if (data instanceof FormData) {
        title = data.get('title') || title;
        category = data.get('category') || category;
        documentNumber = data.get('documentNumber') || documentNumber;
        hasNoExpiry = data.get('hasNoExpiry') === 'true';
        expiryDate = hasNoExpiry ? null : data.get('expiryDate') || expiryDate;
        notes = data.get('notes') || notes;
      }

      documents[docIdx] = enrichDocument({
        ...documents[docIdx],
        title,
        category,
        documentNumber,
        hasNoExpiry,
        expiryDate,
        notes,
      });
      setStored(STORAGE_KEYS.DOCUMENTS, documents);
      return { data: { success: true, data: documents[docIdx] } };
    }
  }

  // Documents: Delete
  if (cleanUrl.match(/\/documents\/[^/]+$/) && method === 'delete') {
    const id = cleanUrl.split('/')[2];
    const removed = documents.find((d) => d._id === id);
    documents = documents.filter((d) => d._id !== id);
    setStored(STORAGE_KEYS.DOCUMENTS, documents);
    if (removed) {
      logs.unshift({
        _id: 'log_' + Date.now(),
        userName: 'Current User',
        action: 'DELETE',
        documentTitle: removed.title,
        details: 'Deleted document permanently',
        createdAt: new Date().toISOString(),
      });
      setStored(STORAGE_KEYS.LOGS, logs);
    }
    return { data: { success: true } };
  }

  // Dashboard Stats
  if (cleanUrl === '/stats/dashboard') {
    let valid = 0, expiringSoon = 0, expired = 0, lifetime = 0, expiringIn7Days = 0, totalStorageMB = 1.95;
    const urgentItems = [];
    const catCounts = {};

    documents.forEach((d) => {
      catCounts[d.category] = (catCounts[d.category] || 0) + 1;
      if (d.status === 'lifetime') lifetime++;
      else if (d.status === 'expired') {
        expired++;
        urgentItems.push({ id: d._id, title: d.title, category: d.category, expiryDate: d.expiryDate, daysRemaining: d.daysRemaining, status: 'expired' });
      } else if (d.status === 'expiring_soon') {
        expiringSoon++;
        if (d.daysRemaining <= 7) expiringIn7Days++;
        urgentItems.push({ id: d._id, title: d.title, category: d.category, expiryDate: d.expiryDate, daysRemaining: d.daysRemaining, status: 'expiring_soon' });
      } else valid++;
    });

    const categoryDistribution = Object.keys(catCounts).map((c) => ({
      category: c,
      count: catCounts[c],
      percentage: Math.round((catCounts[c] / (documents.length || 1)) * 100),
    }));

    const monthlyTimeline = [
      { month: 'Oct 2026', count: expiringSoon },
      { month: 'Nov 2026', count: 0 },
      { month: 'Dec 2026', count: 1 },
      { month: 'Jan 2027', count: 0 },
      { month: 'Feb 2027', count: 1 },
      { month: 'Mar 2027', count: 2 },
    ];

    return {
      data: {
        success: true,
        stats: {
          total: documents.length,
          valid,
          expiringSoon,
          expired,
          lifetime,
          expiringIn7Days,
          totalStorageMB,
          categoryDistribution,
          urgentItems,
          monthlyTimeline,
        },
      },
    };
  }

  // Categories
  if (cleanUrl === '/categories' && method === 'get') {
    return { data: { success: true, data: categories } };
  }
  if (cleanUrl === '/categories' && method === 'post') {
    const newCat = { _id: 'cat_' + Date.now(), name: data.name, description: data.description || '', color: data.color || '#3B82F6', icon: 'Folder', isDefault: false };
    categories.push(newCat);
    setStored(STORAGE_KEYS.CATEGORIES, categories);
    return { data: { success: true, data: newCat } };
  }
  if (cleanUrl.match(/\/categories\/[^/]+$/) && method === 'delete') {
    const id = cleanUrl.split('/')[2];
    const filtered = categories.filter((c) => c._id !== id);
    setStored(STORAGE_KEYS.CATEGORIES, filtered);
    return { data: { success: true } };
  }

  // Admin
  if (cleanUrl === '/admin/system-stats') {
    return {
      data: {
        success: true,
        stats: {
          totalUsers: users.length,
          totalDocuments: documents.length,
          totalAdmins: users.filter((u) => u.role === 'admin').length,
          totalStorageMB: '1.95',
        },
      },
    };
  }
  if (cleanUrl === '/admin/users') {
    const usersWithDocCounts = users.map((u) => ({
      ...u,
      documentCount: documents.length,
    }));
    return { data: { success: true, data: usersWithDocCounts } };
  }
  if (cleanUrl.match(/\/admin\/users\/[^/]+\/role$/) && method === 'put') {
    const id = cleanUrl.split('/')[3];
    const uIdx = users.findIndex((u) => u.id === id || u._id === id);
    if (uIdx !== -1) {
      users[uIdx].role = data.role;
      setStored(STORAGE_KEYS.USERS, users);
      return { data: { success: true, user: users[uIdx] } };
    }
  }
  if (cleanUrl === '/admin/logs') {
    return { data: { success: true, data: logs } };
  }

  return { data: { success: true } };
};

// Unified API Wrapper: tries live Axios first; falls back smoothly to Mock Adapter if static/offline
const api = {
  get: async (url, config = {}) => {
    if (isStaticHost) return handleMockRequest('get', url, null, config.params);
    try {
      return await axiosInstance.get(url, config);
    } catch (err) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        return handleMockRequest('get', url, null, config.params);
      }
      throw err;
    }
  },
  post: async (url, data, config = {}) => {
    if (isStaticHost) return handleMockRequest('post', url, data);
    try {
      return await axiosInstance.post(url, data, config);
    } catch (err) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        return handleMockRequest('post', url, data);
      }
      throw err;
    }
  },
  put: async (url, data, config = {}) => {
    if (isStaticHost) return handleMockRequest('put', url, data);
    try {
      return await axiosInstance.put(url, data, config);
    } catch (err) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        return handleMockRequest('put', url, data);
      }
      throw err;
    }
  },
  patch: async (url, data, config = {}) => {
    if (isStaticHost) return handleMockRequest('patch', url, data);
    try {
      return await axiosInstance.patch(url, data, config);
    } catch (err) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        return handleMockRequest('patch', url, data);
      }
      throw err;
    }
  },
  delete: async (url, config = {}) => {
    if (isStaticHost) return handleMockRequest('delete', url);
    try {
      return await axiosInstance.delete(url, config);
    } catch (err) {
      if (!err.response || err.response.status === 404 || err.code === 'ERR_NETWORK') {
        return handleMockRequest('delete', url);
      }
      throw err;
    }
  },
};

export default api;
