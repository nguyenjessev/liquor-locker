import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Bottle } from "@/types/bottle";
import { format, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
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
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		if (open && bottle) {
			setEditedName(bottle.name);
			setIsOpened(bottle.opened);
			setPurchaseDate(bottle.purchase_date || null);
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
				open_date: isOpened && !bottle.opened ? startOfDay(new Date()) : null,
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
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<p className="font-medium">Name</p>
						<div className="col-span-3">
							<Input
								value={editedName}
								onChange={(e) => {
									setEditedName(e.target.value);
									setHasChanges(true);
								}}
								disabled={loading || isSaving}
							/>
						</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<p className="font-medium">Purchase Date</p>
						<div className="col-span-3">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={`w-48 justify-start text-left font-normal ${!purchaseDate && "text-muted-foreground"}`}
										disabled={loading || isSaving}
									>
										<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
										{purchaseDate ? format(purchaseDate, "PPP") : "Pick a date"}
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
										}}
										autoFocus
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>
					{bottle && (
						<>
							<div className="grid grid-cols-4 items-center gap-4">
								<p className="font-medium">Status</p>
								<button
									onClick={() => {
										setIsOpened(!isOpened);
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
							{bottle.purchase_date && (
								<div className="grid grid-cols-4 items-center gap-4">
									<p className="font-medium">Purchased</p>
									<p className="col-span-3">
										{format(bottle.purchase_date, "PPP")}
									</p>
								</div>
							)}
							{bottle.opened && bottle.open_date && (
								<div className="grid grid-cols-4 items-center gap-4">
									<p className="font-medium">Opened</p>
									<p className="col-span-3">
										{format(bottle.open_date, "PPP")}
									</p>
								</div>
							)}
						</>
					)}
				</div>
				{bottle && (
					<div className="mt-4 flex justify-end gap-2">
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
