"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { mockListings } from '@/lib/mockData';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function ListingEditPage() {
  const params = useParams();
  const [listing, setListing] = useState<typeof mockListings[0] | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [agent, setAgent] = useState("");
  const [description, setDescription] = useState("");
  const [views, setViews] = useState("");
  const [inquiries, setInquiries] = useState("");

  useEffect(() => {
    const found = mockListings.find((l) => l.id === params.id);
    setListing(found);
    if (found) {
      setTitle(found.title);
      setAddress(found.address);
      setPrice(found.price);
      setStatus(found.status);
      setAgent(found.agent);
      setDescription(found.description || "");
      setViews(found.views?.toString() || "");
      setInquiries(found.inquiries?.toString() || "");
    }
    setLoading(false);
  }, [params.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to update the listing
    alert(`Listing updated: ${title}`);
  };

  if (loading) {
    return <div className="container mx-auto py-6 px-2 sm:px-4">Loading...</div>;
  }

  if (!listing) {
    return (
      <div className="container mx-auto py-6 px-2 sm:px-4 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Listing Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">The listing you are looking for does not exist.</div>
            <Button asChild variant="secondary" className="mt-4">
              <Link href="/admin/listings">Back to Listings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Edit Listing</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/admin/listings/${listing.id}`}>Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input id="status" value={status} onChange={e => setStatus(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="agent">Agent</Label>
              <Input id="agent" value={agent} onChange={e => setAgent(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <ReactQuill theme="snow" value={description} onChange={setDescription} className="bg-white" />
            </div>
            <div>
              <Label htmlFor="views">Views</Label>
              <Input id="views" value={views} onChange={e => setViews(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="inquiries">Inquiries</Label>
              <Input id="inquiries" value={inquiries} onChange={e => setInquiries(e.target.value)} />
            </div>
            <Button type="submit">Update Listing</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 