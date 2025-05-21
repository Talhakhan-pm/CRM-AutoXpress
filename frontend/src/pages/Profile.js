import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get the form state from react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });

  // Handle profile update
  const onSubmit = async (data) => {
    setServerError('');
    setSuccessMessage('');
    setIsLoading(true);
    
    try {
      const result = await updateProfile(data);
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully');
      } else {
        setServerError(result.error);
      }
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                User Profile
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Update your personal information
              </p>
            </div>
            
            {serverError && (
              <div className="rounded-md bg-red-50 p-4 mx-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{serverError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="rounded-md bg-green-50 p-4 mx-6">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{successMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200">
              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="username"
                        autoComplete="username"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.username ? 'border-red-300' : ''
                        }`}
                        {...register('username', {
                          required: 'Username is required',
                          minLength: {
                            value: 3,
                            message: 'Username must be at least 3 characters',
                          },
                        })}
                      />
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.email ? 'border-red-300' : ''
                        }`}
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      New Password (Leave blank to keep current)
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                          errors.password ? 'border-red-300' : ''
                        }`}
                        {...register('password', {
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters',
                          },
                        })}
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;