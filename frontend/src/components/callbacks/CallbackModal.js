import React from 'react';
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

  // Watch follow_up_date for the DatePicker component
  const followUpDate = watch('follow_up_date');

  // Reset form when modal opens with new data
  React.useEffect(() => {
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
                  className="text-lg font-medium leading-6 text-gray-900 border-b pb-3"
                >
                  {title || 'Callback Details'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
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
                      <input
                        type="text"
                        id="callback_number"
                        {...register('callback_number', { required: 'Callback number is required' })}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.callback_number ? 'border-red-500' : 'border-gray-300'
                        } shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm`}
                      />
                      {errors.callback_number && (
                        <p className="mt-1 text-sm text-red-500">{errors.callback_number.message}</p>
                      )}
                    </div>

                    {/* Vehicle Info Section */}
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

                    {/* Status Info Section */}
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        id="status"
                        {...register('status')}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
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
                        Lead Score
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        id="lead_score"
                        {...register('lead_score')}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Comments field - full width */}
                  <div className="mt-4">
                    <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                      Comments
                    </label>
                    <textarea
                      id="comments"
                      {...register('comments')}
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      Save
                    </button>
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