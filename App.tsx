import React, { useState, useEffect, useMemo, useRef, ReactNode } from 'react';
import { Plus, ChevronLeft, Sprout, Calendar, Droplets, Scissors, Save, History, Leaf, Check, AlertCircle, Settings, Download, Upload, Bug, Flower2, Trash2, Image as ImageIcon, Shovel, X, BookOpen, ShieldAlert, Pencil, CheckCircle2, Edit3, FlaskConical, Search } from 'lucide-react';
import { BREEDERS, FERTILIZERS, ISSUES, ROSE_LIBRARY, TRANSPLANT_TYPES, SOIL_TYPES, CHEMICALS, PRUNING_TYPES } from './constants';
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
           {saveStatus === 'saving' && <span className="text-gray-400">保存中...</span>}
           {saveStatus === 'saved' && <span className="text-emerald-600 flex items-center gap-1"><Check size={12} /> 保存済</span>}
           {saveStatus === 'error' && <span className="text-rose-600 flex items-center gap-1"><AlertCircle size={12} /> エラー</span>}
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
        if (confirm(`"${name}" の情報（タイプ ${meta.type}, 特徴）で品種詳細を更新しますか？`)) {
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
            <h3 className="text-lg font-bold text-gray-900">品種情報の編集</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        
        <div className="space-y-4 mb-6">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">品種名</label>
                <input 
                    type="text"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:outline-none font-bold text-gray-800"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">作出者 / ブランド</label>
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
                <CheckCircle2 size={18} className="mr-2"/> 変更を保存
            </Button>
            
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-300 text-xs">危険エリア</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <button 
                onClick={() => {
                    if(confirm("本当にこの品種を完全に削除しますか？\n全ての履歴と写真が失われます。")) {
                        onDelete();
                    }
                }}
                className="w-full py-3 text-rose-600 bg-rose-50 rounded-lg font-medium hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
            >
                <Trash2 size={16} /> 品種を削除
            </button>
        </div>
      </div>
    </div>
  );
};

