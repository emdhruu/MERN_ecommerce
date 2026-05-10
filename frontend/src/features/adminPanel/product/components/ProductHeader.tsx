import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ProductHeaderProps {
  onAddProduct: () => void;
}

const ProductHeader = ({ onAddProduct }: ProductHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Product List</h1>
        <p className="text-gray-600 mt-1">Manage your product inventory</p>
      </div>
      <Button 
        className="flex items-center gap-2 bg-[#f05249] hover:bg-[#e04a41] text-white"
        onClick={onAddProduct}
      >
        <Plus size={20} />
        Add Product
      </Button>
    </div>
  );
};

export default ProductHeader;