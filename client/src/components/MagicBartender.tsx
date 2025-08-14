import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function MagicBartender() {
	const [loading, setLoading] = useState(false);
	const [recommendation, setRecommendation] = useState<string | null>(null);
	const [settingsValid, setSettingsValid] = useState<boolean | null>(null);
	const [models, setModels] = useState<string[]>([]);
	const [selectedModel, setSelectedModel] = useState<string>();
	const [loadingModels, setLoadingModels] = useState(false);
	const hasShownToast = useRef(false);
	const hasConfigured = useRef(false);

	const settings = useMemo(() => {
		const apiUrl = localStorage.getItem("apiUrl");
		const apiKey = localStorage.getItem("apiKey");
		return { apiUrl, apiKey };
	}, []);

	useEffect(() => {
		if (!settings.apiUrl || !settings.apiKey) {
			setSettingsValid(false);
			if (!hasShownToast.current) {
				toast.error("Missing API settings", {
					description:
						"Please configure your API URL and key in the settings page.",
				});
				hasShownToast.current = true;
			}
			return;
		}

		const configureAI = async () => {
			if (hasConfigured.current) return;
			try {
				const response = await fetch("http://localhost:8080/ai/configure", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-API-Key": localStorage.getItem("apiKey") || "",
					},
					body: JSON.stringify({
						base_url: settings.apiUrl,
						api_key: settings.apiKey,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to configure AI service");
				}

				setSettingsValid(true);
				if (!hasConfigured.current) {
					toast.success("AI service configured successfully", {
						description: "Ready to provide cocktail recommendations!",
					});
					hasConfigured.current = true;
					fetchModels();
				}
			} catch (error) {
				toast.error("Error configuring AI service", {
					description:
						error instanceof Error
							? error.message
							: "An unknown error occurred",
				});
				setSettingsValid(false);
			}
		};

		configureAI();
	}, [settings]);

	const fetchModels = async () => {
		setLoadingModels(true);
		try {
			const response = await fetch("http://localhost:8080/ai/models", {
				headers: {
					"X-API-Key": localStorage.getItem("apiKey") || "",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch models");
			}

			const data = await response.json();
			setModels(data);
		} catch (error) {
			toast.error("Error fetching models", {
				description:
					error instanceof Error ? error.message : "An unknown error occurred",
			});
		} finally {
			setLoadingModels(false);
		}
	};

	const getRecommendation = async () => {
		if (!settingsValid || !selectedModel) {
			return;
		}

		setLoading(true);
		try {
			const response = await fetch("http://localhost:8080/ai/recommend", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": localStorage.getItem("apiKey") || "",
				},
				body: JSON.stringify({
					model: selectedModel,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get recommendation");
			}

			const data = await response.text();
			setRecommendation(data);
		} catch (error) {
			toast.error("Error getting recommendation", {
				description:
					error instanceof Error ? error.message : "An unknown error occurred",
			});
		} finally {
			setLoading(false);
		}
	};
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
					{!settingsValid ? (
						<p className="text-muted-foreground mb-4">
							Please configure your API settings in the settings page to use the
							Magic Bartender.
						</p>
					) : recommendation ? (
						<>
							<p className="whitespace-pre-wrap mb-4">{recommendation}</p>
							<Button onClick={getRecommendation} disabled={loading}>
								{loading
									? "Getting new recommendation..."
									: "Get Another Recommendation"}
							</Button>
						</>
					) : (
						<>
							<div className="space-y-4">
								<p className="text-muted-foreground">
									Ready to discover new cocktails? Click below to get started.
								</p>
								{loadingModels ? (
									<p>Loading available models...</p>
								) : models.length > 0 ? (
									<div>
										<div className="space-y-2">
											<p className="text-sm font-medium">Select a Model:</p>
											<Select
												value={selectedModel}
												onValueChange={setSelectedModel}
											>
												<SelectTrigger className="w-full">
													<SelectValue placeholder="Select a model" />
												</SelectTrigger>
												<SelectContent>
													{models.map((model) => (
														<SelectItem key={model} value={model}>
															{model}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
								) : null}
								<Button
									onClick={getRecommendation}
									disabled={loading || !selectedModel}
								>
									{loading
										? "Getting recommendation..."
										: "Get Recommendations"}
								</Button>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
