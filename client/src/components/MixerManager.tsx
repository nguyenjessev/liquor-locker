import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NewMixerForm } from "./NewMixerForm";
import { MixerList } from "./MixerList";
import { MixerEditModal } from "./MixerEditModal";
import type { Mixer } from "@/types/mixer";
import { Card, CardContent } from "@/components/ui/card";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_KEY = import.meta.env.VITE_API_KEY || "";

export function MixerManager() {
	const [mixers, setMixers] = useState<Mixer[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedMixer, setSelectedMixer] = useState<Mixer | null>(null);
	const [editModalOpen, setEditModalOpen] = useState(false);

	// Fetch all mixers
	const fetchMixers = async () => {
		try {
			setLoading(true);
			setError(null);
			const headers: Record<string, string> = {};
			if (API_KEY) {
				headers["X-API-Key"] = API_KEY;
			}
			const response = await fetch(`${API_BASE_URL}/mixers`, { headers });
			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}
			const data = await response.json();
			const parsedData = (data || []).map(
				(mixer: {
					id: number;
					name: string;
					opened: boolean;
					open_date: string | null;
					purchase_date: string | null;
				}) => ({
					...mixer,
					open_date: mixer.open_date ? new Date(mixer.open_date) : null,
					purchase_date: mixer.purchase_date
						? new Date(mixer.purchase_date)
						: null,
				}),
			);
			setMixers(parsedData);
		} catch (err) {
			if (err instanceof Error) {
				const errorMessage = err.message.includes("Failed to fetch mixers")
					? "Unable to load mixers. Please check your connection and try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError(
					"Unable to load mixers. Please check your connection and try again.",
				);
			}
		} finally {
			setLoading(false);
		}
	};

	// Add a new mixer
	const addMixer = async (mixer: {
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

			const response = await fetch(`${API_BASE_URL}/mixers`, {
				method: "POST",
				headers,
				body: JSON.stringify(mixer),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}

			const newMixer: {
				id: number;
				name: string;
				opened: boolean;
				open_date: string | null;
				purchase_date: string | null;
			} = await response.json();
			const parsedMixer = {
				...newMixer,
				open_date: newMixer.open_date ? new Date(newMixer.open_date) : null,
				purchase_date: newMixer.purchase_date
					? new Date(newMixer.purchase_date)
					: null,
			};
			setMixers([parsedMixer, ...mixers]);
		} catch (err) {
			if (err instanceof Error) {
				const errorMessage = err.message.includes("Failed to create mixer")
					? "Unable to save mixer. Please try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError("Unable to save mixer. Please try again.");
			}
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Save mixer changes
	const saveMixer = async (
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

			const response = await fetch(`${API_BASE_URL}/mixers/${id}`, {
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

			const updatedMixer: {
				id: number;
				name: string;
				opened: boolean;
				open_date: string | null;
				purchase_date: string | null;
			} = await response.json();
			const parsedMixer = {
				...updatedMixer,
				open_date: updatedMixer.open_date
					? new Date(updatedMixer.open_date)
					: null,
				purchase_date: updatedMixer.purchase_date
					? new Date(updatedMixer.purchase_date)
					: null,
			};
			setMixers(mixers.map((b) => (b.id === id ? parsedMixer : b)));
		} catch (err) {
			if (err instanceof Error) {
				const errorMessage = err.message.includes("Failed to update mixer")
					? "Unable to update mixer. Please try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError("Unable to update mixer. Please try again.");
			}
			throw err;
		} finally {
			setLoading(false);
		}
	};

	// Delete a mixer
	const deleteMixer = async (id: number) => {
		try {
			setLoading(true);
			setError(null);
			const headers: Record<string, string> = {};
			if (API_KEY) {
				headers["X-API-Key"] = API_KEY;
			}
			const response = await fetch(`${API_BASE_URL}/mixers/${id}`, {
				method: "DELETE",
				headers,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || `Server error: ${response.status}`);
			}

			setMixers(mixers.filter((mixer) => mixer.id !== id));
		} catch (err) {
			if (err instanceof Error) {
				const errorMessage = err.message.includes("Failed to delete mixer")
					? "Unable to delete mixer. Please try again."
					: err.message;
				setError(errorMessage);
			} else {
				setError("Unable to delete mixer. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	// Load mixers on component mount
	useEffect(() => {
		fetchMixers();
	}, []);

	return (
		<div className="container mx-auto max-w-4xl p-4 md:p-6 mt-0">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-2xl md:text-3xl font-bold">Mixers</h1>
				</div>
				<p className="text-muted-foreground">Syrups, sodas, and bitters</p>
			</div>

			<NewMixerForm onSubmit={addMixer} loading={loading} />

			{/* Error display */}
			{error && (
				<Card className="mb-6 border-destructive">
					<CardContent className="pt-6">
						<p className="text-destructive">{error}</p>
						<Button variant="outline" onClick={fetchMixers} className="mt-2">
							Retry
						</Button>
					</CardContent>
				</Card>
			)}

			<MixerList
				mixers={mixers}
				loading={loading}
				onEditMixer={(mixer) => {
					setSelectedMixer(mixer);
					setEditModalOpen(true);
				}}
			/>

			<MixerEditModal
				mixer={selectedMixer}
				open={editModalOpen}
				onOpenChange={setEditModalOpen}
				onDelete={deleteMixer}
				onSave={saveMixer}
				loading={loading}
			/>
		</div>
	);
}
