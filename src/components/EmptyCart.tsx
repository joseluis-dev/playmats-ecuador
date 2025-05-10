export default function EmptyCart() {
  return (
    <section className="text-center py-20 w-full flex justify-center">
      <div className="md:max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 font-heading">Tu carrito está vacío</h2>
        <p className="mb-6">Explora nuestros diseños y personaliza tu propio playmat.</p>
        <a href="/cataloge" className="flex items-center justify-center gap-2
            px-4 py-2
            rounded-lg bg-[var(--color-primary)]/90
            hover:bg-[var(--color-primary)]
            transition-colors duration-300 ease-in-out
          ">
          <span className="text-[var(--color-text)]">Ver productos</span>
        </a>
      </div>
    </section>
  );
}
