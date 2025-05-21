import React, { useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { ChevronUpIcon, ChevronDownIcon, PencilIcon, TrashIcon, PhoneIcon, CalendarIcon, UserIcon, FlagIcon } from '@heroicons/react/24/outline';

// Format phone number to US format
const formatPhoneNumber = (value) => {
  if (!value) return value;
  
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, '');
  
  // Handle US phone with or without country code
  let formattedNumber;
  if (phoneNumber.length === 10) {
    // Format as (XXX) XXX-XXXX
    formattedNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
    // Handle with country code (assuming US +1)
    formattedNumber = phoneNumber.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  } else {
    // Just return original if not a standard format
    return value;
  }
  
  return formattedNumber;
};

const columnHelper = createColumnHelper();

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Pending': {
      classes: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
        </svg>
      )
    },
    'Sale': {
      classes: 'bg-green-100 text-green-800 border border-green-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
      )
    },
    'No Answer': {
      classes: 'bg-gray-100 text-gray-800 border border-gray-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
          <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      )
    },
    'Follow-up Later': {
      classes: 'bg-blue-100 text-blue-800 border border-blue-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
        </svg>
      )
    },
    'Not Interested': {
      classes: 'bg-red-100 text-red-800 border border-red-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
          <path d="M15.73 5.25h1.035A7.465 7.465 0 0118 9.375a7.465 7.465 0 01-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.243.723-3.218C7.74 15.724 7.366 15 6.748 15H3.622c-1.026 0-1.945-.694-2.054-1.715A12.134 12.134 0 011.5 12c0-2.848.992-5.464 2.649-7.521.388-.482.987-.729 1.605-.729H9.77a4.5 4.5 0 011.423.23l3.114 1.04a4.5 4.5 0 001.423.23zM21.669 13.773c.536-1.362.831-2.845.831-4.398 0-1.27-.23-2.491-.65-3.617a4.513 4.513 0 00-1.423-.23h-1.079v-.127c0-.245-.027-.479-.079-.705a5.654 5.654 0 00-.31-1.015c-.868.185-1.61.737-2.08 1.482a5.432 5.432 0 00-.578 1.13l-.127.292c-.073.165-.189.315-.322.435-.142.134-.332.225-.535.225h-1.727c-.167 0-.327-.066-.449-.178-.115-.104-.237-.105-.339-.006a8.004 8.004 0 00-1.33 1.397c.795 1.383 1.309 2.932 1.486 4.594 1.948-.444 3.07-1.857 3.689-3.196.144-.314.236-.648.272-.987l.006-.069c.025-.283.12-.532.284-.743.151-.194.368-.34.603-.413.571-.18 1.125-.413 1.655-.694.132-.07.293-.063.422.014z" />
        </svg>
      )
    },
    'Wrong Number': {
      classes: 'bg-purple-100 text-purple-800 border border-purple-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
          <path fillRule="evenodd" d="M15 3.75a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0V5.56l-4.72 4.72a.75.75 0 11-1.06-1.06l4.72-4.72h-2.69a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
        </svg>
      )
    },
    'Invalid': {
      classes: 'bg-gray-100 text-gray-800 border border-gray-200',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      )
    },
  };

  const config = statusConfig[status] || statusConfig['Invalid'];

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.classes}`}>
      {config.icon}
      {status}
    </span>
  );
};

// Lead score component
const LeadScore = ({ score }) => {
  if (!score) return <span className="text-gray-400">-</span>;
  
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="flex items-center">
      <div className={`font-medium ${getScoreColor(score)}`}>
        {score.toFixed(1)}
      </div>
      <div className="ml-2 w-16 bg-gray-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${score >= 8 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${Math.min(score * 10, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function CallbacksTable({ data, onEdit, onDelete }) {
  const [sorting, setSorting] = useState([
    { id: 'follow_up_date', desc: false }, // Default sort by follow-up date ascending
  ]);

  const columns = [
    columnHelper.accessor('customer_name', {
      header: 'Customer',
      cell: info => (
        <div className="font-medium text-gray-900">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor('callback_number', {
      header: 'Phone',
      cell: info => {
        const rawNumber = info.getValue();
        const formattedNumber = formatPhoneNumber(rawNumber);
        
        return (
          <div className="flex items-center">
            <PhoneIcon className="h-4 w-4 text-gray-400 mr-1.5" />
            <a href={`tel:${rawNumber}`} className="text-primary-600 hover:text-primary-800 hover:underline" onClick={e => e.stopPropagation()}>
              {formattedNumber || rawNumber}
            </a>
          </div>
        );
      },
    }),
    columnHelper.accessor(row => `${row.car_year || ''} ${row.car_make || ''} ${row.car_model || ''}`.trim(), {
      id: 'vehicle',
      header: 'Vehicle',
      cell: info => {
        const value = info.getValue();
        return value ? (
          <div className="text-gray-700">{value}</div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      }
    }),
    columnHelper.accessor('product', {
      header: 'Product',
      cell: info => {
        const value = info.getValue();
        return value ? (
          <div className="text-gray-700 max-w-[150px] truncate" title={value}>{value}</div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      }
    }),
    columnHelper.accessor('follow_up_date', {
      header: () => (
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
          <span>Follow-up Date</span>
        </div>
      ),
      cell: info => {
        const value = info.getValue();
        if (!value) return <span className="text-gray-400">-</span>;
        
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isToday = date.toDateString() === today.toDateString();
        const isPast = date < today;
        
        return (
          <div className={`flex items-center ${isToday ? 'text-primary-600 font-medium' : isPast ? 'text-red-600' : 'text-gray-700'}`}>
            {isToday && (
              <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mr-1.5 animate-pulse-slow"></span>
            )}
            {isPast && !isToday && (
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
            )}
            {format(date, 'MM/dd/yyyy')}
          </div>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('agent_name', {
      header: () => (
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 mr-1 text-gray-500" />
          <span>Agent</span>
        </div>
      ),
      cell: info => {
        const value = info.getValue();
        const isClaimed = info.row.original.claimed_by;
        return (
          <div className="flex items-center">
            {isClaimed && (
              <FlagIcon className="h-4 w-4 text-purple-500 mr-1.5" title="Claimed" />
            )}
            {value ? (
              <div className={`text-gray-700 ${isClaimed ? 'font-medium' : ''}`}>{value}</div>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      }
    }),
    columnHelper.accessor('lead_score', {
      header: 'Lead Score',
      cell: info => <LeadScore score={info.getValue()} />,
    }),
    columnHelper.accessor('last_modified', {
      header: 'Last Modified',
      cell: info => (
        <div className="text-gray-500 text-xs">
          {format(new Date(info.getValue()), 'MM/dd/yyyy')}
          <div className="text-gray-400">
            {format(new Date(info.getValue()), 'h:mm a')}
          </div>
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original);
            }}
            className="text-gray-500 hover:text-primary-600 transition-colors duration-150 p-1 rounded-full hover:bg-gray-100"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.original.id);
            }}
            className="text-gray-500 hover:text-red-600 transition-colors duration-150 p-1 rounded-full hover:bg-gray-100"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto shadow-card rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  scope="col"
                  className="px-3 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  style={{ width: header.id === 'actions' ? '60px' : 'auto' }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? 'flex items-center cursor-pointer select-none hover:text-primary-600 transition-colors duration-150'
                          : ''
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUpIcon className="ml-1 h-4 w-4 text-primary-500" />,
                        desc: <ChevronDownIcon className="ml-1 h-4 w-4 text-primary-500" />,
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map(row => (
              <tr 
                key={row.id}
                className="group hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={() => onEdit(row.original)}
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-3 py-3.5 text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-sm text-gray-500 text-center">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-300 mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                  </svg>
                  <div className="text-gray-500 font-medium">No callbacks found</div>
                  <p className="text-gray-400 text-xs mt-1">Create a new callback to get started</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}