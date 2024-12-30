"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LegalDashboard() {
  // State to manage the numbers
  const [totalCases, setTotalCases] = useState(0);
  const [activeCases, setActiveCases] = useState(0);
  const [closedCases, setClosedCases] = useState(0);

  // Function to handle updates
  const handleUpdate = (setter, label) => {
    const newValue = prompt(`Enter the new number for ${label}:`, "0");
    if (newValue !== null && !isNaN(newValue)) {
      setter(parseInt(newValue, 10));
    }
  };

  const [cases, setCases] = useState<any[][]>([
    ["Sr. No", "Date of Hearing", "CP/Suit No", "Subject", "Petitioner", "Court", "Concerned Office", "Comments Filed", "Last Hearing Date", "Remarks"],
  ]);
  const [dragging, setDragging] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  // Handle File Upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });

      // Assuming only one sheet is uploaded
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });
      setCases(sheetData); // Set data from uploaded file
      setOriginalFile(file); // Save the original file for later export
    };
    reader.readAsBinaryString(file);
  };

  // Handle Drag-and-Drop
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

  // Add a New Row
  const handleAddRow = () => {
    const newRow = Array(cases[0].length).fill(""); // Add an empty row with the same number of columns
    setCases([...cases, newRow]);
  };

  // Delete a Row
  const handleDeleteRow = (rowIndex: number) => {
    const updatedCases = cases.filter((_, index) => index !== rowIndex);
    setCases(updatedCases);
  };

  // Edit a Cell
  const handleEditCell = (rowIndex: number, colIndex: number, value: string) => {
    const updatedCases = [...cases];
    updatedCases[rowIndex][colIndex] = value;
    setCases(updatedCases);
  };

  // Save Changes to Excel File
  const handleSaveChanges = () => {
    if (!originalFile) {
      alert("No file uploaded to overwrite!");
      return;
    }

    const ws = XLSX.utils.aoa_to_sheet(cases);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const excelFile = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
    const buffer = new ArrayBuffer(excelFile.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < excelFile.length; i++) {
      view[i] = excelFile.charCodeAt(i) & 0xff;
    }

    const blob = new Blob([buffer], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = originalFile.name;
    link.click();

    alert("Changes saved and file downloaded!");
  };

  return (
    <div className="min-h-screen bg-black text-gray-300 flex flex-col items-center justify-center">
      <div className="flex flex-wrap justify-center gap-8 mt-20 lg:mt-32">
        <div className="flex flex-col items-center justify-center bg-blue-500 text-white rounded-xl p-6 w-64 h-48 shadow-lg">
          <h2 className="text-2xl font-bold">Total Cases</h2>
          <p className="text-4xl font-semibold">{totalCases}</p>
          <button
            className="mt-4 bg-white text-blue-500 font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
            onClick={() => handleUpdate(setTotalCases, "Total Cases")}
          >
            Update Numbers
          </button>
        </div>

        <div className="flex flex-col items-center justify-center bg-green-500 text-white rounded-xl p-6 w-64 h-48 shadow-lg">
          <h2 className="text-2xl font-bold">Active Cases</h2>
          <p className="text-4xl font-semibold">{activeCases}</p>
          <button
            className="mt-4 bg-white text-green-500 font-semibold py-2 px-4 rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300"
            onClick={() => handleUpdate(setActiveCases, "Active Cases")}
          >
            Update Numbers
          </button>
        </div>

        <div className="flex flex-col items-center justify-center bg-red-500 text-white rounded-xl p-6 w-64 h-48 shadow-lg">
          <h2 className="text-2xl font-bold">Closed Cases</h2>
          <p className="text-4xl font-semibold">{closedCases}</p>
          <button
            className="mt-4 bg-white text-red-500 font-semibold py-2 px-4 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300"
            onClick={() => handleUpdate(setClosedCases, "Closed Cases")}
          >
            Update Numbers
          </button>
        </div>
      </div>

      <div className="shadow-md bg-black text-gray-300 transform scale-90 origin-top p-5 rounded-lg w-full max-w-6xl">
        {/* Header Section */}
        <div className="px-5 py-3 bg-black text-white rounded-t-lg flex justify-between items-center">
          <h1 className="text-2xl font-bold">LEGAL DASHBOARD</h1>
          <div className="space-x-2">
            <Button variant="secondary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </div>
        </div>

        {/* Drag-and-Drop Section */}
        <div
          className={`mt-4 p-4 border-2 ${dragging ? "border-gray-100 bg-black" : "border"} rounded-lg flex flex-col items-center justify-center`}
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
        <div className="mt-4 overflow-auto">
          {cases.length > 1 ? (
            <table className="w-full border-collapse border border-gray-700 bg-black text-gray-300 text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {cases[0].map((header, index) => (
                    <th key={index} className="border border-gray-700 p-2 text-center">
                      {header}
                    </th>
                  ))}
                  <th className="border border-gray-700 p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-gray-700">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border border-gray-700 p-2 text-center">
                        <input
                          type="text"
                          value={cell || ""}
                          onChange={(e) => handleEditCell(rowIndex + 1, cellIndex, e.target.value)}
                          className="bg-transparent text-center w-full"
                        />
                      </td>
                    ))}
                    <td className="border border-gray-700 p-2 text-center">
                      <Button variant="destructive" onClick={() => handleDeleteRow(rowIndex + 1)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-center">
              No data to display. Upload files or add cases to populate the table.
            </p>
          )}
        </div>

        {/* Add Case Button */}
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={handleAddRow}>
            Add Case
          </Button>
        </div>
      </div>
    </div>
  );
}
