export interface InventoryItemModel {
  id: string;
  name: string;
  category: 'Powder' | 'Milk' | 'Cups' | 'Sugar' | 'Stirrers';
  stockOnHand: number;
  unit: string;
  reorderPoint: number;
  costPerUnit: number;
}

export class InventoryEntity {
  constructor(public data: InventoryItemModel) {}

  get isLowStock(): boolean {
    return this.data.stockOnHand <= this.data.reorderPoint;
  }
}
