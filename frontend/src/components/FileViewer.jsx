import React from 'react';
import { X } from 'lucide-react';
import { FileViewerProps } from '../../types';

export function FileViewer({ file, onClose }: FileViewerProps) {
  if (!file) return null;

  file,
  onClose,
) {
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-gray-100">{file.path}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)]">
          <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
            {file.content || 'No content available'}
          </pre>
        </div>
      </div>
    </div>
  );
}