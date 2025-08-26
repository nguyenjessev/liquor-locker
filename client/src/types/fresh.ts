export interface Fresh {
	id: number;
	name: string;
	prepared_date?: Date | null;
	purchase_date?: Date | null;
	price?: number | null;
}

export interface CreateFreshRequest {
	name: string;
	prepared_date?: Date;
	purchase_date?: Date;
	price?: number | null;
}
