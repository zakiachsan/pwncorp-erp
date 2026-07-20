'use client';

import React, { useEffect, useState } from 'react';
import { ChevronRight, Star } from 'lucide-react';

interface AccountNode {
  code: string;
  name: string;
  children?: AccountNode[];
}

// Helper to collect all parent node codes
function collectAllParentCodes(nodes: AccountNode[]): string[] {
  const codes: string[] = [];
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      codes.push(node.code);
      codes.push(...collectAllParentCodes(node.children));
    }
  });
  return codes;
}

// Helper to get only level-1 parent codes (for default expansion)
function getLevel1ParentCodes(nodes: AccountNode[]): string[] {
  return nodes
    .filter((node) => node.children && node.children.length > 0)
    .map((node) => node.code);
}

// Convert flat COA data to tree
function buildTree(accounts: any[]): AccountNode[] {
  const map = new Map<string, AccountNode>();
  const roots: AccountNode[] = [];

  accounts.forEach((a) => {
    map.set(a.code, { code: a.code, name: a.name, children: a.children ? [] : undefined });
  });

  accounts.forEach((a) => {
    const node = map.get(a.code)!;
    if (a.parentId) {
      const parentCode = accounts.find((p) => p.id === a.parentId)?.code;
      if (parentCode && map.has(parentCode)) {
        const parent = map.get(parentCode)!;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

interface TreeNodeProps {
  node: AccountNode;
  level: number;
  expandedNodes: Set<string>;
  toggleNode: (code: string) => void;
}

function TreeNode({ node, level, expandedNodes, toggleNode }: TreeNodeProps) {
  const isExpanded = expandedNodes.has(node.code);
  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 24;

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          paddingLeft: `${indent + 12}px`,
          paddingRight: '12px',
          paddingTop: '6px',
          paddingBottom: '6px',
          cursor: hasChildren ? 'pointer' : 'default',
          backgroundColor: 'transparent',
          borderBottom: '1px solid #ecebea',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = '#f9f9f9';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
        }}
        onClick={() => {
          if (hasChildren) toggleNode(node.code);
        }}
      >
        {/* Expand/Collapse Arrow */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            marginRight: '4px',
            flexShrink: 0,
          }}
        >
          {hasChildren ? (
            <ChevronRight
              size={14}
              color="#444746"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          ) : (
            <span style={{ width: '14px' }} />
          )}
        </span>

        {/* Account Code */}
        <span
          style={{
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: level === 0 ? '14px' : level === 1 ? '13px' : '12px',
            fontWeight: level <= 1 ? '700' : '400',
            color: level === 0 ? '#001526' : '#001526',
            minWidth: level === 0 ? '32px' : level === 1 ? '48px' : '64px',
            marginRight: '12px',
            flexShrink: 0,
          }}
        >
          {node.code}
        </span>

        {/* Account Name */}
        <span
          style={{
            fontSize: level === 0 ? '14px' : level === 1 ? '13px' : '13px',
            fontWeight: level <= 1 ? '700' : '400',
            color: level === 0 ? '#001526' : '#444746',
            letterSpacing: level === 0 ? '0.5px' : '0',
          }}
        >
          {node.name}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <>
          {node.children!.map((child) => (
            <TreeNode
              key={child.code}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
        </>
      )}
    </>
  );
}

export default function AccountTreePage() {
  const [accountData, setAccountData] = useState<AccountNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/coa?flat=true')
      .then((r) => r.json())
      .then((json) => {
        const accounts = json.data || [];
        // If API already returns tree structure, use it directly
        if (accounts.length > 0 && accounts[0].children !== undefined) {
          setAccountData(accounts);
        } else {
          setAccountData(accounts);
        }
        // Default: expand level-1 parent nodes
        const level1Codes = getLevel1ParentCodes(accounts.length > 0 && accounts[0].children !== undefined ? accounts : []);
        setExpandedNodes(new Set(level1Codes));
        setLoading(false);
      })
      .catch(() => { setError("Failed to load account tree"); setLoading(false); });
  }, []);

  const toggleNode = (code: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allCodes = collectAllParentCodes(accountData);
    setExpandedNodes(new Set(allCodes));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f4f6f9',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #ecebea',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Star size={20} color="#0176d3" fill="#0176d3" />
          <h1
            style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '600',
              color: '#001526',
            }}
          >
            Account Tree
          </h1>
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={expandAll}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#0176d3',
              backgroundColor: '#fff',
              border: '1px solid #0176d3',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#0176d3';
              (e.target as HTMLButtonElement).style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#fff';
              (e.target as HTMLButtonElement).style.color = '#0176d3';
            }}
          >
            Open All
          </button>
          <button
            onClick={collapseAll}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '500',
              color: '#444746',
              backgroundColor: '#fff',
              border: '1px solid #d0d0d0',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#f4f6f9';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#fff';
            }}
          >
            Close All
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          maxWidth: '900px',
          margin: '20px auto',
          padding: '0 24px',
        }}
      >
        {/* Tree Card */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #ecebea',
            borderRadius: '6px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          {/* Tree Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              paddingLeft: '12px',
              paddingRight: '12px',
              paddingTop: '10px',
              paddingBottom: '10px',
              backgroundColor: '#f9f9f9',
              borderBottom: '1px solid #ecebea',
              gap: '4px',
            }}
          >
            <span style={{ width: '24px' }} /> {/* Arrow spacer */}
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#444746',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                minWidth: '64px',
                marginRight: '12px',
              }}
            >
              Code
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#444746',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Account Name
            </span>
          </div>
          {accountData.map((node) => (
            <TreeNode
              key={node.code}
              node={node}
              level={0}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
