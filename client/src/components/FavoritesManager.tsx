import { useEffect, useState } from "react";
import { CocktailCard } from "./CocktailCard";
import type { CocktailRecommendation, Step } from "@/types/cocktail";
const API_KEY = import.meta.env.VITE_API_KEY || "";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";


interface Favorite extends CocktailRecommendation {
    instructions: Step[];
    id: number;
}

export default function FavoritesManager() {
    const [favorites, setFavorites] = useState<Favorite[]>([]);
    const fetchFavorites = async () => {
        const headers: Record<string, string> = {};
        if (API_KEY) {
            headers["X-API-Key"] = API_KEY;
        }
        const response = await fetch(`${API_BASE_URL}/favorites`, {
            headers,
        });
        const data = await response.json();
        if (data) {
            setFavorites(data);
        }
    };
    

    useEffect(() => {
        fetchFavorites();
    }, []);

	return (
		<div className="container mx-auto max-w-4xl p-4 md:p-6 mt-0">
			<div className="mb-8">
				<h1 className="text-2xl md:text-3xl font-bold mb-2">Favorites</h1>
			</div>
            {favorites.length === 0 && (
                <h2>No Favorites Found</h2>
            )}
			<ul>
				{favorites.map((item) => (
					<CocktailCard
						key={item.id}
						cocktail={{
                            id: item.id,
                            name: item.name,
                            description: item.description,
                            ingredients: item.ingredients,
                            steps: item.instructions,
                        }}
                        hideStar
                        showDelete
					/>
				))}
			</ul>
		</div>
	);
}
