"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	CalendarDaysIcon,
	ClockIcon,
	EyeIcon,
	HomeModernIcon,
	MagnifyingGlassIcon,
	MapPinIcon,
	PencilSquareIcon,
	PlusIcon,
	TrashIcon,
} from "@heroicons/react/24/outline";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOpenHouses } from "@/services/open-house/OpenHouseQueries";
import { deleteOpenHouse } from "@/services/open-house/OpenHouseServices";

interface OpenHouseLike {
	id: string;
	title?: string;
	name?: string;
	status?: string;
	event_date?: string;
	date?: string;
	start_time?: string;
	end_time?: string;
	time?: string;
	property?: {
		title?: string;
		name?: string;
		address?: string;
	};
	property_title?: string;
	property_name?: string;
	description?: string;
}

const formatDate = (dateValue?: string) => {
	if (!dateValue) return "";
	const date = new Date(dateValue);
	if (Number.isNaN(date.getTime())) return dateValue;
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

const formatTime = (timeValue?: string) => {
	if (!timeValue) return "";
	const [hour, minute] = timeValue.split(":");
	if (!hour || !minute) return timeValue;

	const hh = Number(hour);
	const suffix = hh >= 12 ? "PM" : "AM";
	const displayHour = hh % 12 || 12;
	return `${displayHour}:${minute.slice(0, 2)} ${suffix}`;
};

const getStatusClass = (status?: string) => {
	const normalized = String(status || "").toLowerCase();
	if (["active", "available"].includes(normalized)) {
		return "bg-emerald-50 text-emerald-600 border border-emerald-200";
	}
	if (["expired", "closed", "inactive"].includes(normalized)) {
		return "bg-amber-50 text-amber-600 border border-amber-200";
	}
	return "bg-slate-50 text-slate-600 border border-slate-200";
};

export default function OpenHousesListPage() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const [currentPage, setCurrentPage] = useState(1);
	const [keyword, setKeyword] = useState("");
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	const { data, isLoading, isError, error, isFetching } = useOpenHouses({
		page: currentPage,
		keyword,
	});

	const openHouses = useMemo(() => {
		if (Array.isArray((data as { data?: unknown[] })?.data)) {
			return (data as { data: OpenHouseLike[] }).data;
		}
		if (Array.isArray(data)) return data as OpenHouseLike[];
		return [] as OpenHouseLike[];
	}, [data]);

	const pagination =
		(data as { meta?: { [key: string]: number | string }; pagination?: { [key: string]: number | string } })?.meta ||
		(data as { meta?: { [key: string]: number | string }; pagination?: { [key: string]: number | string } })?.pagination ||
		null;

	const totalPages = Number(
		pagination?.last_page || pagination?.total_pages || 1
	);
	const currentPageNum = Number(pagination?.current_page || currentPage);
	const totalItems = Number(
		pagination?.total || pagination?.totalItems || openHouses.length
	);

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteOpenHouse(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["open-houses"] });
			setShowDeleteModal(false);
			setDeleteId(null);
		},
		onError: (mutationError: unknown) => {
			const message =
				mutationError instanceof Error
					? mutationError.message
					: "Failed to delete open house event.";
			alert(message);
		},
	});

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const renderPagination = () => {
		if (!pagination || totalPages <= 1) return null;

		const pages: number[] = [];
		const max = 5;
		let start = Math.max(1, currentPageNum - Math.floor(max / 2));
		let end = Math.min(totalPages, start + max - 1);
		if (end - start < max - 1) start = Math.max(1, end - max + 1);

		for (let page = start; page <= end; page += 1) {
			pages.push(page);
		}

		return (
			<div className="flex flex-col items-center gap-3 mt-8">
				<div className="flex items-center gap-1.5">
					<button
						onClick={() => handlePageChange(currentPageNum - 1)}
						disabled={currentPageNum === 1 || isLoading || isFetching}
						className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
					>
						Previous
					</button>

					{start > 1 && (
						<>
							<button
								onClick={() => handlePageChange(1)}
								className={`w-8 h-8 text-sm rounded-lg border transition ${
									currentPageNum === 1
										? "bg-emerald-500 text-white border-emerald-500"
										: "border-slate-200 text-slate-600 hover:bg-white"
								}`}
							>
								1
							</button>
							{start > 2 && <span className="px-1 text-slate-400">...</span>}
						</>
					)}

					{pages.map((page) => (
						<button
							key={page}
							onClick={() => handlePageChange(page)}
							disabled={isLoading || isFetching}
							className={`w-8 h-8 text-sm rounded-lg border transition ${
								page === currentPageNum
									? "bg-emerald-500 text-white border-emerald-500"
									: "border-slate-200 text-slate-600 hover:bg-white"
							}`}
						>
							{page}
						</button>
					))}

					{end < totalPages && (
						<>
							{end < totalPages - 1 && (
								<span className="px-1 text-slate-400">...</span>
							)}
							<button
								onClick={() => handlePageChange(totalPages)}
								className={`w-8 h-8 text-sm rounded-lg border transition ${
									currentPageNum === totalPages
										? "bg-emerald-500 text-white border-emerald-500"
										: "border-slate-200 text-slate-600 hover:bg-white"
								}`}
							>
								{totalPages}
							</button>
						</>
					)}

					<button
						onClick={() => handlePageChange(currentPageNum + 1)}
						disabled={currentPageNum === totalPages || isLoading || isFetching}
						className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
					>
						Next
					</button>
				</div>

				<p className="text-xs text-slate-400">
					Page {currentPageNum} of {totalPages}
					{totalItems ? ` (${totalItems} total)` : ""}
				</p>
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="px-6 lg:px-8 max-w-[1280px] mx-auto space-y-4">
				<div className="flex justify-between items-center mb-6">
					<Skeleton className="h-7 w-40" />
					<Skeleton className="h-9 w-40" />
				</div>
				{[...Array(4)].map((_, index) => (
					<Skeleton key={index} className="h-[100px] w-full rounded-2xl" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
				<p className="text-red-500">
					Error: {error instanceof Error ? error.message : "Unknown error"}
				</p>
			</div>
		);
	}

	return (
		<div className="px-6 lg:px-8 max-w-[1280px] mx-auto">
			<div className="flex flex-wrap items-center justify-between gap-3 mb-6">
				<h1 className="text-[22px] font-semibold text-slate-900">Open Houses</h1>
				<Link
					href="/admin/open-houses/create"
					className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
				>
					<PlusIcon className="w-4 h-4" />
					Create New Open House
				</Link>
			</div>

			<div className="mb-5 relative max-w-md">
				<MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
				<Input
					value={keyword}
					onChange={(event) => {
						setCurrentPage(1);
						setKeyword(event.target.value);
					}}
					placeholder="Search open houses..."
					className="pl-9"
				/>
			</div>

			<div className="space-y-3">
				{Array.isArray(openHouses) && openHouses.length > 0 ? (
					openHouses.map((openHouse) => {
						const eventName =
							openHouse.title || openHouse.name || `Open House ${openHouse.id}`;
						const dateValue = openHouse.event_date || openHouse.date || "";
						const timeFrom = openHouse.start_time || openHouse.time || "";
						const timeTo = openHouse.end_time || "";
						const propertyName =
							openHouse.property?.title ||
							openHouse.property?.name ||
							openHouse.property_title ||
							openHouse.property_name ||
							"Property details not linked";

						return (
							<div
								key={openHouse.id}
								className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-shadow flex overflow-hidden cursor-pointer"
								onClick={() => router.push(`/admin/open-houses/${openHouse.id}`)}
							>
								<div className="w-[120px] min-h-[100px] flex-shrink-0 hidden sm:flex items-center justify-center bg-emerald-50 text-emerald-700">
									<CalendarDaysIcon className="w-9 h-9 opacity-70" />
								</div>

								<div className="flex-1 min-w-0 px-5 py-4 flex flex-col justify-center">
									<span className="text-[15px] font-semibold text-slate-900 truncate">
										{eventName}
									</span>

									<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
										{dateValue && (
											<span className="flex items-center gap-1">
												<CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
												{formatDate(dateValue)}
											</span>
										)}
										{timeFrom && (
											<span className="flex items-center gap-1">
												<ClockIcon className="w-3.5 h-3.5 text-slate-400" />
												{formatTime(timeFrom)}
												{timeTo ? ` - ${formatTime(timeTo)}` : ""}
											</span>
										)}
										<span className="flex items-center gap-1">
											<MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
											<span className="truncate max-w-[260px]">{propertyName}</span>
										</span>
									</div>

									{openHouse.status && (
										<span
											className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium mt-2 w-fit ${getStatusClass(
												openHouse.status
											)}`}
										>
											{openHouse.status}
										</span>
									)}
								</div>

								<div
									className="flex items-center gap-2 pr-5 flex-shrink-0"
									onClick={(event) => event.stopPropagation()}
								>
									<Link
										href={`/admin/open-houses/${openHouse.id}`}
										className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
									>
										<EyeIcon className="w-4 h-4" />
										View
									</Link>
									<Link
										href={`/admin/open-houses/${openHouse.id}?mode=edit`}
										className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition"
										title="Edit"
									>
										<PencilSquareIcon className="w-4 h-4" />
									</Link>
									<button
										onClick={() => {
											setDeleteId(openHouse.id);
											setShowDeleteModal(true);
										}}
										className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-red-400 hover:text-red-600 hover:border-red-300 transition"
										title="Delete"
									>
										<TrashIcon className="w-4 h-4" />
									</button>
								</div>
							</div>
						);
					})
				) : (
					<div className="text-center py-16 text-slate-400">
						<HomeModernIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
						<p className="text-lg">No open house events found.</p>
					</div>
				)}
			</div>

			{renderPagination()}

			<Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Open House</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-slate-500">
						Are you sure you want to delete this open house event? This action
						cannot be undone.
					</p>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setShowDeleteModal(false)}
							disabled={deleteMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (deleteId) deleteMutation.mutate(deleteId);
							}}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
