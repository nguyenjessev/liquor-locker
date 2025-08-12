import type { Bottle } from "@/types/bottle";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface BottleEditModalProps {
	bottle: Bottle | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function BottleEditModal({
	bottle,
	open,
	onOpenChange,
}: BottleEditModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Bottle: {bottle?.name}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<p className="font-medium">Name</p>
						<p className="col-span-3">{bottle?.name}</p>
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
			</DialogContent>
		</Dialog>
	);
}
