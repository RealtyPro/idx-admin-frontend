'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Bars3Icon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Skeleton } from '@/components/ui/skeleton';
import axiosInstance from '@/services/Api';

const roles = ['Admin', 'Supervisor', 'Agent'];

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive?: string;
  callsHandled?: number;
  avgRating?: number;
  slotFrom?: string;
  slotTo?: string;
  crm_status?: string;
}

interface EditUserFormData {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  slotFrom?: string;
  slotTo?: string;
}

const defaultColumns = [
  { id: 'user', label: 'User' },
  { id: 'status', label: 'Status' },
  { id: 'actions', label: 'Actions' },
];

type DraggableThProps = {
  column: { id: string; label: string };
  index: number;
  listeners: any;
  attributes: any;
  isDragging: boolean;
  sortState: { column: string; direction: 'asc' | 'desc' } | null;
  onSort: (colId: string) => void;
  children?: React.ReactNode;
};

function DraggableTh({ column, index, listeners, attributes, isDragging, sortState, onSort, children }: DraggableThProps) {
  return (
    <th
      className={`px-4 py-3 text-left text-sm font-medium text-dark-secondary bg-white select-none whitespace-nowrap ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
      style={{ cursor: 'grab' }}
      scope="col"
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex items-center gap-1 group"
          onClick={() => onSort(column.id)}
          tabIndex={-1}
        >
          {column.label}
          {sortState?.column === column.id && (
            sortState.direction === 'asc' ? (
              <ChevronUpIcon className="w-4 h-4 text-primary" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-primary" />
            )
          )}
        </button>
      </div>
    </th>
  );
}

type SortableHeaderProps = {
  columns: { id: string; label: string }[];
  columnOrder: string[];
  setColumnOrder: (order: string[]) => void;
  sortState: { column: string; direction: 'asc' | 'desc' } | null;
  setSortState: React.Dispatch<React.SetStateAction<{ column: string; direction: 'asc' | 'desc' } | null>>;
};

function SortableHeader({ columns, columnOrder, setColumnOrder, sortState, setSortState }: SortableHeaderProps) {
  return (
    <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
      {columnOrder.map((colId, idx) => {
        const column = columns.find(c => c.id === colId);
        if (!column) return null;
        return <SortableTh key={colId} id={colId} column={column} index={idx} sortState={sortState} setSortState={setSortState} />;
      })}
    </SortableContext>
  );
}

type SortableThProps = {
  id: string;
  column: { id: string; label: string };
  index: number;
  sortState: { column: string; direction: 'asc' | 'desc' } | null;
  setSortState: React.Dispatch<React.SetStateAction<{ column: string; direction: 'asc' | 'desc' } | null>>;
};

function SortableTh({ id, column, index, sortState, setSortState }: SortableThProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    background: isDragging ? '#f3f4f6' : undefined,
  };
  return (
    <th
      ref={setNodeRef}
      style={style}
      className={`px-4 py-3 text-left text-sm font-medium text-dark-secondary bg-white select-none whitespace-nowrap ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
      scope="col"
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="flex items-center gap-1 group"
          onClick={() => {
            setSortState(prev => {
              if (prev && prev.column === column.id) {
                return { column: column.id, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
              }
              return { column: column.id, direction: 'asc' };
            });
          }}
          tabIndex={-1}
        >
          {column.label}
          {sortState?.column === column.id && (
            sortState.direction === 'asc' ? (
              <ChevronUpIcon className="w-4 h-4 text-primary" />
            ) : (
              <ChevronDownIcon className="w-4 h-4 text-primary" />
            )
          )}
        </button>
      </div>
    </th>
  );
}

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditUserFormData | null>(null);
  const [columnOrder, setColumnOrder] = useState(defaultColumns.map(c => c.id));
  const [sortState, setSortState] = useState<{ column: string; direction: 'asc' | 'desc' } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
     const response = await axiosInstance.get('v1/user/customer', {
        params: { page: currentPage }, // Add page parameter
      });
      
      const data = response.data;
      
      // Extract pagination metadata
      const pagination = data?.meta || data?.pagination || null;
      setTotalPages(pagination?.last_page || pagination?.total_pages || pagination?.totalPages || 1);
      setTotalItems(pagination?.total || pagination?.totalItems || 0);
      
      // Map API response to User interface
      // Adjust the mapping based on the actual API response structure
      const mappedUsers: User[] = Array.isArray(data) 
        ? data.map((user: any, index: number) => ({
            id: user.id || user.user_id || index + 1,
            name: user.name || user.full_name || user.username || `User ${index + 1}`,
            email: user.email || user.email_address || '',
            role: user.role || user.user_role || 'Agent',
            status: user.status || user.is_active ? 'Active' : 'Inactive',
            lastActive: user.last_active || user.last_login || user.updated_at || '',
            callsHandled: user.calls_handled || user.calls || 0,
            avgRating: user.avg_rating || user.rating || 0,
            crm_status: user.crm_status ?? "0",
          }))
        : (data.data || data.users || []).map((user: any, index: number) => ({
            id: user.id || user.user_id || index + 1,
            name: user.name || user.full_name || user.username || `User ${index + 1}`,
            email: user.email || user.email_address || '',
            role: user.role || user.user_role || 'Agent',
            status: user.status || user.is_active ? 'Active' : 'Inactive',
            lastActive: user.last_active || user.last_login || user.updated_at || '',
            callsHandled: user.calls_handled || user.calls || 0,
            avgRating: user.avg_rating || user.rating || 0,
            crm_status: user.crm_status ?? "0",
          }));
      
      setUsers(mappedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      // Don't redirect to login, just show error message
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch users';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Generate half-hour slots from 9:00 AM to 8:00 PM
  const slotOptions: string[] = [];
  for (let hour = 9; hour < 20; hour++) {
    slotOptions.push(
      `${hour < 10 ? '0' : ''}${hour}:00 ${hour < 12 ? 'AM' : hour === 12 ? 'PM' : 'PM'}`.replace('12:00 PM', '12:00 PM').replace('13:00 PM', '1:00 PM').replace('14:00 PM', '2:00 PM').replace('15:00 PM', '3:00 PM').replace('16:00 PM', '4:00 PM').replace('17:00 PM', '5:00 PM').replace('18:00 PM', '6:00 PM').replace('19:00 PM', '7:00 PM')
    );
    slotOptions.push(
      `${hour < 10 ? '0' : ''}${hour}:30 ${hour < 12 ? 'AM' : hour === 12 ? 'PM' : 'PM'}`.replace('12:30 PM', '12:30 PM').replace('13:30 PM', '1:30 PM').replace('14:30 PM', '2:30 PM').replace('15:30 PM', '3:30 PM').replace('16:30 PM', '4:30 PM').replace('17:30 PM', '5:30 PM').replace('18:30 PM', '6:30 PM').replace('19:30 PM', '7:30 PM')
    );
  }
  slotOptions.push('20:00 PM');

  const handleEditUser = (user: User) => {
    setEditingUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    setEditDialogOpen(true);
  };

  const handlePushToCRM = async (user: User) => {
    try {
      // Check if user is authenticated
      const token = sessionStorage.getItem('access_token');
      if (!token) {
        alert('Please login to sync customers to CRM');
        // Optionally redirect to login page
        // window.location.href = '/login';
        return;
      }

      console.log('Pushing to CRM:', user);
      const response = await axiosInstance.get(`/user/sync-customer-to-crm`, {
        params: {
          customer_id: user.id
        }
      });
      console.log('CRM sync response:', response.data);
      
      // Show success message
      if (response.data.message) {
        alert(response.data.message);
      } else {
        alert('Customer successfully synced to CRM');
      }
      
      // Reload customer list after successful sync
      await fetchUsers();
    } catch (error: any) {
      console.error('Error pushing to CRM:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        // Optionally clear token and redirect to login
        // sessionStorage.removeItem('access_token');
        // window.location.href = '/login';
      } else if (error.response?.data?.message) {
        alert(`Failed to sync: ${error.response.data.message}`);
      } else {
        alert('Failed to sync customer to CRM. Please try again.');
      }
    }
  };

  const handleSaveUser = () => {
    if (editingUser) {
      // Here you would typically make an API call to update the user
      console.log('Saving user:', editingUser);
      setEditDialogOpen(false);
      setEditingUser(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    const currentPageNum = currentPage;
    let startPage = Math.max(1, currentPageNum - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 pb-4 sm:pb-6">
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            onClick={() => handlePageChange(currentPageNum - 1)}
            disabled={currentPageNum === 1 || loading}
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>
          
          {startPage > 1 && (
            <>
              <Button
                variant={1 === currentPageNum ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 sm:w-auto sm:px-3 text-xs sm:text-sm p-0 sm:p-2"
                onClick={() => handlePageChange(1)}
                disabled={loading}
              >
                1
              </Button>
              {startPage > 2 && <span className="px-1 sm:px-2 text-muted-foreground text-xs">...</span>}
            </>
          )}
          
          {pages.map((page) => (
            <Button
              key={page}
              variant={page === currentPageNum ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 sm:w-auto sm:px-3 text-xs sm:text-sm p-0 sm:p-2"
              onClick={() => handlePageChange(page)}
              disabled={loading}
            >
              {page}
            </Button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-1 sm:px-2 text-muted-foreground text-xs">...</span>}
              <Button
                variant={totalPages === currentPageNum ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 sm:w-auto sm:px-3 text-xs sm:text-sm p-0 sm:p-2"
                onClick={() => handlePageChange(totalPages)}
                disabled={loading}
              >
                {totalPages}
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            onClick={() => handlePageChange(currentPageNum + 1)}
            disabled={currentPageNum === totalPages || loading}
          >
            Next
          </Button>
        </div>
        
        <div className="text-xs sm:text-sm text-muted-foreground text-center px-2">
          Page {currentPageNum} of {totalPages} 
          <span className="hidden sm:inline"> ({totalItems} total users)</span>
        </div>
      </div>
    );
  };

  let filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Sort users
  if (sortState) {
    filteredUsers = [...filteredUsers].sort((a, b) => {
      const aRecord = a as Record<string, any>;
      const bRecord = b as Record<string, any>;
      const aVal = aRecord[sortState.column];
      const bVal = bRecord[sortState.column];
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortState.direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }

  if (loading) {
    return (
      <div className="container mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="w-full sm:w-auto">
            <Skeleton className="h-6 sm:h-8 w-32 sm:w-40 mb-2" />
            <Skeleton className="h-4 sm:h-5 w-48 sm:w-64" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-full sm:w-32 rounded" />
        </div>
        <Skeleton className="h-16 sm:h-20 w-full rounded-xl mb-3 sm:mb-4" />
        <Skeleton className="h-64 sm:h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-dark">Users</h1>
            <p className="text-xs sm:text-sm text-dark-secondary mt-1">Manage system users and their roles</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center py-6 sm:py-8">
              <p className="text-red-600 mb-3 sm:mb-4 text-sm sm:text-base px-2">Error: {error}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-3 sm:py-6 px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif text-dark">Users</h1>
          <p className="text-xs sm:text-sm text-dark-secondary mt-1">Manage system users and their roles</p>
        </div>
      </div>

      {/* Search and Filter Bar */}

      {/* Users Table - Desktop View */}
      <Card className="hidden md:block">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={event => {
            const { active, over } = event;
            if (over && String(active.id) !== String(over.id)) {
              const oldIndex = columnOrder.indexOf(String(active.id));
              const newIndex = columnOrder.indexOf(String(over.id));
              setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
            }
          }}
        >
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <SortableHeader
                      columns={defaultColumns}
                      columnOrder={columnOrder}
                      setColumnOrder={setColumnOrder}
                      sortState={sortState}
                      setSortState={setSortState}
                    />
                  </tr>
                </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    {columnOrder.map((colId) => {
                      switch (colId) {
                        case 'user':
                          return (
                            <td key="user" className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-primary font-medium text-sm">
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-sm truncate">{user.name}</div>
                                  <div className="text-sm text-gray-500 truncate">{user.email}</div>
                                </div>
                              </div>
                            </td>
                          );
                        case 'role':
                          return (
                            <td key="role" className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                                  user.role === 'Supervisor' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'}`}>
                                {user.role}
                              </span>
                            </td>
                          );
                        case 'status':
                          return (
                            <td key="status" className="px-4 py-3">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {user.status}
                              </span>
                            </td>
                          );
                        case 'lastActive':
                          return <td key="lastActive" className="px-4 py-3 text-sm text-gray-500">{user.lastActive}</td>;
                        case 'callsHandled':
                          return <td key="callsHandled" className="px-4 py-3 text-sm">{user.callsHandled}</td>;
                        case 'avgRating':
                          return (
                            <td key="avgRating" className="px-4 py-3">
                              <div className="flex items-center">
                                <span className="text-sm mr-2">{user.avgRating || 0}</span>
                                <div className="flex gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < Math.floor(user.avgRating || 0) ? 'text-yellow-400' : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </td>
                          );
                        case 'actions':
                          return (
                            <td key="actions" className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 px-3 text-xs whitespace-nowrap"
                                  onClick={() => handlePushToCRM(user)}
                                  disabled={user.crm_status !== "0"}
                                >
                                  {user.crm_status === "0" ? 'Push to CRM' : 'Already in CRM'}
                                </Button>
                                {/* <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button> */}
                              </div>
                            </td>
                          );
                        default:
                          return null;
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </DndContext>
      </Card>

      {/* Users Cards - Mobile View */}
      <div className="md:hidden space-y-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-sm truncate">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0
                  ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user.status}
                </span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-8"
                  onClick={() => handlePushToCRM(user)}
                  disabled={user.crm_status !== "0"}
                >
                  {user.crm_status === "0" ? 'Push to CRM' : 'Already in CRM'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {renderPagination()}

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit User</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Make changes to user details and permissions. Click save when done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-3 sm:py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm">Full Name</Label>
              <Input
                id="name"
                className="text-sm"
                value={editingUser?.name || ''}
                onChange={(e) =>
                  setEditingUser(prev =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                className="text-sm"
                value={editingUser?.email || ''}
                onChange={(e) =>
                  setEditingUser(prev =>
                    prev ? { ...prev, email: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role" className="text-sm">Role</Label>
              <Select
                value={editingUser?.role || ''}
                onValueChange={(value: string) =>
                  setEditingUser(prev =>
                    prev ? { ...prev, role: value } : null
                  )
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role} className="text-sm">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status" className="text-sm">Status</Label>
              <Select
                value={editingUser?.status || ''}
                onValueChange={(value: string) =>
                  setEditingUser(prev =>
                    prev ? { ...prev, status: value } : null
                  )
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active" className="text-sm">Active</SelectItem>
                  <SelectItem value="Inactive" className="text-sm">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slot" className="text-sm">Book a Slot Range</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-2 max-h-60 overflow-y-auto p-1">
                {slotOptions.map((slot, idx) => {
                  const fromIdx = editingUser?.slotFrom ? slotOptions.indexOf(editingUser.slotFrom) : -1;
                  const toIdx = editingUser?.slotTo ? slotOptions.indexOf(editingUser.slotTo) : -1;
                  const isSelected = fromIdx !== -1 && toIdx !== -1 && idx >= fromIdx && idx <= toIdx;
                  const isFrom = fromIdx === idx;
                  const isTo = toIdx === idx;
                  return (
                    <button
                      key={slot}
                      type="button"
                      className={`rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1
                        ${isSelected ? 'bg-primary/80 text-white border-primary' : 'bg-white text-dark border-gray-200 hover:border-primary'}
                        ${isFrom ? 'ring-2 ring-green-400' : ''}
                        ${isTo ? 'ring-2 ring-blue-400' : ''}`}
                      onClick={() => {
                        setEditingUser(prev => {
                          if (!prev) return null;
                          // If no from, set from
                          if (!prev.slotFrom || (prev.slotFrom && prev.slotTo)) {
                            return { ...prev, slotFrom: slot, slotTo: undefined };
                          }
                          // If from is set, set to if valid
                          const fromIdx = slotOptions.indexOf(prev.slotFrom);
                          const clickedIdx = idx;
                          if (clickedIdx > fromIdx) {
                            return { ...prev, slotTo: slot };
                          } else {
                            // Reset if clicked before from
                            return { ...prev, slotFrom: slot, slotTo: undefined };
                          }
                        });
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 mt-1 px-1">
                {editingUser?.slotFrom && editingUser?.slotTo
                  ? `Selected: ${editingUser.slotFrom} to ${editingUser.slotTo}`
                  : editingUser?.slotFrom
                  ? `Select an end slot for the range.`
                  : 'Select a start slot.'}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
              className="w-full sm:w-auto text-sm"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveUser}
              className="w-full sm:w-auto text-sm"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 