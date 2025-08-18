import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function Settings() {
	const [apiUrl, setApiUrl] = useState("");
	const [apiKey, setApiKey] = useState("");

	useEffect(() => {
		const savedApiUrl = localStorage.getItem("apiUrl");
		const savedApiKey = localStorage.getItem("apiKey");
		if (savedApiUrl) setApiUrl(savedApiUrl);
		if (savedApiKey) setApiKey(savedApiKey);
	}, []);

	const saveSettings = async () => {
		const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
		try {
			const sanitizedApiUrl = apiUrl.replace(/\/+$/, "");

			// Validate API configuration
			const configureResponse = await fetch(`${API_BASE_URL}/ai/configure`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					base_url: sanitizedApiUrl,
					api_key: apiKey,
				}),
			});

			if (!configureResponse.ok) {
				throw new Error(
					"Failed to configure API. Please check your URL and key.",
				);
			}

			const modelsResponse = await fetch(`${API_BASE_URL}/ai/models`, {
				method: "GET",
			});

			if (!modelsResponse.ok || (await modelsResponse.json()).length === 0) {
				throw new Error(
					"No models found. Please verify your API configuration.",
				);
			}

			// Save settings if validation succeeds
			localStorage.setItem("apiUrl", sanitizedApiUrl);
			localStorage.setItem("apiKey", apiKey);
			setApiUrl(sanitizedApiUrl);
			toast("Settings saved", {
				description: "Your API settings have been saved successfully.",
			});
		} catch {
			toast("Error saving settings", {
				description: "Could not validate API configuration.",
			});
		}
	};

	return (
		<div className="container mx-auto max-w-4xl p-4 md:p-6 mt-0">
			<div className="mb-8">
				<h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Look & Feel</CardTitle>
					<CardDescription>
						Customize the appearance of your application
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div className="flex items-center justify-between">
							<Label htmlFor="theme-toggle">Theme</Label>
							<ThemeToggle />
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="mt-6">
				<CardHeader>
					<CardTitle>Recommendation API Settings</CardTitle>
					<CardDescription>
						Configure your connection to the recommendation service
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div className="space-y-4">
							<div className="grid w-full gap-1.5">
								<Label htmlFor="apiUrl">API URL</Label>
								<Input
									id="apiUrl"
									placeholder="Enter API URL"
									type="text"
									value={apiUrl}
									onChange={(e) => setApiUrl(e.target.value)}
								/>
							</div>
							<div className="grid w-full gap-1.5">
								<Label htmlFor="apiKey">API Key</Label>
								<Input
									id="apiKey"
									placeholder="Enter API Key"
									type="password"
									value={apiKey}
									onChange={(e) => setApiKey(e.target.value)}
								/>
							</div>
							<Button onClick={saveSettings} className="w-auto">
								Save Settings
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
