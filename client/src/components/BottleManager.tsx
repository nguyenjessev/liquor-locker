import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NewBottleForm } from "./NewBottleForm";
import { BottleList } from "./BottleList";
import { BottleEditModal } from "./BottleEditModal";
import type { Bottle } from "@/types/bottle";
import { Card, CardContent } from "@/components/ui/card";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export function BottleManager() {
	const [bottles, setBottles] = useState<Bottle[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);

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
			const parsedData = (data || []).map(
				(bottle: {
					id: number;
					name: string;
					opened: boolean;
					open_date: string | null;
					purchase_date: string | null;
				}) => ({
					...bottle,
					open_date: bottle.open_date ? new Date(bottle.open_date) : null,
					purchase_date: bottle.purchase_date
						? new Date(bottle.purchase_date)
						: null,
				}),
			);
			setBottles(parsedData);
		} catch (err) {
			if (err instanceof Error) {
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
	const addBottle = async (bottle: {
		name: string;
		opened: boolean;
		open_date?: Date;
		purchase_date?: Date;
	}) => {
		try {
			setLoading(true);
			setError(null);
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};
			if (API_KEY) {
				headers["X-API-Key"] = API_KEY;
			}

			const response = await fetch(`${API_BASE_URL}/bottles`, {
				method: "POST",
				headers,
				body: JSON.stringify(bottle),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}

			const newBottle: {
				id: number;
				name: string;
				opened: boolean;
				open_date: string | null;
				purchase_date: string | null;
			} = await response.json();
			const parsedBottle = {
				...newBottle,
				open_date: newBottle.open_date ? new Date(newBottle.open_date) : null,
				purchase_date: newBottle.purchase_date
					? new Date(newBottle.purchase_date)
					: null,
			};
			setBottles([parsedBottle, ...bottles]);
		} catch (err) {
			if (err instanceof Error) {
				const errorMessage = err.message.includes("Failed to create bottle")
					? "Unable to save bottle. Please try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError("Unable to save bottle. Please try again.");
			}
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Save bottle changes
	const saveBottle = async (
		id: number,
		updates: {
			name: string;
			opened: boolean;
			open_date?: Date | null;
			purchase_date?: Date | null;
		},
	) => {
		try {
			setLoading(true);
			setError(null);
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};
			if (API_KEY) {
				headers["X-API-Key"] = API_KEY;
			}

			const response = await fetch(`${API_BASE_URL}/bottles/${id}`, {
				method: "PUT",
				headers,
				body: JSON.stringify({
					...updates,
					open_date:
						updates.open_date instanceof Date
							? updates.open_date.toISOString()
							: null,
					purchase_date:
						updates.purchase_date instanceof Date
							? updates.purchase_date.toISOString()
							: null,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}

			const updatedBottle: {
				id: number;
				name: string;
				opened: boolean;
				open_date: string | null;
				purchase_date: string | null;
			} = await response.json();
			const parsedBottle = {
				...updatedBottle,
				open_date: updatedBottle.open_date
					? new Date(updatedBottle.open_date)
					: null,
				purchase_date: updatedBottle.purchase_date
					? new Date(updatedBottle.purchase_date)
					: null,
			};
			setBottles(bottles.map((b) => (b.id === id ? parsedBottle : b)));
		} catch (err) {
			if (err instanceof Error) {
				const errorMessage = err.message.includes("Failed to update bottle")
					? "Unable to update bottle. Please try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError("Unable to update bottle. Please try again.");
			}
			throw err;
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
				</div>
				<p className="text-muted-foreground">Manage your bottle collection</p>
			</div>

			<NewBottleForm onSubmit={addBottle} loading={loading} />

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

			<BottleList
				bottles={bottles}
				loading={loading}
				onEditBottle={(bottle) => {
					setSelectedBottle(bottle);
					setEditModalOpen(true);
				}}
			/>

			<BottleEditModal
				bottle={selectedBottle}
				open={editModalOpen}
				onOpenChange={setEditModalOpen}
				onDelete={deleteBottle}
				onSave={saveBottle}
				loading={loading}
			/>
		</div>
	);
}
