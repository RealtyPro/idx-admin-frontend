"use client";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from 'react';

export default function ContactCreatePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to create the contact
    alert(`Contact added: ${name}`);
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4 space-y-6 max-w-xl">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Add Contact</CardTitle>
          <Button asChild variant="secondary" size="sm">
            <Link href="/admin/contact-us">Back</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <textarea id="message" className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm" value={message} onChange={e => setMessage(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            </div>
            <Button type="submit">Add Contact</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 