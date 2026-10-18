import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit, ToggleLeft, ToggleRight, Copy, ListTodo, 
  Trash2, CheckCircle2, CheckSquare, Layers, Clock, AlertCircle, 
  X, ChevronDown, ChevronRight, ShieldCheck, Sparkles, Stethoscope, 
  FileText, Flame, Activity, Tag, HelpCircle
} from 'lucide-react';
import apiClient from '../api/client';
import { DeactivateModal } from '../components/Modals';
import Pagination from '../components/Pagination';

export default function TaskTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Template Form & Hierarchy Builder Modal
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [complianceStandard, setComplianceStandard] = useState('NDIS Quality Standards');
  const [items, setItems] = useState([]);

  // Category / Task Popups inside Builder
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskCategoryName, setTaskCategoryName] = useState('');
  const [taskNameInput, setTaskNameInput] = useState('');
  const [taskDescInput, setTaskDescInput] = useState('');
  const [taskEstimatedMins, setTaskEstimatedMins] = useState(30);
  const [taskPriority, setTaskPriority] = useState('Normal');

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetTemplate, setTargetTemplate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDeptFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, dRes] = await Promise.all([
        apiClient.get('/task-management/templates'),
        apiClient.get('/departments')
      ]);
      setTemplates(tRes.data);
      setDepartments(dRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [defaultStartTime, setDefaultStartTime] = useState('09:00');
  const [defaultEndTime, setDefaultEndTime] = useState('11:00');

  const handleOpenBuilder = (tmpl = null) => {
    if (tmpl) {
      setEditingTemplate(tmpl);
      setTemplateName(tmpl.name);
      setTemplateDesc(tmpl.description || '');
      setDepartmentId(tmpl.department_id || (departments[0]?.id || ''));
      setDefaultStartTime(tmpl.default_start_time || '09:00');
      setDefaultEndTime(tmpl.default_end_time || '11:00');
      setComplianceStandard('NDIS Quality Standards');
      setItems(tmpl.items || []);
    } else {
      setEditingTemplate(null);
      setTemplateName('');
      setTemplateDesc('');
      setDepartmentId(departments[0]?.id || '');
      setDefaultStartTime('09:00');
      setDefaultEndTime('11:00');
      setComplianceStandard('NDIS Quality Standards');
      setItems([
        { 
          category_name: "General Care & Sanitization", 
          task_name: "Morning sanitization and clean condition check", 
          description: "Wipe high touch surfaces, inspect door latches and ventilation", 
          estimated_minutes: 20, 
          priority: "Normal" 
        },
        { 
          category_name: "General Care & Sanitization", 
          task_name: "Deep floor buffing and clinical waste disposal", 
          description: "Clear biohazard bins and disinfect non-slip tiles", 
          estimated_minutes: 30, 
          priority: "High" 
        }
      ]);
    }
    setBuilderOpen(true);
  };

  const handleClone = async (tmpl) => {
    try {
      await apiClient.post(`/task-management/job-templates/${tmpl.id}/clone`);
      fetchData();
    } catch (err) {
      alert("Clone failed");
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: templateName.trim(),
        description: templateDesc?.trim() || null,
        department_id: departmentId ? parseInt(departmentId) : null,
        default_start_time: defaultStartTime,
        default_end_time: defaultEndTime,
        items: items
      };
      if (editingTemplate) {
        await apiClient.put(`/task-management/job-templates/${editingTemplate.id}`, payload);
      } else {
        await apiClient.post('/task-management/job-templates', payload);
      }
      setBuilderOpen(false);
      fetchData();
    } catch (err) {
      alert("Save failed");
    }
  };


  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!categoryInput.trim()) return;
    setItems([
      ...items,
      { 
        category_name: categoryInput.trim(), 
        task_name: `${categoryInput.trim()} Initial Inspection`, 
        description: categoryDesc.trim() || `Standard operating procedure for ${categoryInput.trim()}`, 
        estimated_minutes: 20, 
        priority: "Normal" 
      }
    ]);
    setCategoryInput('');
    setCategoryDesc('');
    setCategoryModalOpen(false);
  };

  const handleOpenAddTask = (catName) => {
    setTaskCategoryName(catName);
    setTaskNameInput('');
    setTaskDescInput('');
    setTaskEstimatedMins(30);
    setTaskPriority('Normal');
    setTaskModalOpen(true);
  };

  const handleSaveTaskItem = (e) => {
    e.preventDefault();
    if (!taskNameInput.trim()) return;
    setItems([
      ...items,
      {
        category_name: taskCategoryName,
        task_name: taskNameInput.trim(),
        description: taskDescInput.trim(),
        estimated_minutes: parseInt(taskEstimatedMins) || 15,
        priority: taskPriority
      }
    ]);
    setTaskModalOpen(false);
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleOpenToggle = (t) => {
    setTargetTemplate(t);
    setDeactivateModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!targetTemplate) return;
    try {
      await apiClient.post(`/task-management/templates/${targetTemplate.id}/toggle-status`);
      setDeactivateModalOpen(false);
      setTargetTemplate(null);
      fetchData();
    } catch (err) {
      alert("Status toggle failed");
    }
  };

  const categories = Array.from(new Set(items.map(i => i.category_name)));
  const totalTemplateMinutes = items.reduce((acc, curr) => acc + (parseInt(curr.estimated_minutes) || 0), 0);

  const filtered = templates.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.department_name && t.department_name.toLowerCase().includes(search.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesDept = selectedDeptFilter === 'ALL' || String(t.department_id) === String(selectedDeptFilter);
    return matchesSearch && matchesDept;
  });

  const paginatedTemplates = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Task Templates & Care Checklists
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200">
              Protocol Builder
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized clinical routines, step-by-step care protocols, and recurring compliance inspection checklists.
          </p>
        </div>

        <button
          onClick={() => handleOpenBuilder(null)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Template</span>
        </button>
      </div>

      {/* Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates by title, description, or skill..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-700 font-medium"
              >
                <option value="ALL">📁 All Skill Departments ({departments.length})</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-bold self-end md:self-auto shrink-0">
            Total: <strong className="text-slate-900">{filtered.length}</strong> Templates
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Template Title & Objective</th>
                <th className="py-3 px-4">Required Department</th>
                <th className="py-3 px-4 text-center">Checklist Tasks</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ListTodo className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">No care templates match your search</p>
                      <p className="text-xs text-slate-400">Click '+ Create Template' to start building care checklists.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTemplates.map((t) => (
                  <tr key={t.id} className={`hover:bg-slate-50/80 transition-colors ${!t.is_active ? 'row-inactive opacity-60' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/60 text-teal-700 flex items-center justify-center shrink-0">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{t.name}</p>
                          <span className="text-[11px] text-slate-500 truncate max-w-sm block">
                            {t.description || "Standardized Clinical Care & Maintenance Protocol"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-md border border-blue-200">
                        {t.department_name || "General Care"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 font-bold text-[10px] rounded-full border border-teal-200">
                        {t.items?.length || 0} Step Checklist
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{t.modified_by || "System Admin"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'badge-tomato'
                      }`}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleClone(t)}
                          title="Duplicate / Clone Template"
                          className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenBuilder(t)}
                          className="px-2.5 py-1 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center space-x-1 font-semibold text-[11px] cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleOpenToggle(t)}
                          className={`px-2 py-1 rounded-lg transition-colors flex items-center space-x-1 font-semibold text-[11px] cursor-pointer ${
                            t.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {t.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          <span>{t.is_active ? "Deactivate" : "Activate"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="templates"
        />
      </div>

      {/* Enterprise Template Builder Modal */}
      {builderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 relative border border-slate-100 overflow-hidden">
            
            {/* Modal Header Banner */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
              <button 
                onClick={() => setBuilderOpen(false)} 
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white">
                      {editingTemplate ? "Edit Care Task Template" : "Build Clinical Care Protocol"}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Define step-by-step checklist items, estimated completion times, and clinical priorities.
                    </p>
                  </div>
                </div>

                {/* Live Stats Pills */}
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-white/10 rounded-xl text-[11px] font-bold text-teal-300 border border-white/10 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>⏱️ {totalTemplateMinutes} mins total</span>
                  </span>
                  <span className="px-2.5 py-1 bg-white/10 rounded-xl text-[11px] font-bold text-white border border-white/10">
                    {items.length} Tasks
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* SECTION 1: Master Template Identification */}
              <div>
                <div className="flex items-center space-x-2 pb-2 mb-3 border-b border-slate-100">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    1. Protocol Identification & Required Skill
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Template Title <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      required 
                      value={templateName} 
                      onChange={(e) => setTemplateName(e.target.value)} 
                      placeholder="e.g. Daily Elderly Care & Hygiene Routine" 
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department (Skill) <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      value={departmentId} 
                      onChange={(e) => setDepartmentId(e.target.value)} 
                      className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>📁 {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Protocol Objective & Clinical Scope
                  </label>
                  <input 
                    value={templateDesc} 
                    onChange={(e) => setTemplateDesc(e.target.value)} 
                    placeholder="e.g. Standard operating protocol for resident morning medication check and personal care assistance." 
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" 
                  />
                </div>
              </div>

              {/* SECTION 2: Protocol Categories & Action Steps Builder */}
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      2. Protocol Categories & Care Steps
                    </h4>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setCategoryModalOpen(true)}
                    className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 font-bold text-xs rounded-xl shadow-2xs flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Category</span>
                  </button>
                </div>

                {/* Categories container */}
                <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                  {categories.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                      <ListTodo className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">No protocol categories added yet</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Click '+ Add Category' to organize tasks into structured sections.</p>
                    </div>
                  ) : (
                    categories.map((catName, cIdx) => {
                      const catItems = items.filter(i => i.category_name === catName);
                      const catMinutes = catItems.reduce((sum, item) => sum + (parseInt(item.estimated_minutes) || 0), 0);

                      return (
                        <div key={cIdx} className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-4 shadow-xs">
                          {/* Category Header */}
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                            <div className="flex items-center space-x-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                              <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">{catName}</h5>
                              <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                {catItems.length} items • {catMinutes} mins
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleOpenAddTask(catName)}
                              className="text-xs text-teal-700 hover:text-teal-800 bg-white hover:bg-teal-50 font-bold px-2.5 py-1 rounded-lg border border-teal-200 shadow-2xs flex items-center space-x-1 cursor-pointer transition-colors"
                            >
                              <Plus className="w-3 h-3 text-teal-600" />
                              <span>Add Task Step</span>
                            </button>
                          </div>

                          {/* Task list in this category */}
                          <div className="space-y-2">
                            {catItems.map((item, itemIdx) => {
                              const overallIndex = items.indexOf(item);
                              return (
                                <div 
                                  key={itemIdx} 
                                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200/80 hover:border-teal-300 shadow-2xs transition-all"
                                >
                                  <div className="flex items-start space-x-2.5 flex-1 pr-3">
                                    <span className="text-[11px] font-mono font-bold text-slate-400 mt-0.5">#{itemIdx + 1}</span>
                                    <div>
                                      <p className="text-xs font-bold text-slate-900 leading-snug">{item.task_name}</p>
                                      {item.description && (
                                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
                                      )}
                                      <div className="flex items-center space-x-2 mt-1.5">
                                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                                          ⏱️ {item.estimated_minutes || 20} mins
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                          item.priority === 'Urgent' 
                                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                            : item.priority === 'High' 
                                            ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                            : 'bg-slate-50 text-slate-700 border-slate-200'
                                        }`}>
                                          {item.priority || 'Normal'} Priority
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(overallIndex)}
                                    title="Remove Task"
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setBuilderOpen(false)} 
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md flex items-center space-x-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingTemplate ? "Update Care Template" : "Save & Publish Template"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 modal-overlay animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Add Protocol Category</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">Group tasks logically into care stages or locations.</p>
            
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category Name *</label>
                <input 
                  required 
                  value={categoryInput} 
                  onChange={(e) => setCategoryInput(e.target.value)} 
                  placeholder="e.g. Morning Medication, Wound Dressing, Room Sanitation" 
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category Scope Note (Optional)</label>
                <input 
                  value={categoryDesc} 
                  onChange={(e) => setCategoryDesc(e.target.value)} 
                  placeholder="e.g. Standard morning sanitization protocol" 
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" 
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setCategoryModalOpen(false)} 
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 modal-overlay animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-teal-600" />
              <span>Add Step to '{taskCategoryName}'</span>
            </h4>
            <p className="text-xs text-slate-500 mb-3">Define task instructions, duration, and priority level.</p>

            <form onSubmit={handleSaveTaskItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input 
                  required 
                  value={taskNameInput} 
                  onChange={(e) => setTaskNameInput(e.target.value)} 
                  placeholder="e.g. Check vital signs and record blood glucose" 
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Clinical Guidance / Step Notes
                </label>
                <textarea 
                  rows={2}
                  value={taskDescInput} 
                  onChange={(e) => setTaskDescInput(e.target.value)} 
                  placeholder="e.g. Ensure patient is seated comfortably. Use sterile swab before measurement." 
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (Minutes)</label>
                  <div className="flex items-center space-x-1">
                    <input 
                      type="number" 
                      min="5"
                      max="480"
                      value={taskEstimatedMins} 
                      onChange={(e) => setTaskEstimatedMins(e.target.value)} 
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-bold" 
                    />
                    <span className="text-xs font-bold text-slate-500">mins</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Priority</label>
                  <select 
                    value={taskPriority} 
                    onChange={(e) => setTaskPriority(e.target.value)} 
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 font-medium"
                  >
                    <option value="Normal">🟢 Normal Protocol</option>
                    <option value="High">🟡 High Priority</option>
                    <option value="Urgent">🔴 Urgent / Critical</option>
                  </select>
                </div>
              </div>

              {/* Quick minute pills */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Quick Duration Presets:</span>
                <div className="flex items-center space-x-1.5">
                  {[10, 15, 20, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setTaskEstimatedMins(mins)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer transition-colors ${
                        parseInt(taskEstimatedMins) === mins 
                          ? 'bg-teal-600 text-white border-teal-600' 
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setTaskModalOpen(false)} 
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Add Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetTemplate?.is_active ? "Deactivate Template" : "Activate Template"}
        message={`Are you sure you want to ${targetTemplate?.is_active ? 'deactivate' : 'activate'} ${targetTemplate?.name}? New schedules cannot be created from deactivated templates.`}
        isDeactivating={targetTemplate?.is_active}
      />
    </div>
  );
}
