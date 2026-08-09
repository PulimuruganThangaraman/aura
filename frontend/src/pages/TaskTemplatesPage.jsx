import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, ToggleLeft, ToggleRight, Copy, ListTodo, Trash2, CheckCircle2 } from 'lucide-react';
import apiClient from '../api/client';
import { DeactivateModal } from '../components/Modals';

export default function TaskTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Template Form & Hierarchy Builder Modal
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [items, setItems] = useState([]);

  // Category / Task Popups inside Builder
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskCategoryName, setTaskCategoryName] = useState('');
  const [taskNameInput, setTaskNameInput] = useState('');
  const [taskDescInput, setTaskDescInput] = useState('');

  const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
  const [targetTemplate, setTargetTemplate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleOpenBuilder = (tmpl = null) => {
    if (tmpl) {
      setEditingTemplate(tmpl);
      setTemplateName(tmpl.name);
      setTemplateDesc(tmpl.description || '');
      setDepartmentId(tmpl.department_id || (departments[0]?.id || ''));
      setItems(tmpl.items || []);
    } else {
      setEditingTemplate(null);
      setTemplateName('');
      setTemplateDesc('');
      setDepartmentId(departments[0]?.id || '');
      setItems([
        { category_name: "Sales Floor, Fruit and Veg and Register", task_name: "Thoroughly sweep sales floor to clean condition", description: "Thoroughly sweep sales floor to clean condition", estimated_minutes: 20, priority: "Normal" },
        { category_name: "Sales Floor, Fruit and Veg and Register", task_name: "Thoroughly scrub sales floor to clean condition", description: "Thoroughly scrub sales floor to clean condition", estimated_minutes: 30, priority: "High" },
        { category_name: "Sales Floor, Fruit and Veg and Register", task_name: "Buff the vinyl floor to high gloss and shine", description: "Buff the vinyl sales floor to high gloss", estimated_minutes: 35, priority: "Normal" }
      ]);
    }
    setBuilderOpen(true);
  };

  const handleClone = async (tmpl) => {
    try {
      await apiClient.post(`/task-management/templates/${tmpl.id}/clone`);
      fetchData();
    } catch (err) {
      alert("Clone failed");
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: templateName,
        description: templateDesc,
        department_id: departmentId ? parseInt(departmentId) : null,
        items: items
      };
      if (editingTemplate) {
        await apiClient.put(`/task-management/templates/${editingTemplate.id}`, payload);
      } else {
        await apiClient.post('/task-management/templates', payload);
      }
      setBuilderOpen(false);
      fetchData();
    } catch (err) {
      alert("Save template failed");
    }
  };

  const handleAddCategory = () => {
    if (!categoryInput) return;
    setCategoryModalOpen(false);
    setCategoryInput('');
    setCategoryDesc('');
  };

  const handleAddTask = () => {
    if (!taskNameInput) return;
    setItems(prev => [
      ...prev,
      {
        category_name: taskCategoryName || "Sales Floor, Fruit and Veg and Register",
        task_name: taskNameInput,
        description: taskDescInput,
        estimated_minutes: 30,
        priority: "Normal"
      }
    ]);
    setTaskModalOpen(false);
    setTaskNameInput('');
    setTaskDescInput('');
  };

  const handleRemoveTask = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmToggle = async () => {
    if (!targetTemplate) return;
    try {
      await apiClient.post(`/task-management/templates/${targetTemplate.id}/toggle-status`);
      setDeactivateModalOpen(false);
      setTargetTemplate(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || "Status toggle failed");
    }
  };

  const categoriesInItems = Array.from(new Set(items.map(i => i.category_name)));

  const filtered = templates.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.department_name && t.department_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Task Templates</h1>
          <p className="text-xs text-slate-500 mt-0.5">Collections of grouped checklists and categories for facility maintenance tasks</p>
        </div>

        <button
          onClick={() => handleOpenBuilder(null)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task Template</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {filtered.length} Templates</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Template Name</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Tasks</th>
                <th className="py-3 px-4">Modified By</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">No task templates found</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className={`hover:bg-slate-50 transition-colors ${!t.is_active ? 'row-inactive' : ''}`}>
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center space-x-2">
                      <ListTodo className="w-4 h-4 text-blue-600" />
                      <span>{t.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{t.description || "N/A"}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{t.department_name || "Cleaning"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-full text-[10px]">
                        {t.task_count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{t.modified_by || "Ushan Lokuge"}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.is_active ? 'bg-emerald-100 text-emerald-800' : 'badge-tomato'
                      }`}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleClone(t)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Clone</span>
                        </button>
                        <button
                          onClick={() => handleOpenBuilder(t)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Edit</span>
                        </button>
                        <button
                          onClick={() => { setTargetTemplate(t); setDeactivateModalOpen(true); }}
                          className={`p-1 rounded-lg transition-colors flex items-center space-x-1 ${
                            t.is_active ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {t.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                          <span className="text-[11px] font-semibold">{t.is_active ? "Deactivate" : "Activate"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Template Builder / Clone Modal */}
      {builderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 my-8 animate-in fade-in duration-150 relative">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
              <span>{editingTemplate ? `Edit Task Template (${editingTemplate.name})` : "Create/Clone Task Template"}</span>
            </h3>

            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Template Name *</label>
                  <input required value={templateName} onChange={(e) => setTemplateName(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department (Skill Group) *</label>
                  <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none">
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                  <input value={templateDesc} onChange={(e) => setTemplateDesc(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
                </div>
              </div>

              {/* Tasks Checklist Grid */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800">Tasks Checklist ({items.length} Tasks)</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCategoryModalOpen(true)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200 hover:bg-blue-100 flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Category</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTaskCategoryName(categoriesInItems[0] || "General"); setTaskModalOpen(true); }}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-emerald-700 flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {categoriesInItems.map((cat, cIdx) => (
                    <div key={cIdx} className="bg-white rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                        <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">{cat}</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {items.filter(i => i.category_name === cat).map((item, iIdx) => (
                          <div key={iIdx} className="py-2 flex items-center justify-between text-xs">
                            <div>
                              <p className="font-semibold text-slate-800">{item.task_name}</p>
                              <p className="text-[11px] text-slate-500">{item.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTask(items.indexOf(item))}
                              className="text-red-500 hover:bg-red-50 p-1 rounded-lg"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setBuilderOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl">CANCEL</button>
                <button type="submit" className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm">UPDATE / SAVE</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Popup */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 relative">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Add/Edit Category</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
                <input required value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} placeholder="e.g. Sales Floor, Fruit and Veg and Register" className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea rows={2} value={categoryDesc} onChange={(e) => setCategoryDesc(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={() => setCategoryModalOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg">CANCEL</button>
              <button type="button" onClick={handleAddCategory} className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg">ADD CATEGORY</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Popup */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 relative">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3">Add/Edit Task</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
                <select value={taskCategoryName} onChange={(e) => setTaskCategoryName(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none">
                  {categoriesInItems.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Task Name *</label>
                <input required value={taskNameInput} onChange={(e) => setTaskNameInput(e.target.value)} placeholder="e.g. Thoroughly sweep sales floor" className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea rows={2} value={taskDescInput} onChange={(e) => setTaskDescInput(e.target.value)} className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg outline-none" />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={() => setTaskModalOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg">CANCEL</button>
              <button type="button" onClick={handleAddTask} className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg">ADD TASK</button>
            </div>
          </div>
        </div>
      )}

      <DeactivateModal
        isOpen={deactivateModalOpen}
        onClose={() => setDeactivateModalOpen(false)}
        onConfirm={handleConfirmToggle}
        title={targetTemplate?.is_active ? "Deactivate Task Template" : "Activate Task Template"}
        message={`Are you sure you want to ${targetTemplate?.is_active ? 'deactivate' : 'activate'} ${targetTemplate?.name}?`}
        isDeactivating={targetTemplate?.is_active}
      />
    </div>
  );
}
