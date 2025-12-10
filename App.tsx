import React, { useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import { Plus, ChevronLeft, Sprout, Calendar, Droplets, Scissors, Save, History, Leaf, Check, AlertCircle, Settings, Download, Upload, Bug, Flower2, Trash2, Image as ImageIcon, Shovel, X, BookOpen, ShieldAlert, Pencil, CheckCircle2, Edit3 } from 'lucide-react';
import { BREEDERS, FERTILIZERS, ISSUES, ROSE_LIBRARY, TRANSPLANT_TYPES, SOIL_TYPES } from './constants';
import { RoseVariety, ViewState, RoseEvent, RosePhoto, FertilizerType, RoseNote } from './types';
import { Button } from './components/Button';
import { PhotoUpload } from './components/PhotoUpload';

// --- Helper Components ---

const Header: React.FC<{ 
  title: string; 
  onBack?: () => void; 
  rightAction?: ReactNode;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
}> = ({ title, onBack, rightAction, saveStatus }) => (
  <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between h-14 select-none">
    <div className="flex items-center gap-2 overflow-hidden flex-1">
      {onBack && (
        <button onClick={onBack} className="p-1 -ml-1 text-gray-600 hover:text-emerald-900 rounded-full shrink-0">
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
    </div>
    
    <div className="flex items-center gap-3 shrink-0 ml-2">
      {saveStatus && saveStatus !== 'idle' && (
        <div className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-opacity duration-300 ${saveStatus === 'saved' ? 'opacity-100' : 'opacity-80'}`}>
           {saveStatus === 'saving' && <span className="text-gray-400">Saving...</span>}
           {saveStatus === 'saved' && <span className="text-emerald-600 flex items-center gap-1"><Check size={12} /> Saved</span>}
           {saveStatus === 'error' && <span className="text-rose-600 flex items-center gap-1"><AlertCircle size={12} /> Error</span>}
        </div>
      )}
      {rightAction && <div>{rightAction}</div>}
    </div>
  </header>
);

const SectionTitle: React.FC<{ icon: React.ElementType; title: string; color?: string }> = ({ icon: Icon, title, color = "text-emerald-900" }) => (
  <h2 className={`flex items-center gap-2 text-sm font-bold ${color} uppercase tracking-wide mb-3 mt-6 border-b border-gray-100 pb-1 select-none`}>
    <Icon size={16} />
    {title}
  </h2>
);

const EditVarietyModal: React.FC<{
  rose: RoseVariety;
  onSave: (updatedRose: RoseVariety) => void;
  onDelete: () => void;
  onClose: () => void;
}> = ({ rose, onSave, onDelete, onClose }) => {
  const [name, setName] = useState(rose.name);
  const [breeder, setBreeder] = useState(rose.breeder);

  const handleSave = () => {
    if (!name.trim() || !breeder) return;
    
    let updatedRose = { ...rose, name, breeder };

    // Check if name changed and matches library for auto-update
    if (name !== rose.name && ROSE_LIBRARY[name]) {
        const meta = ROSE_LIBRARY[name];
        if (confirm(`Update variety details (Type ${meta.type}, Feature) based on "${name}"?`)) {
            updatedRose = {
                ...updatedRose,
                roseType: meta.type,
                feature: meta.feature
            };
        }
    }

    onSave(updatedRose);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Edit Variety Info</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        
        <div className="space-y-4 mb-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Variety Name</label>
                <input 
                    type="text"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:outline-none font-bold text-gray-800"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Breeder</label>
                <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:outline-none"
                    value={breeder}
                    onChange={(e) => setBreeder(e.target.value)}
                >
                    {Object.keys(BREEDERS).map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="space-y-3">
            <Button onClick={handleSave} className="w-full">
                <CheckCircle2 size={18} className="mr-2"/> Save Changes
            </Button>
            
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-300 text-xs">Danger Zone</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button 
                onClick={() => {
                    if(confirm("Are you sure you want to delete this variety completely?")) {
                        onDelete();
                    }
                }}
                className="w-full py-3 text-rose-600 bg-rose-50 rounded-lg font-medium hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 size={16} /> Delete Variety
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  // State
  const [view, setView] = useState<ViewState>({ type: 'LIST' });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isSecure, setIsSecure] = useState(true);
  
  // Edit Variety State
  const [editingRose, setEditingRose] = useState<RoseVariety | null>(null);
  
  const [roses, setRoses] = useState<RoseVariety[]>(() => {
    try {
      if (typeof localStorage === 'undefined') return [];
      const saved = localStorage.getItem('rosarium_roses');
      if (!saved) return [];
      
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      // Data Migration & Sanitization
      return parsed.map((r: any) => ({
        id: typeof r.id === 'string' ? r.id : crypto.randomUUID(),
        breeder: typeof r.breeder === 'string' ? r.breeder : 'Unknown',
        name: typeof r.name === 'string' ? r.name : 'Unknown Rose',
        registrationDate: typeof r.registrationDate === 'string' ? r.registrationDate : new Date().toISOString(),
        events: Array.isArray(r.events) ? r.events : [],
        photos: Array.isArray(r.photos) ? r.photos : [],
        notes: Array.isArray(r.notes) ? r.notes : [],
        memo: typeof r.memo === 'string' ? r.memo : '',
        roseType: typeof r.roseType === 'number' ? r.roseType : undefined,
        feature: typeof r.feature === 'string' ? r.feature : undefined,
        plantingDate: typeof r.plantingDate === 'string' ? r.plantingDate : undefined,
        transplantDate: typeof r.transplantDate === 'string' ? r.transplantDate : undefined,
      }));
    } catch (e) {
      console.error("Failed to load initial data", e);
      return [];
    }
  });

  // Effects - Security Check
  useEffect(() => {
    if (typeof window !== 'undefined' && window.isSecureContext === false && window.location.hostname !== 'localhost') {
      setIsSecure(false);
    }
  }, []);

  // Effects - Auto Save
  useEffect(() => {
    if (roses.length === 0 && !localStorage.getItem('rosarium_roses')) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('rosarium_roses', JSON.stringify(roses));
            setSaveStatus('saved');
        }
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error("Auto-save failed:", error);
        setSaveStatus('error');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [roses]);

  // Actions
  const addRose = (rose: RoseVariety) => {
    setRoses(prev => [rose, ...prev]);
    setView({ type: 'LIST' });
  };

  const updateRose = (updatedRose: RoseVariety) => {
    setRoses(prev => prev.map(r => r.id === updatedRose.id ? updatedRose : r));
    // If we are editing the currently viewed rose, update editingRose if open
    if (editingRose && editingRose.id === updatedRose.id) {
        setEditingRose(updatedRose);
    }
  };

  const deleteRose = (id: string) => {
    if (window.confirm("Delete this variety?\nThis action cannot be undone and all data will be lost.")) {
      setRoses(prev => prev.filter(r => r.id !== id));
      setView({ type: 'LIST' });
      setEditingRose(null);
    }
  };

  const importData = (data: RoseVariety[]) => {
    const migratedData = data.map((r: any) => ({
        ...r,
        id: r.id || crypto.randomUUID(),
        events: Array.isArray(r.events) ? r.events : [],
        photos: Array.isArray(r.photos) ? r.photos : [],
        notes: Array.isArray(r.notes) ? r.notes : [],
    }));
    setRoses(migratedData);
    setView({ type: 'LIST' });
    setSaveStatus('saved');
  };

  const getRose = (id: string) => roses.find(r => r.id === id);

  // --- Views ---

  const SecurityBanner = () => (
    !isSecure ? (
      <div className="bg-amber-100 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs flex items-center justify-center gap-2 font-medium">
        <ShieldAlert size={14} />
        <span>For Camera access, please use HTTPS.</span>
      </div>
    ) : null
  );

  return (
    <>
      {editingRose && (
          <EditVarietyModal 
            rose={editingRose} 
            onSave={updateRose} 
            onDelete={() => deleteRose(editingRose.id)} 
            onClose={() => setEditingRose(null)} 
          />
      )}

      {/* 1. Dashboard (List View) */}
      {view.type === 'LIST' && (
        <div className="min-h-screen bg-gray-50 pb-20">
          <SecurityBanner />
          <header className="bg-emerald-900 text-white px-6 py-8 rounded-b-3xl shadow-lg relative overflow-hidden select-none">
            <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
              <Sprout size={150} />
            </div>
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-serif font-bold mb-1">Rosarium Pro</h1>
                <p className="text-emerald-100 text-sm">Manage your garden with precision.</p>
              </div>
              <button 
                onClick={() => setView({ type: 'SETTINGS' })}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>
          </header>

          <main className="px-4 -mt-6 relative z-20 space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
               <div className="text-gray-600 text-sm">
                 <span className="font-bold text-gray-900 text-lg mr-1">{roses.length}</span> Varieties
               </div>
               <Button size="sm" onClick={() => setView({ type: 'NEW' })}>
                 <Plus size={16} className="mr-1" /> Add New
               </Button>
            </div>

            <div className="space-y-3">
              {roses.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <Leaf size={48} className="mx-auto mb-3 opacity-20" />
                  <p>No roses registered yet.</p>
                  <p className="text-sm">Add your first variety to start tracking.</p>
                </div>
              ) : (
                roses.map(rose => (
                  <div 
                    key={rose.id} 
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-[0.99] transition-transform flex justify-between items-center group select-none relative"
                  >
                    <div 
                        className="flex gap-4 items-center flex-1 cursor-pointer"
                        onClick={() => setView({ type: 'DETAIL', roseId: rose.id })}
                    >
                      {/* Thumbnail */}
                      {rose.photos.find(p => p.type === 'BLOOM') ? (
                         <img 
                          src={rose.photos.find(p => p.type === 'BLOOM')?.url} 
                          alt="Rose" 
                          className="w-12 h-12 rounded-full object-cover border border-gray-100"
                         />
                      ) : (
                         <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-300">
                           <Flower2 size={24} />
                         </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full inline-block">
                              {String(rose.breeder).split('(')[0]}
                          </span>
                          {typeof rose.roseType === 'number' && (
                               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                   rose.roseType === 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                   rose.roseType === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                   rose.roseType >= 3 ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                   'bg-gray-100 text-gray-600 border-gray-200'
                               }`}>
                                  Type {rose.roseType}
                               </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-emerald-900 transition-colors">
                          {rose.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Registered: {new Date(rose.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingRose(rose);
                        }}
                        className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors z-10"
                        title="Edit Variety Name"
                    >
                        <Pencil size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      )}

      {/* 2. Settings (Data Management) */}
      {view.type === 'SETTINGS' && (
        <SettingsScreen 
          roses={roses} 
          onImport={importData} 
          onBack={() => setView({ type: 'LIST' })} 
        />
      )}

      {/* 3. New Rose Registration */}
      {view.type === 'NEW' && (
        <NewRoseScreen 
          onSave={addRose} 
          onCancel={() => setView({ type: 'LIST' })} 
          saveStatus={saveStatus}
        />
      )}

      {/* 4. Rose Detail */}
      {view.type === 'DETAIL' && (
        (() => {
          const rose = getRose(view.roseId);
          if (!rose) return <div>Rose not found</div>;
          return (
            <RoseDetailScreen 
              rose={rose} 
              onUpdate={updateRose} 
              onEdit={() => setEditingRose(rose)}
              onDelete={() => deleteRose(rose.id)}
              onBack={() => setView({ type: 'LIST' })}
              saveStatus={saveStatus}
            />
          );
        })()
      )}
    </>
  );
}

// ... (SettingsScreen and NewRoseScreen remain unchanged)

const SettingsScreen: React.FC<{ 
  roses: RoseVariety[]; 
  onImport: (data: RoseVariety[]) => void;
  onBack: () => void;
}> = ({ roses, onImport, onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = JSON.stringify(roses, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `rosarium_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          if (confirm("This will replace your current data with the imported file. Are you sure?")) {
            onImport(json);
            alert("Data imported successfully!");
          }
        } else {
          alert("Invalid file format.");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Data Management" onBack={onBack} />
      <main className="p-4 space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3 text-emerald-900">
             <Save size={24} />
             <h2 className="font-bold text-lg">Storage Options</h2>
          </div>
          <p className="text-sm text-gray-500">
            Data is saved to your browser. Use Export to backup your data.
          </p>
          
          <div className="pt-4 space-y-3">
             <button 
               onClick={handleExport}
               className="w-full flex items-center justify-between p-4 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"
             >
               <span className="flex items-center gap-2 font-medium">
                 <Download size={20} /> Export Data (JSON)
               </span>
               <span className="text-xs opacity-70">Backup</span>
             </button>

             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full flex items-center justify-between p-4 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
             >
               <span className="flex items-center gap-2 font-medium">
                 <Upload size={20} /> Import Data
               </span>
               <span className="text-xs text-gray-400">Restore</span>
             </button>
             <input 
               type="file" 
               accept=".json" 
               ref={fileInputRef} 
               className="hidden" 
               onChange={handleImport} 
             />
          </div>
        </div>
      </main>
    </div>
  );
};

const NewRoseScreen: React.FC<{ 
  onSave: (r: RoseVariety) => void; 
  onCancel: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}> = ({ onSave, onCancel, saveStatus }) => {
  const [breeder, setBreeder] = useState('');
  const [name, setName] = useState('');
  const [customName, setCustomName] = useState('');

  const handleSave = () => {
    if (!breeder) return;
    
    const finalName = name === 'OTHER' ? customName : name;
    if (!finalName) return;

    // Lookup metadata
    const meta = ROSE_LIBRARY[finalName];

    const newRose: RoseVariety = {
      id: crypto.randomUUID(),
      breeder,
      name: finalName,
      roseType: meta?.type,
      feature: meta?.feature,
      registrationDate: new Date().toISOString(),
      events: [],
      photos: [],
      notes: [],
      memo: ''
    };
    onSave(newRose);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header title="New Variety" onBack={onCancel} saveStatus={saveStatus} />
      <main className="p-4 max-w-lg mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Breeder / Brand</label>
          <select 
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:outline-none"
            value={breeder}
            onChange={(e) => {
              setBreeder(e.target.value);
              setName('');
            }}
          >
            <option value="">Select Breeder</option>
            {Object.keys(BREEDERS).map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {breeder && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-1">Variety Name</label>
            <select 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            >
              <option value="">Select Variety</option>
              {BREEDERS[breeder].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
              <option value="OTHER">Other (Enter manually)</option>
            </select>
          </div>
        )}

        {name && name !== 'OTHER' && ROSE_LIBRARY[name] && (
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 animate-fade-in">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Type {ROSE_LIBRARY[name].type}
                    </span>
                    <span className="text-sm font-medium text-emerald-900">Auto-detected</span>
                </div>
                <p className="text-sm text-gray-700 italic">"{ROSE_LIBRARY[name].feature}"</p>
            </div>
        )}

        {name === 'OTHER' && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-1">Custom Name</label>
            <input
              type="text"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:outline-none"
              placeholder="Enter variety name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          </div>
        )}

        <div className="pt-8">
          <Button 
            className="w-full py-4 text-lg shadow-emerald-900/20 shadow-lg" 
            onClick={handleSave}
            disabled={!breeder || !name || (name === 'OTHER' && !customName)}
          >
            Register to Garden
          </Button>
        </div>
      </main>
    </div>
  );
};

const RoseDetailScreen: React.FC<{ 
  rose: RoseVariety; 
  onUpdate: (r: RoseVariety) => void; 
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}> = ({ rose, onUpdate, onEdit, onDelete, onBack, saveStatus }) => {
  const [activeTab, setActiveTab] = useState<'CARE' | 'PRUNING' | 'GALLERY' | 'MEMO'>('CARE');

  const updateField = (field: keyof RoseVariety, value: any) => {
    onUpdate({ ...rose, [field]: value });
  };

  const addEvent = (event: RoseEvent) => {
    onUpdate({ ...rose, events: [event, ...rose.events] });
  };

  const addPhoto = (photo: RosePhoto) => {
    onUpdate({ ...rose, photos: [photo, ...rose.photos] });
  };

  const updatePhoto = (updatedPhoto: RosePhoto) => {
      onUpdate({ ...rose, photos: rose.photos.map(p => p.id === updatedPhoto.id ? updatedPhoto : p) });
  };

  const deletePhoto = (photoId: string) => {
    if(confirm("Delete this photo?")) {
        onUpdate({ ...rose, photos: rose.photos.filter(p => p.id !== photoId) });
    }
  }

  const addNote = (note: RoseNote) => {
      onUpdate({ ...rose, notes: [note, ...(rose.notes || [])] });
  }

  const updateNote = (updatedNote: RoseNote) => {
      onUpdate({ ...rose, notes: rose.notes.map(n => n.id === updatedNote.id ? updatedNote : n) });
  }

  const deleteNote = (noteId: string) => {
      if(confirm("Delete this note?")) {
          onUpdate({ ...rose, notes: (rose.notes || []).filter(n => n.id !== noteId)});
      }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden" style={{ height: '100dvh' }}>
      <div className="shrink-0 bg-white z-20 shadow-sm relative">
        <Header 
          title={rose.name} 
          onBack={onBack} 
          rightAction={
              <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-emerald-800 bg-emerald-100 px-2 py-1 rounded truncate max-w-[100px] hidden sm:block">
                      {rose.breeder.split('(')[0]}
                  </span>
                  <button
                      onClick={onEdit}
                      className="p-2 text-gray-500 hover:text-emerald-800 transition-colors bg-gray-50 rounded-full border border-gray-200"
                      title="Edit Variety Info"
                  >
                      <Edit3 size={18} />
                  </button>
              </div>
          }
          saveStatus={saveStatus}
        />
        
        {(rose.feature || rose.roseType !== undefined) && (
          <div className="bg-white px-4 py-2 border-b border-gray-100 flex items-start gap-3">
               {typeof rose.roseType === 'number' && (
                   <div className={`shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-lg border ${
                       rose.roseType === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                       rose.roseType === 1 ? 'bg-blue-50 border-blue-200 text-blue-800' :
                       rose.roseType >= 3 ? 'bg-orange-50 border-orange-200 text-orange-800' :
                       'bg-gray-100 border-gray-200 text-gray-600'
                   }`}>
                       <span className="text-[10px] font-bold uppercase">Type</span>
                       <span className="text-xl font-bold leading-none">{rose.roseType}</span>
                   </div>
               )}
               {rose.feature && (
                   <p className="text-xs text-gray-600 italic py-1 leading-relaxed">
                       "{rose.feature}"
                   </p>
               )}
          </div>
        )}
        
        <div className="bg-white border-b border-gray-200 overflow-x-auto no-scrollbar">
          <div className="flex min-w-full">
            {[
              { id: 'CARE', label: 'Care', icon: Droplets },
              { id: 'PRUNING', label: 'Pruning', icon: Scissors },
              { id: 'GALLERY', label: 'Blooms', icon: Flower2 },
              { id: 'MEMO', label: 'Journal', icon: BookOpen },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors px-4 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-emerald-900 text-emerald-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 pb-32 overscroll-contain">
        {activeTab === 'CARE' && <CareTab rose={rose} onUpdate={onUpdate} onAddEvent={addEvent} onDelete={onDelete} />}
        {activeTab === 'PRUNING' && <PruningTab rose={rose} onAddPhoto={addPhoto} onAddEvent={addEvent} onDeletePhoto={deletePhoto} onUpdatePhoto={updatePhoto} />}
        {activeTab === 'GALLERY' && <GalleryTab rose={rose} onAddPhoto={addPhoto} onDeletePhoto={deletePhoto} onUpdatePhoto={updatePhoto} />}
        {activeTab === 'MEMO' && <MemoTab rose={rose} onAddNote={addNote} onDeleteNote={deleteNote} onUpdateNote={updateNote} onUpdateLegacyMemo={(val) => updateField('memo', val)} />}
      </main>
    </div>
  );
};

// --- Tabs Logic ---

const CareTab: React.FC<{ rose: RoseVariety; onUpdate: (r: RoseVariety) => void; onAddEvent: (e: RoseEvent) => void; onDelete?: () => void }> = ({ rose, onUpdate, onAddEvent, onDelete }) => {
  const [fertilizerType, setFertilizerType] = useState<FertilizerType>('VITALIZER');
  const [fertilizerDate, setFertilizerDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [transplantDate, setTransplantDate] = useState(new Date().toISOString().split('T')[0]);
  const [transplantType, setTransplantType] = useState(TRANSPLANT_TYPES[0].value);
  const [potSize, setPotSize] = useState('');
  
  const [healthDate, setHealthDate] = useState(new Date().toISOString().split('T')[0]);
  
  // History Editing State
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ date: '', details: '' });
  
  interface SoilComponent { id: string; type: string; percent: number; customName?: string }
  const [soilMix, setSoilMix] = useState<SoilComponent[]>([{ id: '1', type: SOIL_TYPES[0].value, percent: 100 }]);

  // Calculate current total
  const currentTotal = soilMix.reduce((sum, c) => sum + (Number(c.percent) || 0), 0);

  const addSoilComponent = () => {
    // Auto-calculate remaining percentage - No disabled logic, allow adding anytime
    const remaining = Math.max(0, 100 - currentTotal);
    setSoilMix(prev => [...prev, { id: crypto.randomUUID(), type: SOIL_TYPES[0].value, percent: remaining }]);
  };

  const removeSoilComponent = (id: string) => {
    if (soilMix.length > 1) {
        setSoilMix(prev => prev.filter(c => c.id !== id));
    }
  };

  const updateSoilComponent = (id: string, field: 'type' | 'percent' | 'customName', value: any) => {
    setSoilMix(prev => {
        let newList = prev.map(c => c.id === id ? { ...c, [field]: value } : c);
        
        // Auto-balance logic: ONLY apply if there are exactly 2 components. 
        // If 3+, we don't know which one to adjust, so let user do it manually.
        if (prev.length === 2 && field === 'percent') {
            const newValue = parseInt(value) || 0;
            if (newValue <= 100) {
                const otherId = prev.find(c => c.id !== id)?.id;
                if (otherId) {
                    newList = newList.map(c => 
                        c.id === otherId ? { ...c, percent: 100 - newValue } : c
                    );
                }
            }
        }
        return newList;
    });
  };

  const totalSoilPercent = soilMix.reduce((sum, c) => sum + (Number(c.percent) || 0), 0);

  const handleAddFertilizer = () => {
    const fertLabel = FERTILIZERS.find(f => f.value === fertilizerType)?.label;
    const [year, month, day] = fertilizerDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();
    if (now.getFullYear() === year && now.getMonth() === month - 1 && now.getDate() === day) {
      date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    }

    onAddEvent({
      id: crypto.randomUUID(),
      type: 'FERTILIZER',
      subType: fertilizerType,
      date: date.toISOString(),
      details: `${fertLabel}`
    });
  };

  const handleAddTransplant = () => {
    const typeLabel = TRANSPLANT_TYPES.find(t => t.value === transplantType)?.label;
    
    const soilDetails = soilMix.map(c => {
        const typeLabel = SOIL_TYPES.find(t => t.value === c.type)?.label.split(' (')[0];
        const name = c.type === 'OTHER' ? (c.customName || 'Other') : typeLabel;
        return `${name} (${c.percent}%)`;
    }).join(' + ');

    const details = `${typeLabel}${potSize ? ` [${potSize}]` : ''} | Soil: ${soilDetails}`;

    const [year, month, day] = transplantDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();
    if (now.getFullYear() === year && now.getMonth() === month - 1 && now.getDate() === day) {
      date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    }
    const isoDate = date.toISOString();

    onAddEvent({
        id: crypto.randomUUID(),
        type: 'TRANSPLANT',
        subType: transplantType,
        date: isoDate,
        details: details
    });

    onUpdate({ ...rose, transplantDate: isoDate });
    setPotSize('');
  };

  const handleAddIssue = (issue: { label: string, type: string }) => {
    const [year, month, day] = healthDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();
    if (now.getFullYear() === year && now.getMonth() === month - 1 && now.getDate() === day) {
      date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    }

    onAddEvent({
        id: crypto.randomUUID(),
        type: 'PEST_CONTROL',
        date: date.toISOString(),
        details: issue.label
    });
  }

  const handlePlantingDateChange = (date: string) => {
    onUpdate({ ...rose, plantingDate: date });
  };
  
  const handleTransplantHistoryChange = (date: string) => {
      onUpdate({ ...rose, transplantDate: date });
  };

  // History Editing Handlers
  const startEditingEvent = (event: RoseEvent) => {
    setEditingEventId(event.id);
    const d = new Date(event.date);
    const offsetMs = d.getTimezoneOffset() * 60 * 1000;
    const localDate = new Date(d.getTime() - offsetMs);
    const localStr = localDate.toISOString().slice(0, 16); 
    
    setEditForm({
      date: localStr,
      details: event.details
    });
  };

  const saveEditedEvent = () => {
    if (!editingEventId) return;
    
    const updatedEvents = rose.events.map(e => {
      if (e.id === editingEventId) {
        return {
          ...e,
          date: new Date(editForm.date).toISOString(),
          details: editForm.details
        };
      }
      return e;
    });

    onUpdate({ ...rose, events: updatedEvents });
    setEditingEventId(null);
  };

  const deleteEvent = () => {
      if (!editingEventId) return;
      if (confirm("Delete this event?")) {
          onUpdate({ ...rose, events: rose.events.filter(e => e.id !== editingEventId) });
          setEditingEventId(null);
      }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <SectionTitle icon={Calendar} title="Milestones" />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-medium uppercase">Planting Date</label>
            <input 
              type="date" 
              className="w-full mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm"
              value={rose.plantingDate?.split('T')[0] || ''}
              onChange={(e) => handlePlantingDateChange(new Date(e.target.value).toISOString())}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium uppercase">Last Transplant</label>
            <input 
              type="date" 
              className="w-full mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm"
              value={rose.transplantDate?.split('T')[0] || ''}
              onChange={(e) => handleTransplantHistoryChange(new Date(e.target.value).toISOString())}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <SectionTitle icon={Shovel} title="Soil & Pot" color="text-amber-900" />
        <div className="space-y-4">
             <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Date</label>
                    <input 
                    type="date"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={transplantDate}
                    onChange={(e) => setTransplantDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">Action</label>
                    <select
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                        value={transplantType}
                        onChange={(e) => setTransplantType(e.target.value)}
                    >
                        {TRANSPLANT_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label.split(' (')[0]}</option>
                        ))}
                    </select>
                </div>
             </div>

             <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Pot Size / Details</label>
                <input 
                    type="text"
                    placeholder="Ex: 8号 -> 10号"
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={potSize}
                    onChange={(e) => setPotSize(e.target.value)}
                />
             </div>

             <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-amber-900 font-bold uppercase">Soil Blend</label>
                    <span className={`text-xs font-bold ${totalSoilPercent === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        Total: {totalSoilPercent}%
                    </span>
                </div>
                
                <div className="space-y-2">
                    {soilMix.map((mix) => (
                        <div key={mix.id} className="flex gap-2 items-start animate-fade-in">
                            <div className="flex-1 space-y-1">
                                <select
                                    className="w-full p-1.5 bg-white border border-gray-200 rounded text-sm focus:ring-1 focus:ring-amber-500"
                                    value={mix.type}
                                    onChange={(e) => updateSoilComponent(mix.id, 'type', e.target.value)}
                                >
                                    {SOIL_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                                {mix.type === 'OTHER' && (
                                    <input 
                                        type="text"
                                        placeholder="Enter soil name"
                                        className="w-full p-1.5 bg-white border border-gray-200 rounded text-xs"
                                        value={mix.customName || ''}
                                        onChange={(e) => updateSoilComponent(mix.id, 'customName', e.target.value)}
                                    />
                                )}
                            </div>
                            <div className="w-16 relative">
                                <input 
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="w-full p-1.5 bg-white border border-gray-200 rounded text-sm text-center"
                                    value={mix.percent}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => updateSoilComponent(mix.id, 'percent', e.target.value)}
                                />
                                <span className="absolute right-1 top-1.5 text-xs text-gray-400">%</span>
                            </div>
                            {soilMix.length > 1 && (
                                <button 
                                    onClick={() => removeSoilComponent(mix.id)}
                                    className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center mt-2">
                    <button 
                        onClick={addSoilComponent}
                        className="text-xs font-medium text-amber-800 flex items-center gap-1 hover:underline"
                    >
                        <Plus size={12} /> Add Component {totalSoilPercent !== 100 && `(${100 - totalSoilPercent}% left)`}
                    </button>
                    {soilMix.length === 2 && (
                         <span className="text-[10px] text-amber-600/70 italic">Auto-balancing active</span>
                    )}
                </div>
             </div>
             
             <Button 
                onClick={handleAddTransplant} 
                className="w-full bg-amber-800 hover:bg-amber-900 focus:ring-amber-800"
                disabled={totalSoilPercent !== 100}
            >
                Record {totalSoilPercent !== 100 && `(Total must be 100%)`}
             </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <SectionTitle icon={Droplets} title="Fertilizer" />
        
        <div className="space-y-3">
            <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Date</label>
                <input 
                  type="date"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={fertilizerDate}
                  onChange={(e) => setFertilizerDate(e.target.value)}
                />
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-500 font-medium mb-1 block">Type</label>
                <select
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={fertilizerType}
                  onChange={(e) => setFertilizerType(e.target.value as FertilizerType)}
                >
                  {FERTILIZERS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleAddFertilizer} size="sm" className="h-[38px] min-w-[80px]">
                Record
              </Button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <SectionTitle icon={Bug} title="Dr. Rose (Health)" color="text-rose-900" />
        
        <div className="mb-3">
            <label className="text-xs text-gray-500 font-medium mb-1 block">Date of Observation</label>
            <input 
              type="date"
              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              value={healthDate}
              onChange={(e) => setHealthDate(e.target.value)}
            />
        </div>

        <div className="flex flex-wrap gap-2">
            {ISSUES.map(issue => (
                <button
                    key={issue.label}
                    onClick={() => handleAddIssue(issue)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                        issue.type === 'PREVENTION' 
                        ? 'border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100'
                        : issue.type === 'PEST'
                        ? 'border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100'
                        : 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                    }`}
                >
                    {issue.label}
                </button>
            ))}
        </div>
      </div>

      <div>
        <SectionTitle icon={History} title="History" />
        <div className="space-y-3 mt-2">
          {rose.events.length === 0 && <p className="text-sm text-gray-400 italic">No history events yet.</p>}
          {rose.events.map(event => (
            <div key={event.id} className="flex gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm items-start group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                event.type === 'FERTILIZER' ? 'bg-blue-50 text-blue-600' :
                event.type === 'PRUNING' ? 'bg-rose-50 text-rose-600' :
                event.type === 'PEST_CONTROL' ? 'bg-orange-50 text-orange-600' :
                event.type === 'TRANSPLANT' ? 'bg-amber-50 text-amber-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {event.type === 'FERTILIZER' ? <Droplets size={18} /> : 
                 event.type === 'PRUNING' ? <Scissors size={18} /> : 
                 event.type === 'PEST_CONTROL' ? <Bug size={18} /> :
                 event.type === 'TRANSPLANT' ? <Shovel size={18} /> :
                 <Leaf size={18} />}
              </div>
              
              {editingEventId === event.id ? (
                  <div className="flex-1 space-y-2 animate-fade-in">
                      <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-gray-500 uppercase">Edit Event</label>
                          <button onClick={deleteEvent} className="text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded hover:bg-rose-100 flex items-center gap-1">
                             <Trash2 size={12} /> Delete
                          </button>
                      </div>
                      <input 
                        type="datetime-local"
                        className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-900 focus:outline-none"
                        value={editForm.date}
                        onChange={e => setEditForm({...editForm, date: e.target.value})}
                      />
                      <input 
                        type="text"
                        className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-900 focus:outline-none"
                        value={editForm.details}
                        onChange={e => setEditForm({...editForm, details: e.target.value})}
                        placeholder="Details"
                      />
                      <div className="flex gap-2 mt-2">
                          <Button size="sm" onClick={saveEditedEvent} className="py-1 h-8 text-xs flex-1">
                             <Check size={14} className="mr-1"/> Save
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => setEditingEventId(null)} className="py-1 h-8 text-xs flex-1">
                             <X size={14} className="mr-1"/> Cancel
                          </Button>
                      </div>
                  </div>
              ) : (
                  <div className="flex-1 relative pr-8">
                    <p className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString()} {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    <p className="text-sm font-medium text-gray-800 whitespace-pre-wrap">{event.details}</p>
                    
                    <button 
                        onClick={() => startEditingEvent(event)} 
                        className="absolute top-0 right-0 p-1.5 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                        title="Edit Event"
                    >
                        <Pencil size={14} />
                    </button>
                  </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Danger Zone */}
      <div className="mt-8 pt-6 border-t border-gray-200 pb-10">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Management</h3>
        <button 
            onClick={() => {
                if (onDelete) onDelete();
            }}
            className="w-full py-3 bg-gray-50 text-gray-500 rounded-xl border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors flex items-center justify-center gap-2 font-medium"
        >
            <Trash2 size={16} /> Delete Variety
        </button>
      </div>
    </div>
  );
};

const PruningTab: React.FC<{ rose: RoseVariety; onAddPhoto: (p: RosePhoto) => void; onAddEvent: (e: RoseEvent) => void; onDeletePhoto: (id: string) => void; onUpdatePhoto: (p: RosePhoto) => void }> = ({ rose, onAddPhoto, onAddEvent, onDeletePhoto, onUpdatePhoto }) => {
  const [pruningDate, setPruningDate] = useState(new Date().toISOString().split('T')[0]);
  const [pruningDetails, setPruningDetails] = useState('');
  const [tempBefore, setTempBefore] = useState<string | null>(null);
  const [tempAfter, setTempAfter] = useState<string | null>(null);
  
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ date: '', note: '' });

  const handleSavePruning = () => {
    // 1. Create Event
    const [year, month, day] = pruningDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();
    if (now.getFullYear() === year && now.getMonth() === month - 1 && now.getDate() === day) {
      date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    }
    const isoDate = date.toISOString();

    const detailText = pruningDetails.trim() || 'Pruning Session';
    
    onAddEvent({
        id: crypto.randomUUID(),
        type: 'PRUNING',
        date: isoDate,
        details: detailText
    });

    // 2. Save Photos if present
    if (tempBefore) {
        onAddPhoto({
            id: crypto.randomUUID(),
            url: tempBefore,
            date: isoDate,
            type: 'PRUNING_BEFORE',
            note: detailText
        });
    }

    if (tempAfter) {
        onAddPhoto({
            id: crypto.randomUUID(),
            url: tempAfter,
            date: isoDate,
            type: 'PRUNING_AFTER',
            note: detailText
        });
    }

    // 3. Reset Form
    setPruningDetails('');
    setTempBefore(null);
    setTempAfter(null);
  };

  const startEditing = (photo: RosePhoto) => {
      setEditingPhotoId(photo.id);
      setEditForm({
          date: photo.date.split('T')[0],
          note: photo.note || ''
      });
  }
  
  const saveEdit = () => {
      if (!editingPhotoId) return;
      const original = rose.photos.find(p => p.id === editingPhotoId);
      if (!original) return;
      
      const [year, month, day] = editForm.date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      // Preserve original time
      const originalDate = new Date(original.date);
      date.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());

      onUpdatePhoto({
          ...original,
          date: date.toISOString(),
          note: editForm.note
      });
      setEditingPhotoId(null);
  }

  const pruningPhotos = useMemo(() => 
    rose.photos.filter(p => p.type === 'PRUNING_BEFORE' || p.type === 'PRUNING_AFTER')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  , [rose.photos]);

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-rose-900 font-bold border-b border-rose-100 pb-2">
            <Scissors size={18} />
            <h3>New Pruning Record</h3>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Date</label>
                <input 
                  type="date"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={pruningDate}
                  onChange={(e) => setPruningDate(e.target.value)}
                />
            </div>
            
            <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Details / Notes</label>
                <input 
                  type="text"
                  placeholder="e.g., Summer pruning, Winter pruning..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={pruningDetails}
                  onChange={(e) => setPruningDetails(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase block text-center">Before</span>
                  {tempBefore ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={tempBefore} className="w-full h-full object-cover" alt="Before" />
                          <button onClick={() => setTempBefore(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12}/></button>
                      </div>
                  ) : (
                      <PhotoUpload 
                        label="Before Photo"
                        icon="camera" 
                        onPhotoSelect={setTempBefore} 
                      />
                  )}
              </div>
              <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase block text-center">After</span>
                  {tempAfter ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={tempAfter} className="w-full h-full object-cover" alt="After" />
                          <button onClick={() => setTempAfter(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12}/></button>
                      </div>
                  ) : (
                      <PhotoUpload 
                        label="After Photo" 
                        icon="camera"
                        onPhotoSelect={setTempAfter} 
                      />
                  )}
              </div>
            </div>

            <Button 
                onClick={handleSavePruning} 
                className="w-full mt-2"
                disabled={!tempBefore && !tempAfter && !pruningDetails}
            >
                <Save size={16} className="mr-2" /> Save Record
            </Button>
        </div>
      </div>

      <div>
        <SectionTitle icon={History} title="Pruning Archive" />
        <div className="grid grid-cols-2 gap-3 mt-2">
          {pruningPhotos.length === 0 && <p className="col-span-2 text-sm text-gray-400 italic text-center py-4">No pruning photos recorded.</p>}
          {pruningPhotos.map(photo => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm transition-all duration-300">
               {editingPhotoId === photo.id ? (
                   <div className="absolute inset-0 bg-white z-10 p-2 flex flex-col justify-center gap-2">
                       <input 
                           type="date"
                           className="w-full p-1 border border-gray-200 rounded text-xs"
                           value={editForm.date}
                           onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                       />
                       <input 
                           type="text"
                           className="w-full p-1 border border-gray-200 rounded text-xs"
                           placeholder="Note"
                           value={editForm.note}
                           onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                       />
                       <div className="flex gap-1">
                           <button onClick={saveEdit} className="flex-1 bg-emerald-100 text-emerald-800 text-xs py-1 rounded">Save</button>
                           <button onClick={() => setEditingPhotoId(null)} className="flex-1 bg-gray-100 text-gray-800 text-xs py-1 rounded">Cancel</button>
                       </div>
                   </div>
               ) : (
                 <>
                  <img src={photo.url} alt="Pruning" className="w-full h-32 object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 backdrop-blur-sm flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">
                        {photo.type === 'PRUNING_BEFORE' ? 'Before' : 'After'}
                        </p>
                        <p className="text-[10px] text-gray-300">
                        {new Date(photo.date).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={() => startEditing(photo)} className="text-white/80 hover:text-emerald-400 p-1">
                            <Pencil size={12} />
                        </button>
                        <button onClick={() => onDeletePhoto(photo.id)} className="text-white/80 hover:text-rose-400 p-1">
                            <Trash2 size={12} />
                        </button>
                    </div>
                  </div>
                 </>
               )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GalleryTab: React.FC<{ rose: RoseVariety; onAddPhoto: (p: RosePhoto) => void; onDeletePhoto: (id: string) => void; onUpdatePhoto: (p: RosePhoto) => void }> = ({ rose, onAddPhoto, onDeletePhoto, onUpdatePhoto }) => {
    const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ date: '' });

    const handlePhotoUpload = (base64: string) => {
        onAddPhoto({
          id: crypto.randomUUID(),
          url: base64,
          date: new Date().toISOString(),
          type: 'BLOOM',
        });
    };

    const startEditing = (photo: RosePhoto) => {
        setEditingPhotoId(photo.id);
        setEditForm({
            date: photo.date.split('T')[0]
        });
    }

    const saveEdit = () => {
        if (!editingPhotoId) return;
        const original = rose.photos.find(p => p.id === editingPhotoId);
        if (!original) return;
        
        const [year, month, day] = editForm.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const originalDate = new Date(original.date);
        date.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds());

        onUpdatePhoto({
            ...original,
            date: date.toISOString()
        });
        setEditingPhotoId(null);
    }

    const bloomPhotos = useMemo(() => 
        rose.photos.filter(p => p.type === 'BLOOM')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    , [rose.photos]);

    return (
        <div className="space-y-6 pb-10">
            <div className="bg-gradient-to-br from-rose-50 to-white rounded-xl p-6 shadow-sm border border-rose-100 text-center">
                <Flower2 size={32} className="mx-auto text-rose-400 mb-2" />
                <h3 className="font-serif font-bold text-rose-900 mb-1">Bloom Log</h3>
                <p className="text-xs text-rose-700 mb-4">Capture the perfect bloom moment.</p>
                <div className="max-w-[200px] mx-auto">
                    <PhotoUpload 
                        label="Take Bloom Photo" 
                        icon="camera"
                        onPhotoSelect={handlePhotoUpload} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {bloomPhotos.map(photo => (
                    <div key={photo.id} className="relative rounded-xl overflow-hidden shadow-sm aspect-square bg-white border border-gray-100">
                         {editingPhotoId === photo.id ? (
                             <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-4 gap-3 animate-fade-in">
                                 <span className="text-xs font-bold text-gray-500">Edit Date</span>
                                 <input 
                                     type="date"
                                     className="w-full p-2 border border-gray-200 rounded text-sm bg-white"
                                     value={editForm.date}
                                     onChange={(e) => setEditForm({ date: e.target.value })}
                                 />
                                 <div className="flex w-full gap-2">
                                     <button onClick={saveEdit} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold">Save</button>
                                     <button onClick={() => setEditingPhotoId(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-bold">Cancel</button>
                                 </div>
                             </div>
                         ) : (
                             <>
                                 <img src={photo.url} alt="Bloom" className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                     <div className="flex justify-between items-end">
                                        <span className="text-white text-xs font-medium">{new Date(photo.date).toLocaleDateString()}</span>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => startEditing(photo)}
                                                className="bg-white/20 p-1.5 rounded-full text-white hover:bg-emerald-600 transition-colors backdrop-blur-md"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button 
                                                onClick={() => onDeletePhoto(photo.id)}
                                                className="bg-white/20 p-1.5 rounded-full text-white hover:bg-rose-600 transition-colors backdrop-blur-md"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                     </div>
                                 </div>
                             </>
                         )}
                    </div>
                ))}
            </div>
            {bloomPhotos.length === 0 && (
                <div className="text-center py-10 opacity-40">
                    <ImageIcon size={48} className="mx-auto mb-2" />
                    <p className="text-sm">No blooms captured yet.</p>
                </div>
            )}
        </div>
    );
};

const MemoTab: React.FC<{ rose: RoseVariety; onAddNote: (n: RoseNote) => void; onDeleteNote: (id: string) => void; onUpdateNote: (n: RoseNote) => void; onUpdateLegacyMemo: (val: string) => void }> = ({ rose, onAddNote, onDeleteNote, onUpdateNote, onUpdateLegacyMemo }) => {
    const [noteContent, setNoteContent] = useState('');
    const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Edit State
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ date: '', content: '' });

    const handleAdd = () => {
        if (!noteContent.trim()) return;

        const [year, month, day] = noteDate.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const now = new Date();
        if (now.getFullYear() === year && now.getMonth() === month - 1 && now.getDate() === day) {
            date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        }

        onAddNote({
            id: crypto.randomUUID(),
            date: date.toISOString(),
            content: noteContent
        });
        setNoteContent('');
    };

    const startEditing = (note: RoseNote) => {
        setEditingNoteId(note.id);
        const d = new Date(note.date);
        const offsetMs = d.getTimezoneOffset() * 60 * 1000;
        const localDate = new Date(d.getTime() - offsetMs);
        setEditForm({
            date: localDate.toISOString().split('T')[0],
            content: note.content
        });
    };

    const saveEdit = () => {
        if (!editingNoteId) return;
        
        const [year, month, day] = editForm.date.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        // Preserve time if possible or just use date
        const isoDate = date.toISOString();

        onUpdateNote({
            id: editingNoteId,
            date: isoDate,
            content: editForm.content
        });
        setEditingNoteId(null);
    }

    const notes = useMemo(() => 
        (rose.notes || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    , [rose.notes]);

    return (
        <div className="space-y-6 pb-10">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <BookOpen size={16} className="text-emerald-800"/> New Entry
                    </h3>
                    <input 
                        type="date"
                        className="p-1 bg-gray-50 border border-gray-200 rounded text-xs"
                        value={noteDate}
                        onChange={(e) => setNoteDate(e.target.value)}
                    />
                </div>
                <textarea 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm min-h-[100px] focus:ring-2 focus:ring-emerald-900 focus:outline-none mb-3"
                    placeholder="Observation, growth status, ideas..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                />
                <Button onClick={handleAdd} disabled={!noteContent.trim()} className="w-full">
                    Add Journal Entry
                </Button>
            </div>

            {rose.memo && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 relative">
                    <div className="flex items-center gap-2 mb-2 text-yellow-800 font-bold text-xs uppercase">
                        <span>General Description (Legacy)</span>
                    </div>
                    <textarea 
                        className="w-full bg-transparent border-none text-sm text-gray-700 focus:ring-0 p-0 resize-none"
                        value={rose.memo}
                        onChange={(e) => onUpdateLegacyMemo(e.target.value)}
                        rows={3}
                    />
                </div>
            )}

            <div className="space-y-4">
                {notes.map(note => (
                    <div key={note.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group">
                        {editingNoteId === note.id ? (
                            <div className="space-y-3 animate-fade-in">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-emerald-800 uppercase">Editing</span>
                                    <input 
                                        type="date"
                                        className="p-1 text-xs border border-gray-200 rounded"
                                        value={editForm.date}
                                        onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                    />
                                </div>
                                <textarea 
                                    className="w-full p-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-emerald-900 focus:outline-none"
                                    rows={4}
                                    value={editForm.content}
                                    onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={saveEdit} className="flex-1 h-8 text-xs">
                                        <CheckCircle2 size={14} className="mr-1"/> Save
                                    </Button>
                                    <Button size="sm" variant="secondary" onClick={() => setEditingNoteId(null)} className="flex-1 h-8 text-xs">
                                        <X size={14} className="mr-1"/> Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded">
                                        {new Date(note.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => startEditing(note)}
                                            className="text-gray-300 hover:text-emerald-600 transition-colors p-1"
                                            title="Edit Note"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button 
                                            onClick={() => onDeleteNote(note.id)}
                                            className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                                            title="Delete Note"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {note.content}
                                </p>
                            </>
                        )}
                    </div>
                ))}
                {notes.length === 0 && !rose.memo && (
                    <div className="text-center py-8 text-gray-400 italic text-sm">
                        No journal entries yet.
                    </div>
                )}
            </div>
        </div>
    );
};