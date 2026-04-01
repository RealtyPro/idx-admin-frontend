"use client";
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  PlusIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const [profileImage, setProfileImage] = useState("/placeholder-avatar.jpg");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const labelCls = "block text-xs font-medium text-slate-700 mb-1.5";
  const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition placeholder:text-slate-400";
  const selectCls = "w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition";

  if (loading) {
    return (
      <div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white rounded-xl border border-slate-100 p-1 h-auto flex flex-wrap gap-1">
          <TabsTrigger value="profile" className="rounded-lg text-xs font-medium data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 px-3 py-2"><UserCircleIcon className="w-4 h-4 mr-1.5 inline" />Profile</TabsTrigger>
          <TabsTrigger value="account" className="rounded-lg text-xs font-medium data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 px-3 py-2"><Cog6ToothIcon className="w-4 h-4 mr-1.5 inline" />Account</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg text-xs font-medium data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 px-3 py-2"><BellIcon className="w-4 h-4 mr-1.5 inline" />Notifications</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg text-xs font-medium data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 px-3 py-2"><ShieldCheckIcon className="w-4 h-4 mr-1.5 inline" />Security</TabsTrigger>
          <TabsTrigger value="team" className="rounded-lg text-xs font-medium data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 px-3 py-2"><UserGroupIcon className="w-4 h-4 mr-1.5 inline" />Team</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Profile Settings</h3>
            <p className="text-xs text-slate-500 mb-6">Update your profile information and how others see you</p>
            <div className="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
              <div className="relative w-20 h-20">
                <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-slate-100" onError={e => { const img = e.target as HTMLImageElement; if (!img.src.endsWith("/images/nopic.jpg")) img.src = "/images/nopic.jpg"; }} />
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white"><PhotoIcon className="w-3.5 h-3.5" /></button>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Profile Picture</p>
                <p className="text-xs text-slate-500">Upload a new profile picture</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div><label className={labelCls}>Full Name</label><input className={inputCls} placeholder="Enter your full name" /></div>
              <div><label className={labelCls}>Job Title</label><input className={inputCls} placeholder="Enter your job title" /></div>
              <div className="md:col-span-2"><label className={labelCls}>Bio</label><textarea className={`${inputCls} min-h-[100px]`} placeholder="Write a short bio about yourself" /></div>
            </div>
            <div className="flex justify-end mt-6"><button className="px-5 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Save Changes</button></div>
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Account Settings</h3>
            <p className="text-xs text-slate-500 mb-6">Manage your account preferences</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div><label className={labelCls}>Email Address</label><input className={inputCls} type="email" placeholder="Enter your email" /></div>
              <div><label className={labelCls}>Timezone</label><select className={selectCls}><option>Pacific Time (PT)</option><option>Mountain Time (MT)</option><option>Central Time (CT)</option><option>Eastern Time (ET)</option></select></div>
              <div><label className={labelCls}>Language</label><select className={selectCls}><option>English (US)</option><option>Spanish</option><option>French</option><option>German</option></select></div>
            </div>
            <div className="flex justify-end mt-6"><button className="px-5 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Save Changes</button></div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Notification Preferences</h3>
            <p className="text-xs text-slate-500 mb-6">Choose how you want to be notified</p>
            <div className="space-y-5">
              {[
                { title: "Email Notifications", desc: "Receive email notifications about your activity" },
                { title: "Push Notifications", desc: "Receive push notifications about your activity" },
                { title: "Weekly Digest", desc: "Receive a weekly summary of your activity" },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                  <div><p className="text-sm font-medium text-slate-900">{item.title}</p><p className="text-xs text-slate-500 mt-0.5">{item.desc}</p></div>
                  <Switch />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Security Settings</h3>
            <p className="text-xs text-slate-500 mb-6">Manage your security preferences</p>
            <div className="flex items-center justify-between py-3 mb-6 border-b border-slate-100">
              <div><p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p><p className="text-xs text-slate-500 mt-0.5">Add an extra layer of security to your account</p></div>
              <Switch />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="md:col-span-2"><label className={labelCls}>Current Password</label><input className={inputCls} type="password" placeholder="Enter current password" /></div>
              <div><label className={labelCls}>New Password</label><input className={inputCls} type="password" placeholder="Enter new password" /></div>
              <div><label className={labelCls}>Confirm New Password</label><input className={inputCls} type="password" placeholder="Confirm new password" /></div>
            </div>
            <div className="flex justify-end mt-6"><button className="px-5 py-2.5 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Update Password</button></div>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 lg:p-8">
            <div className="flex items-center justify-between mb-6">
              <div><h3 className="text-sm font-semibold text-slate-900">Team Management</h3><p className="text-xs text-slate-500 mt-0.5">Manage your team members and their roles</p></div>
              <button onClick={() => setInviteDialogOpen(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"><PlusIcon className="w-4 h-4" /> Invite Member</button>
            </div>
            <div className="bg-slate-50/50 rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-700">JD</div>
                  <div><p className="text-sm font-medium text-slate-900">John Doe</p><p className="text-xs text-slate-500">john@example.com</p></div>
                </div>
                <select className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition">
                  <option>Admin</option><option>Member</option><option>Viewer</option>
                </select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Invite Member</DialogTitle><DialogDescription className="text-xs text-slate-500">Enter the email and select a role to invite a new team member.</DialogDescription></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><label className={labelCls}>Email</label><input className={inputCls} type="email" placeholder="user@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} /></div>
            <div><label className={labelCls}>Role</label><select className={selectCls} value={inviteRole} onChange={e => setInviteRole(e.target.value)}><option value="Admin">Admin</option><option value="Member">Member</option><option value="Viewer">Viewer</option></select></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => { setInviteDialogOpen(false); setInviteEmail(""); setInviteRole("Member"); }} className="bg-emerald-500 hover:bg-emerald-600 text-white">Send Invite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}