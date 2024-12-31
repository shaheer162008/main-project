"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

export default function LegalDashboard() {
  const [cases, setCases] = useState<any[][]>([
    ["Sr. No", "Date of Hearing", "CP/Suit No", "Subject", "Petitioner", "Court", "Concerned Office", "Comments Filed", "Last Hearing Date", "Remarks", "Status"],
  ]);
  const [dragging, setDragging] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<any[]>([]);

  // Automatically calculate totals
  const totalCases = cases.length > 1 ? cases.length - 1 : 0; // Subtract header row
  const closedKeywords = ["Disposed off with directions", "Dismissed", "Disposed off"];

  const activeCases = cases.slice(1).filter((row) => {
    const status = String(row[row.length - 1]);
    return !closedKeywords.some((keyword) => status.includes(keyword));
  }).length;

  const closedCases = cases.slice(1).filter((row) => {
    const status = String(row[row.length - 1]);
    return closedKeywords.some((keyword) => status.includes(keyword));
  }).length;

  // Handle File Upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });

      // Assuming only one sheet is uploaded
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: false });
      setCases([[...cases[0]], ...sheetData.slice(1)]); // Append new data to existing table
      setOriginalFile(file); // Save the original file for later export
    };
    reader.readAsBinaryString(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleEditRow = (rowIndex: number) => {
    setEditingRow(rowIndex);
    setEditedRow([...cases[rowIndex]]);
  };

  const handleSaveRow = (rowIndex: number) => {
    const updatedCases = [...cases];
    updatedCases[rowIndex] = editedRow;
    setCases(updatedCases);
    setEditingRow(null);
  };

  const handleChangeCell = (value: string, cellIndex: number) => {
    const updatedRow = [...editedRow];
    updatedRow[cellIndex] = value;
    setEditedRow(updatedRow);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-black flex flex-col items-center justify-center">
      {/* Summary Cards */}
      <div className="flex flex-wrap justify-center gap-8 mt-20 lg:mt-32">
        <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-xl p-6 w-64 h-48 shadow-lg">
          <h2 className="text-2xl font-bold">Total Cases</h2>
          <p className="text-4xl font-semibold">{totalCases}</p>
        </div>

        <div className="flex flex-col items-center justify-center bg-green-500 text-white rounded-xl p-6 w-64 h-48 shadow-lg">
          <h2 className="text-2xl font-bold">Active Cases</h2>
          <p className="text-4xl font-semibold">{activeCases}</p>
        </div>

        <div className="flex flex-col items-center justify-center bg-red-500 text-white rounded-xl p-6 w-64 h-48 shadow-lg">
          <h2 className="text-2xl font-bold">Closed Cases</h2>
          <p className="text-4xl font-semibold">{closedCases}</p>
        </div>
      </div>

      {/* Drag-and-Drop Section */}
      <div
        className={`mt-4 p-4 border-2 ${dragging ? "border-gray-300 bg-gray-100" : "border-gray-500"} rounded-lg flex flex-col items-center justify-center`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="text-sm mb-2">Drag and drop your Excel files here, or click the button to upload.</p>
        <Button
          variant="secondary"
          onClick={() => document.querySelector('input[type="file"]')?.click()}
        >
          Select File
        </Button>
        <input
          type="file"
          accept=".xlsx, .xls"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </div>

      {/* Table Section */}
      <div className="mt-4 overflow-auto w-full max-w-6xl">
        {cases.length > 1 ? (
          <table className="w-full border-collapse border border-gray-500  text-black text-sm">
            <thead>
              <tr className="border-b border-gray-500">
                {cases[0].map((header, index) => (
                  <th key={index} className="border border-gray-500 p-2 text-center">
                    {header}
                  </th>
                ))}
                <th className="border border-gray-500 p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-500">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-500 p-2 text-center">
                      {editingRow === rowIndex ? (
                        <input
                          type="text"
                          value={editedRow[cellIndex] || ""}
                          onChange={(e) => handleChangeCell(e.target.value, cellIndex)}
                          className="bg-transparent text-center w-full"
                        />
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-500 p-2 text-center">
                    {editingRow === rowIndex ? (
                      <Button variant="primary" onClick={() => handleSaveRow(rowIndex)}>
                        Save
                      </Button>
                    ) : (
                      <Button variant="secondary" onClick={() => handleEditRow(rowIndex + 1)}>
                        Edit
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-600 text-center">
            No data to display. Upload files to populate the table.
          </p>
        )}
      </div>
    </div>
  );
}
