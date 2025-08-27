import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
			price?: number | null;
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
	const [price, setPrice] = useState<string>("");

	useEffect(() => {
		if (open && bottle) {
			setEditedName(bottle.name);
			setIsOpened(bottle.opened);
			setPurchaseDate(bottle.purchase_date || null);
			setOpenDate(bottle.open_date || null);
			setPrice(bottle.price?.toFixed(2) || "");
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
				price: parseFloat(price) || null,
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
			<DialogContent className="sm:max-w-[540px]">
				<DialogHeader>
					<DialogTitle>Edit Bottle: {bottle?.name}</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col gap-4">
					{/* Name */}
					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
						<Label htmlFor="name-input" className="font-medium">
							Name
						</Label>
						<Input
							className="w-full sm:col-span-3"
							value={editedName}
							onChange={(e) => {
								setEditedName(e.target.value);
								setHasChanges(true);
							}}
							disabled={loading || isSaving}
							id="name-input"
						/>
					</div>

					{/* Purchase date */}
					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
						<Label htmlFor="purchase-date-input" className="font-medium">
							Purchase Date
						</Label>
						<div className="sm:col-span-3 flex items-center gap-2">
							<Popover
								open={purchaseDateOpen}
								onOpenChange={setPurchaseDateOpen}
							>
								<PopoverTrigger asChild className="min-w-0 flex-1">
									<Button
										variant="outline"
										className={`justify-start overflow-hidden ${!purchaseDate && "text-muted-foreground"}`}
										disabled={loading || isSaving}
										id="purchase-date-input"
									>
										<CalendarIcon />
										<span className="truncate">
											{purchaseDate ? format(purchaseDate, "PPP") : "No date"}
										</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className="w-auto p-0 pointer-events-auto"
									align="start"
								>
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
										weekStart={localStorage.getItem("weekStart") || "0"}
										autoFocus
									/>
								</PopoverContent>
							</Popover>
							{purchaseDate && (
								<Button
									variant="ghost"
									size="icon"
									className="text-muted-foreground hover:text-destructive"
									onClick={() => {
										setPurchaseDate(null);
										setHasChanges(true);
									}}
									disabled={loading || isSaving}
								>
									<X />
								</Button>
							)}
						</div>
					</div>

					{/* Price */}
					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
						<Label htmlFor="price-input" className="font-medium">
							Price
						</Label>
						<div className="relative sm:col-span-3">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
								$
							</span>
							<Input
								type="text"
								className="pl-6 max-w-full"
								value={price}
								onChange={(e) => {
									const value = e.target.value;
									if (value === "" || /^\d*\.?\d*$/.test(value)) {
										setPrice(value);
									}
									setHasChanges(true);
								}}
								disabled={loading || isSaving}
								placeholder="0.00"
								id="price-input"
							/>
						</div>
					</div>

					{/* Status */}
					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
						<Label htmlFor="status-input" className="font-medium">
							Status
						</Label>
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
							className={`col-span-3 relative h-9 w-45 items-center rounded-full border-1 border-border transition-colors duration-100 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
								isOpened ? "bg-secondary" : "bg-muted"
							}`}
							role="switch"
							aria-checked={isOpened}
							id="status-input"
						>
							{/* Sliding thumb with text */}
							<div
								className={`grid place-items-center h-full w-1/2 rounded-full bg-background shadow-md transition-all duration-100 ease-in-out ${
									isOpened ? "translate-x-[100%]" : "translate-x-0"
								}`}
							>
								<span className="text-xs">
									{isOpened ? "Opened" : "Unopened"}
								</span>
							</div>

							{/* Background text */}
							<div className="absolute inset-0 flex items-center justify-between px-4">
								<span
									className={`text-xs transition-opacity duration-100 ${
										isOpened ? "opacity-50" : "opacity-0"
									}`}
								>
									Unopened
								</span>
								<span
									className={`text-xs transition-opacity duration-100 ${
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

					{/* Open date */}
					<div
						className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4 overflow-hidden transition-[max-height,opacity] duration-100 ease-in-out"
						style={{
							maxHeight: isOpened ? "1000px" : "0",
							opacity: isOpened ? 1 : 0,
						}}
					>
						<Label htmlFor="open-date-input" className="font-medium">
							Open Date
						</Label>
						<div className="sm:col-span-3 flex items-center gap-2">
							<div className="flex items-center gap-2 min-w-0 flex-1">
								<Popover open={openDateOpen} onOpenChange={setOpenDateOpen}>
									<PopoverTrigger asChild className="min-w-0 flex-1">
										<Button
											variant="outline"
											className={`justify-start overflow-hidden ${!openDate && "text-muted-foreground"}`}
											disabled={loading || isSaving}
										>
											<CalendarIcon />
											<span className="truncate">
												{openDate ? format(openDate, "PPP") : "No date"}
											</span>
										</Button>
									</PopoverTrigger>
									<PopoverContent
										className="w-auto p-0 pointer-events-auto"
										align="start"
									>
										<Calendar
											mode="single"
											selected={openDate ? startOfDay(openDate) : undefined}
											onSelect={(date) => {
												setOpenDate(date ? startOfDay(date) : null);
												setHasChanges(true);
												setOpenDateOpen(false);
											}}
											weekStart={localStorage.getItem("weekStart") || "0"}
											autoFocus
										/>
									</PopoverContent>
								</Popover>
								{openDate && (
									<Button
										variant="ghost"
										size="icon"
										className="text-muted-foreground hover:text-destructive"
										onClick={() => {
											setOpenDate(null);
											setHasChanges(true);
										}}
										disabled={loading || isSaving}
									>
										<X />
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Control buttons */}
				{bottle && (
					<div className="flex flex-wrap-reverse justify-end gap-2">
						{/* Delete button */}
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

						{/* Save button */}
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
