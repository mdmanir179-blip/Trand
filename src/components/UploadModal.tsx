import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle, FileText, Download, Layers } from 'lucide-react';
import { parseExcelOrCsv, ParseResult } from '../utils/excelParser';
import { SaleRecord } from '../types/sales';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (records: SaleRecord[], fileName: string) => void;
  onDownloadTemplate: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
  onDownloadTemplate
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [pasteContent, setPasteContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      setFileBuffer(buffer);
      const result = await parseExcelOrCsv(buffer, file.name);
      setParseResult(result);
      if (result.sheetNames.length > 0) {
        setSelectedSheet(result.selectedSheet || result.sheetNames[0]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setParseResult({
        success: false,
        records: [],
        sheetNames: [],
        selectedSheet: '',
        totalRows: 0,
        headers: [],
        detectedColumns: {},
        message: `Error reading file: ${msg}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetChange = async (sheetName: string) => {
    if (!fileBuffer) return;
    setIsLoading(true);
    setSelectedSheet(sheetName);
    try {
      const result = await parseExcelOrCsv(fileBuffer, fileName, sheetName);
      setParseResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setParseResult({
        success: false,
        records: [],
        sheetNames: parseResult?.sheetNames || [],
        selectedSheet: sheetName,
        totalRows: 0,
        headers: [],
        detectedColumns: {},
        message: `Error parsing sheet: ${msg}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handlePasteProcess = async () => {
    if (!pasteContent.trim()) return;
    setIsLoading(true);
    try {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(pasteContent).buffer;
      const result = await parseExcelOrCsv(buffer, 'pasted_data.csv');
      setFileName('Pasted Data');
      setParseResult(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setParseResult({
        success: false,
        records: [],
        sheetNames: [],
        selectedSheet: '',
        totalRows: 0,
        headers: [],
        detectedColumns: {},
        message: `Error parsing pasted text: ${msg}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyData = () => {
    if (parseResult && parseResult.success && parseResult.records.length > 0) {
      onDataLoaded(parseResult.records, fileName || 'Uploaded_Excel_Data.xlsx');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Upload Your Sales Excel Data
              </h3>
              <p className="text-xs text-slate-500">
                Upload your Instamart, Quick Commerce, or E-commerce Excel/CSV spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Method Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('file')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'file'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Upload .xlsx / .xls / .csv
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'paste'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Paste CSV / TSV text
            </button>

            <button
              onClick={onDownloadTemplate}
              className="ml-auto flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-xs font-medium hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              Get Template (.xlsx)
            </button>
          </div>

          {activeTab === 'file' ? (
            /* Drag and Drop Zone */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-3">
                <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drag & drop your Excel file here
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Accepts <code className="bg-slate-100 px-1 py-0.5 rounded">.xlsx</code>,{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded">.xls</code>, or{' '}
                <code className="bg-slate-100 px-1 py-0.5 rounded">.csv</code>
              </p>
            </div>
          ) : (
            /* Paste area */
            <div className="space-y-3">
              <label className="block text-xs font-medium text-slate-700">
                Paste tabular data copied directly from Excel, Google Sheets, or CSV:
              </label>
              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Date, Brand, Product Name, Category, Units Sold, Gross Sales, Cost of Sales, Orders, City..."
                rows={6}
                className="w-full font-mono text-xs p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handlePasteProcess}
                disabled={!pasteContent.trim() || isLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
              >
                Parse Pasted Data
              </button>
            </div>
          )}

          {/* Sheet Selector if multiple sheets found */}
          {parseResult && parseResult.sheetNames.length > 1 && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">Multiple Sheets Detected:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {parseResult.sheetNames.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSheetChange(s)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                      selectedSheet === s
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-center p-4 gap-2 text-slate-600 text-xs">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing file and mapping column headers...</span>
            </div>
          )}

          {/* Parse Result Feedback */}
          {parseResult && !isLoading && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 ${
                parseResult.success
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                {parseResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{parseResult.message}</span>
              </div>

              {parseResult.success && (
                <div className="space-y-2 mt-2 pt-2 border-t border-emerald-200/60 text-slate-700">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Total Records:</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {parseResult.records.length.toLocaleString()} rows
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Unique Brands:</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {new Set(parseResult.records.map(r => r.brand)).size} brands
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Gross Sales:</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        ₹{parseResult.records.reduce((s, r) => s + r.grossSales, 0).toLocaleString()}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total Units Sold:</span>
                      <strong className="text-slate-900 font-mono text-sm">
                        {parseResult.records.reduce((s, r) => s + r.unitsSold, 0).toLocaleString()} units
                      </strong>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px]">
                    <span className="text-slate-500 block mb-1">Detected Columns:</span>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(parseResult.detectedColumns).map(([key, col]) => (
                        <span
                          key={key}
                          className="bg-white/80 border border-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]"
                        >
                          <strong className="capitalize">{key}:</strong> {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-white text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyData}
            disabled={!parseResult || !parseResult.success || parseResult.records.length === 0}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Apply Data to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
