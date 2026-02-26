"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function ListingCreatePage() {
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [agent, setAgent] = useState("");
  const [description, setDescription] = useState("");
  const [views, setViews] = useState("");
  const [inquiries, setInquiries] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to create the listing
    alert(`Listing added: ${title}`);
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Add Listing</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/listings">Back</Link>
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
            <Button type="submit">Add Listing</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 