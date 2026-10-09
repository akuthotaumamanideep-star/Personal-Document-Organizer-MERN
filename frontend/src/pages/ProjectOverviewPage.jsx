import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Database,
  Server,
  Layout,
  Lock,
  Code,
  ShieldCheck,
  Terminal,
  Activity,
  Layers,
  ArrowRight,
} from 'lucide-react';
import api from '../services/api';

export default function ProjectOverviewPage() {
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/health');
        setHealthStatus(res.data);
      } catch (err) {
        setHealthStatus({ status: 'degraded', error: err.message });
      }
    };
    checkHealth();
  }, []);

  const objectives = [
    {
      title: 'Demonstrate MERN Stack Development',
      desc: 'Seamless end-to-end integration of MongoDB, Express.js, React.js, and Node.js with Vite.',
      status: 'Completed',
    },
    {
      title: 'Implement CRUD Operations using MongoDB',
      desc: 'Comprehensive Create, Read, Update, and Delete capabilities for documents and categories with Mongoose ODM.',
      status: 'Completed',
    },
    {
      title: 'Build REST APIs using Node.js & Express.js',
      desc: 'Modular controllers, routers, multer file uploads, and JWT authentication middleware.',
      status: 'Completed',
    },
    {
      title: 'Develop Responsive Frontend using React.js',
      desc: 'Modern, reactive interface with status indicators, expiry timelines, modals, and file previewers.',
      status: 'Completed',
    },
    {
      title: 'Authentication & Role-Based Access Control (RBAC)',
      desc: 'JWT security tokens, encrypted passwords (bcrypt), and granular user vs. admin roles.',
      status: 'Completed',
    },
    {
      title: 'Display Project Information and Results Clearly',
      desc: 'Dedicated technical documentation view, analytics dashboard, and live API specifications.',
      status: 'Completed',
    },
  ];

  const apiEndpoints = [
    { method: 'POST', path: '/api/auth/register', auth: 'Public', desc: 'Create new user account' },
    { method: 'POST', path: '/api/auth/login', auth: 'Public', desc: 'Authenticate and receive JWT token' },
    { method: 'GET', path: '/api/auth/me', auth: 'Bearer JWT', desc: 'Get current user profile' },
    { method: 'GET', path: '/api/documents', auth: 'Bearer JWT', desc: 'List documents with search, category, status filter & sort' },
    { method: 'POST', path: '/api/documents', auth: 'Bearer JWT', desc: 'Upload and create new document record (Multipart/Form-Data)' },
    { method: 'GET', path: '/api/documents/:id', auth: 'Bearer JWT', desc: 'Fetch single document details' },
    { method: 'PUT', path: '/api/documents/:id', auth: 'Bearer JWT', desc: 'Update document metadata or replace attachment' },
    { method: 'DELETE', path: '/api/documents/:id', auth: 'Bearer JWT', desc: 'Delete document and erase physical file' },
    { method: 'PATCH', path: '/api/documents/:id/renew', auth: 'Bearer JWT', desc: 'Fast expiry date renewal' },
    { method: 'GET', path: '/api/documents/preview/:file', auth: 'Public', desc: 'Stream file inline (PDF / Images)' },
    { method: 'GET', path: '/api/documents/download/:file', auth: 'Public', desc: 'Download file attachment' },
    { method: 'GET', path: '/api/stats/dashboard', auth: 'Bearer JWT', desc: 'Dashboard metrics, urgent items, 6-mo timeline' },
    { method: 'GET', path: '/api/categories', auth: 'Bearer JWT', desc: 'Fetch preset & custom categories' },
    { method: 'POST', path: '/api/categories', auth: 'Bearer JWT', desc: 'Add user-defined category' },
    { method: 'GET', path: '/api/admin/users', auth: 'Admin JWT', desc: 'List all registered users (Admin only)' },
    { method: 'PUT', path: '/api/admin/users/:id/role', auth: 'Admin JWT', desc: 'Change user role (User <-> Admin)' },
    { method: 'GET', path: '/api/admin/logs', auth: 'Admin JWT', desc: 'View complete system audit trail' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold mb-3 border border-white/20">
              <BookOpen className="w-3.5 h-3.5 text-brand-400" />
              <span>Project Documentation & Specifications</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Personal Document Organizer (MERN Stack)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              A comprehensive system designed to organize personal records, track critical expiration dates, maintain file attachments, and notify users prior to document expiry.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 min-w-[220px]">
            <p className="text-[10px] uppercase font-bold text-slate-300 tracking-wider">
              Live API Status
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-sm font-bold text-emerald-300">
                {healthStatus?.status === 'ok' ? 'Online & Healthy' : 'Connecting...'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              Port: 5050 • MongoDB: 8.2.5
            </p>
          </div>
        </div>
      </div>

      {/* Problem Statement Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-brand-600" />
          1. Problem Statement
        </h2>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed space-y-2">
          <p>
            Individuals regularly manage critical identification cards, insurance policies, vehicle registrations, academic degrees, and warranty receipts. When expiration dates lapse unintentionally, individuals face <strong>costly penalties, insurance lapses, and travel disruptions</strong>.
          </p>
          <p>
            <strong>The Solution:</strong> A centralized MERN-based Personal Document Organizer that enables users to securely store records, categorize them, upload physical scans, and compute real-time expiration states (<em>Valid, Expiring Soon, Expired, Lifetime</em>) with dynamic countdowns and renewal capabilities.
          </p>
        </div>
      </div>

      {/* Objectives Fulfillment Grid */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          2. Objectives & Implementation Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {objectives.map((obj, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Objective {i + 1}
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {obj.status}
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-900">{obj.title}</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">{obj.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MERN Architecture Stack Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          3. MERN Stack Architecture Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* M - MongoDB */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">M - MongoDB</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              NoSQL Document Store. Models: <code>User</code>, <code>Document</code>, <code>Category</code>, <code>ActivityLog</code>. Features virtual computed fields (<code>status</code>, <code>daysRemaining</code>) and indexed queries.
            </p>
          </div>

          {/* E - Express.js */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">E - Express.js</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Lightweight routing & middleware framework. Manages auth middleware (JWT), Multer file multipart handlers, error handling, and REST endpoints.
            </p>
          </div>

          {/* R - React.js */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Layout className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">R - React.js + Vite</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Component-based frontend interface with Context API (Auth), responsive Tailwind utility styling, real-time filtering, Lucide icons, and modal workflows.
            </p>
          </div>

          {/* N - Node.js */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">N - Node.js</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Asynchronous JavaScript runtime environment executing backend services, bcrypt hashing, stream pipelines, and file system I/O.
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          4. Role-Based Access Control (RBAC) Specification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                USER ROLE
              </span>
              <span className="text-xs font-bold text-slate-700">Standard Personal Account</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Manage personal documents (Create, Read, Update, Delete)</li>
              <li>Upload and preview file attachments (PDFs, Images, DOCX)</li>
              <li>Receive real-time expiration notifications and warnings</li>
              <li>Create customized user categories</li>
              <li>Execute 1-click renewal date adjustments</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-600 text-white">
                ADMIN ROLE
              </span>
              <span className="text-xs font-bold text-slate-900">System Administrator</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>All user privileges included</li>
              <li>Access system-wide User Management directory</li>
              <li>Promote or demote user roles (User ↔ Admin)</li>
              <li>View system audit & activity logs (CREATE, UPDATE, DELETE, LOGIN)</li>
              <li>Monitor global storage utilization & multi-tenant stats</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive REST API Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Code className="w-5 h-5 text-brand-600" />
            5. Documented REST API Endpoints
          </h2>
          <span className="text-xs font-bold text-slate-400 font-mono">
            {apiEndpoints.length} Routes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Endpoint Route</th>
                <th className="py-2.5 px-3">Security Level</th>
                <th className="py-2.5 px-3">Operation Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {apiEndpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === 'GET'
                          ? 'bg-blue-100 text-blue-800'
                          : ep.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ep.method === 'PUT'
                          ? 'bg-amber-100 text-amber-800'
                          : ep.method === 'PATCH'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-800 font-semibold">{ep.path}</td>
                  <td className="py-2 px-3 text-slate-500 text-[11px]">{ep.auth}</td>
                  <td className="py-2 px-3 text-slate-600 font-sans text-xs">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
