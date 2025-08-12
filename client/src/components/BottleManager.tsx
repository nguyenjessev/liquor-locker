import React, { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BottleCard } from "./BottleCard";
import type { Bottle } from "@/types/bottle";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export function BottleManager() {
	const [bottles, setBottles] = useState<Bottle[]>([]);
	const [newBottleName, setNewBottleName] = useState("");
	const [isOpened, setIsOpened] = useState(false);
	const [openDate, setOpenDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch all bottles
	const fetchBottles = async () => {
		try {
			setLoading(true);
			setError(null);
			const headers: Record<string, string> = {};
			if (API_KEY) {
				headers["X-API-Key"] = API_KEY;
			}
			const response = await fetch(`${API_BASE_URL}/bottles`, { headers });
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}
			const data = await response.json();
			setBottles(data || []);
		} catch (err) {
			if (err instanceof Error) {
				// Try to extract server error message
				const errorMessage = err.message.includes("Failed to fetch bottles")
					? "Unable to load bottles. Please check your connection and try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError(
					"Unable to load bottles. Please check your connection and try again.",
				);
			}
		} finally {
			setLoading(false);
		}
	};

	// Add a new bottle
	const addBottle = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newBottleName.trim()) return;

		try {
			setLoading(true);
			setError(null);
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};
			if (API_KEY) {
				headers["X-API-Key"] = API_KEY;
			}

			const requestBody: { name: string; opened: boolean; open_date?: string } =
				{
					name: newBottleName.trim(),
					opened: isOpened,
				};

			// Only include open_date if the bottle is marked as opened and a date is provided
			if (isOpened && openDate) {
				requestBody.open_date = openDate; // Use the date string directly (YYYY-MM-DD format)
			}

			const response = await fetch(`${API_BASE_URL}/bottles`, {
				method: "POST",
				headers,
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}

			const newBottle = await response.json();
			setBottles([newBottle, ...bottles]);
			setNewBottleName("");
			setIsOpened(false);
			setOpenDate("");
		} catch (err) {
			if (err instanceof Error) {
				// Try to extract server error message
				const errorMessage = err.message.includes("Failed to create bottle")
					? "Unable to save bottle. Please try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError("Unable to save bottle. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	// Delete a bottle
	const deleteBottle = async (id: number) => {
		try {
			setLoading(true);
			setError(null);
			const headers: Record<string, string> = {};
			if (API_KEY) {
				headers["X-API-Key"] = API_KEY;
			}
			const response = await fetch(`${API_BASE_URL}/bottles/${id}`, {
				method: "DELETE",
				headers,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}

			setBottles(bottles.filter((bottle) => bottle.id !== id));
		} catch (err) {
			if (err instanceof Error) {
				// Try to extract server error message
				const errorMessage = err.message.includes("Failed to delete bottle")
					? "Unable to delete bottle. Please try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError("Unable to delete bottle. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	// Load bottles on component mount
	useEffect(() => {
		fetchBottles();
	}, []);

	return (
		<div className="container mx-auto max-w-4xl p-4 md:p-6 mt-0">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-2xl md:text-3xl font-bold">Bottles</h1>
					<div className="md:hidden">
						<ThemeToggle />
					</div>
				</div>
				<p className="text-muted-foreground">Manage your bottle collection</p>
			</div>

			{/* Add new bottle form */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Add New Bottle</CardTitle>
					<CardDescription>
						Enter the name of the bottle you'd like to add to your collection
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={addBottle} className="space-y-4">
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
								<Button
									type="submit"
									disabled={loading || !newBottleName.trim()}
								>
									{loading ? "Adding..." : "Add Bottle"}
								</Button>
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="is-opened"
									checked={isOpened}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setIsOpened(e.target.checked)
									}
									disabled={loading}
								/>
								<Label htmlFor="is-opened">Already opened</Label>
							</div>

							{isOpened && (
								<div className="ml-6">
									<Label htmlFor="open-date" className="block mb-2">
										Open date (optional)
									</Label>
									<Input
										id="open-date"
										type="date"
										value={openDate}
										onChange={(e) => setOpenDate(e.target.value)}
										disabled={loading}
										className="w-48"
									/>
								</div>
							)}
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Error display */}
			{error && (
				<Card className="mb-6 border-destructive">
					<CardContent className="pt-6">
						<p className="text-destructive">{error}</p>
						<Button variant="outline" onClick={fetchBottles} className="mt-2">
							Retry
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Bottles list */}
			<Card>
				<CardHeader>
					<CardTitle>Your Bottles ({bottles.length})</CardTitle>
					<CardDescription>
						{bottles.length === 0
							? "No bottles in your collection yet"
							: "Click delete to remove a bottle from your collection"}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loading && bottles.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">
							Loading bottles...
						</p>
					) : bottles.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">
							Your collection is empty. Add your first bottle above!
						</p>
					) : (
						<div className="space-y-3">
							<div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
								{bottles.map((bottle) => (
									<BottleCard
										key={bottle.id}
										bottle={bottle}
										onDelete={deleteBottle}
										loading={loading}
									/>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
