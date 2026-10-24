import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, X, Check, ZoomIn, ZoomOut, Video, Image as ImageIcon, AlertTriangle } from 'lucide-react';

interface MediaCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentMediaUrl: string;
  mediaType: 'image' | 'video';
  onSave: (newUrl: string, type: 'image' | 'video') => void;
  onDelete: () => void;
}

export const MediaCustomizerModal: React.FC<MediaCustomizerModalProps> = ({
  isOpen,
  onClose,
  title,
  currentMediaUrl,
  mediaType,
  onSave,
  onDelete,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentMediaUrl);
  const [currentType, setCurrentType] = useState<'image' | 'video'>(mediaType);
  const [zoom, setZoom] = useState<number>(100);
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video');
      setCurrentType(isVideo ? 'video' : 'image');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = () => {
    onSave(previewUrl, currentType);
    onClose();
  };

  const handleDeleteConfirmed = () => {
    onDelete();
    setShowConfirmDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-lg">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media Preview & Framing Area */}
        <div className="space-y-4">
          <div className="relative h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
            {currentType === 'video' ? (
              <video 
                src={previewUrl} 
                controls 
                className="w-full h-full object-cover" 
                style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s' }}
              />
            ) : (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
                style={{ transform: `scale(${zoom / 100})`, transition: 'transform 0.2s' }}
                referrerPolicy="no-referrer"
              />
            )}

            <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-amber-400 font-semibold border border-slate-800 flex items-center gap-1.5">
              {currentType === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
              <span>{currentType === 'video' ? 'Vídeo da Galeria' : 'Imagem da Galeria'}</span>
            </div>
          </div>

          {/* Zoom / Framing Adjustment */}
          {currentType === 'image' && (
            <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <ZoomOut className="w-4 h-4 text-slate-400" />
              <input 
                type="range" 
                min="100" 
                max="150" 
                value={zoom} 
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <ZoomIn className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400 font-mono w-10 text-right">{zoom}%</span>
            </div>
          )}

          {/* Gallery Picker Button */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,video/*" 
            className="hidden" 
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-amber-400" />
            <span>Selecionar Imagem ou Vídeo da Galeria do Celular</span>
          </button>
        </div>

        {/* Delete Confirmation Overlay inside Modal */}
        {showConfirmDelete ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Tem certeza que deseja excluir esta mídia?</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirmed}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                if (window.confirm("Deseja realmente excluir esta mídia e redefinir para o padrão?")) {
                  onDelete();
                  onClose();
                }
              }}
              className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/20 flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Mídia</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
