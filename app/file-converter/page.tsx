"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const convertTypes = [
  { value: "excel-to-csv", label: "Excel (.xlsx) → CSV" },
  { value: "csv-to-excel", label: "CSV → Excel (.xlsx)" },
  { value: "images-to-pdf", label: "Ảnh (JPG/PNG) → PDF" },
];

export default function FileConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [convertType, setConvertType] = useState(convertTypes[0].value);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultName, setResultName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setResultUrl(null);
    setResultName("");
    if (convertType === "images-to-pdf") {
      setFiles(Array.from(e.target.files || []));
      setFile(null);
    } else {
      setFile(e.target.files?.[0] || null);
      setFiles([]);
    }
  };

  // Xử lý chuyển đổi
  const handleConvert = async () => {
    setError("");
    setResultUrl(null);
    setResultName("");
    setLoading(true);
    try {
      if (convertType === "excel-to-csv" && file) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv" });
        setResultUrl(URL.createObjectURL(blob));
        setResultName(file.name.replace(/\.xlsx?$/, ".csv"));
      } else if (convertType === "csv-to-excel" && file) {
        const text = await file.text();
        const ws = XLSX.utils.aoa_to_sheet(text.split('\n').map(line => line.split(',')));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        setResultUrl(URL.createObjectURL(blob));
        setResultName(file.name.replace(/\.csv$/, ".xlsx"));
      } else if (convertType === "images-to-pdf" && files.length > 0) {
        const pdf = new jsPDF();
        for (let i = 0; i < files.length; i++) {
          const imgFile = files[i];
          const imgData = await fileToDataUrl(imgFile);
          const img = new window.Image();
          img.src = imgData;
          await new Promise((res) => (img.onload = res));
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          // Tính toán tỉ lệ ảnh phù hợp
          let ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
          let w = img.width * ratio;
          let h = img.height * ratio;
          let x = (pageWidth - w) / 2;
          let y = (pageHeight - h) / 2;
          if (i > 0) pdf.addPage();
          pdf.addImage(img, "JPEG", x, y, w, h);
        }
        const blob = pdf.output("blob");
        setResultUrl(URL.createObjectURL(blob));
        setResultName("images-to-pdf.pdf");
      } else {
        setError("Vui lòng chọn file phù hợp.");
      }
    } catch (e) {
      setError("Lỗi chuyển đổi file. Vui lòng thử lại hoặc kiểm tra định dạng file.");
    }
    setLoading(false);
  };

  // Helper chuyển file sang dataURL
  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Công cụ chuyển đổi định dạng file</h1>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Chọn loại chuyển đổi:</label>
        <select
          className="border px-3 py-2 rounded w-full"
          value={convertType}
          onChange={e => {
            setConvertType(e.target.value);
            setFile(null);
            setFiles([]);
            setResultUrl(null);
            setResultName("");
            setError("");
          }}
        >
          {convertTypes.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Chọn file cần chuyển đổi:</label>
        {convertType === "images-to-pdf" ? (
          <input type="file" accept="image/*" multiple onChange={handleFileChange} />
        ) : (
          <input type="file" accept={convertType === "excel-to-csv" ? ".xlsx,.xls" : ".csv"} onChange={handleFileChange} />
        )}
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleConvert}
        disabled={loading || (!file && files.length === 0)}
      >
        {loading ? "Đang chuyển đổi..." : "Chuyển đổi"}
      </button>
      {error && <div className="text-red-600 mt-3">{error}</div>}
      {resultUrl && (
        <div className="mt-6">
          <a
            href={resultUrl}
            download={resultName}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Tải file kết quả
          </a>
        </div>
      )}
      <div className="mt-8 text-gray-500 text-sm">
        <b>Lưu ý:</b> File được xử lý hoàn toàn trên trình duyệt, an toàn và bảo mật.<br />
        Các định dạng nâng cao (PDF ↔️ Word, PDF ↔️ Ảnh) sẽ được bổ sung sau.
      </div>
    </div>
  );
} 