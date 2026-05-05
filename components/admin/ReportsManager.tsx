"use client";

import { useState } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ReportsManagerProps {
  stats: {
    totalStudents: number;
    totalApplications: number;
    pendingApplications: number;
    shortlistedApplications: number;
    acceptedApplications: number;
    rejectedApplications: number;
    totalPositions: number;
    openPositions: number;
  };
}

export default function ReportsManager({ stats }: ReportsManagerProps) {
  const [exporting, setExporting] = useState(false);

  const exportApplicantsToExcel = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/admin/export/applicants');
      const data = await response.json();
      if (data.success && data.applicants) {
        const ws = XLSX.utils.json_to_sheet(data.applicants);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Applicants');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `applicants_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        alert(data.error || 'Failed to export applicants');
      }
    } catch (error) {
      console.error('Error exporting applicants:', error);
      alert('Failed to export applicants');
    } finally {
      setExporting(false);
    }
  };

  const exportSummaryReport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/admin/export/summary');
      const data = await response.json();
      if (data.success) {
        const summaryData = [
          { Metric: 'Total Students', Value: stats.totalStudents },
          { Metric: 'Total Applications', Value: stats.totalApplications },
          { Metric: 'Pending Applications', Value: stats.pendingApplications },
          { Metric: 'Shortlisted Applications', Value: stats.shortlistedApplications },
          { Metric: 'Accepted Applications', Value: stats.acceptedApplications },
          { Metric: 'Rejected Applications', Value: stats.rejectedApplications },
          { Metric: 'Total Positions', Value: stats.totalPositions },
          { Metric: 'Open Positions', Value: stats.openPositions },
          { Metric: '', Value: '' },
          { Metric: 'DEPARTMENT BREAKDOWN', Value: '' },
        ];
        
        if (data.departmentBreakdown) {
          data.departmentBreakdown.forEach((dept: any) => {
            summaryData.push({
              Metric: `  ${dept.department_name}`,
              Value: `${dept.applications_count || 0} applications, ${dept.positions_count || 0} positions`
            });
          });
        }
        
        const ws = XLSX.utils.json_to_sheet(summaryData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Summary Report');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `summary_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        alert(data.error || 'Failed to export summary');
      }
    } catch (error) {
      console.error('Error exporting summary:', error);
      alert('Failed to export summary');
    } finally {
      setExporting(false);
    }
  };

  const exportPositionsReport = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/admin/export/positions');
      const data = await response.json();
      if (data.success && data.positions) {
        const ws = XLSX.utils.json_to_sheet(data.positions);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Positions');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `positions_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        alert(data.error || 'Failed to export positions');
      }
    } catch (error) {
      console.error('Error exporting positions:', error);
      alert('Failed to export positions');
    } finally {
      setExporting(false);
    }
  };

  const exportAllData = async () => {
    setExporting(true);
    try {
      const response = await fetch('/api/admin/export/all');
      const data = await response.json();
      if (data.success) {
        const wb = XLSX.utils.book_new();
        
        const summaryData = [
          { Metric: 'Total Students', Value: stats.totalStudents },
          { Metric: 'Total Applications', Value: stats.totalApplications },
          { Metric: 'Pending', Value: stats.pendingApplications },
          { Metric: 'Shortlisted', Value: stats.shortlistedApplications },
          { Metric: 'Accepted', Value: stats.acceptedApplications },
          { Metric: 'Rejected', Value: stats.rejectedApplications },
        ];
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
        
        if (data.applicants && data.applicants.length > 0) {
          const applicantsSheet = XLSX.utils.json_to_sheet(data.applicants);
          XLSX.utils.book_append_sheet(wb, applicantsSheet, 'All Applicants');
        }
        
        if (data.positions && data.positions.length > 0) {
          const positionsSheet = XLSX.utils.json_to_sheet(data.positions);
          XLSX.utils.book_append_sheet(wb, positionsSheet, 'Positions');
        }
        
        const statusData = [
          { Status: 'Pending', Count: stats.pendingApplications },
          { Status: 'Shortlisted', Count: stats.shortlistedApplications },
          { Status: 'Accepted', Count: stats.acceptedApplications },
          { Status: 'Rejected', Count: stats.rejectedApplications },
        ];
        const statusSheet = XLSX.utils.json_to_sheet(statusData);
        XLSX.utils.book_append_sheet(wb, statusSheet, 'By Status');
        
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `complete_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        alert(data.error || 'Failed to export all data');
      }
    } catch (error) {
      console.error('Error exporting all data:', error);
      alert('Failed to export all data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-3xl font-bold">{stats.totalStudents}</div>
          <div className="text-sm opacity-90">Total Registered Students</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-3xl font-bold">{stats.totalApplications}</div>
          <div className="text-sm opacity-90">Total Applications</div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="text-3xl font-bold">{stats.openPositions}</div>
          <div className="text-sm opacity-90">Open Positions</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="text-3xl font-bold">{stats.shortlistedApplications}</div>
          <div className="text-sm opacity-90">Shortlisted</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={exportApplicantsToExcel}
            disabled={exporting}
            className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            📋 Export Applicants
          </button>
          <button
            onClick={exportSummaryReport}
            disabled={exporting}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            📊 Export Summary Report
          </button>
          <button
            onClick={exportPositionsReport}
            disabled={exporting}
            className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
          >
            📌 Export Positions
          </button>
          <button
            onClick={exportAllData}
            disabled={exporting}
            className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
          >
            📦 Export Complete Report
          </button>
        </div>
        {exporting && (
          <div className="mt-4 text-center text-gray-500">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent"></div>
              Generating report...
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📈 Application Status Distribution</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Pending</span>
              <span>{stats.pendingApplications}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats.totalApplications ? (stats.pendingApplications / stats.totalApplications) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Shortlisted</span>
              <span>{stats.shortlistedApplications}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.totalApplications ? (stats.shortlistedApplications / stats.totalApplications) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Accepted</span>
              <span>{stats.acceptedApplications}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.totalApplications ? (stats.acceptedApplications / stats.totalApplications) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Rejected</span>
              <span>{stats.rejectedApplications}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats.totalApplications ? (stats.rejectedApplications / stats.totalApplications) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}