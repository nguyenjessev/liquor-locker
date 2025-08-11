export interface Bottle {
	id: number;
	name: string;
	opened: boolean;
	open_date?: string | null;
	created_at: string;
	updated_at: string;
}

export interface CreateBottleRequest {
	name: string;
	opened: boolean;
	open_date?: string;
}
