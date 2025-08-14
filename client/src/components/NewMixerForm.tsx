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

interface NewMixerFormProps {
	onSubmit: (mixer: {
		name: string;
		opened: boolean;
		open_date?: Date;
		purchase_date?: Date;
	}) => Promise<void>;
	loading: boolean;
}

export function NewMixerForm({ onSubmit, loading }: NewMixerFormProps) {
	const [newMixerName, setNewMixerName] = useState("");
	const [isOpened, setIsOpened] = useState(false);
	const [openDate, setOpenDate] = useState<Date | undefined>(undefined);
	const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(undefined);
	const [purchaseDateOpen, setPurchaseDateOpen] = useState(false);
	const [openDateOpen, setOpenDateOpen] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newMixerName.trim()) return;

		await onSubmit({
			name: newMixerName.trim(),
			opened: isOpened,
			open_date: isOpened && openDate ? openDate : undefined,
			purchase_date: purchaseDate,
		});

		// Reset form
		setNewMixerName("");
		setIsOpened(false);
		setOpenDate(undefined);
		setPurchaseDate(undefined);
	};

	return (
		<Card className="mb-8">
			<CardHeader>
				<CardTitle>Add New Mixer</CardTitle>
				<CardDescription>
					Enter the name of the mixer you'd like to add to your collection
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="flex gap-4">
						<div className="flex flex-col sm:flex-row gap-2">
							<Input
								type="text"
								placeholder="Enter mixer name..."
								value={newMixerName}
								onChange={(e) => setNewMixerName(e.target.value)}
								className="flex-1"
								disabled={loading}
							/>
							<Button type="submit" disabled={loading || !newMixerName.trim()}>
								{loading ? "Adding..." : "Add Mixer"}
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
								<Label className="mb-2 block">Status</Label>
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
									className={`relative inline-flex h-9 w-[160px] items-center rounded-full border-2 border-border transition-colors duration-300 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
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
								<div className="ml-6 flex flex-wrap items-center gap-x-4 gap-y-2">
									<Label htmlFor="open-date">Open date (optional)</Label>
									<div className="flex items-center gap-2">
										<Popover open={openDateOpen} onOpenChange={setOpenDateOpen}>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={`w-[180px] justify-start text-left font-normal ${!openDate && "text-muted-foreground"}`}
													disabled={loading}
												>
													<CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
													<span>
														{openDate ? format(openDate, "PPP") : "No date set"}
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
												<X className="h-4 w-4" />
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
