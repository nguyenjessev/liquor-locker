import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Bottle } from "@/types/bottle";
import { format, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";

interface BottleEditModalProps {
	bottle: Bottle | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: (id: number) => void;
	onSave: (
		id: number,
		updates: {
			name: string;
			opened: boolean;
			open_date?: Date | null;
			purchase_date?: Date | null;
		},
	) => Promise<void>;
	loading?: boolean;
}

export function BottleEditModal({
	bottle,
	open,
	onOpenChange,
	onDelete,
	onSave,
	loading = false,
}: BottleEditModalProps) {
	const [editedName, setEditedName] = useState("");
	const [isOpened, setIsOpened] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
	const [openDate, setOpenDate] = useState<Date | null>(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [purchaseDateOpen, setPurchaseDateOpen] = useState(false);
	const [openDateOpen, setOpenDateOpen] = useState(false);

	useEffect(() => {
		if (open && bottle) {
			setEditedName(bottle.name);
			setIsOpened(bottle.opened);
			setPurchaseDate(bottle.purchase_date || null);
			setOpenDate(bottle.open_date || null);
			setHasChanges(false);
		}
	}, [open, bottle]);

	const handleSave = async () => {
		if (!bottle || !editedName.trim()) return;

		try {
			setIsSaving(true);
			await onSave(bottle.id, {
				name: editedName.trim(),
				opened: isOpened,
				open_date: isOpened ? openDate : null,
				purchase_date: purchaseDate,
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to save bottle:", error);
		} finally {
			setIsSaving(false);
		}
	};
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Bottle: {bottle?.name}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4 max-w-full">
					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
						<p className="font-medium">Name</p>
						<div className="sm:col-span-3">
							<Input
								className="w-full"
								value={editedName}
								onChange={(e) => {
									setEditedName(e.target.value);
									setHasChanges(true);
								}}
								disabled={loading || isSaving}
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
						<p className="font-medium">Purchase Date</p>
						<div className="sm:col-span-3 flex items-center gap-2">
							<div className="flex items-center gap-2 min-w-0 flex-1">
								<Popover
									open={purchaseDateOpen}
									onOpenChange={setPurchaseDateOpen}
								>
									<PopoverTrigger asChild className="min-w-0 flex-1">
										<Button
											variant="outline"
											className={`min-w-0 flex-1 justify-start text-left font-normal whitespace-nowrap overflow-hidden ${!purchaseDate && "text-muted-foreground"}`}
											disabled={loading || isSaving}
										>
											<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
											<span className="truncate">
												{purchaseDate
													? format(purchaseDate, "PPP")
													: "No date set"}
											</span>
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={
												purchaseDate ? startOfDay(purchaseDate) : undefined
											}
											onSelect={(date) => {
												setPurchaseDate(date ? startOfDay(date) : null);
												setHasChanges(true);
												setPurchaseDateOpen(false);
											}}
											autoFocus
										/>
									</PopoverContent>
								</Popover>
							</div>
							{purchaseDate && (
								<Button
									variant="ghost"
									size="icon"
									className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
									onClick={() => {
										setPurchaseDate(null);
										setHasChanges(true);
									}}
									disabled={loading || isSaving}
								>
									<X className="h-4 w-4" />
								</Button>
							)}
						</div>
					</div>
					{bottle && (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
								<p className="font-medium">Status</p>
								<button
									onClick={() => {
										const newOpenedState = !isOpened;
										setIsOpened(newOpenedState);
										if (newOpenedState) {
											setOpenDate(startOfDay(new Date()));
										} else {
											setOpenDate(null);
										}
										setHasChanges(true);
									}}
									disabled={loading || isSaving}
									className={`col-span-3 relative inline-flex h-9 w-[160px] items-center rounded-full border-2 border-border transition-colors duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
										isOpened ? "bg-secondary" : "bg-muted"
									}`}
									role="switch"
									aria-checked={isOpened}
								>
									{/* Sliding thumb with text */}
									<div
										className={`relative z-10 flex h-7 w-[72px] items-center justify-center rounded-full bg-background shadow-md transition-all duration-300 ease-in-out ${
											isOpened ? "translate-x-[80px]" : "translate-x-1"
										}`}
									>
										<span className="text-xs font-medium">
											{isOpened ? "Opened" : "Unopened"}
										</span>
									</div>

									{/* Background text */}
									<div className="absolute inset-0 flex items-center justify-between px-4">
										<span
											className={`text-xs font-medium transition-opacity duration-300 ${
												isOpened ? "opacity-50" : "opacity-0"
											}`}
										>
											Unopened
										</span>
										<span
											className={`text-xs font-medium transition-opacity duration-300 ${
												isOpened ? "opacity-0" : "opacity-50"
											}`}
										>
											Opened
										</span>
									</div>
									<span className="sr-only">
										{isOpened ? "Mark as unopened" : "Mark as opened"}
									</span>
								</button>
							</div>
							<div
								className="overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out"
								style={{
									maxHeight: isOpened ? "80px" : "0",
									marginTop: isOpened ? "1rem" : "0",
									opacity: isOpened ? 1 : 0,
								}}
							>
								<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
									<p className="font-medium">Open Date</p>
									<div className="sm:col-span-3 flex items-center gap-2">
										<div className="flex items-center gap-2 min-w-0 flex-1">
											<Popover
												open={openDateOpen}
												onOpenChange={setOpenDateOpen}
											>
												<PopoverTrigger asChild className="min-w-0 flex-1">
													<Button
														variant="outline"
														className={`min-w-0 flex-1 justify-start text-left font-normal whitespace-nowrap overflow-hidden ${!openDate && "text-muted-foreground"}`}
														disabled={loading || isSaving}
													>
														<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
														<span className="truncate">
															{openDate
																? format(openDate, "PPP")
																: "No date set"}
														</span>
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-auto p-0" align="start">
													<Calendar
														mode="single"
														selected={
															openDate ? startOfDay(openDate) : undefined
														}
														onSelect={(date) => {
															setOpenDate(date ? startOfDay(date) : null);
															setHasChanges(true);
															setOpenDateOpen(false);
														}}
														autoFocus
													/>
												</PopoverContent>
											</Popover>
										</div>
										{openDate && (
											<Button
												variant="ghost"
												size="icon"
												className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
												onClick={() => {
													setOpenDate(null);
													setHasChanges(true);
												}}
												disabled={loading || isSaving}
											>
												<X className="h-4 w-4" />
											</Button>
										)}
									</div>
								</div>
							</div>
						</>
					)}
				</div>
				{bottle && (
					<div className="mt-4 flex flex-wrap-reverse justify-end gap-2">
						<Button
							variant="ghost"
							onClick={() => {
								onDelete(bottle.id);
								onOpenChange(false);
							}}
							disabled={loading || isSaving}
							className="text-destructive hover:text-destructive hover:bg-destructive/10"
						>
							Delete Bottle
						</Button>
						<Button
							variant="default"
							onClick={handleSave}
							disabled={
								loading || isSaving || !editedName.trim() || !hasChanges
							}
						>
							{isSaving ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
