"use client";
import React, { useRef, useState } from "react";

export type AgentInfo = {
  name?: string;
  full_name?: string;
  email?: string;
  phone?: any;
  image?: string;
  avatar?: string;
  photo?: string;
};

type AgentAvatarProps = {
  agent: AgentInfo | string | number | null | undefined;
  size?: "sm" | "md";
  className?: string;
};

const formatPhone = (phone: any) => {
  if (!phone) return "";
  if (typeof phone === "string" || typeof phone === "number") return String(phone);
  if (typeof phone === "object") {
    const code = phone.code ? String(phone.code).trim() : "";
    const number = phone.number ? String(phone.number).trim() : "";
    if (code && number) return `${code} ${number}`;
    if (code) return code;
    if (number) return number;
  }
  return String(phone);
};

const getInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "A";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const normalizeAgent = (agent: AgentAvatarProps["agent"]) => {
  if (!agent) return null;
  if (typeof agent === "string" || typeof agent === "number") {
    return { name: String(agent), email: "", phone: "", image: "" };
  }
  if (typeof agent === "object") {
    return {
      name: agent.name || agent.full_name || "Agent",
      email: agent.email || "",
      phone: formatPhone(agent.phone) || "",
      image: agent.image || agent.avatar || agent.photo || "",
    };
  }
  return null;
};

export default function AgentAvatar({ agent, size = "md", className = "" }: AgentAvatarProps) {
  const info = normalizeAgent(agent);
  if (!info) return null;

  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const sizeClasses = size === "sm" ? "h-10 w-10 text-xs" : "h-12 w-12 text-sm";

  const clearCloseTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`rounded-full border bg-slate-100 overflow-hidden flex items-center justify-center font-semibold text-slate-700 ${sizeClasses}`}
        onMouseEnter={() => {
          clearCloseTimer();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
      >
        {info.image ? (
          <img src={info.image} alt={info.name} className="h-full w-full object-cover" />
        ) : (
          <span>{getInitials(info.name)}</span>
        )}
      </div>
      {open && (
        <div
          className="absolute right-0 top-12 z-20 w-60 rounded-lg border bg-white p-3 shadow-lg"
          onMouseEnter={() => {
            clearCloseTimer();
            setOpen(true);
          }}
          onMouseLeave={scheduleClose}
        >
          <div className="flex items-center gap-3">
            <div className={`rounded-full border bg-slate-100 overflow-hidden flex items-center justify-center font-semibold text-slate-700 ${sizeClasses}`}>
              {info.image ? (
                <img src={info.image} alt={info.name} className="h-full w-full object-cover" />
              ) : (
                <span>{getInitials(info.name)}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{info.name}</div>
              {info.email && <div className="text-xs text-muted-foreground truncate">{info.email}</div>}
              {info.phone && <div className="text-xs text-muted-foreground truncate">{info.phone}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
