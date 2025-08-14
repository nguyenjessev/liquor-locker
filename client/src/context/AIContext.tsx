import { createContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

interface AIContextType {
	isConfigured: boolean;
	models: string[];
	selectedModel: string | undefined;
	setSelectedModel: (model: string | undefined) => void;
	refreshModels: () => Promise<void>;
	configureService: () => Promise<void>;
	lastConfigured: string | null;
	configError: string | null;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
	const [isConfigured, setIsConfigured] = useState<boolean>(() => {
		const lastConfigured = localStorage.getItem("lastConfigured");
		return lastConfigured !== null;
	});
	const [configError, setConfigError] = useState<string | null>(null);
	const [models, setModels] = useState<string[]>([]);
	const [lastConfigured, setLastConfigured] = useState<string | null>(() => {
		return localStorage.getItem("lastConfigured");
	});
	const [selectedModel, setSelectedModel] = useState<string | undefined>(() => {
		return localStorage.getItem("selectedModel") || undefined;
	});

	useEffect(() => {
		if (selectedModel) {
			localStorage.setItem("selectedModel", selectedModel);
		} else {
			localStorage.removeItem("selectedModel");
		}
	}, [selectedModel]);

	const fetchModels = useCallback(async () => {
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
			setConfigError(null);
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "An unknown error occurred";
			setConfigError(message);
			throw error;
		}
	}, [setModels]);

	const configureService = useCallback(async () => {
		const apiUrl = localStorage.getItem("apiUrl");
		const apiKey = localStorage.getItem("apiKey");

		if (!apiUrl || !apiKey) {
			setIsConfigured(false);
			setConfigError("Missing API settings");
			throw new Error("Missing API settings");
		}

		try {
			const response = await fetch("http://localhost:8080/ai/configure", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-API-Key": apiKey,
				},
				body: JSON.stringify({
					base_url: apiUrl,
					api_key: apiKey,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to configure AI service");
			}

			const timestamp = new Date().toISOString();
			setLastConfigured(timestamp);
			localStorage.setItem("lastConfigured", timestamp);
			setIsConfigured(true);
			await fetchModels();

			if (!configError) {
				const lastSettings = localStorage.getItem("lastAISettings");
				const currentSettings = JSON.stringify({
					base_url: apiUrl,
					api_key: apiKey,
				});
				if (lastSettings !== currentSettings) {
					toast.success("AI service configured successfully", {
						description: "Ready to provide cocktail recommendations!",
					});
				}
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "An unknown error occurred";
			setIsConfigured(false);
			setConfigError(message);
			toast.error("Error configuring AI service", {
				description: message,
			});
			throw error;
		}
	}, [fetchModels, setIsConfigured, configError]);

	const value = {
		isConfigured,
		models,
		selectedModel,
		setSelectedModel,
		refreshModels: fetchModels,
		configureService,
		lastConfigured,
		configError,
	};

	return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export type { AIContextType };
export { AIContext };
