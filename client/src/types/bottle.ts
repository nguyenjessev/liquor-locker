export interface Bottle {
	id: number;
	name: string;
	opened: boolean;
	open_date?: string | null;
}

export interface CreateBottleRequest {
	name: string;
	opened: boolean;
	open_date?: string;
}
