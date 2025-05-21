import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import { FunnelIcon } from '@heroicons/react/24/outline';

const STATUS_OPTIONS = [
  'All',
  'Pending',
  'Sale',
  'No Answer',
  'Follow-up Later',
  'Not Interested',
  'Wrong Number',
  'Invalid',
];

// Sample agent list - in a real app you'd fetch this from your API
const AGENTS = [
  'All',
  'John Smith',
  'Emily Johnson',
  'Michael Brown',
  'Sarah Davis',
  'Robert Wilson',
];

export default function CallbacksFilter({ onFilter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    follow_up_date_start: null,
    follow_up_date_end: null,
    status: 'All',
    agent_name: 'All',
  });

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    // Process filters for API
    const apiFilters = {};
    
    if (filters.follow_up_date_start) {
      apiFilters.follow_up_date_start = format(filters.follow_up_date_start, 'yyyy-MM-dd');
    }
    
    if (filters.follow_up_date_end) {
      apiFilters.follow_up_date_end = format(filters.follow_up_date_end, 'yyyy-MM-dd');
    }
    
    if (filters.status && filters.status !== 'All') {
      apiFilters.status = filters.status;
    }
    
    if (filters.agent_name && filters.agent_name !== 'All') {
      apiFilters.agent_name = filters.agent_name;
    }
    
    onFilter(apiFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({
      follow_up_date_start: null,
      follow_up_date_end: null,
      status: 'All',
      agent_name: 'All',
    });
    onFilter({});
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      >
        <FunnelIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
        Filter
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-72 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1 px-2">
            <div className="text-gray-700 px-2 py-1 text-sm font-medium">Filters</div>
            
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Follow-up Date Range</label>
              <div className="flex items-center mt-1 space-x-2">
                <DatePicker
                  selected={filters.follow_up_date_start}
                  onChange={(date) => handleFilterChange('follow_up_date_start', date)}
                  selectsStart
                  startDate={filters.follow_up_date_start}
                  endDate={filters.follow_up_date_end}
                  className="block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholderText="Start date"
                />
                <span className="text-gray-500">to</span>
                <DatePicker
                  selected={filters.follow_up_date_end}
                  onChange={(date) => handleFilterChange('follow_up_date_end', date)}
                  selectsEnd
                  startDate={filters.follow_up_date_start}
                  endDate={filters.follow_up_date_end}
                  minDate={filters.follow_up_date_start}
                  className="block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholderText="End date"
                />
              </div>
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">Agent</label>
              <select
                value={filters.agent_name}
                onChange={(e) => handleFilterChange('agent_name', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm focus:border-primary-500 focus:ring-primary-500"
              >
                {AGENTS.map((agent) => (
                  <option key={agent} value={agent}>
                    {agent}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex justify-between px-2 pb-2">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleApplyFilters}
                className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}