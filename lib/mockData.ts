// Consolidated mock data for IDX Dashboard

// Agents
export const mockAgents = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@idx.com",
    role: "Broker",
    status: "Active",
    lastActive: "2024-06-20 14:30",
    listings: 12,
    sales: 5,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@idx.com",
    role: "Agent",
    status: "Active",
    lastActive: "2024-06-20 15:15",
    listings: 8,
    sales: 3,
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike.wilson@idx.com",
    role: "Agent",
    status: "Inactive",
    lastActive: "2024-06-19 11:00",
    listings: 5,
    sales: 2,
  },
  {
    id: 4,
    name: "Sarah Brown",
    email: "sarah.brown@idx.com",
    role: "Broker",
    status: "Active",
    lastActive: "2024-06-20 16:45",
    listings: 10,
    sales: 4,
  },
];

// Listings
export const mockListings = [
  {
    id: "1",
    title: "Modern Apartment",
    address: "123 Main St, City",
    price: "$1,200,000",
    status: "Active",
    agent: "John Doe",
    views: 120,
    inquiries: 8,
    description: "A beautiful modern apartment in the heart of the city.",
  },
  {
    id: "2",
    title: "Cozy Cottage",
    address: "456 Oak Ave, Town",
    price: "$950,000",
    status: "Sold",
    agent: "Jane Smith",
    views: 98,
    inquiries: 5,
    description: "A cozy cottage with a lovely garden.",
  },
  {
    id: "3",
    title: "Luxury Villa",
    address: "789 Pine Rd, Suburb",
    price: "$2,500,000",
    status: "Active",
    agent: "Sarah Brown",
    views: 210,
    inquiries: 12,
    description: "A luxury villa with a pool and modern amenities.",
  },
];

// Properties (used in admin/properties pages)
export const mockProperties = [
  {
    id: "1",
    title: "Modern Apartment",
    address: "123 Main St, City",
    price: "$1,200,000",
    status: "Active",
    description: "A beautiful modern apartment in the heart of the city.",
  },
  {
    id: "2",
    title: "Cozy Cottage",
    address: "456 Oak Ave, Town",
    price: "$950,000",
    status: "Sold",
    description: "A cozy cottage with a lovely garden.",
  },
  {
    id: "3",
    title: "Luxury Villa",
    address: "789 Pine Rd, Suburb",
    price: "$2,500,000",
    status: "Active",
    description: "A luxury villa with a pool and modern amenities.",
  },
];

// Pages
export const mockPages = [
  {
    id: "1",
    title: "About Us",
    slug: "about-us",
    date: "2024-06-01",
    content: "<p>About us page content.</p>",
  },
  {
    id: "2",
    title: "FAQ",
    slug: "faq",
    date: "2024-06-02",
    content: "<p>FAQ page content.</p>",
  },
];

// Inquiries
export const mockInquiries = [
  {
    id: "1",
    name: "Sarah Lee",
    email: "sarah@example.com",
    message: "Interested in Modern Apartment",
    date: "2024-06-19",
    listingId: "1",
  },
  {
    id: "2",
    name: "Tom Brown",
    email: "tom@example.com",
    message: "Requesting a tour for Luxury Villa",
    date: "2024-06-18",
    listingId: "3",
  },
];

// Contact submissions
export const mockContacts = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    message: "Looking for a 3-bed in downtown.",
    date: "2024-06-15",
  },
  {
    id: "2",
    name: "Brian Lee",
    email: "brian@example.com",
    message: "Can I schedule a call about financing?",
    date: "2024-06-17",
  },
  {
    id: "3",
    name: "Carla Gomez",
    email: "carla@example.com",
    message: "Interested in the Luxury Villa listing.",
    date: "2024-06-20",
  },
];

// Dashboard Stats
export const stats = [
  {
    name: "Total Listings",
    value: "30",
    change: "+5.2%",
    changeType: "positive",
    icon: "HomeIcon",
  },
  {
    name: "New Listings This Month",
    value: "7",
    change: "+16.7%",
    changeType: "positive",
    icon: "DocumentTextIcon",
  },
  {
    name: "Properties Sold",
    value: "12",
    change: "+9.1%",
    changeType: "positive",
    icon: "CreditCardIcon",
  },
  {
    name: "Active Agents",
    value: "8",
    change: "+1",
    changeType: "positive",
    icon: "UsersIcon",
  },
];

