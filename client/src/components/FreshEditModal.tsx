import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

	useEffect(() => {
		if (open && fresh) {
			setEditedName(fresh.name);
			setPurchaseDate(fresh.purchase_date || null);
			setPreparedDate(fresh.prepared_date || null);
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
					<DialogTitle>Edit Bottle: {fresh?.name}</DialogTitle>
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
					{fresh && (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
								<p className="font-medium">Open Date</p>
								<div className="sm:col-span-3 flex items-center gap-2">
									<div className="flex items-center gap-2 min-w-0 flex-1">
										<Popover
											open={preparedDateOpen}
											onOpenChange={setPreparedDateOpen}
										>
											<PopoverTrigger asChild className="min-w-0 flex-1">
												<Button
													variant="outline"
													className={`min-w-0 flex-1 justify-start text-left font-normal whitespace-nowrap overflow-hidden ${!preparedDate && "text-muted-foreground"}`}
													disabled={loading || isSaving}
												>
													<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
													<span className="truncate">
														{preparedDate
															? format(preparedDate, "PPP")
															: "No date set"}
													</span>
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
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
													autoFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
									{preparedDate && (
										<Button
											variant="ghost"
											size="icon"
											className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
											onClick={() => {
												setPreparedDate(null);
												setHasChanges(true);
											}}
											disabled={loading || isSaving}
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>
						</>
					)}
				</div>
				{fresh && (
					<div className="mt-4 flex flex-wrap-reverse justify-end gap-2">
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
