import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useAI } from "@/hooks/useAI";
import { toast } from "sonner";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export function MagicBartender() {
	const [loading, setLoading] = useState(false);
	const [recommendation, setRecommendation] = useState<string | null>(null);
	const {
		isConfigured,
		models,
		selectedModel,
		setSelectedModel,
		configureService,
		lastConfigured,
		isConfigured: serviceConfigured,
		configError,
	} = useAI();

	const hasAttemptedConfig = useRef(false);
	const configAttemptTimestamp = useRef<number>(0);

	useEffect(() => {
		const apiUrl = localStorage.getItem("apiUrl");
		const apiKey = localStorage.getItem("apiKey");

		if (!apiUrl || !apiKey) {
			if (!hasAttemptedConfig.current) {
				toast.error("Missing API settings", {
					description:
						"Please configure your API URL and key in the settings page.",
				});
				hasAttemptedConfig.current = true;
			}
			return;
		}

		// Store current settings to detect changes
		const currentSettings = JSON.stringify({ apiUrl, apiKey });
		const lastSettings = localStorage.getItem("lastAISettings");

		// Prevent rapid retries on failure
		const now = Date.now();
		const timeSinceLastAttempt = now - configAttemptTimestamp.current;
		const minimumRetryInterval = 5000; // 5 seconds

		// Reconfigure if settings have changed or service isn't configured
		if (
			(!serviceConfigured || currentSettings !== lastSettings) &&
			timeSinceLastAttempt >= minimumRetryInterval
		) {
			configAttemptTimestamp.current = now;
			configureService().catch(() => {});
			localStorage.setItem("lastAISettings", currentSettings);
		}
	}, [configureService, serviceConfigured, lastConfigured]);

	const getRecommendation = async () => {
		if (!serviceConfigured || !selectedModel) {
			return;
		}
		if (configError) {
			toast.error("Cannot get recommendations", {
				description: "Please check your API settings and try again.",
			});
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
					{!isConfigured ? (
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
								{models.length > 0 ? (
									<div>
										<div className="space-y-2">
											<p className="text-sm font-medium">Select a Model:</p>
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														role="combobox"
														className="w-full justify-between"
													>
														{selectedModel
															? models.find((model) => model === selectedModel)
															: "Select model..."}
														<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
													</Button>
												</PopoverTrigger>
												<PopoverContent className="w-full p-0">
													<Command>
														<CommandInput placeholder="Search models..." />
														<CommandEmpty>No model found.</CommandEmpty>
														<CommandGroup>
															{models.map((model) => (
																<CommandItem
																	key={model}
																	value={model}
																	onSelect={(currentValue) => {
																		setSelectedModel(
																			currentValue === selectedModel
																				? undefined
																				: currentValue,
																		);
																	}}
																>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			selectedModel === model
																				? "opacity-100"
																				: "opacity-0",
																		)}
																	/>
																	{model}
																</CommandItem>
															))}
														</CommandGroup>
													</Command>
												</PopoverContent>
											</Popover>
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
