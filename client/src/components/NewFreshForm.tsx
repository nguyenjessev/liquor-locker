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

interface NewFreshFormProps {
	onSubmit: (fresh: {
		name: string;
		prepared_date?: Date;
		purchase_date?: Date;
		price?: number;
	}) => Promise<void>;
	loading: boolean;
}

export function NewFreshForm({ onSubmit, loading }: NewFreshFormProps) {
	const [newFreshName, setNewFreshName] = useState("");
	const [preparedDate, setPreparedDate] = useState<Date | undefined>(undefined);
	const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined);
	const [purchaseDateOpen, setPurchaseDateOpen] = useState(false);
	const [preparedDateOpen, setPreparedDateOpen] = useState(false);
	const [price, setPrice] = useState<string>("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newFreshName.trim()) return;

		await onSubmit({
			name: newFreshName.trim(),
			prepared_date: preparedDate,
			purchase_date: purchaseDate,
			price: price ? parseFloat(price) : undefined,
		});

		// Reset form
		setNewFreshName("");
		setPreparedDate(undefined);
		setPurchaseDate(undefined);
		setPrice("");
	};

	return (
		<Card className="mb-8">
			<CardHeader>
				<CardTitle>Add New Fresh Ingredient</CardTitle>
				<CardDescription>
					Add a fresh ingredient to your collection
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Fresh ingredient name and save button */}
					<div className="space-y-2">
						<Label htmlFor="fresh-name-input" className="block">
							Fresh Ingredient Name
						</Label>
						<div className="flex flex-wrap gap-2">
							<Input
								type="text"
								value={newFreshName}
								onChange={(e) => setNewFreshName(e.target.value)}
								className="w-auto min-w-0"
								disabled={loading}
								id="fresh-name-input"
							/>
							<Button type="submit" disabled={loading || !newFreshName.trim()}>
								{loading ? "Adding..." : "Add Ingredient"}
							</Button>
						</div>
					</div>

					{/* Purchase date and price */}
					<div className="flex gap-4">
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
									className="pl-6"
									disabled={loading}
									id="price-input"
									placeholder="0.00"
								/>
							</div>
						</div>
					</div>

					{/* Prepared date */}
					<div className="space-y-2">
						<Label htmlFor="prepared-date-input" className="block">
							Prepared date (optional)
						</Label>
						<div className="flex gap-2">
							<Popover
								open={preparedDateOpen}
								onOpenChange={setPreparedDateOpen}
							>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={`shrink-1 max-w-full justify-start ${!preparedDate && "text-muted-foreground"}`}
										disabled={loading}
										id="prepared-date-input"
									>
										<CalendarIcon />
										<span>
											{preparedDate ? format(preparedDate, "PPP") : "No date"}
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
											setPreparedDate(date ? startOfDay(date) : undefined);
											setPreparedDateOpen(false);
										}}
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
										setPreparedDate(undefined);
									}}
									disabled={loading}
								>
									<X />
								</Button>
							)}
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
