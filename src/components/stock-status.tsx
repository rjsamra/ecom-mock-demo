export function StockStatus({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <p className="text-sm font-medium text-danger">Out of stock</p>;
  }
  if (stock <= 5) {
    return <p className="text-sm font-medium text-warning">Only {stock} left</p>;
  }
  return <p className="text-sm text-success">In stock</p>;
}
