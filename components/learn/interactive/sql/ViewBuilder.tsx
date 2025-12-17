'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Table, Lock, Check, X, Plus, Trash2, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewBuilderProps {
  mode?: 'beginner' | 'intermediate' | 'advanced';
}

interface Column {
  name: string;
  table: string;
  selected: boolean;
}

const sampleTables = {
  Employees: ['EmployeeID', 'FirstName', 'LastName', 'Email', 'Salary', 'DepartmentID'],
  Departments: ['DepartmentID', 'DepartmentName', 'ManagerID', 'Budget'],
  Projects: ['ProjectID', 'ProjectName', 'StartDate', 'EndDate', 'Budget'],
};

export function ViewBuilder({ mode = 'beginner' }: ViewBuilderProps) {
  const [viewName, setViewName] = useState('vw_EmployeeDetails');
  const [selectedColumns, setSelectedColumns] = useState<Column[]>([
    { name: 'FirstName', table: 'Employees', selected: true },
    { name: 'LastName', table: 'Employees', selected: true },
    { name: 'DepartmentName', table: 'Departments', selected: true },
  ]);
  const [whereClause, setWhereClause] = useState('');
  const [showSQL, setShowSQL] = useState(false);

  const toggleColumn = (table: string, column: string) => {
    const exists = selectedColumns.find(c => c.table === table && c.name === column);
    if (exists) {
      setSelectedColumns(prev => prev.filter(c => !(c.table === table && c.name === column)));
    } else {
      setSelectedColumns(prev => [...prev, { name: column, table, selected: true }]);
    }
  };

  const generateSQL = () => {
    if (selectedColumns.length === 0) return '-- Select some columns first';
    
    const tables = [...new Set(selectedColumns.map(c => c.table))];
    const cols = selectedColumns.map(c => `${c.table}.${c.name}`).join(',\n    ');
    
    let sql = `CREATE VIEW ${viewName} AS\nSELECT\n    ${cols}\nFROM ${tables[0]}`;
    
    // Add JOINs if multiple tables
    if (tables.includes('Employees') && tables.includes('Departments')) {
      sql += `\nJOIN Departments ON Employees.DepartmentID = Departments.DepartmentID`;
    }
    
    if (whereClause) {
      sql += `\nWHERE ${whereClause}`;
    }
    
    sql += ';';
    return sql;
  };

  return (
    <div className="p-6 rounded-xl bg-linear-to-br from-slate-900 to-slate-800 border border-slate-700/50 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-cyan-500/20">
          <Eye className="h-5 w-5 text-cyan-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">View Builder</h3>
      </div>

      {/* Beginner Explanation */}
      {mode === 'beginner' && (
        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 mb-6">
          <p className="text-white font-medium">What is a View?</p>
          <p className="text-slate-400 text-sm mt-1">
            💡 A view is like a &quot;saved search&quot; or a &quot;virtual table&quot;. It doesn&apos;t store data itself - 
            it just remembers which columns from which tables you want to see together.
          </p>
        </div>
      )}

      {/* View Name */}
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-1">View Name</label>
        <input
          type="text"
          value={viewName}
          onChange={(e) => setViewName(e.target.value)}
          className="w-full max-w-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="vw_MyView"
        />
      </div>

      {/* Table Column Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {Object.entries(sampleTables).map(([tableName, columns]) => (
          <div key={tableName} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              <Table className="h-4 w-4 text-slate-400" />
              <span className="text-white font-medium">{tableName}</span>
            </div>
            <div className="space-y-1">
              {columns.map((col) => {
                const isSelected = selectedColumns.some(c => c.table === tableName && c.name === col);
                return (
                  <button
                    key={col}
                    onClick={() => toggleColumn(tableName, col)}
                    className={cn(
                      'w-full text-left px-2 py-1 rounded text-sm transition-colors',
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'text-slate-400 hover:bg-slate-700/50'
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                    {col}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Columns Preview */}
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-2">Selected Columns ({selectedColumns.length})</label>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {selectedColumns.map((col) => (
              <motion.div
                key={`${col.table}.${col.name}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-500/20 text-cyan-300 text-sm"
              >
                <span>{col.table}.{col.name}</span>
                <button
                  onClick={() => toggleColumn(col.table, col.name)}
                  className="hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
          {selectedColumns.length === 0 && (
            <span className="text-slate-500 text-sm">Click columns above to select</span>
          )}
        </div>
      </div>

      {/* WHERE Clause (Intermediate+) */}
      {mode !== 'beginner' && (
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-1">WHERE Clause (optional)</label>
          <input
            type="text"
            value={whereClause}
            onChange={(e) => setWhereClause(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="e.g., Salary > 50000"
          />
        </div>
      )}

      {/* Generate SQL Button */}
      <button
        onClick={() => setShowSQL(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white font-medium hover:bg-cyan-600 transition-colors"
      >
        <Play className="h-4 w-4" />
        Generate CREATE VIEW
      </button>

      {/* SQL Output */}
      {showSQL && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-700"
        >
          <pre className="text-sm text-cyan-400 font-mono whitespace-pre-wrap overflow-x-auto">
            {generateSQL()}
          </pre>
        </motion.div>
      )}

      {/* View Benefits Visual */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          { icon: Eye, title: 'Simplicity', desc: 'Hide complex JOINs behind a simple name' },
          { icon: Lock, title: 'Security', desc: 'Expose only specific columns to users' },
          { icon: Table, title: 'Consistency', desc: 'Same data presented the same way' },
        ].map((benefit, idx) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/30"
          >
            <benefit.icon className="h-5 w-5 text-cyan-400 mb-2" />
            <h4 className="text-white font-medium text-sm">{benefit.title}</h4>
            <p className="text-slate-400 text-xs mt-1">{benefit.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Advanced: View Types */}
      {mode === 'advanced' && (
        <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <h4 className="text-amber-400 font-medium mb-2">Advanced View Concepts</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• <strong>Indexed Views:</strong> Materialized for performance (SQL Server)</li>
            <li>• <strong>WITH CHECK OPTION:</strong> Prevents INSERTs that violate WHERE</li>
            <li>• <strong>WITH SCHEMABINDING:</strong> Prevents underlying table changes</li>
            <li>• <strong>Updatable Views:</strong> Must map to single base table</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ViewBuilder;
