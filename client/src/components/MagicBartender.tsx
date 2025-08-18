import { useEffect, useState } from "react";

import type { CocktailRecommendation } from "@/types/cocktail";
import { CocktailCard } from "./CocktailCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from "@/components/ui/popover";
import {
	Command,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function MagicBartender() {
	const [serviceStatus, setServiceStatus] = useState<null | boolean>(null);
	const [loading, setLoading] = useState(true);
	const [models, setModels] = useState<string[]>([]);
	const [modelsLoading, setModelsLoading] = useState(false);
	const [selectedModel, setSelectedModel] = useState<string>("");
	const [recommendations, setRecommendations] = useState<
		CocktailRecommendation[] | null
	>(null);

	// Persist recommendations in localStorage
	const RECOMMENDATIONS_KEY = "magicBartenderRecommendations";

	// On mount, load recommendations from localStorage
	useEffect(() => {
		const saved = localStorage.getItem(RECOMMENDATIONS_KEY);
		if (saved) {
			try {
				const parsed = JSON.parse(saved);
				if (Array.isArray(parsed)) {
					setRecommendations(parsed);
				}
			} catch {
				// Ignore parse errors
			}
		}
	}, []);

	// Whenever recommendations change, persist them
	useEffect(() => {
		if (recommendations) {
			localStorage.setItem(
				RECOMMENDATIONS_KEY,
				JSON.stringify(recommendations),
			);
		} else {
			localStorage.removeItem(RECOMMENDATIONS_KEY);
		}
	}, [recommendations]);
	const [recommendLoading, setRecommendLoading] = useState(false);
	const [recommendError, setRecommendError] = useState<string | null>(null);

	// Persist selected model in localStorage
	const LOCAL_STORAGE_KEY = "selectedModel";

	// On mount, load selected model from localStorage (before models are loaded)
	useEffect(() => {
		const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (stored) {
			setSelectedModel(stored);
		}
	}, []);

	// After models are loaded, validate selectedModel
	useEffect(() => {
		if (models.length > 0 && selectedModel && !models.includes(selectedModel)) {
			setSelectedModel("");
		}
	}, [models, selectedModel]);

	// When selectedModel changes, persist to localStorage
	useEffect(() => {
		if (selectedModel && models.includes(selectedModel)) {
			localStorage.setItem(LOCAL_STORAGE_KEY, selectedModel);
		} else if (selectedModel === "") {
			localStorage.removeItem(LOCAL_STORAGE_KEY);
		}
	}, [selectedModel, models]);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/ai/service`);
				if (!res.ok) {
					setServiceStatus(null);
				} else {
					const data = await res.json();
					if (!data.initialized) {
						// Try to auto-initialize if API settings exist
						const apiUrl = localStorage.getItem("apiUrl");
						const apiKey = localStorage.getItem("apiKey");
						if (apiUrl && apiKey) {
							try {
								const sanitizedApiUrl = apiUrl.replace(/\/+$/, "");
								const configureResponse = await fetch(
									`${API_BASE_URL}/ai/configure`,
									{
										method: "POST",
										headers: {
											"Content-Type": "application/json",
											"X-API-Key": apiKey,
										},
										body: JSON.stringify({
											base_url: sanitizedApiUrl,
											api_key: apiKey,
										}),
									},
								);
								if (configureResponse.ok) {
									// Re-check service status after successful configure
									const res2 = await fetch(`${API_BASE_URL}/ai/service`);
									if (res2.ok) {
										const data2 = await res2.json();
										setServiceStatus(data2.initialized);
									} else {
										setServiceStatus(null);
									}
								} else {
									setServiceStatus(null);
								}
							} catch {
								setServiceStatus(null);
							}
						} else {
							setServiceStatus(false);
						}
					} else {
						setServiceStatus(true);
					}
				}
			} catch {
				setServiceStatus(null);
			} finally {
				setLoading(false);
			}
		};
		fetchStatus();
	}, []);

	// Fetch models when serviceStatus becomes true
	useEffect(() => {
		if (serviceStatus) {
			setModelsLoading(true);
			(async () => {
				try {
					const modelsRes = await fetch(`${API_BASE_URL}/ai/models`);
					if (modelsRes.ok) {
						const modelsData = await modelsRes.json();
						setModels(Array.isArray(modelsData) ? modelsData : []);
					} else {
						setModels([]);
					}
				} catch {
					setModels([]);
				} finally {
					setModelsLoading(false);
				}
			})();
		}
	}, [serviceStatus]);

	return (
		<div className="container mx-auto max-w-4xl p-4 md:p-6 mt-0">
			<div className="mb-8">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-2xl md:text-3xl font-bold">Magic Bartender</h1>
				</div>
				<p className="text-muted-foreground">
					Get personalized cocktail recommendations from our AI-powered
					bartender based on your inventory
				</p>
			</div>

			<Card>
				<CardContent>
					<div className="space-y-4">
						{loading ? (
							<p className="text-muted-foreground">
								Checking service status...
							</p>
						) : serviceStatus ? (
							<>
								<p className="text-muted-foreground">
									Ready to discover new cocktails? Click below to get started.
								</p>
								<div className="mb-6">
									<h2 className="text-lg font-semibold mb-2">
										Available Models
									</h2>
									{modelsLoading ? (
										<p className="text-muted-foreground">Loading models...</p>
									) : models.length > 0 ? (
										<ModelCombobox
											models={models}
											value={selectedModel}
											setValue={setSelectedModel}
										/>
									) : (
										<p className="text-muted-foreground">
											No models available.
										</p>
									)}
								</div>
								<Button
									disabled={!selectedModel || recommendLoading}
									onClick={async () => {
										setRecommendLoading(true);
										setRecommendations(null);
										setRecommendError(null);
										try {
											const res = await fetch(
												`${API_BASE_URL}/cocktails/recommendation`,
												{
													method: "POST",
													headers: {
														"Content-Type": "application/json",
													},
													body: JSON.stringify({ model: selectedModel }),
												},
											);
											if (!res.ok) {
												const errText = await res.text();
												setRecommendError(`Error: ${errText}`);
											} else {
												const data = await res.json();
												if (Array.isArray(data.cocktails)) {
													setRecommendations(data.cocktails);
												} else {
													setRecommendations([]);
												}
											}
										} catch {
											setRecommendError("Failed to fetch recommendation.");
										} finally {
											setRecommendLoading(false);
										}
									}}
								>
									{recommendLoading
										? "Getting Recommendations..."
										: "Get Recommendations"}
								</Button>
							</>
						) : (
							<p className="text-muted-foreground">
								To use Magic Bartender, please configure your API in your{" "}
								<strong>Settings</strong>.
							</p>
						)}
					</div>
				</CardContent>
			</Card>
			{(recommendations && recommendations.length > 0) || recommendError ? (
				<div className="mt-8">
					{recommendations && recommendations.length > 0 && (
						<>
							<h3 className="text-lg font-semibold mb-2">
								Recommended Cocktails
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{recommendations.map((cocktail, idx) => (
									<CocktailCard key={idx} cocktail={cocktail} className="" />
								))}
							</div>
						</>
					)}
					{recommendError && (
						<p className="text-destructive">{recommendError}</p>
					)}
				</div>
			) : null}
		</div>
	);
}

// Combobox for models
function ModelCombobox({
	models,
	value,
	setValue,
}: {
	models: string[];
	value: string;
	setValue: (v: string) => void;
}) {
	const [open, setOpen] = useState(false);

	const options = models.map((model) => ({
		value: model,
		label: model,
	}));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-auto max-w-full justify-between overflow-hidden")}
				>
					<span className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
						{value
							? options.find((option) => option.value === value)?.label
							: "Select model..."}
					</span>
					<ChevronsUpDown className="opacity-50 ml-2 h-4 w-4 shrink-0" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0">
				<Command>
					<CommandInput placeholder="Search model..." className="h-9" />
					<CommandList>
						<CommandEmpty>No model found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										setOpen(false);
									}}
								>
									{option.label}
									<Check
										className={cn(
											"ml-auto",
											value === option.value ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
