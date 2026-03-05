import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Download, Share2, Trash2, File, ChevronRight, Eye,
    ExternalLink, CheckCircle2, Copy, Info,
    History, ListChecks,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fileTypeIconMap, fileTypeColors } from '../components/documents/fileTypes';

// ── helpers ────────────────────────────────────────────────────────────────────
const categoryLabels = {
    'Tài liệu': 'Document', 'Hợp đồng': 'Contract', 'Báo cáo': 'Report',
    'Biên bản': 'Minutes', 'Quy trình': 'Process', 'Khác': 'Other',
    Report: 'Report', Spreadsheet: 'Spreadsheet',
    'Technical Document': 'Technical Document', Media: 'Media', Archive: 'Archive',
};
const avatarPalette = [
    'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
    'bg-orange-500', 'bg-teal-500', 'bg-rose-500',
];

function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return '—';
    if (typeof bytes === 'string') return bytes;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function getExt(name = '') {
    return name.includes('.') ? name.split('.').pop().toUpperCase() : 'FILE';
}
function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
function timeAgo(dateStr) {
    if (!dateStr) return '—';
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(dateStr);
}
function getInitials(name = '') {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
}
function avatarBg(name = '') {
    let h = 0; for (const c of name) h += c.charCodeAt(0);
    return avatarPalette[h % avatarPalette.length];
}
function getCategoryLabel(cat) { return categoryLabels[cat] || cat || 'Other'; }

