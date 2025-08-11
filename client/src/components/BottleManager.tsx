import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface Bottle {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
}

const API_BASE_URL = "http://localhost:8080";

export function BottleManager() {
	const [bottles, setBottles] = useState<Bottle[]>([]);
	const [newBottleName, setNewBottleName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Fetch all bottles
	const fetchBottles = async () => {
		try {
			setLoading(true);
			setError(null);
			const response = await fetch(`${API_BASE_URL}/bottles`);
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
			const response = await fetch(`${API_BASE_URL}/bottles`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ name: newBottleName.trim() }),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}

			const newBottle = await response.json();
			setBottles([newBottle, ...bottles]);
			setNewBottleName("");
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
			const response = await fetch(`${API_BASE_URL}/bottles/${id}`, {
				method: "DELETE",
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
		<div className="container mx-auto max-w-4xl p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-2">Liquor Locker</h1>
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
					<form onSubmit={addBottle} className="flex gap-4">
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
							{bottles.map((bottle) => (
								<div
									key={bottle.id}
									className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
								>
									<div className="flex-1">
										<h3 className="font-medium">{bottle.name}</h3>
										<p className="text-sm text-muted-foreground">
											Added{" "}
											{(() => {
												const date = new Date(bottle.created_at);
												return date.toString() === "Invalid Date"
													? "Invalid Date"
													: date.toLocaleDateString();
											})()}
										</p>
									</div>
									<Button
										variant="destructive"
										size="sm"
										onClick={() => deleteBottle(bottle.id)}
										disabled={loading}
									>
										Delete
									</Button>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
