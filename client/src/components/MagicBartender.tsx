import { useEffect, useState } from "react";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MagicBartender() {
	const [serviceStatus, setServiceStatus] = useState<null | boolean>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStatus = async () => {
			try {
				const res = await fetch(`${API_BASE_URL}/ai/service`);
				if (!res.ok) {
					setServiceStatus(null);
				} else {
					const data = await res.json();
					setServiceStatus(data.initialized);
				}
			} catch {
				setServiceStatus(null);
			} finally {
				setLoading(false);
			}
		};
		fetchStatus();
	}, []);

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
				<div className="mt-2">
					{loading ? (
						<span className="text-sm text-muted-foreground">
							Checking AI service status...
						</span>
					) : serviceStatus === true ? (
						<span className="text-sm text-green-600">
							AI service is initialized and ready!
						</span>
					) : (
						<span className="text-sm text-red-600">
							AI service is not initialized.
						</span>
					)}
				</div>
			</div>

			<Card>
				<CardContent>
					<div className="space-y-4">
						<p className="text-muted-foreground">
							Ready to discover new cocktails? Click below to get started.
						</p>
						<Button>Get Recommendations</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
