'use client';

import React, { useState } from 'react';
import { ChevronRight, Star } from 'lucide-react';

interface AccountNode {
  code: string;
  name: string;
  children?: AccountNode[];
}

const accountData: AccountNode[] = [
  {
    code: '1',
    name: 'ASSETS',
    children: [
      {
        code: '11',
        name: 'KAS',
        children: [
          { code: '1101', name: 'KAS PENJUALAN' },
          { code: '1102', name: 'KAS KECIL' },
        ],
      },
      {
        code: '12',
        name: 'BANK',
        children: [
          { code: '1201', name: 'BANK BCA' },
          { code: '1202', name: 'BANK MANDIRI' },
        ],
      },
      {
        code: '13',
        name: 'PIUTANG',
        children: [
          { code: '1301', name: 'PIUTANG DAGANG' },
          { code: '1302', name: 'PIUTANG PELANGGAN SERVICE' },
        ],
      },
      {
        code: '14',
        name: 'PERSEDIAAN',
        children: [
          { code: '1401', name: 'PERSEDIAAN SPAREPART' },
          { code: '1402', name: 'PERSEDIAAN OLI' },
        ],
      },
      {
        code: '15',
        name: 'AKTIVA TETAP',
        children: [
          { code: '1501', name: 'PERALATAN BENGKEL' },
          { code: '1502', name: 'KENDARAAN' },
          { code: '1503', name: 'INVENTARIS KANTOR' },
        ],
      },
      {
        code: '16',
        name: 'AKUMULASI PENYUSUTAN',
        children: [
          { code: '1601', name: 'AKUM PENYUSUTAN PERALATAN' },
          { code: '1602', name: 'AKUM PENYUSUTAN KENDARAAN' },
        ],
      },
    ],
  },
  {
    code: '2',
    name: 'LIABILITIES',
    children: [
      {
        code: '21',
        name: 'HUTANG DAGANG',
        children: [{ code: '2101', name: 'HUTANG SUPPLIER' }],
      },
      {
        code: '22',
        name: 'HUTANG PAJAK',
        children: [
          { code: '2201', name: 'PPN KELUARAN' },
          { code: '2202', name: 'PPH 21' },
        ],
      },
      {
        code: '23',
        name: 'KEWAJIBAN LAIN-LAIN',
        children: [{ code: '2301', name: 'HUTANG GAJI' }],
      },
    ],
  },
  {
    code: '3',
    name: 'EQUITY',
    children: [
      {
        code: '31',
        name: 'MODAL USAHA',
        children: [{ code: '3101', name: 'MODAL DISETOR' }],
      },
      {
        code: '32',
        name: 'LABA DITAHAN',
        children: [{ code: '3201', name: 'LABA TAHUN BERJALAN' }],
      },
    ],
  },
  {
    code: '4',
    name: 'REVENUE',
    children: [
      {
        code: '41',
        name: 'PENDAPATAN SERVICE',
        children: [
          { code: '4101', name: 'PENDAPATAN JASA SERVIS' },
          { code: '4102', name: 'PENDAPATAN JASA SPOORING' },
          { code: '4103', name: 'PENDAPATAN JASA BALANCING' },
        ],
      },
      {
        code: '42',
        name: 'PENDAPATAN SPAREPART',
        children: [
          { code: '4201', name: 'PENJUALAN SPAREPART' },
          { code: '4202', name: 'RETUR PENJUALAN' },
        ],
      },
      {
        code: '43',
        name: 'PENDAPATAN LAIN-LAIN',
        children: [{ code: '4301', name: 'PENDAPATAN BUNGA BANK' }],
      },
    ],
  },
  {
    code: '5',
    name: 'HPP',
    children: [
      {
        code: '51',
        name: 'HPP SPAREPART',
        children: [{ code: '5101', name: 'HPP SPAREPART' }],
      },
      {
        code: '52',
        name: 'HPP SERVICE',
        children: [{ code: '5201', name: 'HPP JASA SERVICE' }],
      },
    ],
  },
  {
    code: '6',
    name: 'EXPENSES',
    children: [
      {
        code: '61',
        name: 'BEBAN GAJI',
        children: [
          { code: '6101', name: 'GAJI KARYAWAN' },
          { code: '6102', name: 'TUNJANGAN' },
        ],
      },
      {
        code: '62',
        name: 'BEBAN UMUM',
        children: [
          { code: '6201', name: 'BEBAN LISTRIK & AIR' },
          { code: '6202', name: 'BEBAN SEWA' },
          { code: '6203', name: 'BEBAN ATK' },
        ],
      },
      {
        code: '63',
        name: 'BEBAN PENJUALAN',
        children: [{ code: '6301', name: 'BEBAN IKLAN' }],
      },
      {
        code: '64',
        name: 'BEBAN PERBAIKAN',
        children: [
          { code: '6401', name: 'BEBAN PEMELIHARAAN PERALATAN' },
          { code: '6402', name: 'BEBAN PEMELIHARAAN KENDARAAN' },
        ],
      },
      {
        code: '65',
        name: 'BEBAN PENYUSUTAN',
        children: [
          { code: '6501', name: 'BEBAN PENYUSUTAN PERALATAN' },
          { code: '6502', name: 'BEBAN PENYUSUTAN KENDARAAN' },
        ],
      },
      {
        code: '66',
        name: 'BEBAN PAJAK',
        children: [
          { code: '6601', name: 'BEBAN PPh 21' },
          { code: '6602', name: 'BEBAN PPh 23' },
        ],
      },
    ],
  },
];

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
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    // Default: level-1 parent nodes expanded
    const level1Codes = getLevel1ParentCodes(accountData);
    return new Set(level1Codes);
  });

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

          {/* Tree Body */}
          <div>
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

        {/* Footer Info */}
        <div
          style={{
            marginTop: '16px',
            padding: '12px 16px',
            backgroundColor: '#fff',
            border: '1px solid #ecebea',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#444746',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontWeight: '600' }}>
            {expandedNodes.size}
          </span>
          <span>nodes expanded</span>
          <span style={{ margin: '0 4px', color: '#d0d0d0' }}>|</span>
          <span style={{ fontWeight: '600' }}>
            {collectAllParentCodes(accountData).length}
          </span>
          <span>total nodes</span>
        </div>
      </div>
    </div>
  );
}