// ── Preview pane ───────────────────────────────────────────────────────────────
function DocumentPreview({ doc, previewUrl }) {
    const ext = doc?.type || getExt(doc?.name);
    const catLabel = getCategoryLabel(doc?.category);

    if (ext === 'PDF' && previewUrl) {
        return (
            <iframe src={previewUrl} title={doc.name} className="w-full h-full rounded border-0" />
        );
    }
    if ((ext === 'PNG' || ext === 'JPG') && previewUrl) {
        return (
            <div className="w-full h-full flex items-center justify-center p-10">
                <img src={previewUrl} alt={doc.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
            </div>
        );
    }

    // Rich simulated document placeholder
    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 shadow-2xl min-h-full p-12 rounded-lg relative">
            {/* Colored top accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-primary-600 dark:bg-primary-500 rounded-t-lg" />
            <div className="flex flex-col gap-8 pt-2">
                {/* Document header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-black text-primary-700 dark:text-primary-400 uppercase tracking-tight">
                            {catLabel}
                        </h2>
                        <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mt-0.5">
                            {doc?.name}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{ext}</p>
                        <p className="text-xs text-slate-400">{formatDate(doc?.created_at || doc?.date)}</p>
                    </div>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800" />
                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'File Size', value: formatBytes(doc?.size), sub: ext + ' format' },
                        { label: 'Category',  value: catLabel,               sub: 'Document type' },
                        { label: 'Owner',     value: doc?.owner || '—',      sub: 'Uploaded by'   },
                    ].map((s) => (
                        <div key={s.label} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
                            <p className="text-base font-bold text-primary-700 dark:text-primary-400 mt-1 truncate">{s.value}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
                        </div>
                    ))}
                </div>
                {/* Body */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">Document Overview</h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                        This document is stored securely in Enterprise Docs. Use the action buttons above to
                        download, share, or manage this file. The AI assistant can answer questions about its contents.
                    </p>
                    <div className="space-y-2 pt-2">
                        {[100, 90, 95, 75].map((w, i) => (
                            <div key={i} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800" style={{ width: `${w}%` }} />
                        ))}
                    </div>
                    <div className="w-full aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700 mt-4">
                        <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600">
                            <Eye className="w-8 h-8" />
                            <p className="text-xs font-medium">Preview not available for {ext} files</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {[85, 70, 90].map((w, i) => (
                            <div key={i} className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800" style={{ width: `${w}%` }} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function DocumentView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authFetch } = useAuth();

    const [doc, setDoc] = useState(null);
    const [loading, setLoading] = useState(true);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [shareModal, setShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchDoc();
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [id]);

    const fetchDoc = async () => {
        setLoading(true);
        try {
            const res = await authFetch(`/api/documents/${id}`);
            if (!res.ok) { navigate('/documents'); return; }
            const data = await res.json();
            setDoc(data);
            const ext = data.type || getExt(data.name);
            if (['PDF', 'PNG', 'JPG'].includes(ext)) fetchPreview(data.id, ext);
        } catch { navigate('/documents'); }
        finally { setLoading(false); }
    };

    const fetchPreview = async (docId, ext) => {
        try {
            const res = await authFetch(`/api/documents/${docId}/download`);
            if (!res.ok) return;
            const blob = await res.blob();
            const mime = ext === 'PDF' ? 'application/pdf' : `image/${ext.toLowerCase()}`;
            setPreviewUrl(URL.createObjectURL(new Blob([blob], { type: mime })));
        } catch { /* no preview */ }
    };

    const handleDownload = async () => {
        try {
            const res = await authFetch(`/api/documents/${doc.id}/download`);
            if (!res.ok) return;
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = doc.name; a.click();
            URL.revokeObjectURL(url);
        } catch { /* silent */ }
    };

    const handleDelete = async () => {
        try {
            const res = await authFetch(`/api/documents/${doc.id}`, { method: 'DELETE' });
            if (res.ok) navigate('/documents');
        } catch { /* silent */ }
        setDeleteModal(false);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="-mx-4 lg:-mx-8 -mt-4 lg:-mt-8 flex items-center justify-center" style={{ height: 'calc(100vh - 4rem)' }}>
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-400">Loading document…</p>
                </div>
            </div>
        );
    }

    const ext = doc?.type || getExt(doc?.name);
    const Icon = fileTypeIconMap[ext] || File;
    const iconColor = fileTypeColors[ext] || 'text-slate-400';
    const catLabel = getCategoryLabel(doc?.category);
    const tags = Array.isArray(doc?.tags)
        ? doc.tags
        : (doc?.tags ? String(doc.tags).split(',').map(t => t.trim()).filter(Boolean) : []);

    const versions = [
        { label: 'V 2.1', note: 'Current', user: doc?.owner || 'You', time: doc?.date || doc?.created_at, current: true },
        { label: 'V 2.0', user: doc?.owner || 'System', time: doc?.created_at, current: false },
        { label: 'V 1.0', user: 'System', time: doc?.created_at, current: false },
    ];
    const activity = [
        { icon: <Eye className="w-4 h-4" />, bg: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400', user: doc?.owner || 'You', action: 'uploaded this document', time: doc?.created_at },
        { icon: <Info className="w-4 h-4" />, bg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400', user: 'System', action: 'indexed document for AI search', time: doc?.created_at },
    ];

    return (
        // Break out of layout padding for full-bleed layout
        <div className="-mx-4 lg:-mx-8 -mt-4 lg:-mt-8 flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>

            {/* ── Sticky breadcrumb + actions bar ────────────────────── */}
            <div className="shrink-0 px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 z-10">
                <div className="flex flex-col min-w-0">
                    <nav className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <button onClick={() => navigate('/documents')} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            Documents
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                        <span className="hover:text-primary-600 dark:hover:text-primary-400 cursor-default transition-colors">{catLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                        <span className="text-slate-400 dark:text-slate-500 truncate max-w-[180px]">{doc?.name}</span>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate max-w-lg">{doc?.name}</h1>
                        <span className="px-2 py-0.5 rounded bg-primary-600/10 dark:bg-primary-500/20 text-primary-700 dark:text-primary-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
                            {catLabel}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
                        <Download className="w-4 h-4" /> Download
                    </button>
                    <button onClick={() => setShareModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    {previewUrl && (
                        <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <ExternalLink className="w-4 h-4" /> Open
                        </a>
                    )}
                    <button onClick={() => setDeleteModal(true)}
                        className="flex items-center justify-center w-10 h-10 bg-slate-100 dark:bg-slate-800 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Delete document">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Main body ─────────────────────────────────────────── */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left: Preview pane */}
                <div className="flex-1 p-8 bg-slate-200 dark:bg-slate-950 overflow-y-auto">
                    <DocumentPreview doc={doc} previewUrl={previewUrl} />
                </div>

                {/* Right: Info sidebar */}
                <aside className="w-80 xl:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto shrink-0">

                    {/* ─ File Information ─ */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Info className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            File Information
                        </h3>
                        <div className="space-y-3">
                            <MetaRow label="File size" value={formatBytes(doc?.size)} />
                            <MetaRow label="Type" value={ext} />
                            <MetaRow label="Created" value={formatDate(doc?.created_at || doc?.date)} />
                            <MetaRow label="Modified" value={formatDate(doc?.date || doc?.created_at)} />
                            <MetaRow label="Owner" value={
                                <div className="flex items-center gap-2">
                                    <span>{doc?.owner || '—'}</span>
                                    <div className={`w-4 h-4 rounded-full ${avatarBg(doc?.owner)} flex items-center justify-center text-white text-[8px] font-bold`}>
                                        {getInitials(doc?.owner).slice(0, 1)}
                                    </div>
                                </div>
                            } />
                            <MetaRow label="Location" value={
                                <span className="text-primary-600 dark:text-primary-400">/{catLabel}/Files</span>
                            } />
                            <div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Tags</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.length > 0
                                        ? tags.map((tag, i) => (
                                            <span key={i} className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                                                {tag}
                                            </span>
                                        ))
                                        : <span className="text-[10px] text-slate-400 italic">No tags</span>
                                    }
                                    <button className="px-2 py-1 rounded-full bg-primary-600/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold hover:bg-primary-600/20 transition-colors">+</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─ Version History ─ */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <History className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                Version History
                            </h3>
                            <button className="text-primary-600 dark:text-primary-400 text-[10px] font-bold uppercase hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            {versions.map((v, idx) => (
                                <div key={v.label} className="flex gap-3 relative">
                                    {idx < versions.length - 1 && (
                                        <div className="absolute left-[7px] top-5 bottom-0 w-px bg-slate-100 dark:bg-slate-800" />
                                    )}
                                    <div className={`w-3.5 h-3.5 rounded-full shrink-0 z-10 mt-0.5 ring-4 ${
                                        v.current
                                            ? 'bg-primary-600 ring-primary-600/15 dark:ring-primary-500/20'
                                            : 'bg-slate-200 dark:bg-slate-700 ring-transparent'
                                    }`} />
                                    <div className="flex-1 pb-1">
                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            {v.label}
                                            {v.current && <span className="ml-2 text-slate-400 dark:text-slate-500 font-normal">Current</span>}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{timeAgo(v.time)} by {v.user}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ─ Activity Log ─ */}
                    <div className="p-6 flex-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <ListChecks className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                            Activity Log
                        </h3>
                        <div className="space-y-5">
                            {activity.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.bg}`}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-700 dark:text-slate-300">
                                            <strong className="text-slate-900 dark:text-white">{item.user}</strong>{' '}{item.action}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(item.time)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {/* ── Status footer ──────────────────────────────────────── */}
            <footer className="shrink-0 h-8 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 flex items-center justify-between text-[10px] text-slate-400">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> All changes saved
                    </span>
                    {doc?.id && <span>ID: DOC-{String(doc.id).padStart(4, '0')}</span>}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleCopyLink} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                        {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied!' : 'Copy link'}
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">Enterprise Docs</span>
                </div>
            </footer>

            {/* ── Delete modal ─────────────────────────────────────── */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-11 h-11 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white text-center mb-1">Delete Document</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-5">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">"{doc?.name}"</span>? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Share modal ──────────────────────────────────────── */}
            {shareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShareModal(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">Share Document</h3>
                            <button onClick={() => setShareModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">✕</button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Document Link</label>
                            <div className="flex gap-2">
                                <input readOnly value={window.location.href}
                                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 outline-none" />
                                <button onClick={handleCopyLink}
                                    className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors flex items-center gap-1.5">
                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 text-center border-t border-slate-100 dark:border-slate-800 pt-4">
                            Share with anyone in your organization who has access.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────
function MetaRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 text-xs">
            <span className="text-slate-400 shrink-0">{label}</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{value}</span>
        </div>
    );
}
