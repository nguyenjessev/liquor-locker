import React, { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface NewBottleFormProps {
	onSubmit: (bottle: {
		name: string;
		opened: boolean;
		open_date?: Date;
		purchase_date?: Date;
		price?: number;
	}) => Promise<void>;
	loading: boolean;
}

export function NewBottleForm({ onSubmit, loading }: NewBottleFormProps) {
	const [newBottleName, setNewBottleName] = useState("");
	const [isOpened, setIsOpened] = useState(false);
	const [openDate, setOpenDate] = useState<Date | undefined>(undefined);
	const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined);
	const [purchaseDateOpen, setPurchaseDateOpen] = useState(false);
	const [openDateOpen, setOpenDateOpen] = useState(false);
	const [price, setPrice] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newBottleName.trim()) return;

		await onSubmit({
			name: newBottleName.trim(),
			opened: isOpened,
			open_date: isOpened && openDate ? openDate : undefined,
			purchase_date: purchaseDate,
			price: price ? parseFloat(price) : undefined,
		});

		// Reset form
		setNewBottleName("");
		setIsOpened(false);
		setOpenDate(undefined);
		setPurchaseDate(undefined);
		setPrice("");
	};

	return (
		<Card className="mb-8">
			<CardHeader>
				<CardTitle>Add New Bottle</CardTitle>
				<CardDescription>Add a new bottle to your collection</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Bottle name and save button */}
					<div className="space-y-2">
						<Label htmlFor="bottle-name-input" className="block">
							Bottle Name
						</Label>
						<div className="flex flex-wrap gap-2">
							<Input
								type="text"
								value={newBottleName}
								onChange={(e) => setNewBottleName(e.target.value)}
								className="w-auto min-w-0"
								disabled={loading}
								id="bottle-name-input"
							/>
							<Button type="submit" disabled={loading || !newBottleName.trim()}>
								{loading ? "Adding..." : "Add Bottle"}
							</Button>
						</div>
					</div>

					{/* Purchase date and price */}
					<div className="flex gap-4">
						{/* Purchase date */}
						<div className="space-y-2">
							<Label htmlFor="purchase-date-input" className="block">
								Purchase date (optional)
							</Label>
							<div className="flex gap-2">
								<Popover
									open={purchaseDateOpen}
									onOpenChange={setPurchaseDateOpen}
								>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={`shrink-1 max-w-full overflow-hidden justify-start ${!purchaseDate && "text-muted-foreground"}`}
											disabled={loading}
											id="purchase-date-input"
										>
											<CalendarIcon />
											<span>
												{purchaseDate ? format(purchaseDate, "PPP") : "No date"}
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
												setPurchaseDate(date ? startOfDay(date) : undefined);
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
											setPurchaseDate(undefined);
										}}
										disabled={loading}
									>
										<X />
									</Button>
								)}
							</div>
						</div>

						{/* Price */}
						<div className="space-y-2">
							<Label htmlFor="price-input" className="block">
								Price
							</Label>
							<div className="relative">
								<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
									$
								</span>
								<Input
									type="text"
									value={price}
									onChange={(e) => {
										const value = e.target.value;
										if (value === "" || /^\d*\.?\d*$/.test(value)) {
											setPrice(value);
										}
									}}
									className="pl-6 w-32"
									disabled={loading}
									id="price-input"
									placeholder="0.00"
								/>
							</div>
						</div>
					</div>

					{/* Status and open date */}
					<div className="space-y-2">
						<div className="flex gap-4 flex-wrap">
							{/* Status */}
							<div className="space-y-2">
								<Label htmlFor="status-input" className="block">
									Status
								</Label>
								<button
									onClick={() => {
										const newOpenedState = !isOpened;
										setIsOpened(newOpenedState);
										if (newOpenedState) {
											setOpenDate(startOfDay(new Date()));
										} else {
											setOpenDate(undefined);
										}
									}}
									type="button"
									disabled={loading}
									className={`relative h-9 w-45 items-center rounded-full border-1 border-border transition-colors duration-100 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
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

							<div
								className="overflow-hidden transition-[max-height,opacity] duration-100 ease-in-out"
								style={{
									maxHeight: isOpened ? "1000px" : "0",
									opacity: isOpened ? 1 : 0,
								}}
							>
								<div className="space-y-2">
									<Label htmlFor="open-date-input" className="block">
										Open date (optional)
									</Label>
									<div className="flex gap-2">
										<Popover open={openDateOpen} onOpenChange={setOpenDateOpen}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={`shrink-1 max-w-full overflow-hidden justify-start ${!openDate && "text-muted-foreground"}`}
													disabled={loading}
													id="open-date-input"
												>
													<CalendarIcon />
													<span>
														{openDate ? format(openDate, "PPP") : "No date"}
													</span>
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={openDate ? startOfDay(openDate) : undefined}
													onSelect={(date) => {
														setOpenDate(date ? startOfDay(date) : undefined);
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
												className="h-9 w-9 text-muted-foreground hover:text-destructive"
												onClick={() => {
													setOpenDate(undefined);
												}}
												disabled={loading}
											>
												<X />
											</Button>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
