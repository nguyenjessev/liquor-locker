import { useContext } from "react";
import { AIContext, type AIContextType } from "../context/AIContext";

export function useAI(): AIContextType {
	const context = useContext(AIContext);
	if (context === undefined) {
		throw new Error("useAI must be used within an AIProvider");
	}
	return context;
}
