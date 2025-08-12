import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Bottle } from "@/types/bottle";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

interface BottleEditModalProps {
	bottle: Bottle | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: (id: number) => void;
	onSave: (id: number, updates: { name: string }) => Promise<void>;
	loading?: boolean;
}

export function BottleEditModal({
	bottle,
	open,
	onOpenChange,
	onDelete,
	onSave,
	loading = false,
}: BottleEditModalProps) {
	const [editedName, setEditedName] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (bottle) {
			setEditedName(bottle.name);
		}
	}, [bottle]);

	const handleSave = async () => {
		if (!bottle || !editedName.trim()) return;

		try {
			setIsSaving(true);
			await onSave(bottle.id, { name: editedName.trim() });
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to save bottle:", error);
		} finally {
			setIsSaving(false);
		}
	};
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Bottle: {bottle?.name}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<p className="font-medium">Name</p>
						<div className="col-span-3">
							<Input
								value={editedName}
								onChange={(e) => setEditedName(e.target.value)}
								disabled={loading || isSaving}
							/>
						</div>
					</div>
					{bottle && (
						<>
							<div className="grid grid-cols-4 items-center gap-4">
								<p className="font-medium">Status</p>
								<p className="col-span-3">
									<span
										className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
											bottle.opened
												? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-200"
												: "bg-rose-100/80 text-rose-700 dark:bg-rose-800/50 dark:text-rose-200"
										}`}
									>
										{bottle.opened ? "Opened" : "Unopened"}
									</span>
								</p>
							</div>
							{bottle.purchase_date && (
								<div className="grid grid-cols-4 items-center gap-4">
									<p className="font-medium">Purchased</p>
									<p className="col-span-3">
										{new Date(bottle.purchase_date).toLocaleDateString()}
									</p>
								</div>
							)}
							{bottle.opened && bottle.open_date && (
								<div className="grid grid-cols-4 items-center gap-4">
									<p className="font-medium">Opened</p>
									<p className="col-span-3">
										{new Date(bottle.open_date).toLocaleDateString()}
									</p>
								</div>
							)}
						</>
					)}
				</div>
				{bottle && (
					<div className="mt-4 flex justify-end gap-2">
						<Button
							variant="ghost"
							onClick={() => {
								onDelete(bottle.id);
								onOpenChange(false);
							}}
							disabled={loading || isSaving}
							className="text-destructive hover:text-destructive hover:bg-destructive/10"
						>
							Delete Bottle
						</Button>
						<Button
							variant="default"
							onClick={handleSave}
							disabled={
								loading ||
								isSaving ||
								!editedName.trim() ||
								editedName === bottle.name
							}
						>
							{isSaving ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
