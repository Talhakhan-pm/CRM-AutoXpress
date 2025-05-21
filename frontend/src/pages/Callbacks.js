import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { callbacksApi } from '../services/api';
import CallbacksTable from '../components/callbacks/CallbacksTable';
import CallbackModal from '../components/callbacks/CallbackModal';
import CallbacksFilter from '../components/callbacks/CallbacksFilter';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { 
  DocumentArrowDownIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/solid';

export default function Callbacks() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCallback, setCurrentCallback] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState(null);
  const queryClient = useQueryClient();

  // Fetch callbacks with optional filters
  const {
    data: callbacks = [],
    isLoading,
    isError,
    error,
    isFetching,
    refetch
  } = useQuery(
    ['callbacks', filters, isSearching, searchQuery],
    () => {
      if (isSearching && searchQuery.length >= 3) {
        return callbacksApi.searchCallbacks(searchQuery);
      }
      return callbacksApi.getCallbacks(filters);
    },
    {
      keepPreviousData: true,
      enabled: !isSearching || searchQuery.length >= 3,
      staleTime: 30000, // 30 seconds
    }
  );

  // Dashboard summary stats
  const pendingCallbacks = callbacks.filter(c => c.status === 'Pending').length;
  const todayCallbacks = callbacks.filter(c => {
    if (!c.follow_up_date) return false;
    const followUpDate = new Date(c.follow_up_date);
    const today = new Date();
    return followUpDate.toDateString() === today.toDateString();
  }).length;
  const highLeadScoreCallbacks = callbacks.filter(c => c.lead_score && c.lead_score >= 8).length;

  // Create mutation
  const createMutation = useMutation(
    (newCallback) => callbacksApi.createCallback(newCallback),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('callbacks');
        showNotification('success', 'Callback created successfully');
      },
      onError: (error) => {
        showNotification('error', `Error creating callback: ${error.message}`);
      }
    }
  );

  // Update mutation
  const updateMutation = useMutation(
    ({ id, data }) => callbacksApi.updateCallback(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('callbacks');
        showNotification('success', 'Callback updated successfully');
      },
      onError: (error) => {
        showNotification('error', `Error updating callback: ${error.message}`);
      }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (id) => callbacksApi.deleteCallback(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('callbacks');
        showNotification('success', 'Callback deleted successfully');
      },
      onError: (error) => {
        showNotification('error', `Error deleting callback: ${error.message}`);
      }
    }
  );

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleOpenModal = (callback = null) => {
    setCurrentCallback(callback);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentCallback(null);
    setIsModalOpen(false);
  };

  const handleSaveCallback = (callbackData) => {
    if (currentCallback) {
      // Update existing callback
      updateMutation.mutate({
        id: currentCallback.id,
        data: callbackData,
      });
    } else {
      // Create new callback
      createMutation.mutate(callbackData);
    }
    handleCloseModal();
  };

  const handleDeleteCallback = (id) => {
    if (window.confirm('Are you sure you want to delete this callback?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(!!searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleFilter = (newFilters) => {
    setIsSearching(false);
    setSearchQuery('');
    setFilters(newFilters);
  };

  const handleExportCSV = () => {
    // In a real implementation, this would export callbacks to CSV
    showNotification('success', 'Callbacks exported to CSV');
  };

  if (isError) {
    return (
      <div className="rounded-md bg-red-50 p-6 my-4 shadow-md animate-fade-in">
        <div className="flex">
          <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800">Error loading callbacks</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message || 'An unknown error occurred'}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg animate-fade-in-down flex items-center ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
          )}
          <span className={notification.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {notification.message}
          </span>
        </div>
      )}

      <div className="sm:flex sm:items-center sm:justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Callbacks</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage customer callbacks, track follow-ups, and keep notes on each customer interaction.
          </p>
        </div>
        <div className="mt-4 flex items-center space-x-2 sm:mt-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5 text-gray-500 mr-1" />
            Export
          </button>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Callback
          </button>
        </div>
      </div>

      {/* Dashboard summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-card border border-gray-200 flex items-center hover:shadow-card-hover transition-shadow duration-200">
          <div className="bg-primary-100 p-3 rounded-full mr-4">
            <PhoneIcon className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Today's Callbacks</p>
            <p className="text-2xl font-bold text-gray-900">{todayCallbacks}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card border border-gray-200 flex items-center hover:shadow-card-hover transition-shadow duration-200">
          <div className="bg-yellow-100 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-yellow-600">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Callbacks</p>
            <p className="text-2xl font-bold text-gray-900">{pendingCallbacks}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-card border border-gray-200 flex items-center hover:shadow-card-hover transition-shadow duration-200">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-green-600">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">High Priority Leads</p>
            <p className="text-2xl font-bold text-gray-900">{highLeadScoreCallbacks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card border border-gray-200 animate-fade-in">
        <div className="border-b border-gray-200 p-4">
          <div className="sm:flex sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            {/* Search Field */}
            <div className="max-w-lg flex-grow">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-grow">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search callbacks..."
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {isSearching && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-sm">Clear</span>
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Filter component */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => refetch()}
                className={`inline-flex items-center rounded-md p-2 text-gray-500 hover:text-primary-600 focus:outline-none ${isFetching ? 'animate-spin' : ''}`}
                disabled={isFetching}
                title="Refresh"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
              <CallbacksFilter onFilter={handleFilter} />
            </div>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-300 border-r-primary-600 align-[-0.125em]"></div>
            <p className="mt-4 text-gray-700 font-medium">Loading callbacks...</p>
            <p className="mt-2 text-gray-500 text-sm">This will just take a moment</p>
          </div>
        ) : (
          <CallbacksTable 
            data={callbacks} 
            onEdit={handleOpenModal} 
            onDelete={handleDeleteCallback} 
          />
        )}
      </div>

      {/* Callback Modal */}
      <CallbackModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        callback={currentCallback}
        onSave={handleSaveCallback}
        title={currentCallback ? 'Edit Callback' : 'New Callback'}
      />
    </div>
  );
}