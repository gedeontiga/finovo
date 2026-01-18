import { searchParamsCache } from '@/lib/searchparams';
import { ProductTable } from './components';
import { columns } from './components/columns';

type ProductListingPage = {};

export default async function ProductListingPage({ }: ProductListingPage) {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const categories = searchParamsCache.get('category');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories: categories })
  };

  return (
    <ProductTable
      data={[]}
      totalItems={0}
      columns={columns}
    />
  );
}
