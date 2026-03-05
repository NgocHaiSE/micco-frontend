import { useState, useRef, useEffect } from 'react';
import { FileText, Sparkles, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { examplePrompts } from '../data/mockData';
import Breadcrumb from '../components/shared/Breadcrumb';
import DocumentContextPanel from '../components/chat/DocumentContextPanel';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';

export default function ChatAssistant() {
    const { authFetch } = useAuth();
    const [messages, setMessages] = useState([
        {
            id: 0,
            role: 'ai',
            content: 'Hello! I\'m your AI Document Assistant. I can help you find information, summarize documents, or answer questions based on your uploaded files. How can I help you today?',
            sources: [],
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [selectedDocs, setSelectedDocs] = useState(new Set());
    const [showDocs, setShowDocs] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch documents for the context panel
    useEffect(() => {
        fetchDocuments();
        fetchChatHistory();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await authFetch('/api/documents');
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
                // Auto-select first few documents
                const autoSelect = new Set(data.slice(0, 4).map(d => d.id));
                setSelectedDocs(autoSelect);
            }
        } catch (err) {
            console.error('Failed to fetch documents:', err);
        }
    };

    const fetchChatHistory = async () => {
        try {
            const res = await authFetch('/api/chat/history');
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) {
                    setMessages(prev => [prev[0], ...data]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch chat history:', err);
        }
    };

    const toggleDoc = (id) => {
        setSelectedDocs(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const sendMessage = async (text) => {
        if (!text.trim()) return;
        const userMsg = { id: Date.now(), role: 'user', content: text, sources: [] };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await authFetch('/api/chat/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    document_ids: Array.from(selectedDocs),
                }),
            });

            if (res.ok) {
                const aiMsg = await res.json();
                setMessages(prev => [...prev, aiMsg]);
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    role: 'ai',
                    content: 'Sorry, I encountered an error processing your request. Please try again.',
                    sources: [],
                }]);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                role: 'ai',
                content: 'Sorry, I couldn\'t connect to the server. Please check if the backend is running.',
                sources: [],
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <>
            <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'AI Chat' }]} />
            <div className="flex h-[calc(100vh-8rem)] gap-6">
                <DocumentContextPanel
                    documents={documents}
                    selectedDocs={selectedDocs}
                    showDocs={showDocs}
                    onToggle={toggleDoc}
                />

                {/* Chat Panel */}
                <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden">
                    {/* Chat Header */}
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white">AI Document Assistant</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Ask questions about your documents • {selectedDocs.size} docs in context
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDocs(!showDocs)}
                            className="ml-auto hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-800 transition-colors"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            {showDocs ? 'Hide' : 'Show'} Docs
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
                        {messages.map((msg) => (
                            <ChatMessage key={msg.id} msg={msg} />
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center text-white flex-shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="chat-bubble-ai flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-secondary-500" />
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Analyzing documents...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <ChatInput
                        input={input}
                        loading={loading}
                        onInputChange={(e) => setInput(e.target.value)}
                        onSubmit={handleSubmit}
                        onPromptClick={sendMessage}
                        showPrompts={messages.length <= 1}
                        prompts={examplePrompts.slice(0, 4)}
                    />
                </div>
            </div>
        </>
    );
}
