'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  ChevronRight,
  ChevronDown,
  Trash2,
  Star,
  Sparkles,
  FileText,
  Menu,
  X,
  LogOut,
  FolderPlus,
  Settings,
} from 'lucide-react';
import { Document, DocumentNode } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { SearchModal } from './SearchModal';

interface SidebarProps {
  documents: Document[];
  onDocumentCreated?: (doc: Document) => void;
  onDocumentDeleted?: (id: string) => void;
  onToggleFavorite?: (id: string, isFav: boolean) => void;
  userEmail?: string | null;
}

export function Sidebar({
  documents,
  onDocumentCreated,
  onDocumentDeleted,
  onToggleFavorite,
  userEmail,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  // Listen for Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Build tree from flat documents
  const buildTree = (docs: Document[]): DocumentNode[] => {
    const map = new Map<string, DocumentNode>();
    const roots: DocumentNode[] = [];

    docs.forEach((doc) => {
      map.set(doc.id, { ...doc, children: [] });
    });

    docs.forEach((doc) => {
      const node = map.get(doc.id)!;
      if (doc.parent_id && map.has(doc.parent_id)) {
        map.get(doc.parent_id)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const tree = buildTree(documents.filter((d) => !d.is_archived));
  const favorites = documents.filter((d) => d.is_favorite && !d.is_archived);

  // Create a new document in Supabase
  const handleCreateDocument = async (parentId?: string | null) => {
    try {
      const newDocPayload = {
        title: 'Untitled',
        content: [],
        parent_id: parentId || null,
        is_favorite: false,
        is_archived: false,
        icon: '📄',
        cover_image: null,
      };

      let createdDoc: Document;

      const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

      if (hasSupabaseUrl) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from('documents')
          .insert({
            ...newDocPayload,
            user_id: user?.id || 'demo-user',
          })
          .select()
          .single();

        if (error || !data) {
          throw new Error(error?.message || 'Failed to create document in Supabase');
        }
        createdDoc = data;
      } else {
        // Local state fallback
        createdDoc = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          user_id: 'local-user',
          ...newDocPayload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      if (parentId) {
        setExpandedNodes((prev) => ({ ...prev, [parentId]: true }));
      }

      if (onDocumentCreated) {
        onDocumentCreated(createdDoc);
      }

      router.push(`/doc/${createdDoc.id}`);
      setIsMobileOpen(false);
    } catch (err) {
      console.error('Create page error:', err);
      // Fallback local create
      const fallbackDoc: Document = {
        id: `doc_${Date.now()}`,
        user_id: 'local-user',
        title: 'Untitled',
        content: [],
        parent_id: parentId || null,
        is_favorite: false,
        is_archived: false,
        icon: '📄',
        cover_image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (onDocumentCreated) onDocumentCreated(fallbackDoc);
      router.push(`/doc/${fallbackDoc.id}`);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Render recursive tree item
  const renderTreeItem = (node: DocumentNode, depth = 0) => {
    const isActive = pathname === `/doc/${node.id}`;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = !!expandedNodes[node.id];

    return (
      <div key={node.id} className="select-none text-xs">
        <div
          className={`group flex items-center justify-between py-1 px-2 rounded-md transition cursor-pointer my-0.5 ${
            isActive
              ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          <div
            className="flex items-center gap-1.5 flex-1 truncate"
            onClick={() => {
              router.push(`/doc/${node.id}`);
              setIsMobileOpen(false);
            }}
          >
            {/* Expand / Collapse arrow */}
            <button
              onClick={(e) => toggleExpand(node.id, e)}
              className={`p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 ${
                hasChildren ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-neutral-400" />
              )}
            </button>

            <span className="text-sm">{node.icon || '📄'}</span>
            <span className="truncate">{node.title || 'Untitled'}</span>
          </div>

          {/* Action buttons on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Add subpage */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCreateDocument(node.id);
              }}
              title="Add a sub-page"
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <Plus className="w-3 h-3" />
            </button>

            {/* Favorite toggle */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onToggleFavorite) onToggleFavorite(node.id, !node.is_favorite);
              }}
              title={node.is_favorite ? 'Remove favorite' : 'Add to favorites'}
              className="p-1 rounded text-neutral-400 hover:text-amber-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <Star
                className={`w-3 h-3 ${node.is_favorite ? 'fill-amber-400 text-amber-400' : ''}`}
              />
            </button>

            {/* Delete button */}
            {onDocumentDeleted && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDocumentDeleted(node.id);
                }}
                title="Delete page"
                className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Nested children */}
        {hasChildren && isExpanded && (
          <div>{node.children!.map((child) => renderTreeItem(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#fbfbfa] dark:bg-[#1f1f1f] border-r border-neutral-200/80 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 select-none">
      {/* Top Workspace Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-neutral-200/60 dark:border-neutral-800">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            N
          </div>
          <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            Notion AI
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            Gemini
          </span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation Actions */}
      <div className="p-2 space-y-0.5">
        {/* Quick Search */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span>Search</span>
          </div>
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500">
            ⌘K
          </kbd>
        </button>

        {/* New Page button */}
        <button
          onClick={() => handleCreateDocument()}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition font-medium"
        >
          <Plus className="w-3.5 h-3.5 text-neutral-400" />
          <span>New Page</span>
        </button>
      </div>

      {/* Scrollable Tree Section */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Favorites section */}
        {favorites.length > 0 && (
          <div>
            <div className="px-2 mb-1 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Favorites
            </div>
            {favorites.map((fav) => (
              <Link
                key={`fav_${fav.id}`}
                href={`/doc/${fav.id}`}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between py-1 px-2 rounded-md text-xs transition ${
                  pathname === `/doc/${fav.id}`
                    ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-sm">{fav.icon || '📄'}</span>
                  <span className="truncate">{fav.title || 'Untitled'}</span>
                </div>
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              </Link>
            ))}
          </div>
        )}

        {/* Workspace Pages Tree */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Pages
            </span>
            <button
              onClick={() => handleCreateDocument()}
              title="Add a page"
              className="p-0.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {tree.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-neutral-400">
              No pages yet. Click &ldquo;New Page&rdquo; to start.
            </div>
          ) : (
            tree.map((node) => renderTreeItem(node, 0))
          )}
        </div>
      </div>

      {/* Footer User Info & Sign Out */}
      <div className="p-3 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
        <div className="truncate max-w-[150px]">
          <div className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
            {userEmail || 'Demo Account'}
          </div>
          <div className="text-[10px] text-neutral-400">Notion Free Tier</div>
        </div>
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        documents={documents}
      />
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 p-1.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm text-neutral-700 dark:text-neutral-300"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