const ChemicalSelectorModal: React.FC<{
    onSelect: (chemicalName: string) => void;
    onClose: () => void;
}> = ({ onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <FlaskConical size={18} className="text-emerald-600"/>
                        薬剤を選択
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full">
                        <X size={20}/>
                    </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-4">
                    {CHEMICALS.map((category) => (
                        <div key={category.category}>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">{category.category}</h4>
                            <div className="space-y-1">
                                {category.items.map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => onSelect(item)}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-900 transition-colors"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const PruningTypeSelectorModal: React.FC<{
    onSelect: (type: string) => void;
    onClose: () => void;
}> = ({ onSelect, onClose }) => {
    const [customType, setCustomType] = useState('');

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">作業内容を選択</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <div className="space-y-2 mb-4">
                    {PRUNING_TYPES.map(type => (
                        <button
                            key={type}
                            onClick={() => onSelect(type)}
                            className="w-full py-3 px-4 text-left bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 rounded-lg transition-colors font-medium border border-gray-100"
                        >
                            {type}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-2 text-xs text-gray-500">または</span>
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">その他 (自由入力)</label>
                    <div className="flex gap-2">
                        <input 
                            type="text"
                            className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 focus:outline-none"
                            placeholder="作業内容を入力..."
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                        />
                        <Button 
                            size="sm" 
                            onClick={() => onSelect(customType)} 
                            disabled={!customType.trim()}
                        >
                            決定
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Missing Component Implementations ---

const SettingsScreen: React.FC<{
  roses: RoseVariety[];
  onImport: (data: RoseVariety[]) => void;
  onBack: () => void;
}> = ({ roses, onImport, onBack }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(roses));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "rosarium_backup_" + new Date().toISOString().slice(0, 10) + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
            if(window.confirm(`現在 ${roses.length} 品種登録されています。\n${json.length} 品種のデータを読み込んで上書きしますか？`)) {
                onImport(json);
                alert("インポートが完了しました。");
            }
        } else {
            alert("無効なデータ形式です。");
        }
      } catch (err) {
        alert("ファイルの読み込みに失敗しました。");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <Header title="設定・データ管理" onBack={onBack} />
        <main className="p-4 space-y-4">
            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Download size={20} /> データのエクスポート
                </h3>
                <p className="text-sm text-gray-500">
                    現在の登録データをJSONファイルとして保存します。バックアップとしてご利用ください。
                </p>
                <Button onClick={handleExport} variant="secondary" className="w-full">
                    <Download size={16} className="mr-2"/> バックアップを保存
                </Button>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Upload size={20} /> データのインポート
                </h3>
                <p className="text-sm text-gray-500">
                    以前保存したバックアップファイルを読み込みます。現在のデータは上書きされます。
                </p>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleImport}
                />
                <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full">
                    <Upload size={16} className="mr-2"/> ファイルを選択して復元
                </Button>
            </div>
            
            <div className="mt-8 text-center text-xs text-gray-400">
                Rosarium Pro v1.0.0
            </div>
        </main>
    </div>
  );
};

const NewRoseScreen: React.FC<{
  onSave: (rose: RoseVariety) => void;
  onCancel: () => void;
  saveStatus: string;
}> = ({ onSave, onCancel, saveStatus }) => {
  const [breeder, setBreeder] = useState(Object.keys(BREEDERS)[0]);
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = () => {
    if (!name.trim()) return;

    let meta = { type: undefined as number | undefined, feature: undefined as string | undefined };
    if (ROSE_LIBRARY[name]) {
        meta = ROSE_LIBRARY[name];
    }

    const newRose: RoseVariety = {
        id: crypto.randomUUID(),
        breeder,
        name,
        registrationDate: new Date().toISOString(),
        plantingDate: new Date(date).toISOString(),
        events: [],
        photos: [],
        notes: [],
        memo: meta.feature || '',
        roseType: meta.type,
        feature: meta.feature
    };

    onSave(newRose);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <Header title="新しいバラを迎える" onBack={onCancel} />
        <main className="p-4 max-w-lg mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">作出者 / ブランド</label>
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

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">品種名</label>
                    <input 
                        type="text"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:outline-none"
                        placeholder="例: シェエラザード"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        list="rose-names"
                    />
                    <datalist id="rose-names">
                        {BREEDERS[breeder]?.map(n => <option key={n} value={n} />)}
                    </datalist>
                    {ROSE_LIBRARY[name] && (
                        <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded flex items-start gap-2">
                             <CheckCircle2 size={14} className="mt-0.5 shrink-0"/>
                             <span>「{name}」のデータ（Type {ROSE_LIBRARY[name].type}）が見つかりました。自動入力されます。</span>
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">お迎え日</label>
                    <input 
                        type="date"
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-900 focus:outline-none"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div className="pt-4">
                    <Button onClick={handleSubmit} className="w-full py-3" disabled={!name.trim()}>
                        <Plus size={18} className="mr-2" /> リストに追加
                    </Button>
                </div>
            </div>
        </main>
    </div>
  );
};

const GalleryTab: React.FC<{ rose: RoseVariety; onAddPhoto: (p: RosePhoto) => void }> = ({ rose, onAddPhoto }) => {
    return (
        <div className="p-1">
            <div className="grid grid-cols-3 gap-1 mb-4">
                {rose.photos.map(photo => (
                    <div key={photo.id} className="relative aspect-square bg-gray-100 overflow-hidden">
                        <img src={photo.url} className="w-full h-full object-cover" alt="Rose" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] p-1 truncate">
                            {new Date(photo.date).toLocaleDateString()}
                        </div>
                    </div>
                ))}
                <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
                    <PhotoUpload 
                        label="写真を追加" 
                        onPhotoSelect={(url) => {
                            onAddPhoto({
                                id: crypto.randomUUID(),
                                url,
                                date: new Date().toISOString(),
                                type: 'GENERAL'
                            });
                        }} 
                        icon="upload"
                    />
                </div>
            </div>
        </div>
    );
};

const MemoTab: React.FC<{ rose: RoseVariety; onUpdate: (r: RoseVariety) => void }> = ({ rose, onUpdate }) => {
    const [note, setNote] = useState('');

    const handleAddNote = () => {
        if(!note.trim()) return;
        const newNote: RoseNote = {
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            content: note
        };
        onUpdate({
            ...rose,
            notes: [newNote, ...rose.notes]
        });
        setNote('');
    };

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <textarea
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-900 focus:outline-none mb-2"
                    placeholder="観察メモ..."
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                <div className="flex justify-end">
                    <Button size="sm" onClick={handleAddNote} disabled={!note.trim()}>
                        <Save size={14} className="mr-1"/> 記録
                    </Button>
                </div>
            </div>
            <div className="space-y-3">
                {rose.notes.map(n => (
                    <div key={n.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-xs text-gray-400 mb-1">{new Date(n.date).toLocaleString()}</div>
                        <p className="text-gray-700 whitespace-pre-wrap text-sm">{n.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CareTab: React.FC<{ rose: RoseVariety; onUpdate: (r: RoseVariety) => void; onAddEvent: (e: RoseEvent) => void; onDelete?: () => void; onAddPhoto: (p: RosePhoto) => void }> = ({ rose, onUpdate, onAddEvent, onDelete, onAddPhoto }) => {
  const [fertilizerType, setFertilizerType] = useState<FertilizerType>('VITALIZER');
  const [fertilizerDate, setFertilizerDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [transplantDate, setTransplantDate] = useState(new Date().toISOString().split('T')[0]);
  const [transplantType, setTransplantType] = useState(TRANSPLANT_TYPES[0].value);
  const [potSize, setPotSize] = useState('');
  
  const [healthDate, setHealthDate] = useState(new Date().toISOString().split('T')[0]);
  const [showChemicalModal, setShowChemicalModal] = useState(false);
  const [showPruningModal, setShowPruningModal] = useState(false);
  
  // Pruning State
  const [pruningDate, setPruningDate] = useState(new Date().toISOString().split('T')[0]);
  const [pruningDetails, setPruningDetails] = useState('');
  const [tempBefore, setTempBefore] = useState<string | null>(null);
  const [tempAfter, setTempAfter] = useState<string | null>(null);

  const [issueType, setIssueType] = useState(ISSUES[0].label);

  const handleAddFertilizer = () => {
    onAddEvent({
        id: crypto.randomUUID(),
        type: 'FERTILIZER',
        date: new Date(fertilizerDate).toISOString(),
        details: FERTILIZERS.find(f => f.value === fertilizerType)?.label || '肥料',
        subType: fertilizerType
    });
  };

  const handleAddTransplant = () => {
    onAddEvent({
        id: crypto.randomUUID(),
        type: 'TRANSPLANT',
        date: new Date(transplantDate).toISOString(),
        details: `${TRANSPLANT_TYPES.find(t => t.value === transplantType)?.label} (${potSize || 'サイズ不明'})`,
        subType: transplantType
    });
    setPotSize('');
  };

  const handleAddIssue = () => {
      if(issueType === '薬剤散布') {
          setShowChemicalModal(true);
      } else {
          onAddEvent({
            id: crypto.randomUUID(),
            type: 'PEST_CONTROL',
            date: new Date(healthDate).toISOString(),
            details: issueType
          });
      }
  };

  const handleSelectChemical = (chemicalName: string) => {
    onAddEvent({
        id: crypto.randomUUID(),
        type: 'PEST_CONTROL',
        date: new Date(healthDate).toISOString(),
        details: chemicalName,
        subType: 'CHEMICAL'
    });
    setShowChemicalModal(false);
  };

  const handleSavePruning = () => {
    const [year, month, day] = pruningDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();
    if (now.getFullYear() === year && now.getMonth() === month - 1 && now.getDate() === day) {
      date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    }
    const isoDate = date.toISOString();

    const detailText = pruningDetails.trim() || '剪定作業';
    
    onAddEvent({
        id: crypto.randomUUID(),
        type: 'PRUNING',
        date: isoDate,
        details: detailText
    });

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

    setPruningDetails('');
    setTempBefore(null);
    setTempAfter(null);
  };

  const events = [...rose.events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 pb-10">
      {showChemicalModal && (
          <ChemicalSelectorModal 
              onSelect={handleSelectChemical} 
              onClose={() => setShowChemicalModal(false)} 
          />
      )}
      
      {showPruningModal && (
          <PruningTypeSelectorModal 
              onSelect={(type) => {
                  setPruningDetails(type);
                  setShowPruningModal(false);
              }} 
              onClose={() => setShowPruningModal(false)} 
          />
      )}

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <SectionTitle icon={Droplets} title="施肥・活力剤" />
        <div className="flex flex-col gap-3">
            <div className="flex gap-2">
                {FERTILIZERS.map(f => (
                    <button
                        key={f.value}
                        onClick={() => setFertilizerType(f.value)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border ${fertilizerType === f.value ? 'bg-emerald-900 text-white border-emerald-900' : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
                <input 
                    type="date"
                    className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={fertilizerDate}
                    onChange={(e) => setFertilizerDate(e.target.value)}
                />
                <Button onClick={handleAddFertilizer}>
                    <Check size={16} /> 記録
                </Button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <SectionTitle icon={Shovel} title="植え替え・用土" />
        <div className="space-y-3">
             <div className="grid grid-cols-2 gap-2">
                <select 
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={transplantType}
                    onChange={(e) => setTransplantType(e.target.value)}
                >
                    {TRANSPLANT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <input 
                    type="text"
                    placeholder="鉢号数 / 場所"
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={potSize}
                    onChange={(e) => setPotSize(e.target.value)}
                />
             </div>
             <div className="flex gap-2">
                <input 
                    type="date"
                    className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={transplantDate}
                    onChange={(e) => setTransplantDate(e.target.value)}
                />
                <Button onClick={handleAddTransplant}>
                    <Check size={16} /> 記録
                </Button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <SectionTitle icon={Bug} title="ドクター・ローズ" color="text-rose-900"/>
        <div className="flex flex-col gap-3">
             <div className="flex flex-wrap gap-2">
                {ISSUES.map(issue => (
                    <button
                        key={issue.label}
                        onClick={() => setIssueType(issue.label)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full border ${issueType === issue.label ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-white text-gray-500 border-gray-200'}`}
                    >
                        {issue.label}
                    </button>
                ))}
             </div>
             <div className="flex gap-2">
                <input 
                    type="date"
                    className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    value={healthDate}
                    onChange={(e) => setHealthDate(e.target.value)}
                />
                <Button onClick={handleAddIssue} variant={issueType === '薬剤散布' ? 'primary' : 'danger'}>
                    <Check size={16} /> {issueType === '薬剤散布' ? '薬剤選択' : '記録'}
                </Button>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <SectionTitle icon={Scissors} title="剪定・誘引" color="text-rose-900"/>
        
        <div className="space-y-4">
            <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">日付</label>
                <input 
                  type="date"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  value={pruningDate}
                  onChange={(e) => setPruningDate(e.target.value)}
                />
            </div>
            
            <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">詳細 / メモ</label>
                <div className="flex gap-2">
                    <div 
                        onClick={() => setShowPruningModal(true)}
                        className={`flex-1 p-2 border border-gray-200 rounded-lg text-sm flex items-center ${pruningDetails ? 'bg-white text-gray-800' : 'bg-gray-50 text-gray-400'} cursor-pointer`}
                    >
                        {pruningDetails || "作業内容を選択..."}
                    </div>
                    <button 
                        onClick={() => setShowPruningModal(true)}
                        className="p-2 text-emerald-900 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
                    >
                        <Pencil size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase block text-center">剪定前 (Before)</span>
                  {tempBefore ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={tempBefore} className="w-full h-full object-cover" alt="Before" />
                          <button onClick={() => setTempBefore(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12}/></button>
                      </div>
                  ) : (
                      <PhotoUpload 
                        label="Before写真"
                        icon="camera" 
                        onPhotoSelect={setTempBefore} 
                      />
                  )}
              </div>
              <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-500 uppercase block text-center">剪定後 (After)</span>
                  {tempAfter ? (
                      <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img src={tempAfter} className="w-full h-full object-cover" alt="After" />
                          <button onClick={() => setTempAfter(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={12}/></button>
                      </div>
                  ) : (
                      <PhotoUpload 
                        label="After写真" 
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
                <Save size={16} className="mr-2" /> 記録を保存
            </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">最近の活動履歴</h3>
        {events.map(event => (
            <div key={event.id} className="bg-white p-3 rounded-lg border border-gray-100 flex gap-3 items-center">
                <div className={`p-2 rounded-full ${
                    event.type === 'FERTILIZER' ? 'bg-emerald-100 text-emerald-600' :
                    event.type === 'PEST_CONTROL' ? 'bg-rose-100 text-rose-600' :
                    event.type === 'TRANSPLANT' ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-100 text-gray-600'
                }`}>
                    {event.type === 'FERTILIZER' && <Droplets size={16} />}
                    {event.type === 'PEST_CONTROL' && <Bug size={16} />}
                    {event.type === 'TRANSPLANT' && <Shovel size={16} />}
                    {event.type === 'PRUNING' && <Scissors size={16} />}
                </div>
                <div>
                    <div className="text-sm font-bold text-gray-800">{event.details}</div>
                    <div className="text-xs text-gray-400">{new Date(event.date).toLocaleDateString()}</div>
                </div>
            </div>
        ))}
        {events.length === 0 && <div className="text-center text-gray-400 text-sm py-4">履歴はありません</div>}
      </div>
    </div>
  );
};

const RoseDetailScreen: React.FC<{
  rose: RoseVariety;
  onUpdate: (r: RoseVariety) => void;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  saveStatus: string;
}> = ({ rose, onUpdate, onEdit, onDelete, onBack, saveStatus }) => {
  const [activeTab, setActiveTab] = useState<'CARE' | 'GALLERY' | 'MEMO'>('CARE');

  const addEvent = (event: RoseEvent) => {
    onUpdate({ ...rose, events: [event, ...rose.events] });
  };

  const addPhoto = (photo: RosePhoto) => {
    onUpdate({ ...rose, photos: [photo, ...rose.photos] });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
        <Header 
            title={rose.name} 
            onBack={onBack} 
            saveStatus={saveStatus as any}
            rightAction={
                <button onClick={onEdit} className="p-2 text-gray-400 hover:text-emerald-900 rounded-full">
                    <Settings size={20} />
                </button>
            }
        />
        
        {/* Top Summary */}
        <div className="bg-emerald-900 text-white p-6 rounded-b-3xl shadow-lg mb-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 p-4">
                 <Flower2 size={120} />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
                    <span>{rose.breeder}</span>
                    {rose.roseType !== undefined && (
                        <span className="px-1.5 py-0.5 border border-emerald-700 rounded bg-emerald-800/50">Type {rose.roseType}</span>
                    )}
                </div>
                <h1 className="text-2xl font-serif font-bold mb-2">{rose.name}</h1>
                <p className="text-sm text-emerald-100/90 leading-relaxed max-w-xs">
                    {rose.feature || rose.memo || "特徴はまだ記録されていません。"}
                </p>
                <div className="mt-4 flex gap-4 text-xs">
                    <div>
                        <span className="block opacity-60">お迎え日</span>
                        <span className="font-bold">{rose.plantingDate ? new Date(rose.plantingDate).toLocaleDateString() : '---'}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 mb-4">
            <div className="bg-white rounded-xl p-1 shadow-sm flex">
                <button 
                    onClick={() => setActiveTab('CARE')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'CARE' ? 'bg-emerald-100 text-emerald-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    お世話
                </button>
                <button 
                    onClick={() => setActiveTab('GALLERY')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'GALLERY' ? 'bg-emerald-100 text-emerald-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    アルバム
                </button>
                <button 
                    onClick={() => setActiveTab('MEMO')}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'MEMO' ? 'bg-emerald-100 text-emerald-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    日記
                </button>
            </div>
        </div>

        <main className="px-4">
            {activeTab === 'CARE' && (
                <CareTab 
                    rose={rose} 
                    onUpdate={onUpdate} 
                    onAddEvent={addEvent} 
                    onDelete={onDelete}
                    onAddPhoto={addPhoto}
                />
            )}
            {activeTab === 'GALLERY' && (
                <GalleryTab rose={rose} onAddPhoto={addPhoto} />
            )}
            {activeTab === 'MEMO' && (
                <MemoTab rose={rose} onUpdate={onUpdate} />
            )}
        </main>
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
    if (window.confirm("この品種を削除しますか？\n元に戻すことはできず、全てのデータが失われます。")) {
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
        <span>カメラ機能を使用するにはHTTPS接続が必要です。</span>
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
                <p className="text-emerald-100 text-sm">あなたの庭を正確に管理します。</p>
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
                 <span className="font-bold text-gray-900 text-lg mr-1">{roses.length}</span> 品種
               </div>
               <Button size="sm" onClick={() => setView({ type: 'NEW' })}>
                 <Plus size={16} className="mr-1" /> 新規追加
               </Button>
            </div>

            <div className="space-y-3">
              {roses.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <Leaf size={48} className="mx-auto mb-3 opacity-20" />
                  <p>まだバラが登録されていません。</p>
                  <p className="text-sm">最初の品種を追加して記録を始めましょう。</p>
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
                          登録日: {new Date(rose.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingRose(rose);
                        }}
                        className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors z-10"
                        title="品種名の編集"
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
