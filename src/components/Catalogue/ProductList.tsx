import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import { Card } from '@/components/Card';
import { AddToCartButton } from '@/components/AddToCartButton';
import { BoxIcon } from 'lucide-react';
import type { Product, Category, Attribute, ResourceProduct, Resource } from '@/types';
import { CustomBadge } from '@/components/ui/custom-badge';
import { Spinner } from '@/components/ui/spinner';

export const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const fetchedProducts = await productService.list();
        setProducts(fetchedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError("Error al cargar los productos. Por favor, intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <Spinner className='text-[var(--color-primary)] size-14'/>
      </div>
    );
  }

  return (
    <section className="w-full max-w-screen-xl mx-auto p-8 md:p-12">
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-[25rem] gap-6">
          {products.map((product) => {
            // Define additional interface for the API response structure
            type ApiProduct = Product & {
              productResources?: {
                resource: Resource;
                isBanner: boolean;
              }[];
            };
            
            const apiProduct = product as ApiProduct;

            // Find banner image from resourceProducts or use first image if available
            const bannerResource = product.resourceProducts?.find((rp: ResourceProduct) => rp.isBanner)?.resource || 
                          product.resourceProducts?.[0]?.resource ||
                          apiProduct.productResources?.find(pr => pr.isBanner)?.resource || 
                          apiProduct.productResources?.[0]?.resource;
            
            const imageUrl = bannerResource?.url || '';
            
            return (
              <a href={`/playmats/${product.id}`} className="rounded-xl group" key={product.id}>
                <Card 
                  className="text-[var(--color-text)]"
                  id={product.id}
                  title={product.name as string}
                  subtitle="Etiquetas"
                  price={product.price?.toString()}
                  imageSlot={
                    <div 
                      data-transition-key={`img-${product.id}`}
                      className="absolute top-0 left-0 bottom-0 h-full w-full group-hover:scale-110 transition-scale duration-1000 ease-in-out opacity-90 -z-10 bg-center bg-cover bg-no-repeat bg-blend-luminosity"
                      style={{ backgroundImage: `url(${imageUrl})`, viewTransitionName: `img-${product.id}` }}
                    />
                  }
                  contentSlot={
                    <ul className="w-full flex flex-wrap gap-2 text-sm">
                      {product.categories?.map((category: Category) => (
                        <CustomBadge 
                          key={category.id}
                          label={category.name}
                          color={category.color || "gray"}
                          type="outline" />
                      ))}
                      {product.attributes?.map((attribute: Attribute) => (
                        <CustomBadge 
                          key={attribute.id}
                          label={attribute.name}
                          color={attribute.color || "gray"}
                          type="outline" />
                      ))}
                    </ul>
                  }
                  footerSlot={
                    <AddToCartButton
                      className="flex items-center justify-center gap-2 absolute top-0 right-0 p-4 ring-1 ring-black/20 dark:ring-white/20 rounded-rt-lg rounded-bl-lg bg-[var(--color-primary)]/90 hover:bg-[var(--color-primary)] transition-colors duration-300"
                      label="Añadir"
                      product={product}
                    />
                  }
                />
              </a>
            );
          })}
        </div>
      ) : (
        <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] shadow-lg">
          <div className="flex flex-col text-center items-center gap-4">
            <BoxIcon width={100} height={100} />
            <h2 className="text-3xl font-bold text-[var(--color-text)]">No hay productos disponibles</h2>
            <p className="text-lg text-[var(--color-text-muted)]">
              {error || "No se encontraron productos en el catálogo en este momento."}
            </p>
            <a 
              href="/" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 hover:bg-[var(--color-primary-dark)] text-white rounded-lg transition-colors duration-300 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver al inicio
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