export const recentActivity = [
  {
    id: 1,
    type: "listing",
    description: "New listing added: Modern Apartment",
    time: "5 minutes ago",
    agent: "John Doe",
    status: "Active",
  },
  {
    id: 2,
    type: "sale",
    description: "Property sold: Cozy Cottage",
    time: "15 minutes ago",
    agent: "Jane Smith",
    status: "Sold",
  },
  {
    id: 3,
    type: "inquiry",
    description: "New inquiry for Luxury Villa",
    time: "1 hour ago",
    agent: "Sarah Brown",
    status: "New",
  },
  {
    id: 4,
    type: "listing",
    description: "New listing added: Luxury Villa",
    time: "2 hours ago",
    agent: "Sarah Brown",
    status: "Active",
  },
];

// Analytics
export const metrics = [
  {
    name: "Total Listings",
    value: "30",
    change: "+5.2%",
    changeType: "positive",
    icon: "HomeIcon",
  },
  {
    name: "Total Inquiries",
    value: "23",
    change: "+8.7%",
    changeType: "positive",
    icon: "EnvelopeIcon",
  },
  {
    name: "Properties Sold",
    value: "12",
    change: "+9.1%",
    changeType: "positive",
    icon: "CreditCardIcon",
  },
  {
    name: "Active Agents",
    value: "8",
    change: "+1",
    changeType: "positive",
    icon: "UsersIcon",
  },
];
export const listingViews = [
  { title: "Modern Apartment", views: 120 },
  { title: "Cozy Cottage", views: 98 },
  { title: "Luxury Villa", views: 210 },
];
export const topAgents = [
  {
    name: "John Doe",
    listings: 12,
    sales: 5,
    inquiries: 10,
    calls: 15,
    rating: 4.8,
    satisfaction: 95,
  },
  {
    name: "Jane Smith",
    listings: 8,
    sales: 3,
    inquiries: 7,
    calls: 10,
    rating: 4.6,
    satisfaction: 90,
  },
  {
    name: "Sarah Brown",
    listings: 10,
    sales: 4,
    inquiries: 12,
    calls: 20,
    rating: 4.9,
    satisfaction: 98,
  },
];

// Invoices (unchanged for now)
export const invoices = [
  {
    id: "INV-1001",
    date: "2024-02-01",
    amount: 290000,
    status: "Paid",
    url: "#",
    items: [{ description: "Listing Fee", amount: 290000 }],
  },
  {
    id: "INV-1002",
    date: "2024-03-01",
    amount: 150000,
    status: "Pending",
    url: "#",
    items: [{ description: "Listing Fee", amount: 150000 }],
  },
  {
    id: "INV-1003",
    date: "2024-04-01",
    amount: 320000,
    status: "Overdue",
    url: "#",
    items: [{ description: "Listing Fee", amount: 320000 }],
  },
];

// Blog Posts
export const mockBlogs = [
  {
    id: "1",
    title: "First Blog Post",
    author: "Alice",
    date: "2024-06-01",
    category: "Market Trends",
    isFeatured: true,
    subtitle: "A look at the latest real estate trends",
    status: "Published",
    content: "This is the content of the first blog post.",
  },
  {
    id: "2",
    title: "Second Blog Post",
    author: "Bob",
    date: "2024-06-02",
    category: "Tips",
    isFeatured: false,
    subtitle: "How to prepare your home for sale",
    status: "Draft",
    content: "This is the content of the second blog post.",
  },
];

// Testimonials
export const mockTestimonials = [
  {
    id: "1",
    name: "Jane Smith",
    content: "Great service!",
    date: "2024-06-01",
  },
  {
    id: "2",
    name: "Mike Johnson",
    content: "Highly recommend.",
    date: "2024-06-02",
  },
];

// Users
export const mockUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@idx.com",
    role: "Admin",
    status: "Active",
    lastActive: "2024-06-20 14:30",
    callsHandled: 120,
    avgRating: 4.8,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@idx.com",
    role: "Supervisor",
    status: "Active",
    lastActive: "2024-06-20 15:15",
    callsHandled: 98,
    avgRating: 4.6,
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike.wilson@idx.com",
    role: "Agent",
    status: "Inactive",
    lastActive: "2024-06-19 11:00",
    callsHandled: 75,
    avgRating: 4.2,
  },
  {
    id: 4,
    name: "Sarah Brown",
    email: "sarah.brown@idx.com",
    role: "Agent",
    status: "Active",
    lastActive: "2024-06-20 16:45",
    callsHandled: 110,
    avgRating: 4.7,
  },
];
