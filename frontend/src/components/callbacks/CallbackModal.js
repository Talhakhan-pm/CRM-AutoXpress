import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

const STATUS_OPTIONS = [
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
  'John Smith',
  'Emily Johnson',
  'Michael Brown',
  'Sarah Davis',
  'Robert Wilson',
];

// Format phone number to US format (XXX) XXX-XXXX
const formatPhoneNumber = (value) => {
  if (!value) return value;
  
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, '');
  
  // Handle US phone with or without country code
  let formattedNumber;
  if (phoneNumber.length <= 10) {
    // Format as (XXX) XXX-XXXX
    formattedNumber = phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  } else {
    // Handle with country code (assuming US +1)
    formattedNumber = phoneNumber.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }
  
  return formattedNumber;
};

export default function CallbackModal({ isOpen, onClose, callback, onSave, title }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: callback || {
      status: 'Pending',
      agent_name: AGENTS[0],
    },
  });

  // Watch form fields for live updates
  const followUpDate = watch('follow_up_date');
  const callbackNumber = watch('callback_number');
  const product = watch('product');
  const vehicleYear = watch('vehicle_year');
  const carMake = watch('car_make');
  const carModel = watch('car_model');
  const zipCode = watch('zip_code');
  const status = watch('status');
  const comments = watch('comments');
  
  // State for formatted phone number display
  const [formattedPhone, setFormattedPhone] = useState('');
  // State for calculated lead score
  const [calculatedLeadScore, setCalculatedLeadScore] = useState(0);
  
  // Update formatted phone when callback_number changes
  useEffect(() => {
    if (callbackNumber) {
      setFormattedPhone(formatPhoneNumber(callbackNumber));
    } else {
      setFormattedPhone('');
    }
  }, [callbackNumber]);
  
  // Calculate lead score automatically based on form data
  useEffect(() => {
    // Base score starts at 5 (middle of 0-10 range)
    let score = 5;
    
    // Add points for completed fields that indicate a higher quality lead
    if (product) score += 0.5;
    if (vehicleYear) {
      const currentYear = new Date().getFullYear();
      const age = currentYear - parseInt(vehicleYear);
      // Newer vehicles (less than 5 years old) get higher scores
      if (age <= 5) score += 1;
      else if (age <= 10) score += 0.5;
    }
    if (carMake) score += 0.5;
    if (carModel) score += 0.5;
    if (zipCode) score += 0.5;
    
    // Status affects score significantly
    if (status === 'Sale') score += 2;
    else if (status === 'Follow-up Later') score += 1;
    else if (status === 'Not Interested') score -= 2;
    else if (status === 'Wrong Number') score -= 1;
    
    // Having scheduled follow-up date increases score
    if (followUpDate) score += 1;
    
    // Detailed comments might indicate a more engaged lead
    if (comments && comments.length > 20) score += 0.5;
    
    // Cap the score between 0 and 10
    score = Math.max(0, Math.min(10, score));
    
    // Update the score with 1 decimal precision
    setCalculatedLeadScore(parseFloat(score.toFixed(1)));
    
    // Update the form field with the calculated score
    setValue('lead_score', parseFloat(score.toFixed(1)));
    
  }, [product, vehicleYear, carMake, carModel, zipCode, status, followUpDate, comments, setValue]);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (isOpen && callback) {
      // Format the date from string to Date object if it exists
      const formattedCallback = { 
        ...callback,
        follow_up_date: callback.follow_up_date ? new Date(callback.follow_up_date) : null,
      };
      
      // Reset form with the callback data
      reset(formattedCallback);
    }
  }, [isOpen, callback, reset]);

  const onSubmit = (data) => {
    // Format the date back to ISO string for the API
    const formattedData = {
      ...data,
      follow_up_date: data.follow_up_date ? format(new Date(data.follow_up_date), 'yyyy-MM-dd') : null,
      vehicle_year: data.vehicle_year ? parseInt(data.vehicle_year, 10) : null,
      lead_score: data.lead_score ? parseFloat(data.lead_score) : null,
      callback_number: formattedPhone || data.callback_number, // Use formatted phone number
      last_modified_by: 'Admin User', // In a real app, this would be the current user
    };
    
    onSave(formattedData);
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 border-b pb-3 flex items-center justify-between"
                >
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2 text-primary-600">
                      <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                    </svg>
                    {title || 'Callback Details'}
                  </span>
                  <span className="text-sm font-normal text-gray-500">Lead ID: {callback?.id || 'New'}</span>
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
                  {/* Progress bar showing form completeness */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500">Form Completion</span>
                      <span className="text-xs font-medium text-primary-600">
                        {calculatedLeadScore >= 7 ? 'Complete' : calculatedLeadScore >= 5 ? 'Partial' : 'Basic'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${(calculatedLeadScore/10) * 100}%` }}></div>
                    </div>
                  </div>
                  
                  {/* Section headers */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-primary-700 border-b border-primary-200 pb-1 mb-3">Customer Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Customer Info Section */}
                    <div>
                      <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        id="customer_name"
                        {...register('customer_name', { required: 'Customer name is required' })}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.customer_name ? 'border-red-500' : 'border-gray-300'
                        } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm`}
                      />
                      {errors.customer_name && (
                        <p className="mt-1 text-sm text-red-500">{errors.customer_name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="callback_number" className="block text-sm font-medium text-gray-700">
                        Callback Number *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="callback_number"
                          {...register('callback_number', { required: 'Callback number is required' })}
                          className={`mt-1 block w-full rounded-md border ${
                            errors.callback_number ? 'border-red-500' : 'border-gray-300'
                          } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm`}
                          onChange={(e) => {
                            // Let react-hook-form handle the value
                            const event = { ...e };
                            setValue('callback_number', e.target.value);
                          }}
                          placeholder="(XXX) XXX-XXXX"
                        />
                        {formattedPhone && formattedPhone !== callbackNumber && (
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-3 text-gray-400 text-xs">
                            Format: {formattedPhone}
                          </div>
                        )}
                      </div>
                      {errors.callback_number && (
                        <p className="mt-1 text-sm text-red-500">{errors.callback_number.message}</p>
                      )}
                    </div>
                    
                    {/* Vehicle Info Section Header */}
                    <div className="col-span-2 mt-6 mb-4">
                      <h4 className="text-sm font-medium text-primary-700 border-b border-primary-200 pb-1 mb-3">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                            <path d="M3.375 4.5C2.339 4.5 1.5 5.34 1.5 6.375V13.5h12V6.375c0-1.036-.84-1.875-1.875-1.875h-8.25zM13.5 15h-12v2.625c0 1.035.84 1.875 1.875 1.875h.375a3 3 0 116 0h3a.75.75 0 00.75-.75V15z" />
                            <path d="M8.25 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0zM15.75 6.75a.75.75 0 00-.75.75v11.25c0 .087.015.17.042.248a3 3 0 015.958.464c.853-.175 1.522-.935 1.464-1.883a18.659 18.659 0 00-3.732-10.104 1.837 1.837 0 00-1.47-.725H15.75z" />
                            <path d="M19.5 19.5a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z" />
                          </svg>
                          Vehicle Information
                        </span>
                      </h4>
                    </div>

                    <div>
                      <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                        Product
                      </label>
                      <input
                        type="text"
                        id="product"
                        {...register('product')}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="vehicle_year" className="block text-sm font-medium text-gray-700">
                        Vehicle Year
                      </label>
                      <input
                        type="number"
                        id="vehicle_year"
                        {...register('vehicle_year')}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="car_make" className="block text-sm font-medium text-gray-700">
                        Car Make
                      </label>
                      <input
                        type="text"
                        id="car_make"
                        {...register('car_make')}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="car_model" className="block text-sm font-medium text-gray-700">
                        Car Model
                      </label>
                      <input
                        type="text"
                        id="car_model"
                        {...register('car_model')}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        id="zip_code"
                        {...register('zip_code')}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                    
                    {/* Status Info Section Header */}
                    <div className="col-span-2 mt-6 mb-4">
                      <h4 className="text-sm font-medium text-primary-700 border-b border-primary-200 pb-1 mb-3">
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                            <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                          </svg>
                          Follow-up Details
                        </span>
                      </h4>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <div className="relative">
                        <select
                          id="status"
                          {...register('status')}
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm pl-8 p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm appearance-none"
                        >
                          {STATUS_OPTIONS.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none mt-1">
                          <span className={`inline-block w-4 h-4 rounded-full ${
                            status === 'Sale' ? 'bg-green-500' :
                            status === 'Pending' ? 'bg-yellow-500' :
                            status === 'Follow-up Later' ? 'bg-blue-500' :
                            status === 'Not Interested' ? 'bg-red-500' :
                            status === 'Wrong Number' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}></span>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="agent_name" className="block text-sm font-medium text-gray-700">
                        Agent Name
                      </label>
                      <select
                        id="agent_name"
                        {...register('agent_name')}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        {AGENTS.map((agent) => (
                          <option key={agent} value={agent}>
                            {agent}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="follow_up_date" className="block text-sm font-medium text-gray-700">
                        Follow-up Date
                      </label>
                      <DatePicker
                        selected={followUpDate ? new Date(followUpDate) : null}
                        onChange={(date) => setValue('follow_up_date', date)}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        dateFormat="yyyy-MM-dd"
                        placeholderText="Select date"
                      />
                    </div>

                    <div>
                      <label htmlFor="lead_score" className="block text-sm font-medium text-gray-700">
                        Lead Score (Auto-calculated)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          id="lead_score"
                          {...register('lead_score')}
                          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-gray-50"
                          readOnly
                        />
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 mr-3">
                          <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            calculatedLeadScore >= 8 ? 'bg-green-100 text-green-800' : 
                            calculatedLeadScore >= 5 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {calculatedLeadScore.toFixed(1)}
                          </div>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Score updates automatically based on lead quality</p>
                    </div>
                  </div>

                  {/* Comments field - full width */}
                  <div className="col-span-2 mt-6">
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-700 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 text-primary-600">
                        <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
                      </svg>
                      Comments
                    </label>
                    <div className="relative mt-1">
                      <textarea
                        id="comments"
                        {...register('comments')}
                        rows={4}
                        className="block w-full rounded-md border border-gray-300 shadow-sm p-3 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Add any relevant notes or feedback about this callback..."
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {comments?.length || 0} characters
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1 text-primary-400">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                      </svg>
                      {callback?.id ? 'Last modified: ' + new Date(callback.last_modified).toLocaleString() : 'New Callback'}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        Save Callback
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}