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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newBottleName.trim()) return;

		await onSubmit({
			name: newBottleName.trim(),
			opened: isOpened,
			open_date: isOpened && openDate ? openDate : undefined,
			purchase_date: purchaseDate,
		});

		// Reset form
		setNewBottleName("");
		setIsOpened(false);
		setOpenDate(undefined);
		setPurchaseDate(undefined);
	};

	return (
		<Card className="mb-8">
			<CardHeader>
				<CardTitle>Add New Bottle</CardTitle>
				<CardDescription>
					Enter the name of the bottle you'd like to add to your collection
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex gap-4">
						<div className="flex flex-col sm:flex-row gap-2">
							<Input
								type="text"
								placeholder="Enter bottle name..."
								value={newBottleName}
								onChange={(e) => setNewBottleName(e.target.value)}
								className="flex-1"
								disabled={loading}
							/>
							<Button type="submit" disabled={loading || !newBottleName.trim()}>
								{loading ? "Adding..." : "Add Bottle"}
							</Button>
						</div>
					</div>

					<div className="space-y-3">
						<div>
							<div>
								<Label htmlFor="purchase-date" className="block mb-2">
									Purchase date (optional)
								</Label>
								<Popover
									open={purchaseDateOpen}
									onOpenChange={setPurchaseDateOpen}
								>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={`w-48 justify-start text-left font-normal ${!purchaseDate && "text-muted-foreground"}`}
											disabled={loading}
										>
											<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
											{purchaseDate
												? format(purchaseDate, "PPP")
												: "No date set"}
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
							</div>

							<div className="flex items-center space-x-2 mt-4">
								<div className="flex items-center space-x-2">
									<Checkbox
										id="is-opened"
										checked={isOpened}
										onCheckedChange={(checked) => setIsOpened(checked === true)}
										disabled={loading}
									/>
									<Label htmlFor="is-opened">Already opened</Label>
								</div>
							</div>

							<div
								className="overflow-hidden transition-[max-height,opacity,margin] duration-300 ease-in-out"
								style={{
									maxHeight: isOpened ? "80px" : "0",
									marginTop: isOpened ? "1rem" : "0",
									opacity: isOpened ? 1 : 0,
								}}
							>
								<div className="ml-6 flex flex-wrap items-center gap-x-4 gap-y-2">
									<Label htmlFor="open-date">Open date (optional)</Label>
									<Popover open={openDateOpen} onOpenChange={setOpenDateOpen}>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={`w-48 justify-start text-left font-normal ${!openDate && "text-muted-foreground"}`}
												disabled={loading}
											>
												<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
												{openDate ? format(openDate, "PPP") : "No date set"}
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
												autoFocus
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>
						</div>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
