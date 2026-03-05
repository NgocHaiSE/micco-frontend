// src/components/document-view/DocumentInfoSidebar.jsx
import { Info, History, ListChecks } from 'lucide-react';
import { formatBytes, formatDate, timeAgo, getInitials, avatarColor } from '../../utils/formatters';

// ── MetaRow ───────────────────────────────────────────────────────────────────
function MetaRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 text-xs">
            <span className="text-slate-400 shrink-0">{label}</span>
            <span className="font-medium text-slate-800 dark:text-slate-200 text-right">{value}</span>
        </div>
    );
}

// ── DocumentInfoSidebar ────────────────────────────────────────────────────────
export default function DocumentInfoSidebar({ doc, versions, activity, tags, ext, catLabel }) {
    return (
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
                            <div className={`w-4 h-4 rounded-full ${avatarColor(doc?.owner)} flex items-center justify-center text-white text-[8px] font-bold`}>
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
    );
}
