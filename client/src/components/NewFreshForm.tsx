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
	}) => Promise<void>;
	loading: boolean;
}

export function NewFreshForm({ onSubmit, loading }: NewFreshFormProps) {
	const [newFreshName, setNewFreshName] = useState("");
	const [preparedDate, setPreparedDate] = useState<Date | undefined>(undefined);
	const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined);
	const [purchaseDateOpen, setPurchaseDateOpen] = useState(false);
	const [preparedDateOpen, setPreparedDateOpen] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newFreshName.trim()) return;

		await onSubmit({
			name: newFreshName.trim(),
			prepared_date: preparedDate,
			purchase_date: purchaseDate,
		});

		// Reset form
		setNewFreshName("");
		setPreparedDate(undefined);
		setPurchaseDate(undefined);
	};

	return (
		<Card className="mb-8">
			<CardHeader>
				<CardTitle>Add New Fresh Ingredient</CardTitle>
				<CardDescription>
					Enter the name of the fresh ingredient you'd like to add to your
					collection
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex gap-4">
						<div className="flex flex-col sm:flex-row gap-2">
							<Input
								type="text"
								placeholder="Enter ingredient name..."
								value={newFreshName}
								onChange={(e) => setNewFreshName(e.target.value)}
								className="flex-1"
								disabled={loading}
							/>
							<Button type="submit" disabled={loading || !newFreshName.trim()}>
								{loading ? "Adding..." : "Add Ingredient"}
							</Button>
						</div>
					</div>

					<div className="space-y-3">
						<div>
							<div>
								<Label htmlFor="purchase-date" className="block mb-2">
									Purchase date (optional)
								</Label>
								<div className="flex items-center gap-2">
									<Popover
										open={purchaseDateOpen}
										onOpenChange={setPurchaseDateOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={`w-[180px] justify-start text-left font-normal ${!purchaseDate && "text-muted-foreground"}`}
												disabled={loading}
											>
												<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
												<span>
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
											className="h-9 w-9 text-muted-foreground hover:text-destructive"
											onClick={() => {
												setPurchaseDate(undefined);
											}}
											disabled={loading}
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>

							<div className="mt-4">
								<Label htmlFor="prepared-date" className="block mb-2">
									Prepared date (optional)
								</Label>
								<div className="flex items-center gap-2">
									<Popover
										open={preparedDateOpen}
										onOpenChange={setPreparedDateOpen}
									>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={`w-[180px] justify-start text-left font-normal ${!preparedDate && "text-muted-foreground"}`}
												disabled={loading}
											>
												<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
												<span>
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
											className="h-9 w-9 text-muted-foreground hover:text-destructive"
											onClick={() => {
												setPreparedDate(undefined);
											}}
											disabled={loading}
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
