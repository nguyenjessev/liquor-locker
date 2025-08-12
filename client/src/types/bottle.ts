export interface Bottle {
	id: number;
	name: string;
	opened: boolean;
	open_date?: Date | null;
	purchase_date?: Date | null;
}

export interface CreateBottleRequest {
	name: string;
	opened: boolean;
	open_date?: Date;
	purchase_date?: Date;
}
