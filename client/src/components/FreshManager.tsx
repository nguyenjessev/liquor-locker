import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NewFreshForm } from "./NewFreshForm";
import { FreshList } from "./FreshList";
import { FreshEditModal } from "./FreshEditModal";
import type { Fresh } from "@/types/fresh";
import { Card, CardContent } from "@/components/ui/card";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export function FreshManager() {
	const [freshIngredients, setFreshIngredients] = useState<Fresh[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedFresh, setSelectedFresh] = useState<Fresh | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);

	// Fetch all fresh ingredients
	const fetchFreshIngredients = async () => {
		try {
			setLoading(true);
			setError(null);
			const headers: Record<string, string> = {};
			if (API_KEY) {
				headers["X-API-Key"] = API_KEY;
			}
			const response = await fetch(`${API_BASE_URL}/fresh`, { headers });
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}
			const data = await response.json();
			const parsedData = (data || []).map(
				(fresh: {
					id: number;
					name: string;
					prepared_date: string | null;
					purchase_date: string | null;
				}) => ({
					...fresh,
					open_date: fresh.prepared_date ? new Date(fresh.prepared_date) : null,
					purchase_date: fresh.purchase_date
						? new Date(fresh.purchase_date)
						: null,
				}),
			);
			setFreshIngredients(parsedData);
		} catch (err) {
			if (err instanceof Error) {
				const errorMessage = err.message.includes(
					"Failed to fetch fresh ingredients",
				)
					? "Unable to load fresh ingredients. Please check your connection and try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError(
					"Unable to load fresh ingredients. Please check your connection and try again.",
				);
			}
		} finally {
			setLoading(false);
		}
	};

	// Add a new bottle
	const addFresh = async (fresh: {
		name: string;
		prepared_date?: Date;
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

			const response = await fetch(`${API_BASE_URL}/fresh`, {
				method: "POST",
				headers,
				body: JSON.stringify(fresh),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}

			const newFresh: {
				id: number;
				name: string;
				prepared_date: string | null;
				purchase_date: string | null;
			} = await response.json();
			const parsedFresh = {
				...newFresh,
				prepared_date: newFresh.prepared_date
					? new Date(newFresh.prepared_date)
					: null,
				purchase_date: newFresh.purchase_date
					? new Date(newFresh.purchase_date)
					: null,
			};
			setFreshIngredients([parsedFresh, ...freshIngredients]);
		} catch (err) {
			if (err instanceof Error) {
				const errorMessage = err.message.includes(
					"Failed to create fresh ingredient",
				)
					? "Unable to save fresh ingredient. Please try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError("Unable to save fresh ingredient. Please try again.");
			}
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Save fresh ingredient changes
	const saveFresh = async (
		id: number,
		updates: {
			name: string;
			prepared_date?: Date | null;
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

			const response = await fetch(`${API_BASE_URL}/fresh/${id}`, {
				method: "PUT",
				headers,
				body: JSON.stringify({
					...updates,
					prepared_date:
						updates.prepared_date instanceof Date
							? updates.prepared_date.toISOString()
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

			const updatedFresh: {
				id: number;
				name: string;
				prepared_date: string | null;
				purchase_date: string | null;
			} = await response.json();
			const parsedFresh = {
				...updatedFresh,
				prepared_date: updatedFresh.prepared_date
					? new Date(updatedFresh.prepared_date)
					: null,
				purchase_date: updatedFresh.purchase_date
					? new Date(updatedFresh.purchase_date)
					: null,
			};
			setFreshIngredients(
				freshIngredients.map((b) => (b.id === id ? parsedFresh : b)),
			);
		} catch (err) {
			if (err instanceof Error) {
				const errorMessage = err.message.includes(
					"Failed to update fresh ingredient",
				)
					? "Unable to update fresh ingredient. Please try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError("Unable to update fresh ingredient. Please try again.");
			}
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Delete a fresh ingredient
	const deleteFresh = async (id: number) => {
		try {
			setLoading(true);
			setError(null);
			const headers: Record<string, string> = {};
			if (API_KEY) {
				headers["X-API-Key"] = API_KEY;
			}
			const response = await fetch(`${API_BASE_URL}/fresh/${id}`, {
				method: "DELETE",
				headers,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}

			setFreshIngredients(freshIngredients.filter((fresh) => fresh.id !== id));
		} catch (err) {
			if (err instanceof Error) {
				const errorMessage = err.message.includes(
					"Failed to delete fresh ingredient",
				)
					? "Unable to delete fresh ingredient. Please try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError("Unable to delete fresh ingredient. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	// Load fresh ingredients on component mount
	useEffect(() => {
		fetchFreshIngredients();
	}, []);

	return (
		<div className="container mx-auto max-w-4xl p-4 md:p-6 mt-0">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-2xl md:text-3xl font-bold">Fresh</h1>
				</div>
				<p className="text-muted-foreground">
					Fruit, herbs, dairy, eggs, and more
				</p>
			</div>

			<NewFreshForm onSubmit={addFresh} loading={loading} />

			{/* Error display */}
			{error && (
				<Card className="mb-6 border-destructive">
					<CardContent className="pt-6">
						<p className="text-destructive">{error}</p>
						<Button
							variant="outline"
							onClick={fetchFreshIngredients}
							className="mt-2"
						>
							Retry
						</Button>
					</CardContent>
				</Card>
			)}

			<FreshList
				freshIngredients={freshIngredients}
				loading={loading}
				onEditFresh={(fresh) => {
					setSelectedFresh(fresh);
					setEditModalOpen(true);
				}}
			/>

			<FreshEditModal
				fresh={selectedFresh}
				open={editModalOpen}
				onOpenChange={setEditModalOpen}
				onDelete={deleteFresh}
				onSave={saveFresh}
				loading={loading}
			/>
		</div>
	);
}
