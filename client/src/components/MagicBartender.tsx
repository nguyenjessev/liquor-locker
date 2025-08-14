import { useEffect, useState } from "react";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MagicBartender() {
	const [serviceStatus, setServiceStatus] = useState<null | boolean>(null);
	const [loading, setLoading] = useState(true);
	const [models, setModels] = useState<string[]>([]);
	const [modelsLoading, setModelsLoading] = useState(false);

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
								<Button>Get Recommendations</Button>
								<div className="mt-6">
									<h2 className="text-lg font-semibold mb-2">
										Available Models
									</h2>
									{modelsLoading ? (
										<p className="text-muted-foreground">Loading models...</p>
									) : models.length > 0 ? (
										<ul className="list-disc pl-5">
											{models.map((model) => (
												<li key={model}>{model}</li>
											))}
										</ul>
									) : (
										<p className="text-muted-foreground">
											No models available.
										</p>
									)}
								</div>
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
		</div>
	);
}
