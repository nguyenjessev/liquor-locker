import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Fresh } from "@/types/fresh";
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

interface FreshEditModalProps {
	fresh: Fresh | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: (id: number) => void;
	onSave: (
		id: number,
		updates: {
			name: string;
			prepared_date?: Date | null;
			purchase_date?: Date | null;
			price?: number | null;
		},
	) => Promise<void>;
	loading?: boolean;
}

export function FreshEditModal({
	fresh,
	open,
	onOpenChange,
	onDelete,
	onSave,
	loading = false,
}: FreshEditModalProps) {
	const [editedName, setEditedName] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
	const [preparedDate, setPreparedDate] = useState<Date | null>(null);
	const [hasChanges, setHasChanges] = useState(false);
	const [purchaseDateOpen, setPurchaseDateOpen] = useState(false);
	const [preparedDateOpen, setPreparedDateOpen] = useState(false);
	const [price, setPrice] = useState<string>("");

	useEffect(() => {
		if (open && fresh) {
			setEditedName(fresh.name);
			setPurchaseDate(fresh.purchase_date || null);
			setPreparedDate(fresh.prepared_date || null);
			setPrice(fresh.price?.toFixed(2) || "");
			setHasChanges(false);
		}
	}, [open, fresh]);

	const handleSave = async () => {
		if (!fresh || !editedName.trim()) return;

		try {
			setIsSaving(true);
			await onSave(fresh.id, {
				name: editedName.trim(),
				prepared_date: preparedDate,
				purchase_date: purchaseDate,
				price: parseFloat(price) || null,
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to save ingredient:", error);
		} finally {
			setIsSaving(false);
		}
	};
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[540px]">
				<DialogHeader>
					<DialogTitle>Edit Ingredient: {fresh?.name}</DialogTitle>
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

					{/* Prepared date */}
					<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
						<Label htmlFor="prepared-date-input" className="font-medium">
							Prepared Date
						</Label>
						<div className="sm:col-span-3 flex items-center gap-2">
							<div className="flex items-center gap-2 min-w-0 flex-1">
								<Popover
									open={preparedDateOpen}
									onOpenChange={setPreparedDateOpen}
								>
									<PopoverTrigger asChild className="min-w-0 flex-1">
										<Button
											variant="outline"
											className={`justify-start overflow-hidden ${!preparedDate && "text-muted-foreground"}`}
											disabled={loading || isSaving}
										>
											<CalendarIcon />
											<span className="truncate">
												{preparedDate ? format(preparedDate, "PPP") : "No date"}
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
												preparedDate ? startOfDay(preparedDate) : undefined
											}
											onSelect={(date) => {
												setPreparedDate(date ? startOfDay(date) : null);
												setHasChanges(true);
												setPreparedDateOpen(false);
											}}
											weekStart={localStorage.getItem("weekStart") || "0"}
											autoFocus
										/>
									</PopoverContent>
								</Popover>
								{preparedDate && (
									<Button
										variant="ghost"
										size="icon"
										className="text-muted-foreground hover:text-destructive"
										onClick={() => {
											setPreparedDate(null);
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
				{fresh && (
					<div className="flex flex-wrap-reverse justify-end gap-2">
						{/* Delete button */}
						<Button
							variant="ghost"
							onClick={() => {
								onDelete(fresh.id);
								onOpenChange(false);
							}}
							disabled={loading || isSaving}
							className="text-destructive hover:text-destructive hover:bg-destructive/10"
						>
							Delete Ingredient
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
